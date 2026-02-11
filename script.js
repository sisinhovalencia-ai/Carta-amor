const startDate = new Date(2022, 8, 2);

/* ========================= */
/* ABRIR SOBRE */
/* ========================= */

function openEnvelope() {
    document.querySelector('.envelope-wrapper').classList.add('open');
    document.querySelector('.heart-btn').style.display = 'none';

    playMusic();

    setTimeout(() => {
        document.getElementById('envelope-screen').classList.add('hidden');
        document.getElementById('main-scene').classList.add('visible');
        animateTreeGrowth();
    }, 1500);
}

/* ========================= */
/* CANVAS ÁRBOL */
/* ========================= */

const canvas = document.getElementById('treeCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 400;
canvas.height = 400;

const startLength = 80;
const branchWidth = 12;
const startX = canvas.width / 2;
const startY = canvas.height;

/* 🔥 Variables para análisis de audio */
let audioContext;
let analyser;
let source;
let dataArray;
let glowStrength = 0;

function setupAudioAnalyzer() {

    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    source = audioContext.createMediaElementSource(audio);
    analyser = audioContext.createAnalyser();

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    source.connect(analyser);
    analyser.connect(audioContext.destination);

    animateTreeGlow();
}

/* 🌟 Árbol con brillo reactivo */
function drawBranch(x, y, len, width, angle) {

    ctx.beginPath();
    ctx.save();

    ctx.shadowBlur = glowStrength;
    ctx.shadowColor = "rgba(255, 0, 120, 0.9)";

    ctx.strokeStyle = '#3e2723';
    ctx.lineWidth = width;
    ctx.lineCap = 'round';

    ctx.translate(x, y);
    ctx.rotate(angle * Math.PI / 180);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -len);
    ctx.stroke();

    if (len < 8) {
        ctx.restore();
        return;
    }

    const angleLeft = 15 + Math.random() * 15;
    const angleRight = 15 + Math.random() * 15;

    const lenLeft = len * (0.7 + Math.random() * 0.1);
    const lenRight = len * (0.7 + Math.random() * 0.1);

    drawBranch(0, -len, lenLeft, width * 0.7, -angleLeft);
    drawBranch(0, -len, lenRight, width * 0.7, angleRight);

    if (Math.random() < 0.3 && len > 20) {
        drawBranch(0, -len, len * 0.6, width * 0.6, (Math.random() * 10 - 5));
    }

    ctx.restore();
}

function animateTreeGrowth() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBranch(startX, startY, startLength, branchWidth, 0);
    setTimeout(bloomTreeHeartShape, 800);
}

/* 🔥 Animación que calcula brillo según volumen */
function animateTreeGlow() {

    if (!analyser) return;

    analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
    }

    let average = sum / dataArray.length;

    glowStrength = average / 4; // Ajusta sensibilidad aquí

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBranch(startX, startY, startLength, branchWidth, 0);

    requestAnimationFrame(animateTreeGlow);
}

/* ========================= */
/* CORAZÓN DE HOJAS */
/* ========================= */

function bloomTreeHeartShape() {

    const heartsContainer = document.getElementById('hearts-container');
    heartsContainer.innerHTML = '';

    const colors = [
        '#ff0055',
        '#ff4d4d',
        '#ff6699',
        '#ff3366',
        '#ff1a75'
    ];

    const numberOfHearts = window.innerWidth < 600 ? 1600 : 2800;

    const centerX = 50;
    const centerY = 40;
    const scaleX = 3.4;
    const scaleY = 2.8;

    for (let i = 0; i < numberOfHearts; i++) {

        const heart = document.createElement('div');
        heart.classList.add('heart-leaf');

        heart.style.background =
            colors[Math.floor(Math.random() * colors.length)];

        const size = Math.random() * 6 + 4;
        heart.style.width = `${size}px`;
        heart.style.height = `${size}px`;

        let t = Math.random() * Math.PI * 2;

        let x = 16 * Math.pow(Math.sin(t), 3);
        let y =
            13 * Math.cos(t) -
            5 * Math.cos(2 * t) -
            2 * Math.cos(3 * t) -
            Math.cos(4 * t);

        let r = Math.pow(Math.random(), 0.5);
        x *= r;
        y *= r;

        x *= 1.25;

        let finalLeft = centerX + (x * scaleX);
        let finalTop = centerY - (y * scaleY);

        heart.style.left = finalLeft + '%';
        heart.style.top = finalTop + '%';

        heart.style.animation =
            `bloom 0.8s ease-out ${Math.random() * 1.5}s forwards`;

        heartsContainer.appendChild(heart);
    }
}

/* ========================= */
/* 🎵 MÚSICA PROFESIONAL */
/* ========================= */

const audio = document.getElementById('bg-music');
let fadeInterval = null;

function playMusic() {

    audio.muted = false;
    audio.setAttribute("playsinline", "");
    audio.setAttribute("webkit-playsinline", "");

    if (!audioContext) {
        setupAudioAnalyzer();
    }

    audio.volume = 0;

    audio.play().then(() => {

        if (audioContext.state === "suspended") {
            audioContext.resume();
        }

        clearInterval(fadeInterval);

        fadeInterval = setInterval(() => {
            if (audio.volume < 0.5) {
                audio.volume += 0.02;
            } else {
                audio.volume = 0.5;
                clearInterval(fadeInterval);
            }
        }, 100);

    }).catch(() => console.log("Interacción requerida"));
}

function toggleMusic() {

    audio.muted = false;

    if (audio.paused) {
        playMusic();
    } else {

        clearInterval(fadeInterval);

        fadeInterval = setInterval(() => {
            if (audio.volume > 0.02) {
                audio.volume -= 0.02;
            } else {
                audio.volume = 0;
                audio.pause();
                clearInterval(fadeInterval);
            }
        }, 100);
    }
}

function updateMusicIcon() {

    const btn = document.querySelector('.music-btn i');
    const txt = document.getElementById('music-text');

    if (!audio.paused) {
        btn.classList.remove('fa-music');
        btn.classList.add('fa-pause');
        txt.innerText = "Pausar";
    } else {
        btn.classList.add('fa-music');
        btn.classList.remove('fa-pause');
        txt.innerText = "Música";
    }
}

audio.addEventListener("play", updateMusicIcon);
audio.addEventListener("pause", updateMusicIcon);

/* ========================= */
/* ⏳ CONTADOR */
/* ========================= */

function updateTimer() {

    const now = new Date();
    const diff = now - startDate;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    document.getElementById("counter").innerText =
        `${days} días, ${hours}h ${minutes}m ${seconds}s`;
}

setInterval(updateTimer, 1000);
updateTimer();
