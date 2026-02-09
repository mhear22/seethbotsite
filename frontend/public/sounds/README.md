# Sound Effects

This folder contains sound effects for the website.

## Files

### MP3 Files (Current Implementation)
- `click.mp3` - Button click (short tap) - **PLACEHOLDER** (currently a copy of honk sound)
- `success.mp3` - Achievement unlock (positive chime) - **PLACEHOLDER** (currently a copy of honk sound)
- `error.mp3` - Invalid action (negative buzz) - **PLACEHOLDER** (currently a copy of honk sound)
- `panel.mp3` - Panel open/close (soft slide) - **PLACEHOLDER** (currently a copy of honk sound)
- `honk.mp3` - Goose honk - **FINAL** (copied from ../honk-sound.mp3)
- `points.mp3` - Points earned (coin/ding sound) - **PLACEHOLDER** (currently a copy of honk sound)
- `notification.mp3` - Message received (bell) - **PLACEHOLDER** (currently a copy of honk sound)

### WAV Files (Proper Sound Effects - Need Conversion)
The following WAV files contain the actual sound effects but need to be converted to MP3:
- `success.wav` - Positive chime (C5 tone, 200ms) - Ready for conversion
- `error.wav` - Negative buzz (low tone, 200ms) - Ready for conversion
- `panel.wav` - Soft slide (low tone, 50ms) - Ready for conversion
- `points.wav` - Coin/ding sound (A5 tone, 150ms) - Ready for conversion
- `notification.wav` - Bell-like sound (medium tone, 300ms) - Ready for conversion

These WAV files were generated programmatically using `create_sounds.py` and contain simple sine wave tones at appropriate frequencies for each sound effect.

## Conversion Instructions

To convert the WAV files to MP3, you have several options:

### Option 1: Using ffmpeg (Recommended)
```bash
cd /home/seethbotsite/worktrees/ticket-190/frontend/public/sounds
ffmpeg -i success.wav -codec:a libmp3lame -b:a 128k success.mp3
ffmpeg -i error.wav -codec:a libmp3lame -b:a 128k error.mp3
ffmpeg -i panel.wav -codec:a libmp3lame -b:a 128k panel.mp3
ffmpeg -i points.wav -codec:a libmp3lame -b:a 128k points.mp3
ffmpeg -i notification.wav -codec:a libmp3lame -b:a 128k notification.mp3
```

### Option 2: Using online converter
Upload each WAV file to an online WAV-to-MP3 converter and download the resulting MP3 files.

### Option 3: After conversion
Once converted, replace the placeholder MP3 files with the newly converted ones and delete the WAV files.

## Current Status

- ✅ `honk.mp3` - Complete (proper goose honk sound)
- ⏳ Other MP3 files - Currently placeholders, need proper audio
- ✅ WAV source files - Complete (proper sound effects, need conversion)

## Scripts

- `create_sounds.py` - Python script to generate WAV sound files with sine wave tones
- `convert_to_mp3.js` - Node.js script to convert WAV to MP3 (currently broken due to lamejs MPEGMode bug)
- `convert_wav_to_mp3.js` - Alternative Node.js conversion script (also affected by lamejs bug)

## Notes

- All WAV files are 16-bit mono, 44.1kHz sample rate
- The lamejs package has a known bug with MPEGMode that prevents conversion
- Consider replacing lamejs with an alternative or using ffmpeg for production builds
