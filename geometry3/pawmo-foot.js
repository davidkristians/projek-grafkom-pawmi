// geometry/pawmo-foot.js

// --- Helper Functions ---

// ▼▼▼ FUNGSI INI SEKARANG MENGHASILKAN POSISI + NORMAL (STRIDE 6) ▼▼▼
function generateHemiEllipsoid(rx, ry, rz, segments, rings) {
    const vertices = [], faces = [];

    // 1. Generate the rounded top part
    for (let i = 0; i <= rings; i++) {
        const u = (i / rings) * (Math.PI / 2); 
        const cu = Math.cos(u);
        const su = Math.sin(u);
        for (let j = 0; j <= segments; j++) {
            const v = (j / segments) * 2 * Math.PI;
            const cv = Math.cos(v);
            const sv = Math.sin(v);
            
            const x = rx * cv * cu;
            const y = ry * su; 
            const z = rz * sv * cu;
            
            // Hitung normal
            const nx_raw = x / (rx * rx);
            const ny_raw = y / (ry * ry);
            const nz_raw = z / (rz * rz);
            const len = Math.sqrt(nx_raw*nx_raw + ny_raw*ny_raw + nz_raw*nz_raw) || 1;
            
            // Push Posisi (3) dan Normal (3). Total stride 6.
            vertices.push(x, y, z, nx_raw/len, ny_raw/len, nz_raw/len);
        }
    }
    const rowLen = segments + 1;
    for (let i = 0; i < rings; i++) {
        for (let j = 0; j < segments; j++) {
            const i0 = i * rowLen + j, i1 = i0 + 1, i2 = (i + 1) * rowLen + j, i3 = i2 + 1;
            faces.push(i0, i1, i2, i1, i3, i2);
        }
    }

    // 2. Generate the flat bottom cap (dengan vertex terpisah untuk normal yg benar)
    const baseStartIndex = vertices.length / 6; // Stride 6
    // Tambah titik tengah alas
    vertices.push(0, 0, 0, 0, -1, 0); // Normal menghadap ke bawah
    
    // Tambah vertex di sekeliling alas
    for (let j = 0; j <= segments; j++) {
        const v = (j / segments) * 2 * Math.PI;
        const cv = Math.cos(v);
        const sv = Math.sin(v);
        const x = rx * cv;
        const z = rz * sv;
        vertices.push(x, 0, z, 0, -1, 0); // Normal menghadap ke bawah
    }

    // Buat alas
    for (let j = 0; j < segments; j++) {
        faces.push(baseStartIndex, baseStartIndex + j + 1, baseStartIndex + j + 2);
    }
    
    return { vertices, faces };
}
// (Fungsi overrideColor tidak dipakai lagi karena kita menyusun ulang vertex)

// --- Main Class ---
export class pawmoFoot {
    // ▼▼▼ TAMBAHKAN _normal ▼▼▼
    constructor(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, opts = {}) {
        this.GL=GL; this.SHADER_PROGRAM=SHADER_PROGRAM; this._position=_position; this._color=_color; this._MMatrix=_Mmatrix;
        this._normal = _normal; // BARU
        this.POSITION_MATRIX=LIBS.get_I4(); this.MOVE_MATRIX=LIBS.get_I4(); this.childs=[];
        this._build(opts);
    }

    _build(opts) {
        const rx = opts.rx ?? 0.5, ry = opts.ry ?? 0.4, rz = opts.rz ?? 0.7;
        const color = opts.color ?? [1,1,1];

        const geo = generateHemiEllipsoid(rx, ry, rz, 24, 16);
        
        // ▼▼▼ BARU: Susun ulang vertex array untuk memasukkan warna ▼▼▼
        const finalVertices = [];
        for (let i = 0; i < geo.vertices.length; i += 6) {
            const pos = geo.vertices.slice(i, i + 3);
            const norm = geo.vertices.slice(i + 3, i + 6);
            finalVertices.push(...pos, ...color, ...norm);
        }

        this.vertex = finalVertices; // Stride 9
        this.faces = geo.faces;
    }

    setup() {
        this.OBJECT_VERTEX=this.GL.createBuffer(); this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
        this.GL.bufferData(this.GL.ARRAY_BUFFER, new Float32Array(this.vertex), this.GL.STATIC_DRAW);
        this.OBJECT_FACES=this.GL.createBuffer(); this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        this.GL.bufferData(this.GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.faces), this.GL.STATIC_DRAW);
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
    }
}