// env/animation.js

// Ambil LIBS dari window (masih dibutuhkan untuk CloudSystem jika tidak diubah)
const LIBS = window.LIBS;

// Kelas CloudSystem (bisa tetap di sini atau dipindah ke file sendiri)
class CloudSystem {
    constructor() {
        this.clouds = [
            { x: -14, y: 7.5, z: -10, vx: 0.07, size: 1.4, offset: 0, rotY: 0 },
            { x: 6, y: 8.5, z: -14, vx: 0.09, size: 1.8, offset: 1.5, rotY: 0.3 },
            { x: -7, y: 6.8, z: -18, vx: 0.08, size: 1.3, offset: 3, rotY: -0.2 },
            { x: 16, y: 9.2, z: -12, vx: 0.06, size: 1.6, offset: 4.5, rotY: 0.5 },
            { x: 1, y: 10, z: -22, vx: 0.10, size: 1.5, offset: 2, rotY: -0.4 },
            { x: -20, y: 6, z: -25, vx: 0.05, size: 1.9, offset: 5.5, rotY: 0.1 }
        ];
    }
    // Update Awan (Aktif)
    update(deltaTime) {
        this.clouds.forEach(cloud => {
            cloud.x += cloud.vx * deltaTime;
            cloud.y += Math.sin(Date.now() * 0.0002 + cloud.offset) * 0.0015;
            cloud.rotY += deltaTime * 0.02;
            if (cloud.x > 28) {
                cloud.x = -28;
            }
        });
    }
}

export class AnimationLoop {
    constructor(globalApp) {
        this.globalApp = globalApp;
        this.globalApp.cloudSystem = new CloudSystem();

        // Struktur data baru untuk menyimpan fungsi animasi per aktor
        this.actorAnimations = new Map(); // Map: actorObject -> animationFunction
    }

    // Metode baru untuk mendaftarkan animasi aktor
    registerActorAnimation(actor, animationFunction) {
        if (actor && typeof animationFunction === 'function') {
            this.actorAnimations.set(actor, animationFunction);
            console.log(`Animation registered for actor:`, actor); // Log untuk debug
        } else {
            console.warn('Failed to register animation. Invalid actor or function.');
        }
    }

    // Fungsi update utama
    update(time, deltaTime) {
        // 1. Update Awan (Aktif)
        this.globalApp.cloudSystem.update(deltaTime * 2);

        // 2. Update Semua Aktor yang Terdaftar (Aktif)
        // Loop melalui Map animasi
        for (const [actor, animateFunc] of this.actorAnimations.entries()) {
            // Panggil fungsi animasi spesifik untuk aktor tersebut
            try { // Tambahkan try-catch untuk debug jika fungsi animasi error
                animateFunc(actor, time, deltaTime);
            } catch (error) {
                console.error(`Error animating actor:`, actor, error);
                // Hapus animasi error agar tidak terus mencoba (opsional)
                // this.actorAnimations.delete(actor);
            }
        }
    }
}