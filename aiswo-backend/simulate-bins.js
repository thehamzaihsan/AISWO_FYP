#!/usr/bin/env node

/**
 * ESP32 Bin Simulator
 * Simulates ESP32 devices pushing random bin data to Firebase Realtime Database
 * Similar to how the .ino file works
 */

const admin = require("firebase-admin");
const fs = require("fs");

// Configuration
const BIN_IDS = ["bin1", "bin2", "bin3", "bin4", "bin5", "bin6"];
const UPDATE_INTERVAL = 5000; // 5 seconds (like ESP32)

// Sensor simulation ranges
const RANGES = {
  fillPct: { min: 0, max: 100 },
  temperature: { min: 15, max: 35 }, // Celsius
  humidity: { min: 30, max: 80 }, // Percentage
  methane: { min: 0, max: 500 }, // PPM
  battery: { min: 60, max: 100 }, // Percentage
  distance: { min: 10, max: 400 } // cm
};

let db = null;
let isRunning = false;

// Initialize Firebase
function initializeFirebase() {
  try {
    let serviceAccount;
    let databaseURL;
    
    if (fs.existsSync('./serviceAccountKey.json')) {
      serviceAccount = require("./serviceAccountKey.json");
      const projectId = serviceAccount.project_id;
      databaseURL = process.env.FIREBASE_DATABASE_URL || 
                    `https://${projectId}-default-rtdb.asia-southeast1.firebasedatabase.app`;
    } else {
      throw new Error('serviceAccountKey.json not found');
    }

    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: databaseURL
      });
    }
    
    db = admin.database();
    console.log('✅ Connected to Firebase Realtime Database');
    console.log(`🔗 Database URL: ${databaseURL}\n`);
    return true;
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    return false;
  }
}

// Generate random value within range
function randomValue(min, max, decimals = 0) {
  const value = Math.random() * (max - min) + min;
  return decimals > 0 ? parseFloat(value.toFixed(decimals)) : Math.round(value);
}

// Simulate realistic sensor drift (values change gradually)
const binStates = {};

function initializeBinState(binId) {
  binStates[binId] = {
    fillPct: randomValue(RANGES.fillPct.min, RANGES.fillPct.max),
    temperature: randomValue(RANGES.temperature.min, RANGES.temperature.max, 1),
    humidity: randomValue(RANGES.humidity.min, RANGES.humidity.max, 1),
    methane: randomValue(RANGES.methane.min, RANGES.methane.max),
    battery: randomValue(RANGES.battery.min, RANGES.battery.max),
    distance: randomValue(RANGES.distance.min, RANGES.distance.max)
  };
}

// Gradually change values (realistic sensor behavior)
function updateBinState(binId) {
  if (!binStates[binId]) {
    initializeBinState(binId);
  }

  const state = binStates[binId];
  
  // Fill level increases slowly (trash accumulation)
  state.fillPct = Math.min(100, state.fillPct + randomValue(-2, 5));
  
  // Temperature fluctuates slightly
  state.temperature += randomValue(-1, 1, 1);
  state.temperature = Math.max(RANGES.temperature.min, Math.min(RANGES.temperature.max, state.temperature));
  
  // Humidity changes slowly
  state.humidity += randomValue(-3, 3, 1);
  state.humidity = Math.max(RANGES.humidity.min, Math.min(RANGES.humidity.max, state.humidity));
  
  // Methane spikes occasionally (decomposition)
  if (Math.random() > 0.8) {
    state.methane = randomValue(100, RANGES.methane.max);
  } else {
    state.methane = Math.max(0, state.methane - randomValue(10, 30));
  }
  
  // Battery drains slowly
  state.battery = Math.max(RANGES.battery.min, state.battery - randomValue(0, 0.5, 1));
  
  // Distance decreases as bin fills (ultrasonic sensor)
  state.distance = Math.round(400 - (state.fillPct / 100) * 390);
  
  return state;
}

// Convert sensor data to ESP32 format
function generateBinData(binId) {
  const state = updateBinState(binId);
  
  return {
    binId: binId,
    fillPct: Math.round(state.fillPct),
    temperature: parseFloat(state.temperature.toFixed(1)),
    humidity: parseFloat(state.humidity.toFixed(1)),
    methane: Math.round(state.methane),
    battery: Math.round(state.battery),
    distance: state.distance,
    timestamp: new Date().toISOString(),
    deviceId: `ESP32_${binId.toUpperCase()}`,
    latitude: 31.5204 + (Math.random() - 0.5) * 0.01, // Lahore coords with variation
    longitude: 74.3587 + (Math.random() - 0.5) * 0.01,
    status: state.fillPct > 80 ? 'critical' : state.fillPct > 60 ? 'warning' : 'normal'
  };
}

// Push data to Firebase (like ESP32 does)
async function pushBinData(binId) {
  if (!db) return;
  
  const binData = generateBinData(binId);
  
  try {
    // Push to Firebase Realtime Database
    await db.ref(`bins/${binId}`).set(binData);
    
    // Log the update
    const statusEmoji = binData.fillPct > 80 ? '🔴' : binData.fillPct > 60 ? '🟡' : '🟢';
    console.log(`${statusEmoji} ${binId}: ${binData.fillPct}% | Temp: ${binData.temperature}°C | Methane: ${binData.methane} PPM | Battery: ${binData.battery}%`);
    
  } catch (error) {
    console.error(`❌ Error updating ${binId}:`, error.message);
  }
}

// Update all bins
async function updateAllBins() {
  for (const binId of BIN_IDS) {
    await pushBinData(binId);
  }
  console.log('─'.repeat(100));
}

// Start simulation
function startSimulation() {
  if (isRunning) {
    console.log('⚠️  Simulation already running');
    return;
  }
  
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║              🗑️  ESP32 Bin Data Simulator Started                   ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝\n');
  console.log(`📡 Simulating ${BIN_IDS.length} bins: ${BIN_IDS.join(', ')}`);
  console.log(`⏱️  Update interval: ${UPDATE_INTERVAL / 1000} seconds`);
  console.log(`🔗 Database: Firebase Realtime Database\n`);
  console.log('Press Ctrl+C to stop\n');
  console.log('─'.repeat(100));
  
  // Initialize all bins
  BIN_IDS.forEach(binId => initializeBinState(binId));
  
  // First update immediately
  updateAllBins();
  
  // Then update periodically
  const interval = setInterval(updateAllBins, UPDATE_INTERVAL);
  isRunning = true;
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Stopping simulator...');
    clearInterval(interval);
    isRunning = false;
    console.log('✅ Simulator stopped\n');
    process.exit(0);
  });
}

// Main
async function main() {
  console.log('\n🚀 Starting ESP32 Bin Simulator...\n');
  
  if (!initializeFirebase()) {
    console.error('\n❌ Failed to initialize Firebase. Exiting.\n');
    process.exit(1);
  }
  
  startSimulation();
}

// Run
main();
