#!/bin/bash

# AISWO ESP32 Setup Script
# This script installs everything needed for ESP32 development

set -e

echo "=========================================="
echo "AISWO ESP32 Setup Script"
echo "=========================================="

# Install Arduino IDE GUI (recommended for easier development)
echo ""
echo "Step 1: Installing Arduino IDE..."
echo "----------------------------------------"

# Check if Arduino IDE is already installed
if command -v arduino &> /dev/null; then
    echo "✅ Arduino IDE already installed"
    arduino --version
else
    echo "Installing Arduino IDE via Flatpak..."
    flatpak install -y flathub cc.arduino.IDE2
    echo "✅ Arduino IDE installed"
fi

echo ""
echo "=========================================="
echo "Installation Complete!"
echo "=========================================="
echo ""
echo "Next Steps:"
echo "1. Open Arduino IDE (from Applications menu or run: arduino)"
echo "2. Go to File → Preferences"
echo "3. Add this URL to 'Additional Board Manager URLs':"
echo "   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json"
echo ""
echo "4. Go to Tools → Board → Boards Manager"
echo "5. Search for 'ESP32' and install 'esp32 by Espressif Systems'"
echo ""
echo "6. Go to Sketch → Include Library → Manage Libraries"
echo "7. Search for 'Firebase ESP32 Client' by Mobizt and install it"
echo ""
echo "8. Open the file: /home/hamzaihsan/Desktop/AISWO_FYP/esp32_code/smart_bin_esp32.ino"
echo "9. Update WiFi credentials and Firebase settings"
echo "10. Connect your ESP32 and upload!"
echo ""
echo "=========================================="
