export class ellipticParaboloid {
    constructor(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, opts = {}) {
        this.GL = GL; this.SHADER_PROGRAM = SHADER_PROGRAM;
        this._position = _position; this._color = _color; this._MMatrix = _Mmatrix;
        this._normal = _normal;

        this.POSITION_MATRIX = LIBS.get_I4();
        this.MOVE_MATRIX = LIBS.get_I4();
        this.childs = [];

        // Parameter Paraboloid: y/c = x^2/a^2 + z^2/b^2
        const a = opts.a ?? 0.5; // Skala sumbu X
        const b = opts.b ?? 0.3; // Skala sumbu Z
        const c = opts.c ?? 1.0; // Skala sumbu Y (kelengkungan)
        const height = opts.height ?? 1.0; // Tinggi maksimum paraboloid
        const segments = Math.max(3, opts.segments ?? 24);
        const rings = Math.max(2, opts.rings ?? 16);
        const color = opts.color ?? [0, 1, 0]; // Default hijau
        const cap = opts.cap ?? true; // Tambahkan tutup atas atau tidak

        this._build(a, b, c, height, segments, rings, color, cap);
    }

    _build(a, b, c, height, segments, rings, color, addCap) {
        const vertices = [], faces = [];
        const TWO_PI = Math.PI * 2;

        // Buat permukaan melengkung
        for (let i = 0; i <= rings; i++) {
            const y = (i / rings) * height;
            // Radius elips pada ketinggian y: rx = a*sqrt(y/c), rz = b*sqrt(y/c)
            const y_over_c = y / c;
            // Hindari akar negatif atau nol jika y=0 (tapi y_over_c akan 0)
            const sqrt_y_over_c = (y_over_c > 0) ? Math.sqrt(y_over_c) : 0;
            const rx = a * sqrt_y_over_c;
            const rz = b * sqrt_y_over_c;

            for (let j = 0; j <= segments; j++) {
                const theta = (j / segments) * TWO_PI;
                const cosTheta = Math.cos(theta);
                const sinTheta = Math.sin(theta);

                const x = rx * cosTheta;
                const z = rz * sinTheta;
                // y sudah dihitung di loop luar

                // Hitung Normal ((-2x/a^2, 1/c, -2z/b^2))
                let nx_raw = -2 * x / (a * a);
                let ny_raw = 1 / c;
                let nz_raw = -2 * z / (b * b);

                // Normal di titik puncak (0,0,0) adalah (0, 1/c, 0) -> (0, 1, 0) setelah normalisasi
                if (i === 0) {
                    nx_raw = 0;
                    nz_raw = 0;
                }

                const len = Math.sqrt(nx_raw * nx_raw + ny_raw * ny_raw + nz_raw * nz_raw) || 1;

                // Stride 9: pos(3), color(3), normal(3)
                vertices.push(x, y, z, ...color, nx_raw / len, ny_raw / len, nz_raw / len);
            }
        }

        // Buat faces untuk permukaan melengkung
        const rowLen = segments + 1;
        for (let i = 0; i < rings; i++) {
            for (let j = 0; j < segments; j++) {
                const i0 = i * rowLen + j;
                const i1 = i0 + 1;
                const i2 = (i + 1) * rowLen + j;
                const i3 = i2 + 1;
                faces.push(i0, i1, i2);
                faces.push(i1, i3, i2);
            }
        }

        // Buat tutup atas (opsional)
        if (addCap && height > 0) {
            const capY = height;
            const cap_rx = a * Math.sqrt(capY / c);
            const cap_rz = b * Math.sqrt(capY / c);
            const capCenterIndex = vertices.length / 9; // Stride 9

            // Tambahkan titik tengah tutup (Normal 0,1,0)
            vertices.push(0, capY, 0, ...color, 0, 1, 0);

            // Tambahkan vertex di sekeliling tepi tutup (Normal 0,1,0)
            for (let j = 0; j <= segments; j++) {
                const theta = (j / segments) * TWO_PI;
                const x = cap_rx * Math.cos(theta);
                const z = cap_rz * Math.sin(theta);
                vertices.push(x, capY, z, ...color, 0, 1, 0);
            }

            // Buat faces untuk tutup
            for (let j = 0; j < segments; j++) {
                faces.push(capCenterIndex, capCenterIndex + j + 1, capCenterIndex + j + 2);
            }
        }

        this.vertex = vertices;
        this.faces = faces;
    }

    setup() {
        this.OBJECT_VERTEX = this.GL.createBuffer();
        this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
        this.GL.bufferData(this.GL.ARRAY_BUFFER, new Float32Array(this.vertex), this.GL.STATIC_DRAW);
        this.OBJECT_FACES = this.GL.createBuffer();
        this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        this.GL.bufferData(this.GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.faces), this.GL.STATIC_DRAW);
        this.childs.forEach(c => c.setup());
    }

    render(PARENT_MATRIX) {
        // Render function sama seperti ellipsoid.js
        const M = LIBS.get_I4();
        LIBS.mul(M, PARENT_MATRIX, this.POSITION_MATRIX);
        LIBS.mul(M, M, this.MOVE_MATRIX);
        this.GL.useProgram(this.SHADER_PROGRAM);
        this.GL.uniformMatrix4fv(this._MMatrix, false, M);
        // this.GL.uniformMatrix4fv(this._NMatrix, false, M); // kalau ada _NMatrix

        this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);

        // Stride 36 (9 floats * 4 bytes)
        this.GL.vertexAttribPointer(this._position, 3, this.GL.FLOAT, false, 36, 0);
        this.GL.enableVertexAttribArray(this._position); // Posisi
        this.GL.vertexAttribPointer(this._color, 3, this.GL.FLOAT, false, 36, 12);
        this.GL.enableVertexAttribArray(this._color);    // Warna
        this.GL.vertexAttribPointer(this._normal, 3, this.GL.FLOAT, false, 36, 24);
        this.GL.enableVertexAttribArray(this._normal);   // Normal

        this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        this.GL.drawElements(this.GL.TRIANGLES, this.faces.length, this.GL.UNSIGNED_SHORT, 0);

        // Nonaktifkan atribut setelah selesai
        this.GL.disableVertexAttribArray(this._position);
        this.GL.disableVertexAttribArray(this._color);
        this.GL.disableVertexAttribArray(this._normal);

        this.childs.forEach(c => c.render(M));
    }
}