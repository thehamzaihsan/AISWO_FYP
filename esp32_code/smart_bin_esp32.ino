/*
 * AISWO Smart Bin - ESP32 Code
 * Sends weight and fill level data to Firebase Realtime Database
 */

#include <WiFi.h>
#include <FirebaseESP32.h>

// ==================== CONFIGURATION ====================
// WiFi Credentials
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

// Firebase Configuration
#define FIREBASE_HOST "aiswo-simple-697dd-default-rtdb.asia-southeast1.firebasedatabase.app"
#define FIREBASE_AUTH "YOUR_FIREBASE_DATABASE_SECRET"  // See instructions below

// Sensor Pins
#define TRIG_PIN 5       // Ultrasonic sensor TRIG pin
#define ECHO_PIN 18      // Ultrasonic sensor ECHO pin
#define WEIGHT_PIN 34    // Load cell HX711 DOUT pin (or analog if using simple sensor)

// Bin Configuration
#define BIN_HEIGHT_CM 100    // Total bin height in cm
#define BIN_CAPACITY_KG 50   // Maximum capacity in kg

// Update interval (milliseconds)
#define UPDATE_INTERVAL 5000  // Send data every 5 seconds

// ==================== FIREBASE SETUP ====================
FirebaseData firebaseData;
FirebaseAuth auth;
FirebaseConfig config;

// ==================== GLOBAL VARIABLES ====================
unsigned long lastUpdate = 0;
float weightKg = 0;
float fillPct = 0;
String status = "Normal";

// ==================== SETUP ====================
void setup() {
  Serial.begin(115200);
  Serial.println("\n\n=== AISWO Smart Bin Starting ===");
  
  // Initialize sensor pins
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(WEIGHT_PIN, INPUT);
  
  // Connect to WiFi
  connectWiFi();
  
  // Configure Firebase
  config.host = FIREBASE_HOST;
  config.signer.tokens.legacy_token = FIREBASE_AUTH;
  
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  
  Serial.println("✅ Firebase initialized");
  Serial.println("📡 Starting data transmission...\n");
}

// ==================== MAIN LOOP ====================
void loop() {
  if (millis() - lastUpdate >= UPDATE_INTERVAL) {
    lastUpdate = millis();
    
    // Read sensors
    weightKg = readWeight();
    fillPct = readFillLevel();
    status = determineStatus(fillPct);
    
    // Send to Firebase
    sendToFirebase();
    
    // Print to Serial Monitor
    printStatus();
  }
}

// ==================== WIFI CONNECTION ====================
void connectWiFi() {
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
}

// ==================== SENSOR READING ====================
float readWeight() {
  // OPTION 1: If using HX711 load cell amplifier
  // Uncomment this and install HX711 library if you have a proper load cell
  /*
  #include <HX711.h>
  HX711 scale;
  scale.begin(WEIGHT_PIN, SCK_PIN);
  scale.set_scale(calibration_factor);
  scale.tare();
  return scale.get_units(10);  // Average of 10 readings
  */
  
  // OPTION 2: Simple analog sensor (e.g., force-sensitive resistor)
  int rawValue = analogRead(WEIGHT_PIN);
  float voltage = (rawValue / 4095.0) * 3.3;  // ESP32 is 12-bit ADC
  float weight = (voltage / 3.3) * BIN_CAPACITY_KG;  // Simple mapping
  
  return weight;
  
  // OPTION 3: Simulated data for testing (comment out when using real sensor)
  // return random(0, BIN_CAPACITY_KG * 100) / 100.0;
}

float readFillLevel() {
  // Read ultrasonic sensor
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  long duration = pulseIn(ECHO_PIN, HIGH);
  float distance = duration * 0.034 / 2;  // Convert to cm
  
  // Calculate fill percentage
  float fillLevel = BIN_HEIGHT_CM - distance;
  float percentage = (fillLevel / BIN_HEIGHT_CM) * 100;
  
  // Constrain between 0-100%
  percentage = constrain(percentage, 0, 100);
  
  return percentage;
  
  // OPTION 2: Simulated data for testing (comment out when using real sensor)
  // return random(0, 100);
}

String determineStatus(float fillPercentage) {
  if (fillPercentage >= 80) {
    return "NEEDS_EMPTYING";
  } else if (fillPercentage >= 60) {
    return "Warning";
  } else {
    return "Normal";
  }
}

// ==================== FIREBASE DATA TRANSMISSION ====================
void sendToFirebase() {
  String path = "/bins/bin1";  // This is the main hardware bin
  
  // Create JSON object
  FirebaseJson json;
  json.set("weightKg", weightKg);
  json.set("fillPct", fillPct);
  json.set("status", status);
  json.set("updatedAt", getTimestamp());
  
  // Send to Firebase
  if (Firebase.updateNode(firebaseData, path, json)) {
    Serial.println("✅ Data sent to Firebase");
  } else {
    Serial.println("❌ Firebase Error: " + firebaseData.errorReason());
  }
  
  // Optional: Add to history
  String historyPath = path + "/history";
  FirebaseJson historyEntry;
  historyEntry.set("weightKg", weightKg);
  historyEntry.set("fillPct", fillPct);
  historyEntry.set("timestamp", getTimestamp());
  
  Firebase.pushJSON(firebaseData, historyPath, historyEntry);
}

String getTimestamp() {
  // Get time from NTP or use millis() for relative time
  // For now, return ISO format timestamp
  return String(millis());
}

void printStatus() {
  Serial.println("==========================================");
  Serial.print("Weight: ");
  Serial.print(weightKg, 2);
  Serial.println(" kg");
  
  Serial.print("Fill Level: ");
  Serial.print(fillPct, 1);
  Serial.println(" %");
  
  Serial.print("Status: ");
  Serial.println(status);
  
  Serial.print("WiFi: ");
  Serial.println(WiFi.status() == WL_CONNECTED ? "Connected" : "Disconnected");
  Serial.println("==========================================\n");
}
