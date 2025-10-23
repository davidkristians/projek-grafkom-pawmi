// animations/pawmot.js
const LIBS = window.LIBS;

// Konstanta khusus animasi Pawmot (Contoh: lebih cepat)
const PAWMOT_HAND_ROT_AMPLITUDE = LIBS.degToRad(10); // Ayunan lebih besar
const PAWMOT_HAND_SPEED = 3.0; // Lebih cepat
const PAWMOT_HEAD_NOD_AMPLITUDE = LIBS.degToRad(15);
const PAWMOT_HEAD_SPEED = 1.5;
const PAWMOT_HEAD_TRANS_AMPLITUDE = 0.09;
const PAWMOT_TAIL_SPEED = 4.0;
const PAWMOT_TAIL_AMOUNT = 0.30;
const PAWMOT_MOUTH_SPEED = 2.5;
const PAWMOT_MOUTH_MAX_SCALE = 1.4;

// --- KONSTANTA RUFF ---
const PAWMOT_RUFF_SPEED = 5.0; // Kecepatan "bernapas" ruff
const PAWMOT_RUFF_SCALE_MIN = 0.7; // Skala minimum (sedikit mengecil)
const PAWMOT_RUFF_SCALE_MAX = 0.9; // Skala maksimum (sedikit membesar)
const PAWMOT_RUFF_OFFSET_FACTOR = 0.7; // Kunci agar gerakannya bergantian
// ▼▼▼ BARU: Seberapa jauh ruff naik-turun ▼▼▼
const PAWMOT_RUFF_TRANS_AMPLITUDE = 0.14; // Jarak naik-turun

// ▼▼▼ Konstanta Jambul (Tuft) ▼▼▼
const PAWMOT_TUFT_SPEED = 2.0; // Kecepatan lambat seperti angin sepoi-sepoi
const PAWMOT_TUFT_AMPLITUDE = LIBS.degToRad(15); // Ayunan 15 derajat ke setiap sisi
const PAWMOT_TUFT_OFFSET_FACTOR = 0.8; // Faktor 'bergantian' antar helai


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

    // --- LOGIKA ANIMASI RUFF (DIPERBARUI) ---
    if (actor.ruffRef && actor.ruffRef.childs && actor.ruffRef.childs.length > 0) {
        const ruffSpikes = actor.ruffRef.childs;
        
        for (let i = 0; i < ruffSpikes.length; i++) {
            const spike = ruffSpikes[i];
            
            // 1. Buat gelombang sinus yang unik untuk setiap spike
            const timeOffset = (time * PAWMOT_RUFF_SPEED) + (i * PAWMOT_RUFF_OFFSET_FACTOR);
            // sinRuff akan bernilai antara -1 dan 1
            const sinRuff = Math.sin(timeOffset); 
            
            // --- Logika Skala (Besar-Kecil) ---
            // 2a. Ubah rentang sin (-1 s/d 1) menjadi rentang skala (MIN s/d MAX)
            const scaleT = (sinRuff + 1) / 2; // Ini memberi nilai dari 0 s/d 1
            const currentScale = PAWMOT_RUFF_SCALE_MIN + (PAWMOT_RUFF_SCALE_MAX - PAWMOT_RUFF_SCALE_MIN) * scaleT;
            
            // --- Logika Translasi (Naik-Turun) ---
            // 2b. Gunakan sinRuff (-1 s/d 1) untuk menentukan posisi Y
            const currentTranslateY = sinRuff * PAWMOT_RUFF_TRANS_AMPLITUDE;

            // 3. Terapkan kedua transformasi
            LIBS.set_I4(spike.MOVE_MATRIX); // Reset matriks
            // Terapkan skala (besar-kecil)
            LIBS.scale(spike.MOVE_MATRIX, currentScale, currentScale, currentScale);
            // Terapkan translasi (naik-turun) SETELAH di-skala
            LIBS.translateY(spike.MOVE_MATRIX, currentTranslateY);
        }
    }

    // ▼▼▼ LOGIKA ANIMASI JAMBUL (TUFT) ▼▼▼
    if (actor.tuftRef && actor.tuftRef.childs && actor.tuftRef.childs.length > 0) {
        const tuftSpikes = actor.tuftRef.childs;
        
        for (let i = 0; i < tuftSpikes.length; i++) {
            const spike = tuftSpikes[i];
            
            // 1. Buat gelombang sinus yang unik untuk setiap helai jambul
            const timeOffset = (time * PAWMOT_TUFT_SPEED) + (i * PAWMOT_TUFT_OFFSET_FACTOR);
            const sinTuft = Math.sin(timeOffset); // Nilai berayun antara -1 dan 1
            
            // 2. Ubah nilai sinus menjadi rotasi (ayunan kanan-kiri)
            const currentRotationZ = sinTuft * PAWMOT_TUFT_AMPLITUDE;

            // 3. Terapkan rotasi
            LIBS.set_I4(spike.MOVE_MATRIX); // Reset matriks gerak
            LIBS.rotateZ(spike.MOVE_MATRIX, currentRotationZ);
        }
    }

    // ▼▼▼ GANTI SEMUA BLOK WANDERING LAMA DENGAN VERSI FINAL INI ▼▼▼
    if (actor.movementState) {
        const state = actor.movementState;
        const M = actor.POSITION_MATRIX;

        // --- 1. STATE LOGIC (Prioritas: Pause > Evade > Seek > Wander) ---
        
        if (state.isPausing) {
            // --- STATE: PAUSING ---
            // Diam di tempat.
            state.pauseTimer -= deltaTime;
            if (state.pauseTimer <= 0) {
                state.isPausing = false;
                state.timeToNextChange = 0; // Selesai berhenti, cari target baru
            }

        } else if (state.isEvading) {
            // --- STATE: EVADING ---
            // Menghindar dari tabrakan.
            state.evadeTimer -= deltaTime;
            if (state.evadeTimer <= 0) {
                state.isEvading = false;
                state.timeToNextChange = 0; // Selesai menghindar, cari target baru
            }
        
        } else if (state.isSeekingCenter) {
            // --- STATE: SEEKING CENTER ---
            // Berjalan menuju titik (0,0).
            
            // Cek jarak ke pusat
            const centerDist = Math.sqrt(state.currentX * state.currentX + state.currentZ * state.currentZ);
            const pauseStopRadius = 0.1; // Radius "tengah" (sangat kecil)

            if (centerDist < pauseStopRadius) {
                // --- KEPUTUSAN: SUDAH SAMPAI, BERHENTI ---
                state.isSeekingCenter = false;
                state.isPausing = true;
                state.pauseTimer = 3.0 + Math.random() * 2.0; // Berhenti 3-5 detik
                state.speed = 0; // Hentikan kecepatan
            } else {
                // --- KEPUTUSAN: BELUM SAMPAI, TERUS KEJAR ---
                // Arahkan target ke pusat (0,0) setiap frame
                state.targetFacingAngle = Math.atan2(0 - state.currentZ, 0 - state.currentX);
                state.speed = 0.7; // Kecepatan konstan saat menuju pusat
            }

        } else {
            // --- STATE: WANDERING (Default) ---
            // Jalan-jalan acak.
            state.timeToNextChange -= deltaTime;
            if (state.timeToNextChange <= 0) {
                // Waktunya mengambil keputusan baru
                const seekCenterChance = 0.35; // 35% kemungkinan

                if (Math.random() < seekCenterChance) {
                    // --- KEPUTUSAN: KEJAR PUSAT ---
                    state.isSeekingCenter = true;
                } else {
                    // --- KEPUTUSAN: LANJUT JALAN (WANDER) ---
                    state.targetFacingAngle = Math.random() * 2 * Math.PI;
                    state.timeToNextChange = 3.0 + Math.random() * 3.0;
                    state.speed = 0.5 + Math.random() * 0.5;
                }
            }
        }

        // --- 2. MOVEMENT LOGIC (HANYA JALAN JIKA TIDAK PAUSING) ---
        if (!state.isPausing) {
            
            // --- 2a. Belok Mulus ---
            let angleDiff = state.targetFacingAngle - state.currentFacingAngle;
            while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
            while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

            const turnStep = state.turnSpeed * deltaTime;
            if (Math.abs(angleDiff) > turnStep) {
                state.currentFacingAngle += (angleDiff > 0 ? 1 : -1) * turnStep;
            } else {
                state.currentFacingAngle = state.targetFacingAngle;
            }
            state.currentFacingAngle = (state.currentFacingAngle + 2 * Math.PI) % (2 * Math.PI);

            // --- 2b. Hitung Posisi BERIKUTNYA ---
            const moveX = Math.cos(state.currentFacingAngle) * state.speed * deltaTime;
            const moveZ = Math.sin(state.currentFacingAngle) * state.speed * deltaTime;
            const nextX = state.currentX + moveX;
            const nextZ = state.currentZ + moveZ;

            // --- 2c. Cek Tabrakan ---
            let isColliding = false;
            let collisionSource = null;
            for (const obs of state.obstacles) {
                const dist = Math.sqrt(Math.pow(nextX - obs.x, 2) + Math.pow(nextZ - obs.z, 2));
                if (dist < state.pawmotRadius + obs.r) {
                    isColliding = true;
                    collisionSource = obs;
                    break;
                }
            }
            const maxRadius = 1.8;
            const nextRadius = Math.sqrt(nextX * nextX + nextZ * nextZ);
            const isAtWall = (nextRadius > maxRadius);
            const isStuck = isAtWall || isColliding;

            // --- 2d. Logika Reaksi & Pergerakan ---
            if (!state.isEvading) {
                // --- Mode Normal / Seeking ---
                if (isStuck) {
                    // BARU NABRAK! (Saat wander ATAU saat seeking)
                    state.isEvading = true; // Masuk mode menghindar
                    state.isSeekingCenter = false; // Batalkan niat ke pusat
                    
                    if (isAtWall) {
                        state.targetFacingAngle = Math.atan2(-state.currentZ, -state.currentX);
                        state.evadeTimer = 1.5;
                    } else {
                        let awayAngle = Math.atan2(state.currentZ - collisionSource.z, state.currentX - collisionSource.x);
                        let randomOffset = (Math.random() - 0.5) * (Math.PI / 1.5); 
                        state.targetFacingAngle = awayAngle + randomOffset;
                        state.evadeTimer = 1.0;
                    }
                } else {
                    // Aman, bergerak
                    state.currentX = nextX;
                    state.currentZ = nextZ;
                }
            } else {
                // --- Mode Menghindar ---
                if (!isStuck) {
                    // Jalur aman, lanjutkan bergerak
                    state.currentX = nextX;
                    state.currentZ = nextZ;
                }
                // Jika masih stuck, JANGAN BERGERAK (biarkan belok)
            }
        
        } // --- Akhir dari 'if (!state.isPausing)' ---
        
        // --- 3. Terapkan Transformasi (SELALU JALAN) ---
        const tiltEffectY = state.currentZ * Math.sin(state.grassTiltRad * -1.0);
        const dynamicY = state.baseY + tiltEffectY;

        LIBS.set_I4(M); // Reset matriks

        LIBS.translateY(M, dynamicY); 
        LIBS.scale(M, state.baseScale, state.baseScale, state.baseScale);
        LIBS.rotateX(M, state.grassTiltRad); 
        LIBS.rotateY(M, -state.currentFacingAngle + (Math.PI / 2)); 
        LIBS.translateX(M, state.currentX);
        LIBS.translateZ(M, state.currentZ);
    }
    // ▲▲▲ AKHIR BLOK PENGGANTI ▲▲▲
}