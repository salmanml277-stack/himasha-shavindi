#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os, json, random, glob
from datetime import datetime
from flask import Flask, render_template, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROFILE_PIC = os.path.join(BASE_DIR, "public", "profile.jpg")
SURPRISE_PATH = os.path.join(BASE_DIR, "public", "media")
MEMORIES_PATH = os.path.join(BASE_DIR, "public", "media")
MUSIC_PATH = os.path.join(BASE_DIR, "public", "media")

FRIENDSHIP_START = datetime(2026, 2, 22, 14, 30)

GATE = [
    {"id":1, "en":"What makes you smile every morning? 🌅", "si":"උදේ පාන්දර ඔබව සිනහවට පත් කරන්නේ කුමක්ද? 🌅", "ta":"காலையில் உங்களை சிரிக்க வைப்பது எது? 🌅"},
    {"id":2, "en":"If your heart had a color today, what would it be? 💙", "si":"අද ඔබේ හදවතට වර්ණයක් තිබුනේ නම්, එය කුමක්ද? 💙", "ta":"இன்று உங்கள் இதயத்திற்கு ஒரு நிறம் இருந்தால், அது என்ன? 💙"},
    {"id":3, "en":"What flower reminds you of yourself? 🌸", "si":"ඔබව මතක් කරන මල කුමක්ද? 🌸", "ta":"உங்களை நினைவூட்டும் மலர் எது? 🌸"}
]

QUOTES = {
    "en": ["🌸 Where you are, flowers bloom", "💙 Your soul is blue skies", "🎵 You are music"],
    "si": ["🌸 ඔබ ඉන්න තැන මල් පිපෙනවා", "💙 ඔබේ ආත්මය නිල් අහස", "🎵 ඔබ සංගීතය"],
    "ta": ["🌸 நீ இருக்கும் இடத்தில் பூக்கள் மலர்கின்றன", "💙 உன் ஆன்மா நீல வானம்", "🎵 நீ இசை"]
}

def get_files(folder, extensions):
    files = []
    if os.path.exists(folder):
        for ext in extensions:
            for f in glob.glob(os.path.join(folder, f"*.{ext}")):
                files.append({"name": os.path.basename(f), "url": f"/media/{os.path.basename(f)}"})
    return files

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/init')
def init():
    memories = get_files(MEMORIES_PATH, ['jpg','jpeg','png','heic','gif'])
    music = get_files(MUSIC_PATH, ['mp3','m4a','wav','flac'])
    wishes = get_files(SURPRISE_PATH, ['mp3','m4a','wav'])
    return jsonify({
        "gate": GATE,
        "memories": memories,
        "music": music,
        "wishes": wishes,
        "friendship": friendship_stats(),
        "profile_exists": os.path.exists(PROFILE_PIC)
    })

@app.route('/profile')
def profile_pic():
    if os.path.exists(PROFILE_PIC):
        return send_from_directory(os.path.dirname(PROFILE_PIC), os.path.basename(PROFILE_PIC))
    return "", 404

@app.route('/api/quote/<lang>')
def quote(lang):
    return jsonify({"quote": random.choice(QUOTES.get(lang, QUOTES['en']))})

@app.route('/api/friendship')
def friendship():
    return jsonify(friendship_stats())

def friendship_stats():
    delta = datetime.now() - FRIENDSHIP_START
    days = delta.days
    hours = delta.seconds // 3600
    minutes = (delta.seconds % 3600) // 60
    seconds = delta.seconds % 60
    percent = min(100, int((days / 60) * 100)) if days < 60 else 100
    return {"days":days, "hours":hours, "minutes":minutes, "seconds":seconds, "percent":percent}

if __name__ == '__main__':
    print("\n🌸 HIMASHA SHAVINDI · HYPER APP 🌸")
    app.run(host='0.0.0.0', port=5000, debug=False)
# force deploy
