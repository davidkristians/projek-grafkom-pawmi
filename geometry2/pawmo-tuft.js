import { getBezierPoint, getBezierTangent } from "./bezier.js";

export class pawmoTuft {
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
        const segments = opts.segments ?? 24;
        const rings = opts.rings ?? 24;

        // Titik bezier dari p0 sampe p3
        const p0 = [0.3, -0.375];
        const p1 = [0.75, 0.15];
        const p2 = [0.075, 0.675];
        const p3 = [0.0, 0.825];

        const vertices = [], faces = [];

        for (let i = 0; i <= rings; i++) {
            const t = i / rings;
            const profilePoint = getBezierPoint(t, p0, p1, p2, p3);
            const radius = profilePoint.x;
            const y = profilePoint.y;
            const tangent = getBezierTangent(t, p0, p1, p2, p3);
            let n_x = tangent.y;
            let n_y = -tangent.x; // Normal tegak lurus tangent
            const len = Math.sqrt(n_x*n_x + n_y*n_y) || 1;
            const n_x_norm = n_x / len;
            const n_y_norm = n_y / len;

            for (let j = 0; j <= segments; j++) {
                const angle = (j / segments) * 2 * Math.PI;
                const cosA = Math.cos(angle);
                const sinA = Math.sin(angle);
                const x = radius * cosA;
                const z = radius * sinA;

                // Hitung normal 3d nya
                const nx = n_x_norm * cosA;
                const ny = n_y_norm;
                const nz = n_x_norm * sinA;

                vertices.push(x, y, z, ...color, nx, ny, nz);
            }
        }

        // Pembuatan faces (permukaan)
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
    }

    render(PARENT_MATRIX) {  }
}