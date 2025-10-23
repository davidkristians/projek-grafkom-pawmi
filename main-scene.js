// main-scene.js (BERSIH - Hanya mengontrol Kamera)

// Import sistem utama
import { Environment } from './env/environment.js';
import { Camera } from './env/camera.js';
import { AnimationLoop } from './env/animation.js';
import { IslandNode } from './scene/IslandNode.js';

// Impor fungsi create untuk semua aktor
import { createPawmi } from './actors/pawmi.js';
import { createPawmo } from './actors/pawmo.js';
import { createPawmot } from './actors/pawmot.js';

// 1. Buat jembatan global
const globalApp = {
    gl: null,
    mainProgram: null,
    cloudProgram: null,
    skyboxProgram: null, // Referensi program skybox
    posLoc: -1,
    colLoc: -1,
    normLoc: -1,
    texCoordLoc: -1, // Lokasi UV (meskipun tidak dipakai di sini)
    mvLoc: null,
    projLoc: null,
    normMatLoc: null,
    samplerLoc: null, // Lokasi sampler (meskipun tidak dipakai di sini)
    timeLoc: null, // Lokasi waktu (meskipun tidak dipakai di sini)
    useTextureLoc: null, // Flag tekstur (meskipun tidak dipakai di sini)
    useVertexColorLoc: null, // Flag warna vertex (meskipun tidak dipakai di sini)
    actors: [], // Berisi IslandNodes
    islandPositions: [[-6, 0, 0], [0, 0, 0], [6, 0, 0]],
    camera: null,
    currentTime: 0, // Waktu global untuk animasi shader (jika ada)
    islandRotY: 0, // Rotasi Yaw (Kiri/Kanan)
    islandRotX: 0, // Rotasi Pitch (Atas/Bawah)
    rotationSpeed: LIBS.degToRad(2.0) // Kecepatan rotasi per frame
};
window.myApp = globalApp;

// 2. Inisialisasi sistem utama
const env = new Environment('glCanvas', globalApp);
const camera = new Camera(globalApp); // Kamera menangani input mouse/keyboard
const animation = new AnimationLoop(globalApp);
globalApp.camera = camera;

// 3. Fungsi Asinkron untuk Setup Panggung dan Aktor
async function initializeScene() {
    console.log("Initializing scene...");
    await env.setup(); // Tunggu environment (shaders, buffers, textures) siap
    console.log("Environment setup complete.");

    if (!globalApp.mainProgram) {
        console.error("Setup failed, main shader program not initialized.");
        return; // Hentikan jika shader gagal
    }
    camera.updateProjectionMatrix(); // Set matriks proyeksi awal

    // 4. Perakitan Scene Graph (IslandNode + Actors)
    console.log("Assembling scene graph...");
    const actorCreateFuncs = [createPawmi, createPawmo, createPawmot];
    const islandPositions = globalApp.islandPositions;
    const islandRotationsY = [LIBS.degToRad(0), LIBS.degToRad(0), LIBS.degToRad(0)];

    for (let i = 0; i < 3; i++) {
        if (!env || !globalApp.mvLoc || !globalApp.normMatLoc) {
            console.error("Environment or shader locations not ready for IslandNode creation.");
            continue;
        }
        console.log(`Creating IslandNode ${i}...`);
        const islandNode = new IslandNode(globalApp.mvLoc, globalApp.normMatLoc, env);

        // Atur posisi & rotasi pulau di dunia
        LIBS.set_I4(islandNode.POSITION_MATRIX);
        LIBS.translateX(islandNode.POSITION_MATRIX, islandPositions[i][0]);
        LIBS.translateY(islandNode.POSITION_MATRIX, islandPositions[i][1]);
        LIBS.translateZ(islandNode.POSITION_MATRIX, islandPositions[i][2]);
        LIBS.rotateY(islandNode.POSITION_MATRIX, islandRotationsY[i]);
        const pitchAngle = LIBS.degToRad(15); // Ubah -10 sesuai keinginan
        LIBS.rotateX(islandNode.POSITION_MATRIX, pitchAngle);

        // Buat aktor untuk pulau ini
        console.log(`Creating Actor ${i}...`);
        const actorRig = actorCreateFuncs[i](animation);
        if (actorRig) {
            islandNode.childs.push(actorRig); // Jadikan aktor anak dari pulau
             console.log(`Actor ${i} added to IslandNode ${i}.`);
        } else {
             console.warn(`Failed to create actor ${i}.`);
        }

        globalApp.actors.push(islandNode); // Tambahkan node pulau ke daftar render
    }
    console.log("Scene graph assembled.");

    // 5. Mulai Render Loop setelah semua siap
    requestAnimationFrame(mainRenderLoop);
    console.log("Starting render loop.");
}


// --- Pastikan TIDAK ADA sisa kode event listener mouse di sini ---
// HAPUS SEMUA INI JIKA MASIH ADA:
// let THETA=0,PHI=0,drag=false,x_prev=0,y_prev=0;
// const mouseDown=...
// const mouseUp=...
// const mouseMove=...
// const mouseWheel=...
// CANVAS.addEventListener("mousedown",...);
// CANVAS.addEventListener("mouseup",...);
// CANVAS.addEventListener("mouseout",...);
// CANVAS.addEventListener("mousemove",...);
// CANVAS.addEventListener("wheel",...);
// -----------------------------------------------------------------

// 6. Jalankan Render Loop Utama
let lastTime = 0;
function mainRenderLoop(time) {
    time *= 0.001; // ke detik
    const deltaTime = Math.min(time - lastTime, 0.1); // Batasi deltaTime
    lastTime = time;
    globalApp.currentTime = time; // Update waktu global

    // Update state animasi dan input kamera
    animation.update(time, deltaTime);
    camera.update(deltaTime); // Kamera menghitung viewMatrix BARU berdasarkan input

    const keys = globalApp.camera.keys;
    const speed = globalApp.rotationSpeed;

    if (keys['arrowleft']) {
        globalApp.islandRotY += speed; // Putar ke Kiri (Yaw positif)
        
    }
    if (keys['arrowright']) {
        globalApp.islandRotY -= speed; // Putar ke Kanan (Yaw negatif)
    }
    if (keys['arrowup']) {
        globalApp.islandRotX -= speed; // Angkat/Miring ke Atas (Pitch negatif, sesuai konvensi)
    }
    if (keys['arrowdown']) {
        globalApp.islandRotX += speed; // Turunkan/Miring ke Bawah (Pitch positif)
    }

    // Dapatkan matriks terbaru LANGSUNG dari kamera
    const currentViewMatrix = camera.getViewMatrix();
    const currentProjMatrix = camera.getProjectionMatrix();

    // Render seluruh scene menggunakan matriks dari kamera
    // Pastikan env.render() menggunakan viewMatrix ini dan TIDAK ada
    // rotasi tambahan yang diterapkan ke 'actors' (IslandNode) di sini.
    env.render(currentViewMatrix, currentProjMatrix);

    requestAnimationFrame(mainRenderLoop);
}

// Panggil fungsi inisialisasi async untuk memulai
initializeScene().catch(error => {
    console.error("Initialization failed:", error);
});

