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
}