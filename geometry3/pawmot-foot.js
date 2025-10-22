// geometry3/pawmot-foot.js

function generateHemiEllipsoid(rx, ry, rz, segments, rings, color) {
    const vertices = [], faces = [];
    for (let i = 0; i <= rings; i++) {
        const u = (i / rings) * (Math.PI / 2);
        const cu = Math.cos(u), su = Math.sin(u);
        for (let j = 0; j <= segments; j++) {
            const v = (j / segments) * 2 * Math.PI;
            const cv = Math.cos(v), sv = Math.sin(v);
            const x = rx * cv * cu, y = ry * su, z = rz * sv * cu;
            const nx = x / (rx * rx), ny = y / (ry * ry), nz = z / (rz * rz);
            const len = Math.sqrt(nx*nx + ny*ny + nz*nz) || 1;
            vertices.push(x, y, z, ...color, nx/len, ny/len, nz/len);
        }
    }
    const rowLen = segments + 1;
    for (let i = 0; i < rings; i++) {
        for (let j = 0; j < segments; j++) {
            const i0 = i*rowLen+j, i1=i0+1, i2=(i+1)*rowLen+j, i3=i2+1;
            faces.push(i0,i1,i2, i1,i3,i2);
        }
    }
    const baseCenterIdx = vertices.length / 9;
    vertices.push(0,0,0, ...color, 0,-1,0);
    for (let j=0; j<=segments; j++) {
        const v = (j/segments)*2*Math.PI;
        vertices.push(rx*Math.cos(v),0,rz*Math.sin(v),...color, 0,-1,0);
    }
    for (let j=0; j<segments; j++) {
        faces.push(baseCenterIdx, baseCenterIdx + j + 2, baseCenterIdx + j + 1);
    }
    return { vertices, faces };
}

export class pawmotFoot { // Nama kelas tetap pawmoFoot agar konsisten
    constructor(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, opts = {}) {
        this.GL=GL; this.SHADER_PROGRAM=SHADER_PROGRAM;
        this._position=_position; this._color=_color; this._normal=_normal;
        this._MMatrix=_Mmatrix;
        this.POSITION_MATRIX=LIBS.get_I4(); this.MOVE_MATRIX=LIBS.get_I4();
        this.childs = []; // Tambahkan childs agar patch tidak error
        this._build(opts);
    }
    _build(opts) {
        const rx = opts.rx ?? 0.5, ry = opts.ry ?? 0.4, rz = opts.rz ?? 0.7;
        const color = opts.color ?? [1,1,1];
        const geo = generateHemiEllipsoid(rx, ry, rz, 24, 16, color);
        this.vertex = geo.vertices;
        this.faces = geo.faces;
    }
    setup() {
        this.OBJECT_VERTEX=this.GL.createBuffer(); this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
        this.GL.bufferData(this.GL.ARRAY_BUFFER, new Float32Array(this.vertex), this.GL.STATIC_DRAW);
        this.OBJECT_FACES=this.GL.createBuffer(); this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        this.GL.bufferData(this.GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.faces), this.GL.STATIC_DRAW);
    }
    // ▼▼▼ DIUBAH: Fungsi render diganti placeholder ▼▼▼
    render(PARENT_MATRIX) { /* ... This will be patched ... */ }
}