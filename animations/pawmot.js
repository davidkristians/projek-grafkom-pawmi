// animations/pawmot.js
const LIBS = window.LIBS;

// Konstanta khusus animasi Pawmot (Contoh: lebih cepat)
const PAWMOT_HAND_ROT_AMPLITUDE = LIBS.degToRad(20); // Ayunan lebih besar
const PAWMOT_HAND_SPEED = 3.0; // Lebih cepat
const PAWMOT_HEAD_NOD_AMPLITUDE = LIBS.degToRad(18);
const PAWMOT_HEAD_SPEED = 3.5;
const PAWMOT_HEAD_TRANS_AMPLITUDE = 0.09;
const PAWMOT_TAIL_SPEED = 4.0;
const PAWMOT_TAIL_AMOUNT = 0.30;
const PAWMOT_MOUTH_SPEED = 4.5;
const PAWMOT_MOUTH_MAX_SCALE = 1.4;

// Fungsi animasi Pawmot
export function animatePawmot(actor, time, deltaTime) {
    const sinHand = Math.sin(time * PAWMOT_HAND_SPEED);
    const sinHead = Math.sin(time * PAWMOT_HEAD_SPEED);

    // Animasi Ekor
    if (actor.tailRef) {
        const tailRotation = Math.sin(time * PAWMOT_TAIL_SPEED) * PAWMOT_TAIL_AMOUNT;
        LIBS.set_I4(actor.tailRef.MOVE_MATRIX);
        LIBS.rotateZ(actor.tailRef.MOVE_MATRIX, tailRotation);
    }

    // Animasi Mulut
    if (actor.mouthRef) {
        const scaleT = (Math.sin(time * PAWMOT_MOUTH_SPEED) + 1) / 2;
        const currentScale = 1.0 + (PAWMOT_MOUTH_MAX_SCALE - 1.0) * scaleT;
        LIBS.set_I4(actor.mouthRef.MOVE_MATRIX);
        LIBS.scale(actor.mouthRef.MOVE_MATRIX, currentScale, currentScale, currentScale);
    }

    // Animasi Tangan Kiri
    if (actor.leftHandMove) {
        const rotZ = sinHand * PAWMOT_HAND_ROT_AMPLITUDE;
        LIBS.set_I4(actor.leftHandMove);
        LIBS.rotateZ(actor.leftHandMove, rotZ);
        LIBS.translateX(actor.leftHandMove, -rotZ - 0.2);
    }

    // Animasi Tangan Kanan
    if (actor.rightHandMove) {
        const rotZ = sinHand * PAWMOT_HAND_ROT_AMPLITUDE;
        LIBS.set_I4(actor.rightHandMove);
        LIBS.rotateZ(actor.rightHandMove, -rotZ);
        LIBS.translateX(actor.rightHandMove, rotZ + 0.2);
    }

    // Animasi Kepala
    if (actor.headMove) {
        const transY = Math.abs(sinHead) * PAWMOT_HEAD_TRANS_AMPLITUDE;
        const nodRotX = sinHead * PAWMOT_HEAD_NOD_AMPLITUDE;
        LIBS.set_I4(actor.headMove);
        LIBS.translateY(actor.headMove, transY);
        LIBS.rotateX(actor.headMove, nodRotX);
    }
}