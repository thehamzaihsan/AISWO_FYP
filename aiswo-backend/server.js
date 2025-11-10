const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const axios = require("axios");
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Firebase configuration - using environment variables or default setup
let db = null;
let firestore = null;

try {
  const serviceAccount = require("./serviceAccountKey.json");
  
  // Auto-detect database URL from project ID
  const projectId = serviceAccount.project_id;
  const databaseURL = process.env.FIREBASE_DATABASE_URL || 
                     `https://${projectId}-default-rtdb.asia-southeast1.firebasedatabase.app`;
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: databaseURL
  });
  
  db = admin.database();
  firestore = admin.firestore();
  console.log("✅ Firebase connected successfully");
  console.log(`📊 Project: ${projectId}`);
  console.log(`🔗 Database: ${databaseURL}`);
} catch (error) {
  console.log("⚠️ Firebase not configured - running in demo mode");
  console.log("To enable Firebase, add serviceAccountKey.json file");
  console.log("Error:", error.message);
}

// 🔹 Dummy bins (bin2, bin3)
const dummyBins = {
  bin2: {
    weightKg: 9.2,
    fillPct: 92,
    status: "NEEDS_EMPTYING",
    updatedAt: new Date().toISOString(),
    name: "Main Street Bin",
    location: "Main Street, Downtown",
    capacity: 10,
    operatorId: "op1",
    operatorEmail: "m.charagh02@gmail.com",
    history: [
      { ts: "2025-10-08 11:00", weightKg: 8.5, fillPct: 85 },
      { ts: "2025-10-08 11:30", weightKg: 8.8, fillPct: 88 },
      { ts: "2025-10-08 12:00", weightKg: 9.2, fillPct: 92 }
    ]
  },
  bin3: {
    weightKg: 5.1,
    fillPct: 51,
    status: "OK",
    updatedAt: new Date().toISOString(),
    name: "Park Avenue Bin",
    location: "Park Avenue, Central Park",
    capacity: 10,
    operatorId: "op2",
    operatorEmail: "m.charagh02@gmail.com",
    history: [
      { ts: "2025-10-08 10:00", weightKg: 4.8, fillPct: 48 },
      { ts: "2025-10-08 10:30", weightKg: 4.9, fillPct: 49 },
      { ts: "2025-10-08 11:00", weightKg: 5.1, fillPct: 51 }
    ]
  }
};

// 🔹 Weighted data generation for multiple bins using real hardware data
const WEIGHT_FACTORS = {
  bin2: 0.3,
  bin3: 0.5,
  bin4: 0.7,
  bin5: 0.4,
  bin6: 0.6
};

function generateWeightedBinData(realBinData, binId) {
  const weightFactor = WEIGHT_FACTORS[binId] || 0.5;
  
  if (!realBinData || !realBinData.weightKg) {
    // Fallback data if real data is not available
    return {
      weightKg: Math.floor(Math.random() * 20) + 5,
      fillPct: Math.floor(Math.random() * 80) + 10,
      status: "Normal",
      updatedAt: new Date().toISOString()
    };
  }
  
  // Apply weight factor to real data
  const weightedWeight = Math.floor(realBinData.weightKg * weightFactor);
  const weightedFillPct = Math.floor(realBinData.fillPct * weightFactor);
  
  // Add some variation to make it look more realistic
  const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
  const finalWeight = Math.max(0, Math.floor(weightedWeight * (1 + variation)));
  const finalFillPct = Math.max(0, Math.min(100, Math.floor(weightedFillPct * (1 + variation))));
  
  let status = "Normal";
  if (finalFillPct > 80) status = "Full";
  else if (finalFillPct > 60) status = "Warning";
  
  return {
    weightKg: finalWeight,
    fillPct: finalFillPct,
    status: status,
    updatedAt: new Date().toISOString()
  };
}

// 🔹 Dummy operators (will be moved to Firestore)
const dummyOperators = {
  op1: {
    name: "John Smith",
    email: "m.charagh02@gmail.com",
    phone: "+1-555-0123",
    assignedBins: ["bin2"],
    createdAt: new Date().toISOString()
  },
  op2: {
    name: "Sarah Johnson",
    email: "m.charagh02@gmail.com",
    phone: "+1-555-0124",
    assignedBins: ["bin3"],
    createdAt: new Date().toISOString()
  }
};

const operatorTaskTemplates = [
  { id: "inspect", label: "Inspect assigned bins within your zone" },
  { id: "report", label: "Report any hardware or location issues" },
  { id: "confirm-empty", label: "Confirm bins emptied after collection" }
];

const operatorProgressState = {};
const operatorTaskState = {};

function ensureOperatorState(operatorId) {
  if (!operatorProgressState[operatorId]) {
    operatorProgressState[operatorId] = {
      completedBins: [],
      history: []
    };
  }

  if (!operatorTaskState[operatorId]) {
    operatorTaskState[operatorId] = operatorTaskTemplates.map(task => ({
      ...task,
      completed: false
    }));
  }

  return {
    progress: operatorProgressState[operatorId],
    tasks: operatorTaskState[operatorId]
  };
}

function updateTaskCompletion(operatorId, taskId, completed) {
  const { tasks } = ensureOperatorState(operatorId);
  const nextTasks = tasks.map(task =>
    task.id === taskId ? { ...task, completed: Boolean(completed) } : task
  );
  operatorTaskState[operatorId] = nextTasks;
  return nextTasks;
}

function toggleCompletedBin(operatorId, binId, completed, payload = {}) {
  const { progress } = ensureOperatorState(operatorId);
  const uniqueSet = new Set(progress.completedBins);
  if (completed) {
    uniqueSet.add(binId);
  } else {
    uniqueSet.delete(binId);
  }
  progress.completedBins = Array.from(uniqueSet);
  if (completed) {
    progress.history.push({
      type: "clear",
      binId,
      operatorId,
      timestamp: new Date().toISOString(),
      ...payload
    });
  }
  return progress.completedBins;
}

// Global cache for bins and operators data (for chatbot access)
let cachedBins = {};
let cachedOperators = {};
let cachedWeather = null;

// ================= Email & FCM Notification Setup =================

// Track bins that have already triggered an alert
const notifiedBins = {};
// Configure your email here
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "m.charaghyousafkhan@gmail.com", // TODO: Replace with your email
    pass: "vskvkbyqrfqjdail" // TODO: Replace with your app password (not your Gmail password)
  }
});

function sendBinAlertEmail(binId, fillPct, operatorEmail = null) {
  // Use operator email if provided, otherwise use default admin email
  const toEmail = operatorEmail || 'm.charagh02@gmail.com';
  
  const mailOptions = {
    from: 'm.charaghyousafkhan@gmail.com',
    to: toEmail,
    subject: `🚨 URGENT: Bin ${binId} is almost full!`,
    text: `Bin ${binId} is at ${fillPct}% fill. Please take action immediately to prevent overflow.\n\nThis is an automated alert from the Smart Bin Monitoring System.`
  };
  
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.error('Error sending email:', error);
    }
    console.log(`📧 Alert email sent to ${toEmail}:`, info.response);
  });
}

// FCM push notification function
function sendBinAlertPush(binId, fillPct, fcmToken) {
  // Skip if Firebase is not configured
  if (!db || !firestore) {
    console.log('⚠️ Push notifications disabled - Firebase not configured');
    return;
  }
  
  const message = {
    notification: {
      title: `Bin ${binId} is almost full!`,
      body: `Bin ${binId} is at ${fillPct}% fill. Please take action.`
    },
    token: fcmToken
  };
  admin.messaging().send(message)
    .then((response) => {
      console.log('✅ Push notification sent:', response);
    })
    .catch((error) => {
      console.error('❌ Error sending push notification:', error);
    });
}

// ================= Weather Monitoring =================

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || "f4c33dca360f8875d88a28fbd7cf34e3";
let lastWeatherCheck = 0;
const WEATHER_CHECK_INTERVAL = 3 * 60 * 60 * 1000; // 3 hours

async function checkWeatherAndSendAlerts() {
  try {
    const currentTime = Date.now();
    if (currentTime - lastWeatherCheck < WEATHER_CHECK_INTERVAL) {
      return; // Skip if checked recently
    }

    lastWeatherCheck = currentTime;
    
    // Get current location (you can modify this to get actual location)
    const lat = 40.7128; // New York coordinates as default
    const lon = -74.0060;
    
    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );
    
    const weather = weatherResponse.data;
    const weatherId = weather.weather[0].id;
    
    // Check for rain conditions
    if (weatherId >= 500 && weatherId < 600) {
      console.log("🌧️ Rain detected! Sending weather alerts...");
      
      // Send alerts to all operators
      for (const [operatorId, operator] of Object.entries(dummyOperators)) {
        const weatherAlertEmail = {
          from: 'm.charaghyousafkhan@gmail.com',
          to: operator.email,
          subject: `🌧️ Weather Alert: Rain Expected - Bin Monitoring Required`,
          text: `Dear ${operator.name},\n\nRain is expected in your area. Please check your assigned bins for potential overflow issues.\n\nWeather Details:\n- Condition: ${weather.weather[0].description}\n- Temperature: ${weather.main.temp}°C\n- Humidity: ${weather.main.humidity}%\n\nPlease ensure bins are properly secured and monitor for overflow.\n\nBest regards,\nSmart Bin Monitoring System`
        };
        
        transporter.sendMail(weatherAlertEmail, (error, info) => {
          if (error) {
            console.error('Error sending weather alert email:', error);
          } else {
            console.log(`Weather alert email sent to ${operator.name}:`, info.response);
          }
        });
      }
    }
  } catch (error) {
    console.error('Error checking weather:', error);
  }
}

// ================= Routes =================

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});


// 🔹 All bins (merge real bin1 + weighted bins)
app.get("/bins", async (req, res) => {
  try {
    console.log("🔍 Fetching bins...");
    let bins = {};
    let realBinData = null;
    let operators = {};
    
    // Get operators data first
    if (firestore) {
      try {
        const operatorsSnapshot = await firestore.collection('operators').get();
        operatorsSnapshot.forEach(doc => {
          operators[doc.id] = doc.data();
        });
        console.log("✅ Operators loaded from Firestore");
      } catch (firestoreError) {
        console.log("⚠️ Firestore error, using dummy operators");
        operators = dummyOperators;
      }
    } else {
      console.log("⚠️ Firestore not available, using dummy operators");
      operators = dummyOperators;
    }
    
    if (db) {
      try {
        // Get real data from bin1 (your hardware)
        const snapshot = await db.ref("bins/bin1").once("value");
        realBinData = snapshot.val() || {};
        bins.bin1 = realBinData;
        console.log(`✅ Retrieved bin1 data: ${realBinData.weightKg || 0}kg`);
      } catch (error) {
        console.log(`⚠️ Error fetching bin1 data: ${error.message}`);
        // Use dummy data for bin1 if Firebase fails
        realBinData = { weightKg: 5.2, fillPct: 52, status: "OK", updatedAt: new Date().toISOString() };
        bins.bin1 = realBinData;
      }
    } else {
      console.log("⚠️ No Firebase DB connection, using dummy bin1 data");
      realBinData = { weightKg: 5.2, fillPct: 52, status: "OK", updatedAt: new Date().toISOString() };
      bins.bin1 = realBinData;
    }
    
    // Get bins from Firestore
    if (firestore) {
      try {
        const binsSnapshot = await firestore.collection('bins').get();
        binsSnapshot.forEach(doc => {
          const binData = doc.data();
          const binId = doc.id;
          
          // Skip bin1 as it's handled by Realtime Database
          if (binId !== 'bin1') {
            // Generate weighted data based on real hardware data
            const weightedData = generateWeightedBinData(realBinData, binId);
            bins[binId] = {
              ...binData,
              ...weightedData,
              lastFetched: new Date().toISOString()
            };
          }
        });
      } catch (firestoreError) {
        console.log("Firestore not available, using fallback data");
        // Fallback to dummy data if Firestore is not available
        Object.keys(dummyBins).forEach(binId => {
          const weightedData = generateWeightedBinData(realBinData, binId);
          bins[binId] = {
            ...dummyBins[binId],
            ...weightedData,
            lastFetched: new Date().toISOString()
          };
        });
      }
    } else {
      // Fallback when Firebase is not available
      Object.keys(dummyBins).forEach(binId => {
        const weightedData = generateWeightedBinData(realBinData, binId);
        bins[binId] = {
          ...dummyBins[binId],
          ...weightedData,
          lastFetched: new Date().toISOString()
        };
      });
    }

    // Always include dummy bins for demonstration
    Object.keys(dummyBins).forEach(binId => {
      if (!bins[binId]) {
        bins[binId] = {
          ...dummyBins[binId],
          lastFetched: new Date().toISOString()
        };
      }
    });

    // Add last updated timestamp to each bin
    Object.keys(bins).forEach(id => {
      if (bins[id]) {
        bins[id].lastFetched = new Date().toISOString();
      }
    });

    // 🔔 Notification check (email & push alert)
    // TODO: Replace with real FCM tokens for each user/device
    const testFcmToken = "fkGOPdEiReizD1mj7d3a0M:APA91bG2d9ACAzMgclkwT9xgsy9AC5dMZRNH-65Gyya3nu8ATEJQKJcHruVOHJDAfECJTn8PbYvI_viILwFppiirF2oaNBKJpcznBwFPt11zdsQK54eaSqY";
    Object.entries(bins).forEach(([id, bin]) => {
      if (bin.fillPct > 80) {
        if (!notifiedBins[id]) {
          console.log(`⚠️ ALERT: ${id} is almost full (${bin.fillPct}%)`);
          
          // Send email to assigned operator
          if (bin.operatorId && operators[bin.operatorId]) {
            const operator = operators[bin.operatorId];
            const operatorAlertEmail = {
              from: 'm.charaghyousafkhan@gmail.com',
              to: operator.email,
              subject: `🚨 URGENT: Bin ${id} is Full - Immediate Action Required`,
              text: `Dear ${operator.name},\n\nBin ${id} (${bin.name || id}) is at ${bin.fillPct}% capacity and needs immediate attention.\n\nBin Details:\n- Location: ${bin.location || 'Not specified'}\n- Current Weight: ${bin.weightKg} kg\n- Fill Level: ${bin.fillPct}%\n- Status: ${bin.status}\n\nPlease empty this bin as soon as possible to prevent overflow.\n\nBest regards,\nSmart Bin Monitoring System`
            };
            
            transporter.sendMail(operatorAlertEmail, (error, info) => {
              if (error) {
                console.error('Error sending operator alert email:', error);
              } else {
                console.log(`📧 Operator alert email sent to ${operator.name} (${operator.email}):`, info.response);
              }
            });
          }
          
          // Send general alert email to admin
          sendBinAlertEmail(id, bin.fillPct);
          
          if (testFcmToken && testFcmToken !== "YOUR_FCM_DEVICE_TOKEN_HERE") {
            sendBinAlertPush(id, bin.fillPct, testFcmToken);
          }
          notifiedBins[id] = true;
        }
      } else {
        // Reset notification if bin is no longer above threshold
        notifiedBins[id] = false;
      }
    });

    // Check weather and send alerts
    await checkWeatherAndSendAlerts();

    // Cache data for chatbot access
    cachedBins = bins;
    cachedOperators = operators;

    console.log(`✅ Returning ${Object.keys(bins).length} bins`);
    res.json(bins);
  } catch (err) {
    console.error("❌ Error fetching bins:", err);
    res.status(500).json({ error: "Failed to fetch bins" });
  }
});

// 🔹 Single bin
app.get("/bins/:id", async (req, res) => {
  const id = req.params.id;
  try {
    if (id === "bin1") {
      // bin1 is always from Realtime Database (real hardware)
      if (db) {
        const snapshot = await db.ref("bins/bin1").once("value");
        return res.json(snapshot.val() || {});
      } else {
        return res.status(404).json({ error: "Real-time database not available" });
      }
    } else {
      // Other bins use weighted data from Firestore
      if (firestore) {
        const binDoc = await firestore.collection('bins').doc(id).get();
        if (binDoc.exists) {
          const binData = binDoc.data();
          
          // Get real data to generate weighted data
          let realBinData = null;
          if (db) {
            const snapshot = await db.ref("bins/bin1").once("value");
            realBinData = snapshot.val() || {};
          }
          
          // Generate weighted data
          const weightedData = generateWeightedBinData(realBinData, id);
          const finalBinData = {
            ...binData,
            ...weightedData,
            lastFetched: new Date().toISOString()
          };
          
          return res.json(finalBinData);
        } else {
          return res.status(404).json({ error: "Bin not found" });
        }
      } else {
        // Fallback to dummy data
        if (dummyBins[id]) {
          let realBinData = null;
          if (db) {
            const snapshot = await db.ref("bins/bin1").once("value");
            realBinData = snapshot.val() || {};
          }
          
          const weightedData = generateWeightedBinData(realBinData, id);
          const finalBinData = {
            ...dummyBins[id],
            ...weightedData,
            lastFetched: new Date().toISOString()
          };
          
          return res.json(finalBinData);
        } else {
          return res.status(404).json({ error: "Bin not found" });
        }
      }
    }
  } catch (err) {
    console.error(`Error fetching bin ${id}:`, err);
    res.status(500).json({ error: "Failed to fetch bin" });
  }
});

// 🔹 Bin history
app.get("/bins/:id/history", async (req, res) => {
  const id = req.params.id;
  try {
    if (id === "bin1") {
      const snapshot = await db.ref("bins/bin1/history").once("value");
      return res.json(snapshot.val() || []); // safe return
    } else if (dummyBins[id]) {
      return res.json(dummyBins[id].history);
    } else {
      return res.status(404).json({ error: "History not found" });
    }
  } catch (err) {
    console.error(`Error fetching history for ${id}:`, err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// 🔹 Statistics endpoint
app.get("/stats", async (req, res) => {
  try {
    let allBins = {};
    let realBinData = null;
    
    // Get real bin1 data
    if (db) {
      const snapshot = await db.ref("bins/bin1").once("value");
      realBinData = snapshot.val() || {};
      allBins.bin1 = realBinData;
    }
    
    // Get other bins from Firestore with weighted data
    if (firestore) {
      try {
        const binsSnapshot = await firestore.collection('bins').get();
        binsSnapshot.forEach(doc => {
          const binData = doc.data();
          const binId = doc.id;
          
          if (binId !== 'bin1') {
            const weightedData = generateWeightedBinData(realBinData, binId);
            allBins[binId] = {
              ...binData,
              ...weightedData
            };
          }
        });
      } catch (firestoreError) {
        console.log("Firestore not available for stats, using fallback");
        Object.keys(dummyBins).forEach(binId => {
          const weightedData = generateWeightedBinData(realBinData, binId);
          allBins[binId] = {
            ...dummyBins[binId],
            ...weightedData
          };
        });
      }
    } else {
      // Fallback when Firebase is not available
      Object.keys(dummyBins).forEach(binId => {
        const weightedData = generateWeightedBinData(realBinData, binId);
        allBins[binId] = {
          ...dummyBins[binId],
          ...weightedData
        };
      });
    }

    const stats = {
      totalBins: Object.keys(allBins).length,
      normalBins: Object.values(allBins).filter(bin => bin.fillPct <= 60).length,
      warningBins: Object.values(allBins).filter(bin => bin.fillPct > 60 && bin.fillPct <= 80).length,
      fullBins: Object.values(allBins).filter(bin => bin.fillPct > 80).length,
      averageFillLevel: Object.values(allBins).reduce((sum, bin) => sum + (bin.fillPct || 0), 0) / Object.keys(allBins).length,
      totalWeight: Object.values(allBins).reduce((sum, bin) => sum + (bin.weightKg || 0), 0),
      lastUpdated: new Date().toISOString()
    };

    res.json(stats);
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

// ================= Operator Management =================

// Get all operators
app.get("/operators", async (req, res) => {
  try {
    if (firestore) {
      const operatorsSnapshot = await firestore.collection('operators').get();
      const operators = {};
      operatorsSnapshot.forEach(doc => {
        operators[doc.id] = doc.data();
      });
      res.json(operators);
    } else {
      res.json(dummyOperators);
    }
  } catch (error) {
    console.error("Error fetching operators:", error);
    res.status(500).json({ error: "Failed to fetch operators" });
  }
});

// Get single operator
app.get("/operators/:id", async (req, res) => {
  const id = req.params.id;
  try {
    if (firestore) {
      const operatorDoc = await firestore.collection('operators').doc(id).get();
      if (operatorDoc.exists) {
        res.json(operatorDoc.data());
      } else {
        res.status(404).json({ error: "Operator not found" });
      }
    } else {
      if (dummyOperators[id]) {
        res.json(dummyOperators[id]);
      } else {
        res.status(404).json({ error: "Operator not found" });
      }
    }
  } catch (error) {
    console.error(`Error fetching operator ${id}:`, error);
    res.status(500).json({ error: "Failed to fetch operator" });
  }
});

// Create new operator
app.post("/operators", async (req, res) => {
  const { id, name, email, phone, assignedBins } = req.body;
  
  if (!id || !name || !email) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  
  const operatorData = {
    name,
    email,
    phone: phone || '',
    assignedBins: assignedBins || [],
    createdAt: new Date().toISOString()
  };
  
  try {
    if (firestore) {
      await firestore.collection('operators').doc(id).set(operatorData);
      res.json({ message: "Operator created successfully", operator: operatorData });
    } else {
      dummyOperators[id] = operatorData;
      res.json({ message: "Operator created successfully", operator: operatorData });
    }
  } catch (error) {
    console.error("Error creating operator:", error);
    res.status(500).json({ error: "Failed to create operator" });
  }
});

// Update operator
app.put("/operators/:id", async (req, res) => {
  const id = req.params.id;
  const { name, email, phone, assignedBins } = req.body;
  
  try {
    if (firestore) {
      const operatorDoc = await firestore.collection('operators').doc(id).get();
      if (!operatorDoc.exists) {
        return res.status(404).json({ error: "Operator not found" });
      }
      
      const updateData = {
        name: name || operatorDoc.data().name,
        email: email || operatorDoc.data().email,
        phone: phone || operatorDoc.data().phone,
        assignedBins: assignedBins || operatorDoc.data().assignedBins,
        updatedAt: new Date().toISOString()
      };
      
      await firestore.collection('operators').doc(id).update(updateData);
      res.json({ message: "Operator updated successfully", operator: updateData });
    } else {
      if (!dummyOperators[id]) {
        return res.status(404).json({ error: "Operator not found" });
      }
      
      dummyOperators[id] = {
        ...dummyOperators[id],
        name: name || dummyOperators[id].name,
        email: email || dummyOperators[id].email,
        phone: phone || dummyOperators[id].phone,
        assignedBins: assignedBins || dummyOperators[id].assignedBins,
        updatedAt: new Date().toISOString()
      };
      
      res.json({ message: "Operator updated successfully", operator: dummyOperators[id] });
    }
  } catch (error) {
    console.error("Error updating operator:", error);
    res.status(500).json({ error: "Failed to update operator" });
  }
});

// Delete operator
app.delete("/operators/:id", async (req, res) => {
  const id = req.params.id;
  
  try {
    if (firestore) {
      const operatorDoc = await firestore.collection('operators').doc(id).get();
      if (!operatorDoc.exists) {
        return res.status(404).json({ error: "Operator not found" });
      }
      
      await firestore.collection('operators').doc(id).delete();
      res.json({ message: "Operator deleted successfully" });
    } else {
      if (!dummyOperators[id]) {
        return res.status(404).json({ error: "Operator not found" });
      }
      
      delete dummyOperators[id];
      res.json({ message: "Operator deleted successfully" });
    }
  } catch (error) {
    console.error("Error deleting operator:", error);
    res.status(500).json({ error: "Failed to delete operator" });
  }
});

// ================= Operator Progress APIs =================

app.get("/operators/:id/progress", (req, res) => {
  try {
    const { progress, tasks } = ensureOperatorState(req.params.id);
    res.json({
      completedBins: [...progress.completedBins],
      tasks: tasks.map(task => ({ ...task }))
    });
  } catch (error) {
    console.error("Error fetching operator progress:", error);
    res.status(500).json({ error: "Failed to fetch operator progress" });
  }
});

app.post("/operators/:id/tasks/:taskId", (req, res) => {
  const operatorId = req.params.id;
  const { taskId } = req.params;
  const { completed } = req.body || {};

  try {
    const updatedTasks = updateTaskCompletion(operatorId, taskId, completed);
    res.json({
      tasks: updatedTasks.map(task => ({ ...task }))
    });
  } catch (error) {
    console.error("Error updating operator task:", error);
    res.status(500).json({ error: "Failed to update task status" });
  }
});

app.post("/operators/:operatorId/bins/:binId/clear", async (req, res) => {
  const { operatorId, binId } = req.params;
  const { completed = true, note = "" } = req.body || {};
  const timestamp = new Date().toISOString();

  try {
    ensureOperatorState(operatorId);
    let updatedBinData = null;

    if (completed) {
      if (binId === "bin1" && db) {
        const binSnapshot = await db.ref("bins/bin1").once("value");
        const currentData = binSnapshot.val() || {};
        const updates = {
          fillPct: 0,
          weightKg: 0,
          status: "Normal",
          lastClearedAt: timestamp,
          lastClearedBy: operatorId
        };
        await db.ref("bins/bin1").update(updates);
        updatedBinData = { ...currentData, ...updates };
      } else if (firestore) {
        const docRef = firestore.collection("bins").doc(binId);
        const docSnapshot = await docRef.get();
        if (!docSnapshot.exists) {
          if (!dummyBins[binId]) {
            return res.status(404).json({ error: "Bin not found" });
          }
        } else {
          const updates = {
            status: "Normal",
            fillPct: 0,
            weightKg: 0,
            lastClearedAt: timestamp,
            lastClearedBy: operatorId
          };
          if (note) {
            updates.lastClearedNote = note;
          }
          updates.history = admin.firestore.FieldValue.arrayUnion({
            type: "clear",
            operatorId,
            timestamp,
            note
          });
          await docRef.set(updates, { merge: true });
          const refreshed = await docRef.get();
          updatedBinData = refreshed.data();
        }
      }

      if (!updatedBinData) {
        if (!dummyBins[binId]) {
          return res.status(404).json({ error: "Bin not found" });
        }
        dummyBins[binId] = {
          ...dummyBins[binId],
          status: "Normal",
          fillPct: 0,
          weightKg: 0,
          lastClearedAt: timestamp,
          lastClearedBy: operatorId
        };
        if (!dummyBins[binId].history) {
          dummyBins[binId].history = [];
        }
        dummyBins[binId].history.push({
          ts: timestamp,
          type: "clear",
          operatorId,
          note
        });
        updatedBinData = dummyBins[binId];
      }
    } else if (dummyBins[binId]) {
      updatedBinData = dummyBins[binId];
    }

    const completedBins = toggleCompletedBin(operatorId, binId, completed, { note });
    res.json({
      completedBins,
      bin: updatedBinData,
      timestamp
    });
  } catch (error) {
    console.error("Error updating bin clearance status:", error);
    res.status(500).json({ error: "Failed to update bin clearance status" });
  }
});

// ================= Bin Management =================

// Create new bin
app.post("/bins", async (req, res) => {
  const { id, name, location, capacity, operatorId, status } = req.body;
  
  if (!id) {
    return res.status(400).json({ error: "Bin ID is required" });
  }
  
  const binData = {
    weightKg: 0,
    fillPct: 0,
    status: status || "Active",
    updatedAt: new Date().toISOString(),
    name: name || id,
    location: location || '',
    capacity: capacity || 50,
    operatorId: operatorId || '',
    history: [],
    createdAt: new Date().toISOString()
  };
  
  try {
    if (firestore) {
      await firestore.collection('bins').doc(id).set(binData);
      res.json({ message: "Bin created successfully", bin: binData });
    } else {
      dummyBins[id] = binData;
      res.json({ message: "Bin created successfully", bin: binData });
    }
  } catch (error) {
    console.error("Error creating bin:", error);
    res.status(500).json({ error: "Failed to create bin" });
  }
});

// Update bin
app.put("/bins/:id", async (req, res) => {
  const id = req.params.id;
  const { name, location, capacity, operatorId, status } = req.body;
  
  try {
    if (firestore) {
      const binDoc = await firestore.collection('bins').doc(id).get();
      if (!binDoc.exists) {
        return res.status(404).json({ error: "Bin not found" });
      }
      
      const updateData = {
        name: name || binDoc.data().name,
        location: location || binDoc.data().location,
        capacity: capacity || binDoc.data().capacity,
        operatorId: operatorId || binDoc.data().operatorId,
        status: status || binDoc.data().status,
        updatedAt: new Date().toISOString()
      };
      
      await firestore.collection('bins').doc(id).update(updateData);
      res.json({ message: "Bin updated successfully", bin: updateData });
    } else {
      if (!dummyBins[id]) {
        return res.status(404).json({ error: "Bin not found" });
      }
      
      dummyBins[id] = {
        ...dummyBins[id],
        name: name || dummyBins[id].name,
        location: location || dummyBins[id].location,
        capacity: capacity || dummyBins[id].capacity,
        operatorId: operatorId || dummyBins[id].operatorId,
        status: status || dummyBins[id].status,
        updatedAt: new Date().toISOString()
      };
      
      res.json({ message: "Bin updated successfully", bin: dummyBins[id] });
    }
  } catch (error) {
    console.error("Error updating bin:", error);
    res.status(500).json({ error: "Failed to update bin" });
  }
});

// Delete bin
app.delete("/bins/:id", async (req, res) => {
  const id = req.params.id;
  
  try {
    if (firestore) {
      const binDoc = await firestore.collection('bins').doc(id).get();
      if (!binDoc.exists) {
        return res.status(404).json({ error: "Bin not found" });
      }
      
      await firestore.collection('bins').doc(id).delete();
      res.json({ message: "Bin deleted successfully" });
    } else {
      if (!dummyBins[id]) {
        return res.status(404).json({ error: "Bin not found" });
      }
      
      delete dummyBins[id];
      res.json({ message: "Bin deleted successfully" });
    }
  } catch (error) {
    console.error("Error deleting bin:", error);
    res.status(500).json({ error: "Failed to delete bin" });
  }
});

// ==========================================

// Test alert endpoint
app.post("/test-alert/:binId", async (req, res) => {
  const binId = req.params.binId;
  const { fillPct = 85, weightKg = 8.5 } = req.body;
  
  try {
    // Find operator for this bin
    const operator = operators.find(op => op.assignedBins?.includes(binId)) || operators[0];
    
    if (operator) {
      // Send test alert
      sendBinAlertEmail(operator, {
        id: binId,
        weightKg,
        fillPct,
        status: "NEEDS_EMPTYING",
        location: "Test Location"
      });
      
      res.json({ 
        message: "Test alert sent!",
        sentTo: operator.email,
        binId,
        fillPct,
        weightKg
      });
    } else {
      res.status(404).json({ error: "No operator found for this bin" });
    }
  } catch (error) {
    console.error("Error sending test alert:", error);
    res.status(500).json({ error: "Failed to send test alert" });
  }
});

// ================= Chatbot Endpoints =================
const chatbot = require('./chatbot/gemini');

// POST /chatbot/message - Send message to chatbot
app.post('/chatbot/message', async (req, res) => {
  try {
    const { userId, message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Use a default userId if not provided
    const userIdentifier = userId || 'anonymous';

    // Gather context for chatbot
    const context = {
      bins: cachedBins,
      operators: cachedOperators,
      weather: cachedWeather
    };

    // Get response from chatbot
    const result = await chatbot.chat(userIdentifier, message, context);

    res.json({
      response: result.response,
      timestamp: result.timestamp,
      userId: userIdentifier
    });

  } catch (error) {
    console.error('Chatbot endpoint error:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      response: "I'm having trouble right now. Please try again! 🤖"
    });
  }
});

// GET /chatbot/history/:userId - Get conversation history
app.get('/chatbot/history/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const history = chatbot.getHistory(userId);
    
    res.json({
      userId,
      history,
      messageCount: history.length
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// DELETE /chatbot/history/:userId - Clear conversation history
app.delete('/chatbot/history/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const result = chatbot.clearHistory(userId);
    
    res.json({
      userId,
      message: 'Conversation history cleared',
      ...result
    });
  } catch (error) {
    console.error('Error clearing chat history:', error);
    res.status(500).json({ error: 'Failed to clear history' });
  }
});

// GET /chatbot/stats - Get chatbot statistics
app.get('/chatbot/stats', (req, res) => {
  try {
    const stats = chatbot.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching chatbot stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// POST /chatbot/report - Report issue via chatbot
app.post('/chatbot/report', async (req, res) => {
  try {
    const { userId, binId, issue, description } = req.body;

    if (!binId || !issue) {
      return res.status(400).json({ error: 'binId and issue are required' });
    }

    // Create support ticket (you can expand this)
    const ticket = {
      id: `TICKET-${Date.now()}`,
      userId: userId || 'anonymous',
      binId,
      issue,
      description: description || '',
      status: 'open',
      createdAt: new Date().toISOString()
    };

    // Send message to chatbot about the report
    const message = `Report issue with ${binId}: ${issue}. ${description || ''}`;
    const context = { bins: cachedBins };
    const chatResponse = await chatbot.chat(userId || 'anonymous', message, context);

    res.json({
      ticket,
      chatbotResponse: chatResponse.response,
      message: 'Issue reported successfully'
    });

  } catch (error) {
    console.error('Error reporting issue:', error);
    res.status(500).json({ error: 'Failed to report issue' });
  }
});

const PORT = 5000;
app.listen(PORT, () =>
  console.log(`🚀 Backend running on http://localhost:${PORT}`)
);
