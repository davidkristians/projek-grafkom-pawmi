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

// Fungsi animasi Pawmo
export function animatePawmo(actor, time, deltaTime) {
    const sinHand = Math.sin(time * PAWMO_HAND_SPEED);
    const sinHead = Math.sin(time * PAWMO_HEAD_SPEED);

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

    // ▼▼▼ ANIMASI KEPALA BARU ▼▼▼
    if (actor.headMove) {
        // Gerakan memantul naik-turun (tetap ada, tapi amplitudonya dikurangi)
        const transY = Math.abs(sinHead) * PAWMO_HEAD_TRANS_AMPLITUDE;
        
        // Ganti nama variabel dari 'nodRotX' menjadi 'swayRotZ' agar jelas
        const swayRotZ = sinHead * PAWMO_HEAD_SWAY_AMPLITUDE;

        // Reset matriks gerakan
        LIBS.set_I4(actor.headMove);
        
        // Terapkan gerakan memantul
        LIBS.translateY(actor.headMove, transY);
        
        // Ganti rotateX menjadi rotateZ untuk gerakan mengayun kanan-kiri
        LIBS.rotateZ(actor.headMove, swayRotZ);
    }
    // ▲▲▲ SELESAI ANIMASI KEPALA BARU ▲▲▲
}

