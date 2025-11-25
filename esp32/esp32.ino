/*
 * AISWO Smart Bin - ESP32 Firebase Integration
 * Sends weight and fill level data to Firebase Realtime Database
 * 
 * Hardware Requirements:
 * - ESP32 Board
 * - HX711 Load Cell Amplifier + Load Cell
 * - HC-SR04 Ultrasonic Sensor
 * 
 * Libraries Required (Install via Arduino Library Manager):
 * - HX711 by Bogdan Necula
 * - Firebase ESP32 Client by Mobizt (v4.4.14 or higher)
 */

#include <WiFi.h>
#include <HX711.h>
#include <FirebaseESP32.h>
#include <addons/TokenHelper.h>
#include <addons/RTDBHelper.h>
#include <time.h>

// ================= WIFI CONFIGURATION =================
#define WIFI_SSID "hamza"
#define WIFI_PASSWORD "hamzai2003"

// ================= FIREBASE CONFIGURATION =================
// Get these from Firebase Console:
// 1. Go to Project Settings > Service Accounts
// 2. Database URL is shown in Realtime Database section
#define FIREBASE_HOST "aiswo-simple-697dd-default-rtdb.asia-southeast1.firebasedatabase.app"
#define FIREBASE_AUTH "7wBKisL50K9KmjUZpSWCtyMdGUYGT0KZhCqcNb4r"  // See setup instructions below

// ================= SENSOR PINS =================
// Weight Sensor (HX711)
#define LOADCELL_DOUT_PIN 4
#define LOADCELL_SCK_PIN  5
float CALIBRATION_FACTOR = -300;

// Ultrasonic Sensor (HC-SR04)
#define TRIG_PIN 14
#define ECHO_PIN 27

// ================= BIN CONFIGURATION =================
#define BIN_CAPACITY_KG 3.0          // 3kg maximum capacity
#define BIN_HEIGHT_CM 25.4           // Bin height: 10 inches = 25.4cm
#define UPDATE_INTERVAL 5000         // Send to Firebase every 5 seconds
int BLOCK_DISTANCE_CM = 10;

// ================= OBJECTS =================
HX711 scale;
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

unsigned long lastUpdate = 0;
bool firebaseReady = false;

// ================= SENSOR FUNCTIONS =================

long readDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  long duration = pulseIn(ECHO_PIN, HIGH, 30000); 
  if (duration == 0) return 0; 
  return duration * 0.034 / 2; 
}

float readWeight() {
  float weight = scale.get_units(5);  // Average of 5 readings
  if (weight < 0) weight = 0;         // Prevent negative weights
  return weight / 1000.0;             // Convert grams to kg
}

float calculateFillPercentage(float weightKg, long distanceCm) {
  // Option 1: Based on weight
  float weightPct = (weightKg / BIN_CAPACITY_KG) * 100;
  
  // Option 2: Based on distance (if ultrasonic is at top of bin)
  float fillLevel = BIN_HEIGHT_CM - distanceCm;
  float distancePct = (fillLevel / BIN_HEIGHT_CM) * 100;
  
  // Use the maximum of both methods
  float fillPct = max(weightPct, distancePct);
  return constrain(fillPct, 0, 100);
}

String determineStatus(float fillPct, bool isBlocked) {
  if (isBlocked || fillPct >= 90) {
    return "NEEDS_EMPTYING";
  } else if (fillPct >= 70) {
    return "Warning";
  } else {
    return "Normal";
  }
}

// ================= SETUP =================
void setup() {
  Serial.begin(115200);
  Serial.println("\n\n=== AISWO Smart Bin - Firebase Edition ===");
  
  // 1. Setup Sensor Pins
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  
  // 2. Setup Load Cell
  Serial.println("Initializing load cell...");
  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
  scale.set_scale(CALIBRATION_FACTOR);
  scale.tare();
  Serial.println("✅ Load cell ready");
  
  // 3. Connect to WiFi
  Serial.print("Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.println("✅ WiFi Connected!");
  Serial.print("📍 IP Address: ");
  Serial.println(WiFi.localIP());
  
  // 4. Setup NTP Time (for proper timestamps)
  Serial.println("Syncing time with NTP...");
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  
  // Wait for time to sync
  time_t now = time(nullptr);
  int retries = 0;
  while (now < 24 * 3600 && retries < 20) {
    delay(500);
    Serial.print(".");
    now = time(nullptr);
    retries++;
  }
  Serial.println();
  if (now > 24 * 3600) {
    Serial.println("✅ Time synchronized");
    Serial.print("📅 Current time: ");
    Serial.println(ctime(&now));
  } else {
    Serial.println("⚠️ Time sync timeout - using millis()");
  }
  
  // 5. Configure Firebase
  Serial.println("Configuring Firebase...");
  config.host = FIREBASE_HOST;
  config.signer.tokens.legacy_token = FIREBASE_AUTH;
  
  // Optional: For debugging
  config.timeout.serverResponse = 10000;
  
  // Initialize Firebase
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  
  // Set buffer sizes
  fbdo.setBSSLBufferSize(1024, 1024);
  fbdo.setResponseSize(1024);
  
  Serial.println("✅ Firebase initialized");
  Serial.println("📡 Starting data transmission...\n");
  
  firebaseReady = true;
}

// ================= MAIN LOOP =================
void loop() {
  // Check if it's time to update Firebase
  if (millis() - lastUpdate >= UPDATE_INTERVAL) {
    lastUpdate = millis();
    
    // Read sensors
    float weightKg = readWeight();
    long distance = readDistance();
    bool isBlocked = (distance > 0 && distance < BLOCK_DISTANCE_CM);
    float fillPct = calculateFillPercentage(weightKg, distance);
    String status = determineStatus(fillPct, isBlocked);
    
    // Print to Serial Monitor
    Serial.println("==========================================");
    Serial.print("Weight: ");
    Serial.print(weightKg, 2);
    Serial.println(" kg");
    
    Serial.print("Distance: ");
    Serial.print(distance);
    Serial.println(" cm");
    
    Serial.print("Fill Level: ");
    Serial.print(fillPct, 1);
    Serial.println(" %");
    
    Serial.print("Blocked: ");
    Serial.println(isBlocked ? "YES" : "NO");
    
    Serial.print("Status: ");
    Serial.println(status);
    
    // Send to Firebase
    if (firebaseReady && WiFi.status() == WL_CONNECTED) {
      sendToFirebase(weightKg, fillPct, status, isBlocked, distance);
    } else {
      Serial.println("❌ Firebase not ready or WiFi disconnected");
    }
    
    Serial.println("==========================================\n");
  }
}

// ================= FIREBASE FUNCTIONS =================
void sendToFirebase(float weightKg, float fillPct, String status, bool isBlocked, long distance) {
  String path = "/bins/bin1";  // Main hardware bin
  
  // Create JSON object
  FirebaseJson json;
  json.set("weightKg", weightKg);
  json.set("fillPct", fillPct);
  json.set("status", status);
  json.set("isBlocked", isBlocked);
  json.set("distance", distance);  // Add ultrasonic distance
  json.set("updatedAt", getTimestamp());
  json.set("name", "Hardware Bin");
  json.set("location", "ESP32 Device");
  json.set("capacity", BIN_CAPACITY_KG);
  
  // Update Firebase using correct API for v4.4.17
  Serial.print("📤 Sending to Firebase... ");
  if (Firebase.setJSON(fbdo, path, json)) {
    Serial.println("✅ Success!");
  } else {
    Serial.println("❌ Failed!");
    Serial.println("Reason: " + fbdo.errorReason());
  }
  
  // Optional: Add to history (for data analytics)
  addToHistory(weightKg, fillPct, distance);
}

void addToHistory(float weightKg, float fillPct, long distance) {
  String historyPath = "/bins/bin1/history";
  
  FirebaseJson historyEntry;
  historyEntry.set("weightKg", weightKg);
  historyEntry.set("fillPct", fillPct);
  historyEntry.set("distance", distance);  // Add distance to history
  historyEntry.set("timestamp", getTimestamp());
  
  // Push to history (creates auto-generated key)
  if (Firebase.pushJSON(fbdo, historyPath, historyEntry)) {
    Serial.println("📊 History updated");
  } else {
    Serial.println("❌ History failed: " + fbdo.errorReason());
  }
}

String getTimestamp() {
  // Get current time from NTP
  time_t now = time(nullptr);
  
  // If time is synced (> 24 hours since epoch), use real time
  if (now > 24 * 3600) {
    // Convert to ISO 8601 format
    struct tm timeinfo;
    gmtime_r(&now, &timeinfo);
    char buffer[30];
    strftime(buffer, sizeof(buffer), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);
    return String(buffer);
  } else {
    // Fallback to millis if time not synced
    return String(millis());
  }
}