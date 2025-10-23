// env/camera.js

// Ambil LIBS dari window
const LIBS = window.LIBS;

export class Camera {
    constructor(globalApp) {
        this.globalApp = globalApp;
        this.gl = globalApp.gl;
        this.canvas = globalApp.gl.canvas; // Dapatkan referensi ke canvas

        // State Kamera
        this.position = [0, 3.5, 9]; // Posisi awal (X, Y, Z)
        this.yaw = 0;       // Rotasi horizontal (Y)
        this.pitch = -0.3;  // Rotasi vertikal (X)
        this.speed = 6.0;   // Kecepatan gerakan (unit/detik)
        this.drag = false;  // Status apakah mouse terkunci (pointer lock)

        // Sensitivitas
        this.sensitivityLook = 0.003; // Sensitivitas mouse

        this.viewMatrix = LIBS.get_I4();
        this.projectionMatrix = LIBS.get_I4();

        // Matriks sementara
        this.temp_R_inv = LIBS.get_I4();
        this.temp_T_inv = LIBS.get_I4();
        this.viewMatrixNoRotation = LIBS.get_I4();

        // ▼▼▼ BARU: Properti untuk Third-Person View (TPV) ▼▼▼
        this.isThirdPerson = false;   // Status mode TPV
        this.targetObject = null;    // Objek yang akan diikuti (misal: player, mobil, dll)
        this.tpvOffset = {           // Jarak kamera dari target
            distance: 8.0,          // Jarak ke belakang
            height: 4.0            // Jarak ke atas
        };
        // ▲▲▲ SELESAI ▲▲▲

        this.keys = {}; // Status tombol keyboard
        this._setupControls();
    }

    // ▼▼▼ BARU: Method untuk mengatur target TPV ▼▼▼
    /**
     * Mengatur objek yang akan diikuti oleh kamera.
     * Objek target HARUS memiliki properti:
     * - position: [x, y, z] (Array)
     * - yaw: 0 (Number, dalam radian)
     */
    setTarget(object) {
        this.targetObject = object;
        // Jika target di-set, otomatis pindah ke mode TPV
        this.isThirdPerson = true;
        // Posisikan yaw/pitch kamera agar sama dengan target saat pertama kali
        this.yaw = this.targetObject.yaw || 0;
        // this.pitch = ... (bisa diatur jika target punya pitch)
    }
    // ▲▲▲ SELESAI ▲▲▲

    // ▼▼▼ BARU: Method untuk ganti mode FPV/TPV ▼▼▼
    toggleViewMode() {
        if (!this.targetObject) {
            console.warn("Tidak bisa ganti ke TPV, targetObject belum di-set.");
            this.isThirdPerson = false; // Paksa kembali ke FPV
            return;
        }

        this.isThirdPerson = !this.isThirdPerson;

        if (!this.isThirdPerson) {
            // Saat beralih kembali ke FPV (orang pertama)
            // Posisikan kamera di tempat target (misal, di "mata" target)
            this.position[0] = this.targetObject.position[0];
            this.position[1] = this.targetObject.position[1] + 1.5; // Asumsi tinggi mata 1.5 unit
            this.position[2] = this.targetObject.position[2];
            // Yaw dan Pitch sudah sinkron, jadi tidak perlu diubah
        }
    }
    // ▲▲▲ SELESAI ▲▲▲

    _setupControls() {
        // --- Mouse Controls (Pointer Lock for Mouse Look) ---
        const mouseMove = (e) => {
            if (!this.drag) return;
            const deltaX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
            const deltaY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;

            // Gerakan mouse X -> ubah Yaw (kiri/kanan)
            this.yaw -= deltaX * this.sensitivityLook;

            // Gerakan mouse Y -> ubah Pitch (atas/bawah)
            this.pitch -= deltaY * this.sensitivityLook;

            // Batasi pitch
            const limit = LIBS.degToRad(89.9);
            this.pitch = Math.max(-limit, Math.min(limit, this.pitch));
        };

        // ... (kode mouseDown dan lockChange sama persis) ...
        const mouseDown = () => {
            this.canvas.requestPointerLock = this.canvas.requestPointerLock || this.canvas.mozRequestPointerLock;
            this.canvas.requestPointerLock();
        };
        const lockChange = () => {
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
            const key = e.key.toLowerCase();
            this.keys[key] = true;

            // ▼▼▼ BARU: Tombol 'v' untuk ganti mode view ▼▼▼
            if (key === 'v') {
                this.toggleViewMode();
            }
            // ▲▲▲ SELESAI ▲▲▲

            if (e.key === 'Escape') {
                document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
                if (document.exitPointerLock) document.exitPointerLock();
            }
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        window.addEventListener('resize', () => this.updateProjectionMatrix());
    }

    // Fungsi ini harus dipanggil setiap kali canvas resize
    updateProjectionMatrix() {
        // ... (kode sama persis) ...
        const aspect = this.gl.canvas.width / this.gl.canvas.height;
        this.projectionMatrix = this._createPerspective(Math.PI / 4, aspect, 0.1, 100);
    }

    // Fungsi ini dipanggil setiap frame oleh main-scene.js
    update(deltaTime) {
        const moveSpeed = this.speed * deltaTime;

        // --- Hitung Vektor Arah Berdasarkan Yaw dan Pitch ---
        // (kode sama persis)
        const cosPitch = Math.cos(this.pitch);
        const sinPitch = Math.sin(this.pitch);
        const cosYaw = Math.cos(this.yaw);
        const sinYaw = Math.sin(this.yaw);
        const forwardX = -sinYaw * cosPitch;
        const forwardY = sinPitch;
        const forwardZ = -cosYaw * cosPitch;
        const rightX = cosYaw;
        const rightY = 0;
        const rightZ = -sinYaw;

        // --- Hitung Vektor Gerakan Berdasarkan Input Keyboard ---
        // (Perhitungan moveX/Y/Z tetap sama)
        let moveX = 0;
        let moveY = 0;
        let moveZ = 0;
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
        if (this.keys['a']) {
            moveX -= rightX * moveSpeed;
            moveZ -= rightZ * moveSpeed;
        }
        if (this.keys['d']) {
            moveX += rightX * moveSpeed;
            moveZ += rightZ * moveSpeed;
        }
        if (this.keys[' ']) {
            moveY += moveSpeed;
        }
        if (this.keys['shift']) {
            moveY -= moveSpeed;
        }

        // ▼▼▼ LOGIKA UTAMA: Terapkan gerakan ke TARGET (TPV) atau KAMERA (FPV) ▼▼▼
        if (this.isThirdPerson && this.targetObject) {
            // --- MODE THIRD-PERSON (TPV) ---

            // 1. Update posisi TARGET berdasarkan input WASD
            this.targetObject.position[0] += moveX;
            this.targetObject.position[1] += moveY; // Gerakan Y (terbang/jongkok)
            this.targetObject.position[2] += moveZ;

            // 2. Update rotasi TARGET berdasarkan mouse (yaw)
            this.targetObject.yaw = this.yaw;
            // (Kamu bisa tambahkan this.targetObject.pitch = this.pitch jika model targetmu bisa miring naik/turun)

            // 3. Hitung posisi KAMERA baru (di belakang target)
            const dist = this.tpvOffset.distance;
            const height = this.tpvOffset.height;

            // Hitung posisi offset "belakang" berdasarkan yaw kamera/target
            // Kita pakai sin(yaw) dan cos(yaw) karena di FPV yaw 0 menghadap -Z
            // Di TPV kita ingin kebalikannya (offset +Z saat yaw 0)
            // Jadi kita gunakan yaw + Math.PI (180 derajat)
            // Atau cara gampangnya, kita balik saja vektor 'forward'
            const camOffsetX = -forwardX * dist / cosPitch; // (Bagi cosPitch untuk menormalkan)
            const camOffsetZ = -forwardZ * dist / cosPitch;

            // Atur posisi kamera
            this.position[0] = this.targetObject.position[0] - camOffsetX;
            this.position[1] = this.targetObject.position[1] + height - (forwardY * dist); // Sesuaikan tinggi berdasarkan pitch
            this.position[2] = this.targetObject.position[2] - camOffsetZ;

        } else {
            // --- MODE FIRST-PERSON (FPV) / FREE-ROAM ---

            // Terapkan total pergerakan ke posisi kamera (seperti kode aslimu)
            this.position[0] += moveX;
            this.position[1] += moveY;
            this.position[2] += moveZ;
        }
        // ▲▲▲ SELESAI ▲▲▲

        // (Saya hapus kode 'q' dan rotate1 karena sepertinya itu untuk percobaan
        // dan akan mengacaukan logika FPV/TPV. Jika kamu membutuhkannya,
        // kamu bisa menambahkannya kembali, tapi itu akan memutar kamera/target)

        // --- Hitung View Matrix (V = R^-1 * T^-1) ---
        // (Kode sisa ke bawah SAMA PERSIS)
        LIBS.set_I4(this.temp_R_inv);
        LIBS.rotateY(this.temp_R_inv, this.yaw);
        LIBS.rotateX(this.temp_R_inv, -this.pitch);

        LIBS.set_I4(this.temp_T_inv);
        LIBS.translateX(this.temp_T_inv, -this.position[0]);
        LIBS.translateY(this.temp_T_inv, -this.position[1]);
        LIBS.translateZ(this.temp_T_inv, -this.position[2]);

        LIBS.mul(this.viewMatrix, this.temp_R_inv, this.temp_T_inv);

        // Hitung View Matrix Tanpa Rotasi
        LIBS.set_I4(this.viewMatrixNoRotation);
        LIBS.mul(this.viewMatrixNoRotation, this.temp_T_inv, this.viewMatrixNoRotation);
    }

    getViewMatrix() {
        return this.viewMatrix;
    }
    getViewMatrixNoRotation() {
        return this.viewMatrixNoRotation;
    }
    getProjectionMatrix() {
        return this.projectionMatrix;
    }

    _createPerspective(fov, aspect, near, far) {
        // ... (kode sama persis) ...
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