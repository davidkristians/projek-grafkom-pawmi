// animations/pawmo.js - Versi Baru dengan Animasi Sequence
const LIBS = window.LIBS;

// ========== KONSTANTA ANIMASI ==========

// Konstanta Tangan 
const PAWMO_HAND_ROT_AMPLITUDE = LIBS.degToRad(25);
const PAWMO_HAND_SPEED = 2.0;

// Konstanta Kepala
const PAWMO_HEAD_SWAY_AMPLITUDE = LIBS.degToRad(12); 
const PAWMO_HEAD_SPEED = 1.8;
const PAWMO_HEAD_TRANS_AMPLITUDE = 0.04;

// Konstanta Ekor & Mulut
const PAWMO_TAIL_SPEED = 3.0;
const PAWMO_TAIL_AMOUNT = 0.20;
const PAWMO_MOUTH_SPEED = 3.5;
const PAWMO_MOUTH_MAX_SCALE = 1.2;

// Konstanta Kaki
const PAWMO_WALK_SPEED = 2.0;
const PAWMO_WALK_STEP_HEIGHT = 0.15;
const PAWMO_WALK_STEP_LENGTH = 0.2;
const PAWMO_WALK_STEP_ROTATION = LIBS.degToRad(-20);
const PAWMO_BODY_MOVE_SPEED = 0.4;

// ========== TIMING ANIMASI SEQUENCE ==========
const SEQUENCE_TIMING = {
    WALK_1: 3.0,        // 0-3 detik: Jalan
    STOP: 1.5,          // 3-4.5 detik: Berhenti  
    JUMP: 1.0,          // 4.5-5.5 detik: Lompat sedikit
    TURN: 1.5,          // 5.5-7 detik: Putar balik
    WALK_2: 3.0         // 7-10 detik: Jalan lagi (arah berlawanan)
};

// Hitung waktu kumulatif untuk memudahkan pengecekan
const CUMULATIVE_TIME = {
    WALK_1_END: SEQUENCE_TIMING.WALK_1,
    STOP_END: SEQUENCE_TIMING.WALK_1 + SEQUENCE_TIMING.STOP,
    JUMP_END: SEQUENCE_TIMING.WALK_1 + SEQUENCE_TIMING.STOP + SEQUENCE_TIMING.JUMP,
    TURN_END: SEQUENCE_TIMING.WALK_1 + SEQUENCE_TIMING.STOP + SEQUENCE_TIMING.JUMP + SEQUENCE_TIMING.TURN,
    WALK_2_END: SEQUENCE_TIMING.WALK_1 + SEQUENCE_TIMING.STOP + SEQUENCE_TIMING.JUMP + SEQUENCE_TIMING.TURN + SEQUENCE_TIMING.WALK_2
};

// Fungsi animasi Pawmo dengan state-based system
export function animatePawmo(actor, time, deltaTime) {
    
    // ========== ANIMASI IDLE (Selalu Berjalan) ==========
    
    const sinHand = Math.sin(time * PAWMO_HAND_SPEED);
    const sinHead = Math.sin(time * PAWMO_HEAD_SPEED);

    // Animasi Ekor
    if (actor.tailRef) {
        const tailRotation = Math.sin(time * PAWMO_TAIL_SPEED) * PAWMO_TAIL_AMOUNT;
        LIBS.set_I4(actor.tailRef.MOVE_MATRIX);
        LIBS.rotateY(actor.tailRef.MOVE_MATRIX, tailRotation);
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
        const swayRotZ = sinHead * PAWMO_HEAD_SWAY_AMPLITUDE;
        LIBS.set_I4(actor.headMove);
        LIBS.translateY(actor.headMove, transY);
        LIBS.rotateZ(actor.headMove, swayRotZ);
    }

    // ========== STATE-BASED ANIMATION SEQUENCE ==========
    
    // Initialize rotation accumulator if not exists
    if (!actor.totalRotation) {
        actor.totalRotation = 0;
        actor.isReturning = false; // Track jika sedang kembali
        actor.jumpProgress = 0; // Track progress lompatan
    }
    
    // Loop animasi setelah selesai
    const loopTime = time % CUMULATIVE_TIME.WALK_2_END;
    
    // STATE 1: JALAN PERTAMA (0-3 detik)
    if (loopTime < CUMULATIVE_TIME.WALK_1_END) {
        const sinWalk = Math.sin(loopTime * PAWMO_WALK_SPEED);
        
        // Reset MOVE_MATRIX untuk memastikan tidak ada efek dari state lain
        if (actor.MOVE_MATRIX) {
            LIBS.set_I4(actor.MOVE_MATRIX);
        }
        
        // Animasi Kaki Kanan
        if (actor.rightFootMove) {
            const transZ = sinWalk * PAWMO_WALK_STEP_LENGTH;
            const transY = Math.max(0, sinWalk) * PAWMO_WALK_STEP_HEIGHT;
            const rotX = Math.max(0, sinWalk) * PAWMO_WALK_STEP_ROTATION;
            LIBS.set_I4(actor.rightFootMove);
            LIBS.translateY(actor.rightFootMove, transY);
            LIBS.translateZ(actor.rightFootMove, transZ);
            LIBS.rotateX(actor.rightFootMove, rotX);
        }
        
        // Animasi Kaki Kiri
        if (actor.leftFootMove) {
            const transZ = -sinWalk * PAWMO_WALK_STEP_LENGTH;
            const transY = Math.max(0, -sinWalk) * PAWMO_WALK_STEP_HEIGHT;
            const rotX = Math.max(0, -sinWalk) * PAWMO_WALK_STEP_ROTATION;
            LIBS.set_I4(actor.leftFootMove);
            LIBS.translateY(actor.leftFootMove, transY);
            LIBS.translateZ(actor.leftFootMove, transZ);
            LIBS.rotateX(actor.leftFootMove, rotX);
        }
        
        // Gerakkan badan maju
        LIBS.translateZ(actor.POSITION_MATRIX, PAWMO_BODY_MOVE_SPEED * deltaTime);
        actor.isReturning = false;
    }
    
    // STATE 2: BERHENTI (3-4.5 detik)
    else if (loopTime < CUMULATIVE_TIME.STOP_END) {
        // Reset MOVE_MATRIX ke posisi netral
        if (actor.MOVE_MATRIX) {
            LIBS.set_I4(actor.MOVE_MATRIX);
        }
        
        // Reset posisi kaki ke netral (berhenti total)
        if (actor.rightFootMove) {
            LIBS.set_I4(actor.rightFootMove);
        }
        if (actor.leftFootMove) {
            LIBS.set_I4(actor.leftFootMove);
        }
        // Tidak ada pergerakan badan
    }
    
    // STATE 3: LOMPAT SEDIKIT (4.5-5.5 detik)
    else if (loopTime < CUMULATIVE_TIME.JUMP_END) {
        // Hitung progress lompatan (0 ke 1)
        const jumpLocalTime = loopTime - CUMULATIVE_TIME.STOP_END;
        const jumpProgress = jumpLocalTime / SEQUENCE_TIMING.JUMP;
        
        // Gunakan parabola untuk lompatan (naik lalu turun)
        const jumpHeight = Math.sin(jumpProgress * Math.PI) * 0.8; // Max 0.8 unit tinggi
        
        // Initialize MOVE_MATRIX jika belum ada
        if (!actor.MOVE_MATRIX) {
            actor.MOVE_MATRIX = LIBS.get_I4();
        }
        
        // Set MOVE_MATRIX dengan posisi Y untuk lompatan
        LIBS.set_I4(actor.MOVE_MATRIX);
        LIBS.translateY(actor.MOVE_MATRIX, jumpHeight);
        
        // Sedikit kompresi kaki saat mendarat
        if (actor.rightFootMove && actor.leftFootMove) {
            const compression = (jumpProgress > 0.8) ? (1 - jumpProgress) * 2 : 0;
            LIBS.set_I4(actor.rightFootMove);
            LIBS.translateY(actor.rightFootMove, -compression * 0.1);
            LIBS.set_I4(actor.leftFootMove);
            LIBS.translateY(actor.leftFootMove, -compression * 0.1);
        }
    }
    
    // STATE 4: PUTAR BALIK (5.5-7 detik)
    else if (loopTime < CUMULATIVE_TIME.TURN_END) {
        // Reset MOVE_MATRIX setelah lompat
        if (actor.MOVE_MATRIX) {
            LIBS.set_I4(actor.MOVE_MATRIX);
        }
        
        // Hitung progress putaran (0 ke 1)
        const turnLocalTime = loopTime - CUMULATIVE_TIME.JUMP_END;
        const turnProgress = turnLocalTime / SEQUENCE_TIMING.TURN;
        
        // Putar 180 derajat secara smooth
        const targetRotation = Math.PI; // 180 derajat
        const currentRotation = turnProgress * targetRotation;
        const rotationDelta = currentRotation - (actor.previousRotation || 0);
        
        LIBS.rotateY(actor.POSITION_MATRIX, rotationDelta);
        
        // Simpan rotasi sebelumnya
        actor.previousRotation = currentRotation;
        
        // Reset kaki tetap di posisi netral
        if (actor.rightFootMove) {
            LIBS.set_I4(actor.rightFootMove);
        }
        if (actor.leftFootMove) {
            LIBS.set_I4(actor.leftFootMove);
        }
        
        // Set flag bahwa sedang kembali
        if (turnProgress > 0.99) {
            actor.isReturning = true;
            actor.previousRotation = 0; // Reset untuk cycle berikutnya
        }
    }
    
    // STATE 5: JALAN KEMBALI (7-10 detik)
    else if (loopTime < CUMULATIVE_TIME.WALK_2_END) {
        const walkLocalTime = loopTime - CUMULATIVE_TIME.TURN_END;
        const sinWalk = Math.sin(walkLocalTime * PAWMO_WALK_SPEED);
        
        // Reset MOVE_MATRIX 
        if (actor.MOVE_MATRIX) {
            LIBS.set_I4(actor.MOVE_MATRIX);
        }
        
        // Animasi Kaki Kanan (sama seperti jalan pertama)
        if (actor.rightFootMove) {
            const transZ = sinWalk * PAWMO_WALK_STEP_LENGTH;
            const transY = Math.max(0, sinWalk) * PAWMO_WALK_STEP_HEIGHT;
            const rotX = Math.max(0, sinWalk) * PAWMO_WALK_STEP_ROTATION;
            LIBS.set_I4(actor.rightFootMove);
            LIBS.translateY(actor.rightFootMove, transY);
            LIBS.translateZ(actor.rightFootMove, transZ);
            LIBS.rotateX(actor.rightFootMove, rotX);
        }
        
        // Animasi Kaki Kiri
        if (actor.leftFootMove) {
            const transZ = -sinWalk * PAWMO_WALK_STEP_LENGTH;
            const transY = Math.max(0, -sinWalk) * PAWMO_WALK_STEP_HEIGHT;
            const rotX = Math.max(0, -sinWalk) * PAWMO_WALK_STEP_ROTATION;
            LIBS.set_I4(actor.leftFootMove);
            LIBS.translateY(actor.leftFootMove, transY);
            LIBS.translateZ(actor.leftFootMove, transZ);
            LIBS.rotateX(actor.leftFootMove, rotX);
        }
        
        // PERBAIKAN: Setelah berputar 180°, Pawmo harus jalan "maju" relatif ke badannya
        // Yang berarti bergerak ke arah Z negatif dalam world space (kembali)
        LIBS.translateZ(actor.POSITION_MATRIX, -PAWMO_BODY_MOVE_SPEED * deltaTime);
        
        // Reset rotation tracker saat cycle selesai
        if (walkLocalTime >= SEQUENCE_TIMING.WALK_2 - 0.1) {
            actor.previousRotation = 0;
        }
    }
}