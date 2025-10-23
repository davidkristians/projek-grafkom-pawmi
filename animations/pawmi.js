// animations/pawmi.js

const LIBS = window.LIBS;

// Konstanta khusus animasi Pawmi
const PAWMI_HAND_ROT_AMPLITUDE = LIBS.degToRad(15);
const PAWMI_HAND_SPEED = 2.5;
const PAWMI_HEAD_NOD_AMPLITUDE = LIBS.degToRad(15);
const PAWMI_HEAD_SPEED = 3.0;
const PAWMI_HEAD_TRANS_AMPLITUDE = 0.08;
const PAWMI_TAIL_SPEED = 3.5;
const PAWMI_TAIL_AMOUNT = 0.25;
const PAWMI_MOUTH_SPEED = 2.0;
const PAWMI_MOUTH_MAX_SCALE = 1.4;

// Konstanta untuk gerakan maju-mundur
const PAWMI_WALK_CYCLE_DURATION = 4.0; // durasi satu siklus penuh (maju + mundur) dalam detik
const PAWMI_WALK_DISTANCE = 1.5; // jarak maksimal bergerak
const PAWMI_TURN_DURATION = 0.8; // durasi rotasi 180 derajat dalam detik

// Fungsi animasi yang diekspor
export function animatePawmi(actor, time, deltaTime) {
    const sinHand = Math.sin(time * PAWMI_HAND_SPEED);
    const sinHead = Math.sin(time * PAWMI_HEAD_SPEED);

    // === ANIMASI GERAKAN MAJU-MUNDUR dengan ROTASI ===
    const totalCycle = PAWMI_WALK_CYCLE_DURATION + (PAWMI_TURN_DURATION * 2);
    const cycleTime = time % totalCycle;

    let positionZ = 0;
    let rotationY = 0;

    if (cycleTime < PAWMI_WALK_CYCLE_DURATION / 2) {
        // Fase 1: MAJU (0 -> WALK_CYCLE_DURATION/2)
        const t = cycleTime / (PAWMI_WALK_CYCLE_DURATION / 2);
        positionZ = PAWMI_WALK_DISTANCE * t;
        rotationY = 0;
    }
    else if (cycleTime < PAWMI_WALK_CYCLE_DURATION / 2 + PAWMI_TURN_DURATION) {
        // Fase 2: PUTAR 180 derajat
        const t = (cycleTime - PAWMI_WALK_CYCLE_DURATION / 2) / PAWMI_TURN_DURATION;
        // Smooth easing (ease-in-out)
        const smoothT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        positionZ = PAWMI_WALK_DISTANCE;
        rotationY = Math.PI * smoothT;
    }
    else if (cycleTime < PAWMI_WALK_CYCLE_DURATION + PAWMI_TURN_DURATION) {
        // Fase 3: MUNDUR (sebenarnya maju tapi badan sudah 180)
        const t = (cycleTime - PAWMI_WALK_CYCLE_DURATION / 2 - PAWMI_TURN_DURATION) / (PAWMI_WALK_CYCLE_DURATION / 2);
        positionZ = PAWMI_WALK_DISTANCE * (1 - t);
        rotationY = Math.PI;
    }
    else {
        // Fase 4: PUTAR BALIK ke depan
        const t = (cycleTime - PAWMI_WALK_CYCLE_DURATION - PAWMI_TURN_DURATION) / PAWMI_TURN_DURATION;
        const smoothT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        positionZ = 0;
        rotationY = Math.PI + (Math.PI * smoothT);
    }

    // Terapkan transformasi gerakan ke SELURUH actor (POSITION_MATRIX)
    LIBS.set_I4(actor.POSITION_MATRIX);
    LIBS.translateY(actor.POSITION_MATRIX, 1.09); // posisi Y tetap
    LIBS.rotateY(actor.POSITION_MATRIX, rotationY); // rotasi badan
    LIBS.translateZ(actor.POSITION_MATRIX, positionZ); // gerakan maju-mundur
    LIBS.translateY(actor.POSITION_MATRIX, 0.3); // posisi X tetap
    LIBS.scale(actor.POSITION_MATRIX, 0.2, 0.2, 0.2); // scale tetap

    // ... (Kode konstanta di atas tidak berubah)

    // --- KONSTANTA BARU untuk Rotasi Ekor Penuh (Disarankan) ---
    const TAIL_SPIN_SPEED = 8.0;
    const TAIL_TILT_ANGLE = LIBS.degToRad(20);
    const MAX_ANGLE = 2 * Math.PI;

    // --- KONSTANTA TRANSLASI BARU UNTUK MENGHINDARI CLIPPING ---
    const TAIL_OFFSET_Z = 0.2; // Pindahkan ekor 0.1 unit ke belakang (menjauhi badan)
    const TAIL_OFFSET_Y = 0.2; // Pindahkan ekor 0.15 unit ke bawah

    // Fungsi animasi yang diekspor

    // ... (Kode animasi gerakan maju-mundur dan badan di atas tidak berubah)

    // Animasi Ekor
    if (actor.tailRef) {
        const tailRotationZ = Math.sin(time * PAWMI_TAIL_SPEED) * PAWMI_TAIL_AMOUNT;
        const tailRotationY = (time * TAIL_SPIN_SPEED) % MAX_ANGLE;

        LIBS.set_I4(actor.tailRef.MOVE_MATRIX);

        // 1. Miringkan ekor (Kemiringan Statis)
        LIBS.rotateX(actor.tailRef.MOVE_MATRIX, tailRotationY);

        // 2. Rotasi Berkelanjutan (Putaran Penuh) pada Sumbu Y
        LIBS.rotateY(actor.tailRef.MOVE_MATRIX, TAIL_TILT_ANGLE);

        // 3. Rotasi Ayunan (Swing) pada Sumbu Z
        LIBS.rotateZ(actor.tailRef.MOVE_MATRIX, tailRotationZ);

        // 4. TRANSLASI UNTUK MENGHINDARI TEMBUS BADAN (CLIPPING)
        // Ini adalah langkah kunci untuk memperbaiki clipping setelah semua rotasi diterapkan.
        LIBS.translateZ(actor.tailRef.MOVE_MATRIX, TAIL_OFFSET_Z+-0.45);
        LIBS.translateY(actor.tailRef.MOVE_MATRIX, TAIL_OFFSET_Y);
        LIBS.translateX(actor.tailRef.MOVE_MATRIX, 0.15); // Tidak ada offset pada sumbu X

    }

    // ... (Kode animasi mulut, tangan, kaki, dan kepala di bawah tidak berubah)


    // Animasi Mulut
    if (actor.mouthRef) {
        const scaleT = (Math.sin(time * PAWMI_MOUTH_SPEED) + 1) / 2;
        const currentScale = 1.0 + (PAWMI_MOUTH_MAX_SCALE - 1.0) * scaleT;
        LIBS.set_I4(actor.mouthRef.MOVE_MATRIX);
        LIBS.scale(actor.mouthRef.MOVE_MATRIX, currentScale, currentScale, currentScale);
    }

    // Animasi Tangan Kiri
    if (actor.leftHandMove) {
        const rotZ = sinHand * PAWMI_HAND_ROT_AMPLITUDE;
        LIBS.set_I4(actor.leftHandMove);
        LIBS.rotateZ(actor.leftHandMove, rotZ);
        LIBS.translateX(actor.leftHandMove, -rotZ - 0.2);
    }

    if (actor.RightFootMove) {
        const rotZ = sinHand * PAWMI_HAND_ROT_AMPLITUDE;
        LIBS.set_I4(actor.RightFootMove);
        LIBS.rotateX(actor.RightFootMove, rotZ + 0.2);
        LIBS.translateY(actor.RightFootMove, -rotZ);
        LIBS.translateX(actor.RightFootMove, -rotZ + 0.05);
    }
    if (actor.LeftFootMove) {
        const rotZ = sinHand * PAWMI_HAND_ROT_AMPLITUDE;
        LIBS.set_I4(actor.LeftFootMove);
        LIBS.rotateX(actor.LeftFootMove, -rotZ + 0.2);
        LIBS.translateY(actor.LeftFootMove, rotZ);
        LIBS.translateX(actor.LeftFootMove, rotZ - 0.05);
    }

    // Animasi Tangan Kanan
    if (actor.rightHandMove) {
        const rotZ = sinHand * PAWMI_HAND_ROT_AMPLITUDE;
        LIBS.set_I4(actor.rightHandMove);
        LIBS.rotateX(actor.rightHandMove, rotZ + 0.2);
        LIBS.rotateZ(actor.rightHandMove, rotZ + 0.2);
        LIBS.rotateY(actor.rightHandMove, 0.1);

        LIBS.translateY(actor.rightHandMove, -rotZ);
        LIBS.translateX(actor.rightHandMove, -rotZ + 0.05);
    }

    // Animasi Kepala
    if (actor.headMove) {
        const transY = Math.abs(sinHead) * PAWMI_HEAD_TRANS_AMPLITUDE;
        const nodRotX = sinHead * PAWMI_HEAD_NOD_AMPLITUDE;
        LIBS.set_I4(actor.headMove);
        LIBS.translateY(actor.headMove, transY);
        LIBS.rotateX(actor.headMove, nodRotX);
    }
}