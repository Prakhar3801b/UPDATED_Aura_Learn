/**
 * Aura_Learn AR Core
 * Architecture: Browser Camera -> Socket.IO -> Python Backend
 */

let renderer, scene, camera;
let videoElement;
let animationId = null;
let socket = null;
let frameInterval = null;

// Hand Tracking Simulation
let handLines;
const handJoints = [];

// Mock Data for Experiments
const EXPERIMENT_DATA = {
    physics: { title: "Physics: Pendulum Experiment" },
    chemistry: { title: "Chemistry: Titration" },
    biology: { title: "Biology: Plant Cell" }
};

// Debug Helper
function debugLog(msg) {
    console.log(msg);
    const box = document.getElementById('debug-log-box');
    if (box) {
        box.innerHTML += `> ${msg}<br>`;
        box.scrollTop = box.scrollHeight;
    }
}

export function startARSession(domain) {
    const container = document.getElementById('ar-view-container');
    const startOverlay = document.getElementById('ar-start-overlay');
    const startBtn = document.getElementById('start-ar-btn');

    // Create Debug Box if missing
    if (!document.getElementById('debug-log-box')) {
        const dBox = document.createElement('div');
        dBox.id = 'debug-log-box';
        Object.assign(dBox.style, {
            position: 'absolute', bottom: '10px', right: '10px', width: '300px', height: '150px',
            backgroundColor: 'rgba(0,0,0,0.7)', color: '#0f0', fontFamily: 'monospace',
            fontSize: '12px', padding: '10px', overflowY: 'auto', zIndex: '9999', pointerEvents: 'none'
        });
        document.body.appendChild(dBox);
    }

    stopARSession();
    if (startOverlay) startOverlay.style.display = 'flex';
    document.getElementById('debug-log-box').innerHTML = "Ready to Start...<br>";

    const data = EXPERIMENT_DATA[domain] || EXPERIMENT_DATA.physics;
    document.getElementById('experiment-title').innerText = data.title;

    initThreeJS(container);
    initSocket();

    const newBtn = startBtn.cloneNode(true);
    startBtn.parentNode.replaceChild(newBtn, startBtn);

    newBtn.onclick = () => {
        debugLog("Button Clicked. Starting...");
        startOverlay.style.display = 'none';
        initCamera(container, domain);
        animate();
    };
}

// ... stopARSession ...

function initSocket() {
    if (!window.io) {
        debugLog("ERROR: Socket.IO library missing!");
        return;
    }
    socket = io('http://localhost:5000');
    socket.on('connect', () => debugLog("Socket: Connected!"));
    socket.on('connect_error', (err) => debugLog(`Socket Error: ${err.message}`));
    socket.on('ai_response', (data) => {
        // debugLog(`AI: ${data.status}`); // Too spammy
        updateUIWithAI(data);
    });
}

function initCamera(container, domain) {
    debugLog("Camera: Initializing...");
    videoElement = document.createElement('video');
    videoElement.setAttribute('autoplay', '');
    videoElement.setAttribute('muted', '');
    videoElement.setAttribute('playsinline', '');

    Object.assign(videoElement.style, {
        position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
        objectFit: 'cover', zIndex: '1'
    });

    container.appendChild(videoElement);

    if (!navigator.mediaDevices?.getUserMedia) {
        debugLog("Error: getUserMedia API missing");
        alert("Camera API not supported");
        return;
    }

    navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
    })
        .then(stream => {
            debugLog("Camera: Stream Acquired.");
            videoElement.srcObject = stream;
            videoElement.onloadedmetadata = () => {
                debugLog(`Camera: Metadata Loaded (${videoElement.videoWidth}x${videoElement.videoHeight})`);
                videoElement.play()
                    .then(() => {
                        debugLog("Camera: Playing.");
                        startFrameStream(domain);
                    })
                    .catch(err => debugLog(`Camera Play Error: ${err.message}`));
            };
        })
        .catch(err => {
            debugLog(`Camera Error: ${err.name} - ${err.message}`);
            console.error("Camera error:", err);
        });
}

function startFrameStream(domain) {
    debugLog("Stream: Starting Frame Capture loop...");
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    let count = 0;
    frameInterval = setInterval(() => {
        if (!socket || !videoElement || videoElement.readyState < 2) return;

        if (count % 20 === 0) debugLog("Stream: Sending frame..."); // Log occasionally
        count++;

        canvas.width = 480;
        canvas.height = 360;
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

        socket.emit('process_frame', {
            image: canvas.toDataURL('image/jpeg', 0.6),
            domain
        });
    }, 200);
}

function updateUIWithAI(data) {
    document.querySelector('.step-title').innerText = data.status;
    document.querySelector('.step-desc').innerText = `Confidence: ${data.confidence}`;
}

function animate() {
    animationId = requestAnimationFrame(animate);
    const t = Date.now() * 0.002;

    if (scene.children[1]) {
        const s = 1 + Math.sin(t * 2) * 0.05;
        scene.children[1].scale.set(s, s, 1);
        scene.children[1].rotation.z -= 0.005;
    }

    handJoints.forEach((j, i) => {
        j.position.x += Math.sin(t + i) * 0.005;
        j.position.y += Math.cos(t + i) * 0.005;
    });

    if (handLines)
        handLines.geometry.setFromPoints(handJoints.map(j => j.position));

    renderer.render(scene, camera);
}

window.startARSession = startARSession;
window.stopARSession = stopARSession;
