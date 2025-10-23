const LIBS = window.LIBS;

// Konstanta Tangan (Tidak berubah)
const PAWMO_HAND_ROT_AMPLITUDE = LIBS.degToRad(25);
const PAWMO_HAND_SPEED = 2.0;

// ▼▼▼ DIUBAH: Ganti nama konstanta kepala agar lebih jelas ▼▼▼
const PAWMO_HEAD_SWAY_AMPLITUDE = LIBS.degToRad(12); // Ayunan sedikit lebih lebar
const PAWMO_HEAD_SPEED = 1.8; // Sedikit lebih lambat agar natural
const PAWMO_HEAD_TRANS_AMPLITUDE = 0.04; // Gerakan pantul sedikit dikurangi

// Konstanta Ekor & Mulut (Tidak berubah)
const PAWMO_TAIL_SPEED = 3.0;
const PAWMO_TAIL_AMOUNT = 0.20;
const PAWMO_MOUTH_SPEED = 3.5;
const PAWMO_MOUTH_MAX_SCALE = 1.2;

// Konstanta Kaki
const PAWMO_WALK_SPEED = 2.0; // Samakan dengan kecepatan tangan agar sinkron
const PAWMO_WALK_STEP_HEIGHT = 0.15; // Seberapa tinggi kaki diangkat
const PAWMO_WALK_STEP_LENGTH = 0.2;  // Seberapa jauh kaki melangkah ke depan/belakang
const PAWMO_WALK_STEP_ROTATION = LIBS.degToRad(-20); // Rotasi "ujung kaki" ke atas
const PAWMO_BODY_MOVE_SPEED = 0.4;

// ▼▼▼ BARU: Tambahkan durasi untuk berjalan ▼▼▼
const PAWMO_WALK_DURATION = 3.0; // Akan berjalan selama 3 detik saja

// Fungsi animasi Pawmo
export function animatePawmo(actor, time, deltaTime) {
    const sinHand = Math.sin(time * PAWMO_HAND_SPEED);
    const sinHead = Math.sin(time * PAWMO_HEAD_SPEED);
    // sinWalk dipindah ke dalam blok 'if' di bawah

    // --- Animasi Idle (Selalu Berjalan) ---

    // Animasi Ekor (Sudah benar, kanan-kiri)
    if (actor.tailRef) {
        const tailRotation = Math.sin(time * PAWMO_TAIL_SPEED) * PAWMO_TAIL_AMOUNT;
        LIBS.set_I4(actor.tailRef.MOVE_MATRIX);
        LIBS.rotateY(actor.tailRef.MOVE_MATRIX, tailRotation);
    }

    // Animasi Mulut (Tidak berubah)
    if (actor.mouthRef) {
        const scaleT = (Math.sin(time * PAWMO_MOUTH_SPEED) + 1) / 2;
        const currentScale = 1.0 + (PAWMO_MOUTH_MAX_SCALE - 1.0) * scaleT;
        LIBS.set_I4(actor.mouthRef.MOVE_MATRIX);
        LIBS.scale(actor.mouthRef.MOVE_MATRIX, currentScale, currentScale, currentScale);
    }

    // Animasi Tangan Kiri (Tidak berubah)
    if (actor.leftHandMove) {
        const rotZ = sinHand * PAWMO_HAND_ROT_AMPLITUDE;
        LIBS.set_I4(actor.leftHandMove);
        LIBS.rotateZ(actor.leftHandMove, rotZ);
        LIBS.translateX(actor.leftHandMove, -rotZ - 0.2);
    }

    // Animasi Tangan Kanan (Tidak berubah)
    if (actor.rightHandMove) {
        const rotZ = sinHand * PAWMO_HAND_ROT_AMPLITUDE;
        LIBS.set_I4(actor.rightHandMove);
        LIBS.rotateX(actor.rightHandMove, rotZ+0.2);
        LIBS.rotateZ(actor.rightHandMove, +rotZ);
        LIBS.rotateY(actor.rightHandMove, 0.1);
        LIBS.translateY(actor.rightHandMove, -rotZ );
        LIBS.translateX(actor.rightHandMove,-rotZ + 0.05);
    }

    // Animasi Kepala
    if (actor.headMove) {
        // Gerakan memantul naik-turun
        const transY = Math.abs(sinHead) * PAWMO_HEAD_TRANS_AMPLITUDE;
        // Gerakan mengayun kanan-kiri
        const swayRotZ = sinHead * PAWMO_HEAD_SWAY_AMPLITUDE;
        // Reset matriks gerakan
        LIBS.set_I4(actor.headMove);
        // Terapkan gerakan
        LIBS.translateY(actor.headMove, transY);
        LIBS.rotateZ(actor.headMove, swayRotZ);
    }
    // ▲▲▲ Selesai Animasi Idle ▲▲▲


    // --- Animasi Berjalan (Hanya jika time < durasi) ---
    if (time < PAWMO_WALK_DURATION) {
        // Pindahkan kalkulasi sinWalk ke SINI
        const sinWalk = Math.sin(time * PAWMO_WALK_SPEED);

        // ▼▼▼ ANIMASI KAKI KANAN ▼▼▼
        if (actor.rightFootMove) {
            const transZ = sinWalk * PAWMO_WALK_STEP_LENGTH;
            const transY = Math.max(0, sinWalk) * PAWMO_WALK_STEP_HEIGHT;
            const rotX = Math.max(0, sinWalk) * PAWMO_WALK_STEP_ROTATION;
            LIBS.set_I4(actor.rightFootMove);
            LIBS.translateY(actor.rightFootMove, transY);
            LIBS.translateZ(actor.rightFootMove, transZ);
            LIBS.rotateX(actor.rightFootMove, rotX);
        }

        // ▼▼▼ ANIMASI KAKI KIRI ▼▼▼
        if (actor.leftFootMove) {
            const transZ = -sinWalk * PAWMO_WALK_STEP_LENGTH;
            const transY = Math.max(0, -sinWalk) * PAWMO_WALK_STEP_HEIGHT;
            const rotX = Math.max(0, -sinWalk) * PAWMO_WALK_STEP_ROTATION;
            LIBS.set_I4(actor.leftFootMove);
            LIBS.translateY(actor.leftFootMove, transY);
            LIBS.translateZ(actor.leftFootMove, transZ);
            LIBS.rotateX(actor.leftFootMove, rotX);
        }

        // ▼▼▼ ANIMASI GERAKAN SELURUH BADAN (LOKOMOSI) ▼▼▼
        LIBS.translateZ(actor.POSITION_MATRIX, PAWMO_BODY_MOVE_SPEED * deltaTime);

    } else {
        // ▼▼▼ BARU: Reset posisi kaki jika sudah selesai berjalan ▼▼▼
        // Ini menghentikan kaki di posisi netral (0,0,0)
        if (actor.rightFootMove) {
            LIBS.set_I4(actor.rightFootMove);
        }
        if (actor.leftFootMove) {
            LIBS.set_I4(actor.leftFootMove);
        }
    }
}

