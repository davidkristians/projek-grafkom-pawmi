// main-scene.js

// Import sistem utama
import { Environment } from './env/environment.js';
import { Camera } from './env/camera.js';
import { AnimationLoop } from './env/animation.js';

// ▼▼▼ BARU: Import node scene kita ▼▼▼
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
    posLoc: null,       // aPosition
    colLoc: null,       // aColor
    normLoc: null,      // aNormal
    mvLoc: null,        // uModelViewMatrix
    projLoc: null,    // uProjectionMatrix
    normMatLoc: null, // uNormalMatrix
    actors: [], // <-- Daftar ini sekarang akan berisi IslandNode
    islandPositions: [[-6, 0, 0], [0, 0, 0], [6, 0, 0]], // Tetap sebagai data
    camera: null
};
window.myApp = globalApp;

// 2. Inisialisasi sistem utama
const env = new Environment('glCanvas', globalApp);
const camera = new Camera(globalApp);
const animation = new AnimationLoop(globalApp); 
globalApp.camera = camera; 

// 3. Setup panggung
env.setup(); // Ini hanya setup buffer & shader
camera.updateProjectionMatrix(); 

// 4. ▼▼▼ LOGIKA PERAKITAN SCENE BARU ▼▼▼
    
// Daftar fungsi untuk membuat aktor
const actorCreateFuncs = [createPawmi, createPawmo, createPawmot];
// Posisi pulau dari global
const islandPositions = globalApp.islandPositions;

// Atur rotasi Y untuk setiap pulau di sini
// Ubah angka-angka ini untuk memutar pulau sesuai keinginan Anda!
const islandRotationsY = [
    LIBS.degToRad(0),  // Pulau kiri (Pawmi)
    LIBS.degToRad(0),  // Pulau tengah (Pawmo)
    LIBS.degToRad(0)   // Pulau kanan (Pawmot)
];

for (let i = 0; i < 3; i++) {
    // 1. Buat Scene Node "Induk" untuk pulau
    //    Kita berikan 'env' agar ia bisa mengakses buffers dan _drawObject
    const islandNode = new IslandNode(globalApp.mvLoc, globalApp.normMatLoc, env);

    // 2. Atur posisi & rotasi DUNIA untuk islandNode
    LIBS.set_I4(islandNode.POSITION_MATRIX);
    LIBS.translateX(islandNode.POSITION_MATRIX, islandPositions[i][0]);
    LIBS.translateY(islandNode.POSITION_MATRIX, islandPositions[i][1]);
    LIBS.translateZ(islandNode.POSITION_MATRIX, islandPositions[i][2]);
    LIBS.rotateY(islandNode.POSITION_MATRIX, islandRotationsY[i]); // <-- INI ROTASI INDUKNYA

    // 3. Buat aktor (pokemon) untuk pulau ini
    //    Fungsi create[Aktor] sekarang me-return rig-nya
    const actorRig = actorCreateFuncs[i](animation); 
    //    (actorRig.POSITION_MATRIX sudah diatur ke offset LOKAL)

    // 4. Jadikan aktor sebagai "anak" dari islandNode
    islandNode.childs.push(actorRig);

    // 5. Tambahkan "induk" (islandNode) ke daftar render utama
    globalApp.actors.push(islandNode);
}

// 5. Jalankan Render Loop Utama (Tidak berubah)
let lastTime = 0;
function mainRenderLoop(time) {
    time *= 0.001;
    const deltaTime = time - lastTime;
    lastTime = time;

    animation.update(time, deltaTime);
    camera.update(deltaTime); 
    env.render(camera.getViewMatrix(), camera.getProjectionMatrix());

    requestAnimationFrame(mainRenderLoop);
}

// Mulai loop!
requestAnimationFrame(mainRenderLoop);