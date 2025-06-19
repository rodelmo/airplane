// Use global variables from CDN instead of ES6 imports
const THREE = window.THREE;
const { Howl, Howler } = window.Howler;

import { PlaneController } from './PlaneController';
import { CameraController } from './CameraController';
import { UI } from './UI';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Create sky
const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
const skyMaterial = new THREE.MeshBasicMaterial({
    color: 0x87CEEB,
    side: THREE.BackSide
});
const sky = new THREE.Mesh(skyGeometry, skyMaterial);
scene.add(sky);

// Create ground
const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
const groundMaterial = new THREE.MeshPhongMaterial({
    color: 0x1a472a,
    side: THREE.DoubleSide
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = Math.PI / 2;
ground.position.y = -2;
scene.add(ground);

// Create buildings
function createBuilding(width, height, depth, x, z) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshPhongMaterial({
        color: Math.random() * 0xffffff,
        flatShading: true
    });
    const building = new THREE.Mesh(geometry, material);
    building.position.set(x, height / 2 - 2, z);
    return building;
}

// Create a grid of buildings
const buildings = new THREE.Group();
const gridSize = 10;
const spacing = 15;

for (let x = -gridSize; x <= gridSize; x++) {
    for (let z = -gridSize; z <= gridSize; z++) {
        // Skip some positions to create streets
        if (Math.abs(x) % 3 === 0 || Math.abs(z) % 3 === 0) continue;
        
        const height = Math.random() * 20 + 10; // Random height between 10 and 30
        const width = Math.random() * 5 + 5;    // Random width between 5 and 10
        const depth = Math.random() * 5 + 5;    // Random depth between 5 and 10
        
        const building = createBuilding(
            width,
            height,
            depth,
            x * spacing,
            z * spacing
        );
        buildings.add(building);
    }
}
scene.add(buildings);

// Create plane model
function createPlane() {
    const plane = new THREE.Group();

    // Fuselage (main body) - aligned along Z-axis
    const fuselageGeometry = new THREE.CylinderGeometry(0.5, 0.5, 4, 8);
    const fuselageMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });
    const fuselage = new THREE.Mesh(fuselageGeometry, fuselageMaterial);
    fuselage.rotation.x = Math.PI / 2; // Cylinder points along Z
    plane.add(fuselage);

    // Wings - perpendicular to fuselage, spread along X
    const wingGeometry = new THREE.BoxGeometry(6, 0.2, 1);
    const wingMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });
    const wings = new THREE.Mesh(wingGeometry, wingMaterial);
    wings.position.set(0, 0, 0); // Centered at fuselage
    plane.add(wings);

    // Tail horizontal stabilizer - at back, spread along X
    const tailGeometry = new THREE.BoxGeometry(2, 0.15, 0.5);
    const tailMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.set(0, 0, -2); // At rear of fuselage
    plane.add(tail);

    // Tail vertical stabilizer - at back, vertical
    const stabilizerGeometry = new THREE.BoxGeometry(0.15, 0.7, 0.4);
    const stabilizerMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });
    const stabilizer = new THREE.Mesh(stabilizerGeometry, stabilizerMaterial);
    stabilizer.position.set(0, 0.4, -2); // On top of tail
    plane.add(stabilizer);

    // Propeller - at front (positive Z)
    const propellerGeometry = new THREE.BoxGeometry(0.15, 1.2, 0.1);
    const propellerMaterial = new THREE.MeshPhongMaterial({ color: 0x404040 });
    const propeller = new THREE.Mesh(propellerGeometry, propellerMaterial);
    propeller.position.set(0, 0, 2.1); // In front of fuselage
    plane.add(propeller);

    // Optional: add a simple cockpit
    const cockpitGeometry = new THREE.SphereGeometry(0.5, 8, 8, 0, Math.PI);
    const cockpitMaterial = new THREE.MeshPhongMaterial({ color: 0x334488, transparent: true, opacity: 0.5 });
    const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
    cockpit.position.set(0, 0.4, 0.7);
    cockpit.rotation.x = Math.PI / 2;
    plane.add(cockpit);

    return plane;
}

const plane = createPlane();
// Position plane above and outside city, approaching inward
plane.position.set(-100, 50, -100);
plane.rotation.set(0, Math.PI / 4, 0); // No nose-down, just facing city
scene.add(plane);

// Initialize controllers
const planeController = new PlaneController(plane);
const cameraController = new CameraController(camera, plane);
const ui = new UI();

// Input handling
const keys = {};
window.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// UFO model based on reference image
function createUFO() {
    const ufo = new THREE.Group();

    // Main saucer (disk)
    const saucerGeometry = new THREE.CylinderGeometry(3, 5, 1, 16, 1, false);
    const saucerMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc, flatShading: true });
    const saucer = new THREE.Mesh(saucerGeometry, saucerMaterial);
    saucer.position.y = 0;
    ufo.add(saucer);

    // Dome (top)
    const domeGeometry = new THREE.SphereGeometry(2, 12, 8, 0, Math.PI * 2, 0, Math.PI / 1.5);
    const domeMaterial = new THREE.MeshPhongMaterial({ color: 0x8888ff, flatShading: true, transparent: true, opacity: 0.7 });
    const dome = new THREE.Mesh(domeGeometry, domeMaterial);
    dome.position.y = 0.8;
    ufo.add(dome);

    // Bottom ring
    const ringGeometry = new THREE.TorusGeometry(2.2, 0.2, 8, 16);
    const ringMaterial = new THREE.MeshPhongMaterial({ color: 0x888888, flatShading: true });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.y = -0.4;
    ring.rotation.x = Math.PI / 2;
    ufo.add(ring);

    return ufo;
}

// UFO AI: random patrolling
class UFOAI {
    constructor(ufo, areaSize = 200, minY = 30, maxY = 50, speed = 10) {
        this.ufo = ufo;
        this.areaSize = areaSize;
        this.minY = minY;
        this.maxY = maxY;
        this.speed = speed;
        this.setRandomWaypoint();
    }
    setRandomWaypoint() {
        this.target = new THREE.Vector3(
            (Math.random() - 0.5) * this.areaSize,
            this.minY + Math.random() * (this.maxY - this.minY),
            (Math.random() - 0.5) * this.areaSize
        );
    }
    update(deltaTime) {
        const dir = new THREE.Vector3().subVectors(this.target, this.ufo.position);
        const dist = dir.length();
        if (dist < 2) {
            this.setRandomWaypoint();
        } else {
            dir.normalize();
            this.ufo.position.add(dir.multiplyScalar(this.speed * deltaTime));
            // Optional: slight rotation for effect
            this.ufo.rotation.y += 0.3 * deltaTime;
        }
    }
}

// Spawn UFOs
const ufoAIs = [];
for (let i = 0; i < 5; i++) {
    const ufo = createUFO();
    ufo.position.set(
        (Math.random() - 0.5) * 200,
        30 + Math.random() * 20,
        (Math.random() - 0.5) * 200
    );
    scene.add(ufo);
    ufoAIs.push(new UFOAI(ufo));
}

// --- Shooting and Explosions ---
const bullets = [];
let lastShotTime = 0;
const bulletSpeed = 80;
const bulletLifetime = 2; // seconds

// --- Sound Effects ---
const music = new Howl({ src: ['/public/music.mp3'], loop: true, volume: 0.5 });
const shootSound = new Howl({ src: ['/public/shoot.wav'], volume: 0.5 });
const explosionSound = new Howl({ src: ['/public/explosion.wav'], volume: 0.7 });
const victorySound = new Howl({ src: ['/public/victory.wav'], volume: 0.7 });

function shootBullet() {
    const now = performance.now() / 1000;
    if (now - lastShotTime < 0.2) return; // Cooldown
    lastShotTime = now;
    // Bullet starts at plane nose (front, +Z)
    const bulletGeo = new THREE.SphereGeometry(0.15, 8, 8);
    const bulletMat = new THREE.MeshBasicMaterial({ color: 0xffee00 });
    const bullet = new THREE.Mesh(bulletGeo, bulletMat);
    // Position at plane nose
    const nose = new THREE.Vector3(0, 0, 2.2); // +Z is forward
    nose.applyQuaternion(plane.quaternion);
    nose.add(plane.position);
    bullet.position.copy(nose);
    // Store direction
    const dir = new THREE.Vector3(0, 0, 1); // Forward in local space (+Z)
    dir.applyQuaternion(plane.quaternion);
    bullets.push({ mesh: bullet, dir, time: 0 });
    scene.add(bullet);
    shootSound.play();
}

// --- Explosions ---
const explosions = [];
function spawnExplosion(pos) {
    const geo = new THREE.SphereGeometry(1.2, 16, 16); // Larger initial size
    const mat = new THREE.MeshBasicMaterial({ color: 0xff5522, transparent: true, opacity: 0.8 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos);
    explosions.push({ mesh, time: 0 });
    scene.add(mesh);
    explosionSound.play();
}

// --- Score ---
let score = 0;

// --- Update UI to show score ---
ui.scoreDiv = document.createElement('div');
ui.scoreDiv.style.position = 'absolute';
ui.scoreDiv.style.top = '20px';
ui.scoreDiv.style.left = '50%';
ui.scoreDiv.style.transform = 'translateX(-50%)';
ui.scoreDiv.style.color = 'white';
ui.scoreDiv.style.fontFamily = 'Arial, sans-serif';
ui.scoreDiv.style.fontSize = '2em';
ui.scoreDiv.style.textShadow = '1px 1px 2px black';
document.body.appendChild(ui.scoreDiv);
function updateScoreUI() {
    ui.scoreDiv.textContent = `Score: ${score}`;
}
updateScoreUI();

// --- Input: shooting ---
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') shootBullet();
});

// --- Game State Management ---
let gameState = 'start'; // 'start', 'playing', 'victory'

function showOverlay(text, buttonText, onButton) {
    let overlay = document.getElementById('game-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'game-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = 0;
        overlay.style.left = 0;
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.background = 'rgba(0,0,0,0.7)';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.zIndex = 1000;
        overlay.style.color = 'white';
        overlay.style.fontFamily = 'Arial, sans-serif';
        overlay.style.fontSize = '2.5em';
        overlay.style.transition = 'opacity 0.5s';
        document.body.appendChild(overlay);
    }
    overlay.innerHTML = `<div style="margin-bottom: 30px;">${text}</div>`;
    if (buttonText) {
        const btn = document.createElement('button');
        btn.textContent = buttonText;
        btn.style.fontSize = '1em';
        btn.style.padding = '10px 30px';
        btn.style.borderRadius = '8px';
        btn.style.border = 'none';
        btn.style.background = '#44aaff';
        btn.style.color = 'white';
        btn.style.cursor = 'pointer';
        btn.onclick = () => {
            overlay.style.opacity = 0;
            setTimeout(() => overlay.remove(), 500);
            if (onButton) onButton();
        };
        overlay.appendChild(btn);
    }
    overlay.style.opacity = 1;
}

function hideOverlay() {
    const overlay = document.getElementById('game-overlay');
    if (overlay) {
        overlay.style.opacity = 0;
        setTimeout(() => overlay.remove(), 500);
    }
}

function startGame() {
    gameState = 'playing';
    hideOverlay();
    music.play();
    // Reset game state if needed
    // (Could respawn UFOs, reset score, etc.)
    // For now, just continue
    // TODO: Add music start here
}

function showVictory() {
    gameState = 'victory';
    showOverlay(`Victory!<br>Score: ${score}`, 'Restart', () => {
        window.location.reload();
    });
    music.stop();
    victorySound.play();
    // TODO: Add victory sound/music here
}

// Show start overlay on load
if (gameState === 'start') {
    showOverlay('3D Plane Game<br><span style="font-size:0.6em;">Press any key to start</span>');
    window.addEventListener('keydown', function anyKeyStart(e) {
        if (gameState === 'start') {
            startGame();
            window.removeEventListener('keydown', anyKeyStart);
        }
    });
}

// Animation loop
let lastTime = 0;
function animate(currentTime) {
    requestAnimationFrame(animate);
    
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    // Handle input
    let pitch = 0;
    let roll = 0;
    let speed = 0;

    if (keys['w']) pitch += 1;
    if (keys['s']) pitch -= 1;
    if (keys['a']) roll -= 1;
    if (keys['d']) roll += 1;
    if (keys['q']) speed -= 1;
    if (keys['e']) speed += 1;
    if (keys['c']) {
        cameraController.toggleMode();
        keys['c'] = false; // Prevent multiple toggles
    }

    // Update controllers
    planeController.setInput(pitch, roll, speed);
    planeController.update(deltaTime);
    cameraController.update(deltaTime);
    
    // Update UI
    ui.updateSpeed(planeController.speed, planeController.minSpeed, planeController.maxSpeed);
    
    // Rotate propeller
    plane.children[4].rotation.z += 0.2;
    
    // Update UFOs
    for (const ufoAI of ufoAIs) {
        ufoAI.update(deltaTime);
    }
    
    // Update bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.mesh.position.addScaledVector(b.dir, bulletSpeed * deltaTime);
        b.time += deltaTime;
        if (b.time > bulletLifetime) {
            scene.remove(b.mesh);
            bullets.splice(i, 1);
        }
    }
    // Bullet-UFO collision
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = ufoAIs.length - 1; j >= 0; j--) {
            const bullet = bullets[i];
            const ufo = ufoAIs[j].ufo;
            if (bullet.mesh.position.distanceTo(ufo.position) < 2.5) {
                // Hit!
                spawnExplosion(ufo.position);
                scene.remove(ufo);
                scene.remove(bullet.mesh);
                ufoAIs.splice(j, 1);
                bullets.splice(i, 1);
                score++;
                updateScoreUI();
                break;
            }
        }
    }
    // Update explosions
    for (let i = explosions.length - 1; i >= 0; i--) {
        const e = explosions[i];
        e.time += deltaTime;
        e.mesh.scale.setScalar(1.5 + 4 * e.time);
        e.mesh.material.opacity = 0.8 * (1 - e.time / 0.5);
        if (e.time > 0.5) {
            scene.remove(e.mesh);
            explosions.splice(i, 1);
        }
    }
    
    // In animation loop, only allow controls and UI during 'playing'
    if (gameState !== 'playing') {
        renderer.render(scene, camera);
        return;
    }

    // When all UFOs are destroyed, show victory
    if (ufoAIs.length === 0 && gameState === 'playing') {
        showVictory();
    }
    
    renderer.render(scene, camera);
}

animate(0); 