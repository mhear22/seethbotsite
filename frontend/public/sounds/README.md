# Sound Effects

This folder contains sound effects for the website.

## Files

All audio files are in MP3 format, optimized for web use:
- `click.mp3` - Button click (short tap) - 1KB
- `success.mp3` - Achievement unlock (positive chime) - 4.2KB
- `error.mp3` - Invalid action (negative buzz) - 4.2KB
- `panel.mp3` - Panel open/close (soft slide) - 1.7KB
- `honk.mp3` - Goose honk - 5.9KB
- `points.mp3` - Points earned (coin/ding sound) - 3.4KB
- `notification.mp3` - Message received (bell) - 5.8KB

## Audio Specifications

- Format: MP3
- Sample Rate: 44.1kHz
- Channels: Mono
- Bitrate: 128 kbps VBR
- Duration: 50-300ms per sound

## Usage

```javascript
// Using HTML5 Audio
const clickSound = new Audio('/sounds/click.mp3');
clickSound.play();

// Using Web Audio API
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const buffer = await fetch('/sounds/success.mp3').then(r => r.arrayBuffer());
const audioBuffer = await audioContext.decodeAudioData(buffer);
const source = audioContext.createBufferSource();
source.buffer = audioBuffer;
source.connect(audioContext.destination);
source.start();
```

## Implementation Notes

- All sounds are generated programmatically as sine wave tones at appropriate frequencies
- Short duration (50-300ms) to avoid overlapping
- Normalized to ensure consistent volume levels
- Optimized for fast loading and playback

## Files Summary

| File | Purpose | Duration | Frequency | Size |
|------|---------|----------|-----------|------|
| click.mp3 | Button click | 50ms | 1000Hz | 1KB |
| success.mp3 | Achievement | 200ms | C5 (523Hz) | 4.2KB |
| error.mp3 | Error | 200ms | Low tone (150Hz) | 4.2KB |
| panel.mp3 | Panel toggle | 50ms | Low tone (200Hz) | 1.7KB |
| honk.mp3 | Goose honk | ~200ms | N/A (goose sound) | 5.9KB |
| points.mp3 | Points earned | 150ms | A5 (880Hz) | 3.4KB |
| notification.mp3 | Notification | 300ms | Medium tone (600Hz) | 5.8KB |

Total size: ~26KB for all 7 sound effects
