// geometry2/pawmo-torso.js (Versi Upgrade dengan Normal)
import { getBezierPoint, getBezierTangent } from "./bezier.js"; // Pastikan tangent di-impor

export class pawmoTorso {
    // ▼▼▼ DIUBAH: Tambahkan _normal ▼▼▼
    constructor(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, opts = {}) {
        this.GL = GL; this.SHADER_PROGRAM = SHADER_PROGRAM;
        this._position = _position; this._color = _color; this._MMatrix = _Mmatrix;
        this._normal = _normal; // BARU
        this.POSITION_MATRIX = LIBS.get_I4();
        this.MOVE_MATRIX = LIBS.get_I4();
        this.childs = [];
        this._build(opts);
    }

    _build(opts) {
        const color = opts.color ?? [1, 1, 1];
        const segments = opts.segments ?? 48;
        const rings = opts.rings ?? 48;

        // Titik Bézier Anda (tetap sama)
        const p0 = [0.0, -1.6];
        const p1 = [2.2, -1.6];
        const p2 = [1.6, 1.8];
        const p3 = [0.0, 1.7];

        const vertices = [], faces = [];

        for (let i = 0; i <= rings; i++) {
            const t = i / rings;
            const profilePoint = getBezierPoint(t, p0, p1, p2, p3);
            const radius = profilePoint.x;
            const y = profilePoint.y;

            // ▼▼▼ BARU: Hitung normal dari tangent ▼▼▼
            const tangent = getBezierTangent(t, p0, p1, p2, p3);
            let n_x = tangent.y;
            let n_y = -tangent.x; // Normal tegak lurus tangent
            const len = Math.sqrt(n_x*n_x + n_y*n_y) || 1; // Hindari pembagian nol
            const n_x_norm = n_x / len;
            const n_y_norm = n_y / len;
            // ▲▲▲ SELESAI ▲▲▲

            for (let j = 0; j <= segments; j++) {
                const angle = (j / segments) * 2 * Math.PI;
                const cosA = Math.cos(angle);
                const sinA = Math.sin(angle);
                const x = radius * cosA;
                const z = radius * sinA;

                // ▼▼▼ BARU: Normal 3D ▼▼▼
                const nx = n_x_norm * cosA;
                const ny = n_y_norm;
                const nz = n_x_norm * sinA;

                // ▼▼▼ DIUBAH: Tambahkan normal ke vertex (stride 9) ▼▼▼
                vertices.push(x, y, z, ...color, nx, ny, nz);
            }
        }

        // Pembuatan faces (tetap sama)
        const rowLen = segments + 1;
        for (let i = 0; i < rings; i++) {
            for (let j = 0; j < segments; j++) {
                const i0 = i * rowLen + j, i1 = i0 + 1, i2 = (i + 1) * rowLen + j, i3 = i2 + 1;
                faces.push(i0, i1, i2, i1, i3, i2);
            }
        }

        this.vertex = vertices;
        this.faces = faces;
    }

    setup() {
        this.OBJECT_VERTEX=this.GL.createBuffer(); this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
        this.GL.bufferData(this.GL.ARRAY_BUFFER, new Float32Array(this.vertex), this.GL.STATIC_DRAW);
        this.OBJECT_FACES=this.GL.createBuffer(); this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        this.GL.bufferData(this.GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.faces), this.GL.STATIC_DRAW);
        // this.childs.forEach(c => c.setup()); // Torso ini tidak punya anak
    }
    // Render() akan di-patch oleh pawmo.js
    render(PARENT_MATRIX) { /* ... This will be patched ... */ }
}