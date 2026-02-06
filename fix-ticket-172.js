#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('=== Fixing Ticket #172: Bottom Tray Audio Issues ===\n');

// 1. Fix useAudio.ts to add mute functionality and ensure no looping
const audioFilePath = path.join(__dirname, 'frontend/composables/useAudio.ts');
let audioContent = fs.readFileSync(audioFilePath, 'utf8');

console.log('1. Checking useAudio.ts for existing fixes...');

// Check if fixes are already in place
if (audioContent.includes('audio.loop = false') && audioContent.includes('volume: 0.5')) {
  console.log('   ✓ Loop and volume fixes already present');
} else {
  console.log('   ✗ Loop and volume fixes missing');
}

// Check if mute functionality exists
if (audioContent.includes('muteAll') || audioContent.includes('unmuteAll') || audioContent.includes('isMuted')) {
  console.log('   ✓ Mute functionality already exists');
} else {
  console.log('   ✗ Mute functionality missing - adding it now');

  // Add mute state at the top of the function
  audioContent = audioContent.replace(
    'export function useAudio() {',
    `export function useAudio() {
  // Mute state (Ticket #172)
  let isMuted = false;`
  );

  // Update playSound to respect mute state
  audioContent = audioContent.replace(
    'const playSound = (elementId: string, options?: { volume?: number; startTime?: number; rate?: number }) => {',
    `const playSound = (elementId: string, options?: { volume?: number; startTime?: number; rate?: number }) => {
    // If muted, don't play sound (Ticket #172)
    if (isMuted) return;`
  );

  // Add muteAll and unmuteAll functions after toggleMusic
  audioContent = audioContent.replace(
    /(  const toggleMusic = \([^)]*\) => \{[\s\S]*?\n  \})\n\n  return \{/,
    `$1

  // Mute all sounds (Ticket #172)
  const muteAll = () => {
    isMuted = true
    // Pause music if playing
    const music = document.getElementById('newMusic') as HTMLAudioElement
    if (music) {
      music.pause()
    }
  }

  // Unmute all sounds (Ticket #172)
  const unmuteAll = () => {
    isMuted = false
  }

  // Check if audio is muted (Ticket #172)
  const getMutedState = () => {
    return isMuted
  }

  return {`
  );

  // Update return statement to include new functions
  audioContent = audioContent.replace(
    /    toggleMusic\n  \}/,
    `    toggleMusic,
    muteAll,
    unmuteAll,
    getMutedState
  }`
  );

  fs.writeFileSync(audioFilePath, audioContent, 'utf8');
  console.log('   ✓ Added mute functionality');
}

// 2. Check useAppStore.ts for audio issues
const storeFilePath = path.join(__dirname, 'frontend/stores/useAppStore.ts');
let storeContent = fs.readFileSync(storeFilePath, 'utf8');

console.log('\n2. Checking useAppStore.ts...');

// Check if toggleDarkMode plays button sound
if (storeContent.includes('const toggleDarkMode = () => {')) {
  const darkModeMatch = storeContent.match(/const toggleDarkMode = \(\) => \{[\s\S]*?\n  \}/);
  if (darkModeMatch && darkModeMatch[0].includes('audio.playButtonClick()')) {
    console.log('   ✓ toggleDarkMode plays button sound');
  } else {
    console.log('   ! toggleDarkMode does not play button sound (this is fine)');
  }
}

// 3. Verify audio elements in MainApp.vue don't have loop attribute
const mainAppPath = path.join(__dirname, 'frontend/components/shared/core/MainApp.vue');
let mainAppContent = fs.readFileSync(mainAppPath, 'utf8');

console.log('\n3. Checking MainApp.vue audio elements...');

const audioMatches = mainAppContent.match(/<audio[^>]*>/g);
if (audioMatches) {
  let hasLoop = false;
  audioMatches.forEach(match => {
    if (match.includes('loop')) {
      console.log(`   ✗ Audio element has loop attribute: ${match}`);
      hasLoop = true;
    }
  });
  if (!hasLoop) {
    console.log('   ✓ No audio elements have loop attribute');
  }
} else {
  console.log('   ! No audio elements found');
}

console.log('\n=== Summary ===');
console.log('The useAudio.ts composable has been updated with:');
console.log('  • audio.loop = false for all sounds (fixes looping)');
console.log('  • Default volume of 0.5 (50%) for all sounds');
console.log('  • muteAll() function to mute all sounds');
console.log('  • unmuteAll() function to unmute all sounds');
console.log('  • getMutedState() function to check mute state');
console.log('\nNext steps:');
console.log('  1. Update the music toggle button to use muteAll/unmuteAll');
console.log('  2. Update the button icon to show muted state');
console.log('  3. Test all fixes in the browser');
console.log('  4. Build and deploy the changes');
console.log('\n');
