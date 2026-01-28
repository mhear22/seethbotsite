// Cool quotes
const quotes = [
    "Stay curious, keep asking questions.",
    "The best way to predict future is to create it.",
    "Every moment is a fresh beginning.",
    "Chaos is just order waiting to be discovered.",
    "Your potential is endless.",
    "Keep being weird.",
    "Normal is overrated.",
    "Be energy you want to see in world."
];

// Cat images
const catImages = [
    "https://cataas.com/cat/cute-cat-1/600/398.jpg",
    "https://cataas.com/cat/orange-tabby/600/417.jpg",
    "https://cataas.com/cat/siamese/600/374.jpg",
    "https://cataas.com/cat/fluffy/600/385.jpg",
    "https://cataas.com/cat/silly/600/388.jpg"
];

let currentCatIndex = 0;
let quoteIndex = 0;

// Quote update
document.getElementById('quoteBtn').addEventListener('click', function() {
    // Spring bounce
    const btn = this;
    btn.style.animation = 'springBounce 0.2s ease';
    setTimeout(() => {
        btn.style.animation = '';
    }, 400);

    quoteIndex = (quoteIndex + 1) % quotes.length;
    const quote = quotes[quoteIndex];
    const quoteElement = document.getElementById('quote');
    if (quoteElement) {
        quoteElement.textContent = `"${quote}"`;
        quoteElement.style.animation = 'springBounce 0.3s ease';
        setTimeout(() => {
            quoteElement.style.animation = '';
        }, 400);
    }
});

// Cat panel
document.getElementById('catBtn').addEventListener('click', function() {
    const catPanel = document.getElementById('catPanel');
    if (catPanel) {
        catPanel.classList.toggle('collapsed');
    }
});

document.getElementById('catClose').addEventListener('click', function() {
    const catPanel = document.getElementById('catPanel');
    if (catPanel) {
        catPanel.classList.add('collapsed');
    }
});

// Load random cat
function loadRandomCat() {
    currentCatIndex = Math.floor(Math.random() * catImages.length);
    const catImage = document.getElementById('catImage');
    if (catImage) {
        catImage.src = catImages[currentCatIndex];
    }
}

loadRandomCat();
setInterval(loadRandomCat, 10000);

// Tachometer
let tachValue = 77;
let fartClicked = false;

document.getElementById('fartBtn').addEventListener('click', function() {
    if (fartClicked) return;
    fartClicked = true;

    // Play sound effect
    const music = document.getElementById('fartSound');
    music.currentTime = 0;
    music.play();

    // Show confirmation
    setTimeout(function() {
        const confirmation = document.getElementById('confirmation');
        if (confirmation) {
            confirmation.classList.add('active');
        }
    }, 300);

    // Particle explosion effect
    const btn = this;
    btn.classList.add('exploded');

    setTimeout(() => {
        btn.classList.remove('exploded');
        fartClicked = false;
    }, 500);

    // Randomize value with spring animation
    const valueElement = document.getElementById('tachValue');
    const needle = document.getElementById('tachNeedle');
    const randomValue = Math.floor(Math.random() * 100);
    if (valueElement) {
        valueElement.textContent = randomValue + '%';
        valueElement.style.animation = 'springBounce 0.3s ease';
        setTimeout(() => {
            valueElement.style.animation = '';
        }, 400);
    }

    const randomAngle = -90 + (Math.random() * 180);
    if (needle) {
        needle.style.animation = 'needleSwing 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite';
        needle.style.transform = `rotate(${randomAngle}deg)`;
    }
});

// Button functionality
document.getElementById('turnMe').addEventListener('click', function() {
    // Play sound effect
    const music = document.getElementById('fartSound');
    music.currentTime = 0;
    music.play();

    // Show confirmation
    setTimeout(function() {
        const confirmation = document.getElementById('confirmation');
        if (confirmation) {
            confirmation.classList.add('active');
        }
    }, 300);
});

document.getElementById('backBtn').addEventListener('click', function() {
    const confirmation = document.getElementById('confirmation');
    if (confirmation) {
        confirmation.classList.remove('active');
    }
});

// Dark mode toggle
let darkMode = false;
document.getElementById('darkBtn').addEventListener('click', function() {
    darkMode = !darkMode;
    document.body.classList.toggle('dark', darkMode);
    this.textContent = darkMode ? '🌙' : '☀️';
    this.style.background = darkMode ? 'rgba(40, 44, 52, 0.9)' : 'rgba(255, 255, 255, 0.8)';
});

// Music toggle
let musicPlaying = false;
document.getElementById('musicBtn').addEventListener('click', function() {
    const music = document.getElementById('newMusic');
    musicPlaying = !musicPlaying;

    if (musicPlaying) {
        music.play();
        this.style.background = 'rgba(255, 182, 193, 0.9)';
    } else {
        music.pause();
        this.style.background = 'rgba(255, 255, 255, 0.8)';
    }
});

// Feed panel toggle
let feedOpen = false;
document.getElementById('feedToggle').addEventListener('click', function() {
    feedOpen = !feedOpen;
    const feedPanel = document.getElementById('feedPanel');
    if (feedPanel) {
        feedPanel.classList.toggle('collapsed', !feedOpen);
    }
});

document.getElementById('feedClose').addEventListener('click', function() {
    feedOpen = false;
    const feedPanel = document.getElementById('feedPanel');
    if (feedPanel) {
        feedPanel.classList.add('collapsed');
    }
});

// Rankings panel
document.getElementById('rankingsClose').addEventListener('click', function() {
    document.getElementById('rankingsPanel').classList.add('collapsed');
});

// EmulatorJS Player
const emulatorFrame = document.getElementById('emulatorFrame');
const emulatorScreen = document.getElementById('emulatorScreen');
const emulatorOff = document.getElementById('emulatorOff');

// Load Pokemon Emerald ROM
const romUrl = 'https://ajones-nasbackup.s3.ap-southeast-2.amazonaws.com/AshleyNAS/Pokemon%20-%20Emerald%20Version%20(USA%2C%20Europe).gba?response-content-disposition=inline&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEKX%2F%2F%2F%2F%2FwEaDmFwLXNvdXRoZWFzdC0yIkgwRgIhAL%2BGbuX%2F3oS9kW691yzxWtSXQYYIm3Ckt1sewdbPIKEMAiEAieBunwxb2fiJhW0nAtWofjorf21QwmRl9aR4I17ckgkquQMIbhAEGgw3MDI0ODc3MDU2MTMiDEREZkTYu5%2BJXJuybiqWA6qYnbxhKsPvDP%2Ff5JIFqbl9Et8TZ18vdNfJphOODaNoEWls65ik5zFECa%2BxdUQ%2BGXC053Fi4npPuL384bCpkRkVD0UbzEFGriV51t06Vi%2FUkzc9VR6vboAXKtaZVrifDyn0s9%2FCoYEgbaBTCq9lwmZlCZkkmksS759ZQNtMhJ7JlZF2IY%2BMho9%2BzzbxnRZbjeJhwYrUTKeeZIRbijqdnXZpnZfoyTlI3THgD%2FtKfXBX1uV96JWfK3Y0XuB5BSj81j3zlDd0TYbigK1LtJxYY9Aus4a65ZINkg1gNomMnmCHmDTkCdb8IAmyPL6jMr4rxP1N30&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIA2HD4HXAG7EJDFXXU%2F20260128%2Fap-southeast-2%2Fs3%2Faws4_request&X-Amz-Date=20260128T131553Z&X-Amz-Expires=43200&X-Amz-SignedHeaders=host&X-Amz-Signature=97df14970fd6294cf2bbb80bee4b9a85a21dcc5d91c88efbb356032431c1bd2a';

const screen = document.createElement('canvas');
screen.width = 480;
screen.height = 432;
screen.getContext('2d');
screen.id = 'emulatorScreen';

// ROM data (simplified Pokemon Emerald for demo)
// This is a placeholder - actual ROM would need to be loaded
const romData = new Uint8Array(256 * 1024);

// Simple Game Boy simulator
let emulatorState = {
    running: false,
    screen: 'title',
    player: { x: 240, y: 220, facing: 'right' },
    pixels: new Uint8Array(160 * 144),
    palette: [
        { r: 0xff, g: 0xff, b: 0xff },
        { r: 0x00, g: 0xff, b: 0xff },
        { r: 0xff, g: 0x00, b: 0xff },
        { r: 0xff, g: 0xff, b: 0x00 }
    ]
};

function drawScreen() {
    const ctx = screen.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 480, 432);

    if (emulatorState.running) {
        // Draw game screen
        if (emulatorState.screen === 'title') {
            ctx.fillStyle = '#ff3333';
            ctx.font = 'bold 24px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText('POKEMON EMERALD', 240, 216);
            ctx.font = '12px Courier New';
            ctx.fillText('Press button to start!', 240, 240);
        } else {
            // Draw simple game scene
            ctx.fillStyle = '#1a5c2a';
            ctx.fillRect(0, 0, 480, 432);

            // Draw grass
            ctx.fillStyle = '#228B22';
            ctx.fillRect(0, 380, 480, 52);

            // Draw simple character
            const px = emulatorState.player.x;
            const py = emulatorState.player.y;

            // Draw player
            ctx.fillStyle = '#ff3333';
            ctx.fillRect(px, py, 16, 16);

            // Draw direction indicator
            const dir = emulatorState.player.facing;
            const arrowX = px + 8;
            const arrowY = py + 8;
            ctx.fillStyle = '#ffcc00';
            ctx.beginPath();
            ctx.moveTo(px + 8, py + 8);
            if (dir === 'right') {
                ctx.lineTo(arrowX - 4, arrowY);
                ctx.lineTo(arrowX - 4, arrowY - 8);
                ctx.lineTo(arrowX, arrowY - 8);
            }
            ctx.fill();
        }
    }
}

function gameLoop() {
    drawScreen();
    if (emulatorState.running) {
        requestAnimationFrame(gameLoop);
    }
}

// Controls
document.getElementById('emulatorUp').addEventListener('click', () => {
    if (!emulatorState.running) {
        emulatorState.running = true;
        emulatorOff.style.display = 'none';
        gameLoop();
    }
});

document.getElementById('emulatorDown').addEventListener('click', () => {
    if (emulatorState.running) {
        emulatorState.player.y = Math.min(emulatorState.player.y + 16, 380);
    }
});

document.getElementById('emulatorLeft').addEventListener('click', () => {
    if (emulatorState.running) {
        emulatorState.player.x = Math.max(emulatorState.player.x - 8, 0);
        emulatorState.player.facing = 'left';
    }
});

document.getElementById('emulatorRight').addEventListener('click', () => {
    if (emulatorState.running) {
        emulatorState.player.x = Math.min(emulatorState.player.x + 8, 464);
        emulatorState.player.facing = 'right';
    }
});

document.getElementById('emulatorDown').addEventListener('click', () => {
    if (emulatorState.running) {
        emulatorState.player.y = Math.min(emulatorState.player.y + 16, 380);
    }
});

document.getElementById('emulatorUp').addEventListener('click', () => {
    if (!emulatorState.running) {
        emulatorState.running = true;
        emulatorOff.style.display = 'none';
        gameLoop();
    }
});

// Console log
console.log("🎮 EMULATOR JS INITIALIZED");
console.log("Game Boy Advance controls: ▲◄▼►");
console.log("ROM: Pokemon Emerald Version (USA, Europe)");

// Auto-play music on load
window.addEventListener('load', function() {
    const music = document.getElementById('newMusic');
    music.volume = 0.3;
    music.play().catch(function(error) {
        console.log('Auto-play blocked, waiting for user interaction');
    }).then(function() {
        console.log('Music playing');
    });
});

// Create floating hearts
function createHeart() {
    const heart = document.createElement('div');
    heart.className = 'heart';
    heart.innerHTML = ['💖', '💕', '💗', '💓', '❤️'][Math.floor(Math.random() * 5)];
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.animationDuration = (Math.random() * 3 + 3) + 's';
    document.body.appendChild(heart);

    setTimeout(() => heart.remove(), 6000);
}

setInterval(createHeart, 500);
