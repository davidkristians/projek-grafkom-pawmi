// geometry/pawmoTorsoSegment.js (MODIFIKASI dari pawmo-torso.js)
import { getBezierPoint, getBezierTangent } from "./bezier.js";

// Ganti nama kelas menjadi pawmoTorsoSegment
export class pawmoTorsoSegment {
    constructor(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, opts = {}) {
        this.GL = GL; this.SHADER_PROGRAM = SHADER_PROGRAM;
        this._position = _position; this._color = _color; this._MMatrix = _Mmatrix;
        this._normal = _normal;
        this.POSITION_MATRIX = LIBS.get_I4();
        this.MOVE_MATRIX = LIBS.get_I4();
        this.childs = [];
        this._build(opts);
    }

    _build(opts) {
        const color = opts.color ?? [1, 1, 1];
        const segments = opts.segments ?? 24; // Kurangi resolusi sedikit untuk performa
        const rings = opts.rings ?? 16;     // Kurangi resolusi sedikit

        // ▼▼▼ BARU: Parameter untuk menentukan segmen mana yang dibuat ▼▼▼
        const tStart = opts.tStart ?? 0.0; // Mulai dari t berapa (0 = bawah)
        const tEnd = opts.tEnd ?? 1.0;     // Selesai di t berapa (1 = atas)
        // ▲▲▲ SELESAI ▲▲▲

        // Profil Bézier (bisa disesuaikan lagi jika perlu)
        const p0 = [0, -1.6];
        const p1 = [1.8, -1.0];
        const p2 = [1.3, 1.6];
        const p3 = [0.0, 1.8];

        const vertices = [], faces = [];

        // Loop HANYA dari tStart sampai tEnd
        for (let i = 0; i <= rings; i++) {
            // Hitung t dalam rentang [tStart, tEnd]
            const t = tStart + (tEnd - tStart) * (i / rings);

            const profilePoint = getBezierPoint(t, p0, p1, p2, p3);
            const radius = profilePoint.x;
            const y = profilePoint.y;

            // Kalkulasi normal (tetap sama)
            const tangent = getBezierTangent(t, p0, p1, p2, p3);
            let n_x = tangent.y;
            let n_y = -tangent.x;
            const len = Math.sqrt(n_x*n_x + n_y*n_y) || 1;
            const n_x_norm = n_x / len;
            const n_y_norm = n_y / len;

            for (let j = 0; j <= segments; j++) {
                const angle = (j / segments) * 2 * Math.PI;
                const cosA = Math.cos(angle);
                const sinA = Math.sin(angle);
                const x = radius * cosA;
                const z = radius * sinA;
                const nx = n_x_norm * cosA;
                const ny = n_y_norm;
                const nz = n_x_norm * sinA;
                vertices.push(x, y, z, ...color, nx, ny, nz);
            }
        }

        // Pembuatan faces (tetap sama)
        const rowLen = segments + 1;
        for (let i = 0; i < rings; i++) { // Perhatikan loop sampai < rings
            for (let j = 0; j < segments; j++) { // Perhatikan loop sampai < segments
                const i0 = i * rowLen + j;
                const i1 = i0 + 1;
                const i2 = (i + 1) * rowLen + j;
                const i3 = i2 + 1;
                faces.push(i0, i1, i2);
                faces.push(i1, i3, i2);
            }
        }

        this.vertex = vertices;
        this.faces = faces;

        // Simpan titik akhir untuk penyambungan
        this.endPoint = { x: 0, y: getBezierPoint(tEnd, p0, p1, p2, p3).y, z: 0 };
        this.endRadius = getBezierPoint(tEnd, p0, p1, p2, p3).x;
    }

    setup() {
        this.OBJECT_VERTEX = this.GL.createBuffer();
        this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
        this.GL.bufferData(this.GL.ARRAY_BUFFER, new Float32Array(this.vertex), this.GL.STATIC_DRAW);
        this.OBJECT_FACES = this.GL.createBuffer();
        this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        this.GL.bufferData(this.GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.faces), this.GL.STATIC_DRAW);
    }

    render(PARENT_MATRIX) {
        const M = LIBS.get_I4();
        LIBS.mul(M, PARENT_MATRIX, this.POSITION_MATRIX);
        LIBS.mul(M, M, this.MOVE_MATRIX);
        this.GL.useProgram(this.SHADER_PROGRAM);
        this.GL.uniformMatrix4fv(this._MMatrix, false, M);
        this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);

        // Stride 36 (9 floats * 4 bytes)
        this.GL.vertexAttribPointer(this._position, 3, this.GL.FLOAT, false, 36, 0);
        this.GL.vertexAttribPointer(this._color, 3, this.GL.FLOAT, false, 36, 12);
        this.GL.vertexAttribPointer(this._normal, 3, this.GL.FLOAT, false, 36, 24);
        this.GL.enableVertexAttribArray(this._normal);

        this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        this.GL.drawElements(this.GL.TRIANGLES, this.faces.length, this.GL.UNSIGNED_SHORT, 0);
    }
}