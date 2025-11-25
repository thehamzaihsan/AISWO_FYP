#!/usr/bin/env node

/**
 * ESP32 Bin Simulator
 * Simulates ESP32 devices pushing random bin data to Firebase Realtime Database
 * Similar to how the .ino file works
 */

const admin = require("firebase-admin");
const fs = require("fs");

// Configuration
const BIN_IDS = ["bin2", "bin3", "bin4", "bin5", "bin6"]; // bin1 is for real hardware
const UPDATE_INTERVAL = 5000; // 5 seconds (like ESP32)

// Bin configurations (matching real bins)
const BIN_CONFIGS = {
  bin2: { name: "Kitchen Bin", location: "Kitchen", capacity: 5 },
  bin3: { name: "Living Room Bin", location: "Living Room", capacity: 4 },
  bin4: { name: "Bathroom Bin", location: "Bathroom", capacity: 3 },
  bin5: { name: "Office Bin", location: "Office", capacity: 4 },
  bin6: { name: "Garage Bin", location: "Garage", capacity: 6 }
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
  const capacity = BIN_CONFIGS[binId].capacity;
  const initialWeight = randomValue(0, capacity * 0.3, 2); // Start 0-30% full
  const initialFillPct = (initialWeight / capacity) * 100;
  
  binStates[binId] = {
    weightKg: initialWeight,
    fillPct: initialFillPct
  };
}

// Gradually change values (realistic sensor behavior)
function updateBinState(binId) {
  if (!binStates[binId]) {
    initializeBinState(binId);
  }

  const state = binStates[binId];
  const capacity = BIN_CONFIGS[binId].capacity;
  
  // Weight increases slowly (trash accumulation)
  // Randomly add 0-50g, occasionally remove trash (emptying)
  const weightChange = Math.random() < 0.95 ? randomValue(0, 0.05, 3) : -state.weightKg * 0.8;
  state.weightKg = Math.max(0, Math.min(capacity, state.weightKg + weightChange));
  
  // Calculate fill percentage from weight
  state.fillPct = parseFloat(((state.weightKg / capacity) * 100).toFixed(2));
  
  return state;
}

// Convert sensor data to ESP32 format (matching .ino file exactly)
function generateBinData(binId) {
  const state = updateBinState(binId);
  const config = BIN_CONFIGS[binId];
  const isBlocked = Math.random() < 0.02; // 2% chance of blockage
  
  // Determine status (matching ESP32 logic)
  let status;
  if (isBlocked || state.fillPct >= 90) {
    status = "NEEDS_EMPTYING";
  } else if (state.fillPct >= 70) {
    status = "Warning";
  } else {
    status = "Normal";
  }
  
  // Match exact ESP32 format: weightKg, fillPct, status, isBlocked, updatedAt, name, location, capacity
  return {
    weightKg: parseFloat(state.weightKg.toFixed(5)),
    fillPct: state.fillPct,
    status: status,
    isBlocked: isBlocked,
    updatedAt: new Date().toISOString(),
    name: config.name,
    location: config.location,
    capacity: config.capacity
  };
}

// Push data to Firebase (like ESP32 does)
async function pushBinData(binId) {
  if (!db) return;
  
  const binData = generateBinData(binId);
  
  try {
    // Update main bin data (matching ESP32 updateNode behavior)
    await db.ref(`bins/${binId}`).update(binData);
    
    // Add to history (matching ESP32 addToHistory)
    await db.ref(`bins/${binId}/history`).push({
      weightKg: binData.weightKg,
      fillPct: binData.fillPct,
      timestamp: binData.updatedAt
    });
    
    // Log the update
    const statusEmoji = binData.fillPct >= 90 ? '🔴' : binData.fillPct >= 70 ? '🟡' : '🟢';
    console.log(`${statusEmoji} ${binId} (${binData.name}): ${binData.fillPct.toFixed(2)}% | Weight: ${binData.weightKg.toFixed(3)}kg | ${binData.status}`);
    
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
  console.log(`📡 Simulating ${BIN_IDS.length} bins (bin1 is reserved for real ESP32 hardware):`);
  BIN_IDS.forEach(id => {
    const config = BIN_CONFIGS[id];
    console.log(`   - ${id}: ${config.name} (${config.location}) - ${config.capacity}kg capacity`);
  });
  console.log(`\n⏱️  Update interval: ${UPDATE_INTERVAL / 1000} seconds`);
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
