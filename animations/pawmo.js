// animations/pawmo.js
const LIBS = window.LIBS;

// Konstanta khusus animasi Pawmo (Contoh: lebih lambat)
const PAWMO_HAND_ROT_AMPLITUDE = LIBS.degToRad(25); // Ayunan lebih kecil
const PAWMO_HAND_SPEED = 2.0; // Lebih lambat
const PAWMO_HEAD_NOD_AMPLITUDE = LIBS.degToRad(10);
const PAWMO_HEAD_SPEED = 2.5;
const PAWMO_HEAD_TRANS_AMPLITUDE = 0.06;
const PAWMO_TAIL_SPEED = 3.0;
const PAWMO_TAIL_AMOUNT = 0.20;
const PAWMO_MOUTH_SPEED = 3.5;
const PAWMO_MOUTH_MAX_SCALE = 1.2;

// Fungsi animasi Pawmo
export function animatePawmo(actor, time, deltaTime) {
    const sinHand = Math.sin(time * PAWMO_HAND_SPEED);
    const sinHead = Math.sin(time * PAWMO_HEAD_SPEED);

    // Animasi Ekor
    if (actor.tailRef) {
        const tailRotation = Math.sin(time * PAWMO_TAIL_SPEED) * PAWMO_TAIL_AMOUNT;
        LIBS.set_I4(actor.tailRef.MOVE_MATRIX);
        LIBS.rotateZ(actor.tailRef.MOVE_MATRIX, tailRotation);
    }

    // Animasi Mulut
    if (actor.mouthRef) {
        const scaleT = (Math.sin(time * PAWMO_MOUTH_SPEED) + 1) / 2;
        const currentScale = 1.0 + (PAWMO_MOUTH_MAX_SCALE - 1.0) * scaleT;
        LIBS.set_I4(actor.mouthRef.MOVE_MATRIX);
        LIBS.scale(actor.mouthRef.MOVE_MATRIX, currentScale, currentScale, currentScale);
    }

    // Animasi Tangan Kiri
    if (actor.leftHandMove) {
        const rotZ = sinHand * PAWMO_HAND_ROT_AMPLITUDE;
        LIBS.set_I4(actor.leftHandMove);
        LIBS.rotateZ(actor.leftHandMove, rotZ);
        LIBS.translateX(actor.leftHandMove, -rotZ - 0.2);
    }

    // Animasi Tangan Kanan
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
        const transY = Math.abs(sinHead) * PAWMO_HEAD_TRANS_AMPLITUDE;
        const nodRotX = sinHead * PAWMO_HEAD_NOD_AMPLITUDE;
        LIBS.set_I4(actor.headMove);
        LIBS.translateY(actor.headMove, transY);
        LIBS.rotateX(actor.headMove, nodRotX);
    }
}