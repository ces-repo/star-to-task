#!/bin/bash

# Build-Skript für Star to Task Add-on

echo "🔨 Building Star to Task Add-on..."

# Lösche alte ZIP-Datei
if [ -f "star-to-task.zip" ]; then
    rm star-to-task.zip
    echo "✅ Alte ZIP-Datei gelöscht"
fi

# Erstelle neue ZIP-Datei
zip -r star-to-task.zip \
    manifest.json \
    background.js \
    experiment.js \
    experiment-schema.json \
    icons/ \
    options/ \
    README.md \
    INSTALLATION.md \
    NEXT_STEPS.md

echo ""
echo "✅ star-to-task.zip erstellt!"
echo ""
ls -lh star-to-task.zip
echo ""
echo "📦 Bereit zur Installation in Thunderbird!"
echo ""
echo "Installation:"
echo "1. Thunderbird → Add-ons → Zahnrad → Add-on aus Datei installieren"
echo "2. Wähle star-to-task.zip"
echo ""
