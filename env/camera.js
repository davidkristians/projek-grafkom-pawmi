// env/camera.js

// Ambil LIBS dari window
const LIBS = window.LIBS;

export class Camera {
    constructor(globalApp) {
        this.globalApp = globalApp;
        this.gl = globalApp.gl;
        this.canvas = globalApp.gl.canvas; // Dapatkan referensi ke canvas

        // State Kamera Free-Roam (Minecraft POV)
        this.position = [0, 3.5, 9]; // Posisi awal (X, Y, Z) - Sesuaikan jika perlu
        this.yaw = 0;       // Rotasi horizontal (Y) - Diubah oleh mouse X
        this.pitch = -0.3;  // Rotasi vertikal (X) - Diubah oleh mouse Y, sedikit ke bawah
        this.speed = 6.0;   // Kecepatan gerakan (unit/detik)
        this.drag = false;  // Status apakah mouse terkunci (pointer lock)

        // Sensitivitas
        this.sensitivityLook = 0.003; // Sensitivitas mouse untuk rotasi (yaw/pitch)

        this.viewMatrix = LIBS.get_I4();
        this.projectionMatrix = LIBS.get_I4();

        // Matriks sementara untuk kalkulasi V = R_inv * T_inv
        this.temp_R_inv = LIBS.get_I4();
        this.temp_T_inv = LIBS.get_I4();

        // ▼▼▼ BARU: Matriks view khusus tanpa rotasi ▼▼▼
        this.viewMatrixNoRotation = LIBS.get_I4();
        // ▲▲▲ SELESAI ▲▲▲

        this.keys = {}; // Status tombol keyboard
        this._setupControls();
    }

    _setupControls() {
        // --- Mouse Controls (Pointer Lock for Mouse Look) ---

        const mouseMove = (e) => {
            if (!this.drag) return; // Hanya update jika mouse terkunci

            const deltaX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
            const deltaY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;

            // Gerakan mouse X -> ubah Yaw (kiri/kanan)
            this.yaw -= deltaX * this.sensitivityLook;

            // Gerakan mouse Y -> ubah Pitch (atas/bawah)
            this.pitch -= deltaY * this.sensitivityLook;

            // Batasi pitch agar tidak terbalik (seperti di Minecraft)
            const limit = LIBS.degToRad(89.9); // Batas hampir 90 derajat
            this.pitch = Math.max(-limit, Math.min(limit, this.pitch));
        };

        const mouseDown = () => {
            // Minta pointer lock saat canvas diklik
            this.canvas.requestPointerLock = this.canvas.requestPointerLock || this.canvas.mozRequestPointerLock;
            this.canvas.requestPointerLock();
        };

        const lockChange = () => {
            // Update status 'drag' saat pointer lock berubah
            if (document.pointerLockElement === this.canvas || document.mozPointerLockElement === this.canvas) {
                this.drag = true;
            } else {
                this.drag = false;
            }
        };

        this.canvas.addEventListener("mousedown", mouseDown);
        document.addEventListener("pointerlockchange", lockChange);
        document.addEventListener("mozpointerlockchange", lockChange);
        document.addEventListener("mousemove", mouseMove);

        // --- Keyboard Controls (WASD + Space/Shift) ---
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            // Key Escape untuk keluar dari pointer lock
            if (e.key === 'Escape') {
                document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
                if (document.exitPointerLock) document.exitPointerLock();
            }
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        // Hubungkan resize ke update projection matrix
        window.addEventListener('resize', () => this.updateProjectionMatrix());
    }

    // Fungsi ini harus dipanggil setiap kali canvas resize
    updateProjectionMatrix() {
        const aspect = this.gl.canvas.width / this.gl.canvas.height;
        this.projectionMatrix = this._createPerspective(Math.PI / 4, aspect, 0.1, 100); // FOV 45 derajat
    }

    // Fungsi ini dipanggil setiap frame oleh main-scene.js
    update(deltaTime) {
        const moveSpeed = this.speed * deltaTime;

        // --- Hitung Vektor Arah Berdasarkan Yaw dan Pitch ---
        const cosPitch = Math.cos(this.pitch);
        const sinPitch = Math.sin(this.pitch);
        const cosYaw = Math.cos(this.yaw);
        const sinYaw = Math.sin(this.yaw);

        // Vektor arah pandang (depan - Forward Vector)
        const forwardX = -sinYaw * cosPitch;
        const forwardY = sinPitch;
        const forwardZ = -cosYaw * cosPitch;

        // Vektor arah kanan (Right Vector - tegak lurus forward & up[0,1,0])
        const rightX = cosYaw;
        const rightY = 0; // Gerakan strafe (A/D) hanya horizontal
        const rightZ = -sinYaw;

        // --- Update Posisi Berdasarkan Input Keyboard ---
        let moveX = 0;
        let moveY = 0;
        let moveZ = 0;

        // Maju/Mundur (W/S) - Menggunakan vektor forward 3D
        if (this.keys['w']) {
            moveX += forwardX * moveSpeed;
            moveY += forwardY * moveSpeed;
            moveZ += forwardZ * moveSpeed;
        }
        if (this.keys['s']) {
            moveX -= forwardX * moveSpeed;
            moveY -= forwardY * moveSpeed;
            moveZ -= forwardZ * moveSpeed;
        }

        // Strafe Kiri/Kanan (A/D) - Menggunakan vektor right horizontal
        if (this.keys['a']) { // Gerak ke Kiri (negatif right)
            moveX -= rightX * moveSpeed;
            moveZ -= rightZ * moveSpeed;
        }
        if (this.keys['d']) { // Gerak ke Kanan (positif right)
            moveX += rightX * moveSpeed;
            moveZ += rightZ * moveSpeed;
        }

        // Naik/Turun (Space/Shift) - Langsung di sumbu Y
        if (this.keys[' ']) {
            moveY += moveSpeed;
        }
        if (this.keys['shift']) {
            moveY -= moveSpeed;
        }

        // Terapkan total pergerakan ke posisi kamera
        this.position[0] += moveX;
        this.position[1] += moveY;
        this.position[2] += moveZ;

        // --- Hitung View Matrix (V = R^-1 * T^-1) ---
        // 1. Hitung Rotasi Terbalik (R^-1 = Ry(-yaw) * Rx(-pitch))
        LIBS.set_I4(this.temp_R_inv);
        LIBS.rotateY(this.temp_R_inv, this.yaw);
        LIBS.rotateX(this.temp_R_inv, -this.pitch);

        // 2. Hitung Translasi Terbalik (T^-1)
        LIBS.set_I4(this.temp_T_inv);
        LIBS.translateX(this.temp_T_inv, -this.position[0]);
        LIBS.translateY(this.temp_T_inv, -this.position[1]);
        LIBS.translateZ(this.temp_T_inv, -this.position[2]);

        // 3. Kalikan V = R^-1 * T^-1
        LIBS.mul(this.viewMatrix, this.temp_R_inv, this.temp_T_inv);

        // ▼▼▼ BARU: Hitung View Matrix Tanpa Rotasi (Hanya T^-1) ▼▼▼
        // Gunakan hasil translasi terbalik dari langkah 2
        LIBS.set_I4(this.viewMatrixNoRotation); // Reset
        LIBS.mul(this.viewMatrixNoRotation, this.temp_T_inv, this.viewMatrixNoRotation); // Salin T^-1
        // Atau bisa juga:
        // LIBS.set_I4(this.viewMatrixNoRotation);
        // LIBS.translateX(this.viewMatrixNoRotation, -this.position[0]);
        // LIBS.translateY(this.viewMatrixNoRotation, -this.position[1]);
        // LIBS.translateZ(this.viewMatrixNoRotation, -this.position[2]);
        // ▲▲▲ SELESAI ▲▲▲
    }

    getViewMatrix() {
        return this.viewMatrix;
    }

    // ▼▼▼ BARU: Method untuk mendapatkan view matrix tanpa rotasi ▼▼▼
    getViewMatrixNoRotation() {
        return this.viewMatrixNoRotation;
    }
    // ▲▲▲ SELESAI ▲▲▲

    getProjectionMatrix() {
        return this.projectionMatrix;
    }

    // --- Helper Matriks ---
    _createPerspective(fov, aspect, near, far) {
        const f = 1.0 / Math.tan(fov / 2);
        const nf = 1 / (near - far);
        return new Float32Array([
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (far + near) * nf, -1,
            0, 0, 2 * far * near * nf, 0
        ]);
    }
}