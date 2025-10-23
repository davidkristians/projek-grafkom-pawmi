// animations/pawmo.js - Versi Final (Full Loop dengan Duduk & Konstanta Jelas)
const LIBS = window.LIBS;

// ========== KONSTANTA ANIMASI ==========
const PAWMO_HAND_ROT_AMPLITUDE = LIBS.degToRad(25);
const PAWMO_HAND_SPEED = 2.0;
const PAWMO_HEAD_SWAY_AMPLITUDE = LIBS.degToRad(12);
const PAWMO_HEAD_SPEED = 1.8;
const PAWMO_HEAD_TRANS_AMPLITUDE = 0.04;
const PAWMO_TAIL_SPEED = 3.0;
const PAWMO_TAIL_AMOUNT = 0.20;
const PAWMO_MOUTH_SPEED = 3.5;
const PAWMO_MOUTH_MAX_SCALE = 1.2;
const PAWMO_WALK_SPEED = 2.0;
const PAWMO_WALK_STEP_HEIGHT = 0.15;
const PAWMO_WALK_STEP_LENGTH = 0.2;
const PAWMO_WALK_STEP_ROTATION = LIBS.degToRad(-20);

// ========== KONSTANTA GERAKAN ==========
const PAWMO_WALK_CYCLE_DURATION = 6.0; // 3.0s maju, 3.0s mundur
const PAWMO_WALK_DISTANCE = 1.5;
const PAWMO_JUMP_DURATION = 0.8;
const PAWMO_PAUSE_DURATION = 1.0; // Durasi "Paw Shake"
const PAWMO_SIT_DURATION = 1.0; // Durasi transisi duduk
const PAWMO_SIT_IDLE_DURATION = 1.5; // Durasi diam saat duduk
const PAWMO_STAND_UP_DURATION = 1.0; // Durasi transisi berdiri
const PAWMO_TURN_DURATION = 0.8; // Durasi berputar 180

// ========== KONSTANTA NAFAS ==========
const PAWMO_BREATH_SPEED = 4;
const PAWMO_BREATH_AMOUNT_Y = 0.05;
const PAWMO_BREATH_AMOUNT_Z = 0.1;

// ========== KONSTANTA DUDUK (NAMA DIPERJELAS) ==========
const SITTING_Y_OFFSET = -0.25;
const SIT_LEAN_ANGLE = LIBS.degToRad(15);
const LEG_SIT_ROT_X = LIBS.degToRad(-90);
const LEG_FORWARD_DISTANCE = 0.7; // <-- Mengontrol maju/mundur kaki
const LEG_LIFT_AMOUNT = 1;      // <-- Mengontrol atas/bawah kaki

// ========== KALKULASI WAKTU SIKLUS (9 FASE) ==========
const F1_WALK_END = PAWMO_WALK_CYCLE_DURATION / 2; // 3.0s
const F2_JUMP_END = F1_WALK_END + PAWMO_JUMP_DURATION; // 3.8s
const F3_PAUSE_END = F2_JUMP_END + PAWMO_PAUSE_DURATION; // 4.8s (Shake)
const F4_SIT_DOWN_END = F3_PAUSE_END + PAWMO_SIT_DURATION; // 5.8s (Duduk)
const F5_SIT_IDLE_END = F4_SIT_DOWN_END + PAWMO_SIT_IDLE_DURATION; // 7.3s (Diam Duduk)
const F6_STAND_UP_END = F5_SIT_IDLE_END + PAWMO_STAND_UP_DURATION; // 8.3s (Berdiri)
const F7_TURN_BACK_END = F6_STAND_UP_END + PAWMO_TURN_DURATION; // 9.1s (Putar 1)
const F8_WALK_BACK_END = F7_TURN_BACK_END + PAWMO_WALK_CYCLE_DURATION / 2; // 12.1s (Jalan Balik)
const F9_TURN_FRONT_END = F8_WALK_BACK_END + PAWMO_TURN_DURATION; // 12.9s (Putar 2)
const TOTAL_CYCLE_TIME = F9_TURN_FRONT_END;


// Fungsi animasi Pawmo
export function animatePawmo(actor, time, deltaTime) {

    // ========== ANIMASI IDLE (Selalu Berjalan) ==========
    const sinHand = Math.sin(time * PAWMO_HAND_SPEED);
    const sinHead = Math.sin(time * PAWMO_HEAD_SPEED);
    const sinBreath = Math.sin(time * PAWMO_BREATH_SPEED);

    // (Animasi Ekor, Mulut, Kepala, Nafas tidak berubah)
    if (actor.tailRef) {
        const tailRotation = Math.sin(time * PAWMO_TAIL_SPEED) * PAWMO_TAIL_AMOUNT;
        LIBS.set_I4(actor.tailRef.MOVE_MATRIX);
        LIBS.rotateY(actor.tailRef.MOVE_MATRIX, tailRotation);
    }
    if (actor.mouthRef) {
        const scaleT = (Math.sin(time * PAWMO_MOUTH_SPEED) + 1) / 2;
        const currentScale = 1.0 + (PAWMO_MOUTH_MAX_SCALE - 1.0) * scaleT;
        LIBS.set_I4(actor.mouthRef.MOVE_MATRIX);
        LIBS.scale(actor.mouthRef.MOVE_MATRIX, currentScale, currentScale, currentScale);
    }
    if (actor.headMove) {
        const transY = Math.abs(sinHead) * PAWMO_HEAD_TRANS_AMPLITUDE;
        const swayRotZ = sinHead * PAWMO_HEAD_SWAY_AMPLITUDE;
        LIBS.set_I4(actor.headMove);
        LIBS.translateY(actor.headMove, transY);
        LIBS.rotateZ(actor.headMove, swayRotZ);
    }
    if (actor.torsoRef) {
        const breathScaleT = (sinBreath + 1) / 2;
        const scaleY = 1.0 + breathScaleT * PAWMO_BREATH_AMOUNT_Y;
        const scaleZ = 1.0 + breathScaleT * PAWMO_BREATH_AMOUNT_Z;

        LIBS.set_I4(actor.torsoRef.MOVE_MATRIX);
        LIBS.scale(actor.torsoRef.MOVE_MATRIX, 1.0, scaleY, scaleZ);
    }

    // ========== LOGIKA GERAKAN BADAN (STATE MACHINE BARU) ==========

    const cycleTime = time % TOTAL_CYCLE_TIME;

    let positionZ = 0;
    let rotationY = 0;
    let jumpHeight = 0;
    let rotationX_body = 0;

    let isWalking = false;
    let isShaking = false;
    let isSitting = false;

    // Konstanta posisi dasar
    const BASE_POS_Y = 1.5;
    const BASE_POS_X = 0.3;
    const BASE_SCALE = 0.2;

    if (cycleTime < F1_WALK_END) {
        // Fase 1: MAJU
        isWalking = true;
        const t = cycleTime / (PAWMO_WALK_CYCLE_DURATION / 2);
        positionZ = PAWMO_WALK_DISTANCE * t;
        rotationY = 0;
    }
    else if (cycleTime < F2_JUMP_END) {
        // Fase 2: LOMPAT
        isWalking = false;
        const t = (cycleTime - F1_WALK_END) / PAWMO_JUMP_DURATION;
        jumpHeight = Math.sin(t * Math.PI) * PAWMO_JUMP_HEIGHT;
        positionZ = PAWMO_WALK_DISTANCE;
        rotationY = 0;
    }
    else if (cycleTime < F3_PAUSE_END) {
        // Fase 3: DIAM (PAW SHAKE)
        isShaking = true;
        positionZ = PAWMO_WALK_DISTANCE;
        rotationY = 0;
        jumpHeight = 0;
    }
    else if (cycleTime < F4_SIT_DOWN_END) {
        // Fase 4: Transisi DUDUK
        isSitting = true;
        const t = (cycleTime - F3_PAUSE_END) / PAWMO_SIT_DURATION;
        const smoothT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

        positionZ = PAWMO_WALK_DISTANCE;
        rotationY = 0;
        jumpHeight = SITTING_Y_OFFSET * smoothT;
        rotationX_body = SIT_LEAN_ANGLE * smoothT;
    }
    else if (cycleTime < F5_SIT_IDLE_END) {
        // Fase 5: DIAM DUDUK
        isSitting = true;
        positionZ = PAWMO_WALK_DISTANCE;
        rotationY = 0;
        jumpHeight = SITTING_Y_OFFSET;
        rotationX_body = SIT_LEAN_ANGLE;
    }
    else if (cycleTime < F6_STAND_UP_END) {
        // Fase 6: Transisi BERDIRI
        isSitting = true; // Tetap true untuk animasikan kaki
        const t = (cycleTime - F5_SIT_IDLE_END) / PAWMO_STAND_UP_DURATION;
        const smoothT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

        positionZ = PAWMO_WALK_DISTANCE;
        rotationY = 0;
        jumpHeight = SITTING_Y_OFFSET * (1.0 - smoothT);
        rotationX_body = SIT_LEAN_ANGLE * (1.0 - smoothT);
    }
    else if (cycleTime < F7_TURN_BACK_END) {
        // Fase 7: BERPUTAR 180 (untuk kembali)
        isWalking = false;
        const t = (cycleTime - F6_STAND_UP_END) / PAWMO_TURN_DURATION;
        const smoothT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        positionZ = PAWMO_WALK_DISTANCE;
        rotationY = Math.PI * smoothT;
    }
    else if (cycleTime < F8_WALK_BACK_END) {
        // Fase 8: JALAN MUNDUR
        isWalking = true;
        const t = (cycleTime - F7_TURN_BACK_END) / (PAWMO_WALK_CYCLE_DURATION / 2);
        positionZ = PAWMO_WALK_DISTANCE * (1.0 - t);
        rotationY = Math.PI;
    }
    else {
        // Fase 9: BERPUTAR BALIK (menghadap depan)
        isWalking = false;
        const t = (cycleTime - F8_WALK_BACK_END) / PAWMO_TURN_DURATION;
        const smoothT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        positionZ = 0;
        rotationY = Math.PI + (Math.PI * smoothT);
    }


    // Terapkan transformasi gerakan ke SELURUH actor (POSITION_MATRIX)
    LIBS.set_I4(actor.POSITION_MATRIX);
    LIBS.translateY(actor.POSITION_MATRIX, BASE_POS_Y + jumpHeight);
    LIBS.rotateY(actor.POSITION_MATRIX, rotationY);
    LIBS.rotateX(actor.POSITION_MATRIX, rotationX_body); // Terapkan sandaran badan
    LIBS.translateZ(actor.POSITION_MATRIX, positionZ);
    LIBS.translateX(actor.POSITION_MATRIX, BASE_POS_X);
    LIBS.scale(actor.POSITION_MATRIX, BASE_SCALE, BASE_SCALE, BASE_SCALE);


    // ========== ANIMASI KAKI & TANGAN (TERGANTUNG STATE) ==========

    if (isWalking) {
        // === STATE: JALAN ===
        const sinWalk = Math.sin(time * PAWMO_WALK_SPEED);

        // (Animasi Kaki & Tangan Jalan tidak berubah)
        if (actor.rightFootMove) {
            const transZ = sinWalk * PAWMO_WALK_STEP_LENGTH;
            const transY = Math.max(0, sinWalk) * PAWMO_WALK_STEP_HEIGHT;
            const rotX = Math.max(0, sinWalk) * PAWMO_WALK_STEP_ROTATION;
            LIBS.set_I4(actor.rightFootMove);
            LIBS.translateY(actor.rightFootMove, transY);
            LIBS.translateZ(actor.rightFootMove, transZ);
            LIBS.rotateX(actor.rightFootMove, rotX);
        }
        if (actor.leftFootMove) {
            const transZ = -sinWalk * PAWMO_WALK_STEP_LENGTH;
            const transY = Math.max(0, -sinWalk) * PAWMO_WALK_STEP_HEIGHT;
            const rotX = Math.max(0, -sinWalk) * PAWMO_WALK_STEP_ROTATION;
            LIBS.set_I4(actor.leftFootMove);
            LIBS.translateY(actor.leftFootMove, transY);
            LIBS.translateZ(actor.leftFootMove, transZ);
            LIBS.rotateX(actor.leftFootMove, rotX);
        }
        if (actor.leftHandMove) {
            const rotX_Left = sinHand * PAWMO_HAND_ROT_AMPLITUDE;
            LIBS.set_I4(actor.leftHandMove);
            LIBS.rotateX(actor.leftHandMove, rotX_Left);
        }
        if (actor.rightHandMove) {
            const rotX_Right = -sinHand * PAWMO_HAND_ROT_AMPLITUDE;
            LIBS.set_I4(actor.rightHandMove);
            LIBS.rotateX(actor.rightHandMove, rotX_Right);
        }

    } else if (isShaking) {
        // === STATE: MENGIBAS TANGAN (Rotate Arbitrary Axis) ===

        // (Animasi Kibasan Tangan tidak berubah)
        if (actor.rightFootMove) { LIBS.set_I4(actor.rightFootMove); }
        if (actor.leftFootMove) { LIBS.set_I4(actor.leftFootMove); }
        if (actor.leftHandMove) { LIBS.set_I4(actor.leftHandMove); }
        if (actor.rightHandMove) {
            const SHAKE_SPEED = 35.0;
            const SHAKE_AMOUNT_Z = LIBS.degToRad(30);
            const SHAKE_AMOUNT_Y = LIBS.degToRad(25);
            const rotZ_shake = Math.sin(time * SHAKE_SPEED) * SHAKE_AMOUNT_Z;
            const rotY_shake = Math.cos(time * SHAKE_SPEED) * SHAKE_AMOUNT_Y;
            LIBS.set_I4(actor.rightHandMove);
            LIBS.rotateX(actor.rightHandMove, LIBS.degToRad(390));
            LIBS.rotateZ(actor.rightHandMove, LIBS.degToRad(90));
            LIBS.rotateY(actor.rightHandMove, rotY_shake);
            LIBS.rotateZ(actor.rightHandMove, rotZ_shake);
        }

    } else if (isSitting) {
        // === STATE: DUDUK/BERDIRI (Hierarchical Transformation) ===

        // Reset Tangan
        if (actor.leftHandMove) { LIBS.set_I4(actor.leftHandMove); }
        if (actor.rightHandMove) { LIBS.set_I4(actor.rightHandMove); }

        // Tentukan 't_sit' (progres duduk, 0 = berdiri, 1 = duduk)
        let t_sit = 0.0;
        if (cycleTime < F4_SIT_DOWN_END) {
            t_sit = (cycleTime - F3_PAUSE_END) / PAWMO_SIT_DURATION;
        } else if (cycleTime < F5_SIT_IDLE_END) {
            t_sit = 1.0;
        } else if (cycleTime < F6_STAND_UP_END) {
            t_sit = 1.0 - ((cycleTime - F5_SIT_IDLE_END) / PAWMO_STAND_UP_DURATION);
        }

        const smoothT_sit = t_sit < 0.5 ? 2 * t_sit * t_sit : 1 - Math.pow(-2 * t_sit + 2, 2) / 2;

        // Hitung transformasi kaki (Children)
        const legRotX = LEG_SIT_ROT_X * smoothT_sit;

        // Gunakan nama konstanta yang sudah diperjelas
        const legExtend = LEG_FORWARD_DISTANCE * smoothT_sit; // Untuk maju
        const legLift = LEG_LIFT_AMOUNT * smoothT_sit;   // Untuk atas

        // Terapkan ke kedua kaki
        if (actor.rightFootMove) {
            LIBS.set_I4(actor.rightFootMove);
            LIBS.rotateX(actor.rightFootMove, legRotX);     // 1. Putar
            LIBS.translateY(actor.rightFootMove, legExtend+1);  // 2. Maju (Y baru)
            LIBS.translateZ(actor.rightFootMove, -legLift+2.5); // 3. Angkat (Z baru)
        }
        if (actor.leftFootMove) {
            LIBS.set_I4(actor.leftFootMove);
            LIBS.rotateX(actor.leftFootMove, legRotX);     // 1. Putar
            LIBS.translateY(actor.leftFootMove, legExtend+1);  // 2. Maju (Y baru)
            LIBS.translateZ(actor.leftFootMove, -legLift+2.5); // 3. Angkat (Z baru)
        }

    } else {
        // === STATE LAIN (LOMPAT / BERPUTAR) ===

        // Reset Kaki & Tangan
        if (actor.rightFootMove) { LIBS.set_I4(actor.rightFootMove); }
        if (actor.leftFootMove) { LIBS.set_I4(actor.leftFootMove); }
        if (actor.leftHandMove) { LIBS.set_I4(actor.leftHandMove); }
        if (actor.rightHandMove) { LIBS.set_I4(actor.rightHandMove); }
    }
}