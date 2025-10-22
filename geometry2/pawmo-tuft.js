// geometry/pawmo-tuft.js
// ▼▼▼ BARU: Import fungsi tangent ▼▼▼
import { getBezierPoint, getBezierTangent } from "./bezier.js";

// Ini adalah kelas baru, khusus untuk jambul di kepala
export class pawmoTuft {
    // ▼▼▼ TAMBAHKAN _normal ▼▼▼
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
        const segments = opts.segments ?? 24; 
        const rings = opts.rings ?? 24;     

        const p0 = [0.3, -0.375]; // Pangkal lebar
        const p1 = [0.75, 0.15];  // Gembung di tengah
        const p2 = [0.075, 0.675];  // Mengecil ke atas
        const p3 = [0.0, 0.825];


        const vertices = [], faces = [];

        for (let i = 0; i <= rings; i++) {
            const t = i / rings;
            
            const profilePoint = getBezierPoint(t, p0, p1, p2, p3);
            const radius = profilePoint.x;
            const y = profilePoint.y;

            // ▼▼▼ BARU: Hitung normal dari tangent ▼▼▼
            const tangent = getBezierTangent(t, p0, p1, p2, p3);
            let n_x = tangent.y;
            let n_y = -tangent.x;
            const len = Math.sqrt(n_x*n_x + n_y*n_y) || 1;
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
                
                vertices.push(x, y, z, ...color, nx, ny, nz);
            }
        }

        // (Kode 'faces' Anda tetap sama)
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
        this.childs.forEach(c => c.setup());
  }
    render(PARENT_MATRIX) {
        const M=LIBS.get_I4(); LIBS.mul(M, PARENT_MATRIX, this.POSITION_MATRIX); LIBS.mul(M, M, this.MOVE_MATRIX);
        this.GL.useProgram(this.SHADER_PROGRAM); this.GL.uniformMatrix4fv(this._MMatrix, false, M);
        this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);

        // ▼▼▼ BARU: Stride 36 (9 floats * 4 bytes) ▼▼▼
        this.GL.vertexAttribPointer(this._position, 3, this.GL.FLOAT, false, 36, 0);
        this.GL.vertexAttribPointer(this._color, 3, this.GL.FLOAT, false, 36, 12);
        // ▼▼▼ BARU: Pointer untuk normal ▼▼▼
        this.GL.vertexAttribPointer(this._normal, 3, this.GL.FLOAT, false, 36, 24);
        this.GL.enableVertexAttribArray(this._normal); // Aktifkan

        this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        this.GL.drawElements(this.GL.TRIANGLES, this.faces.length, this.GL.UNSIGNED_SHORT, 0);
        this.childs.forEach(c => c.render(M));
    }
}