// geometry/skybox.js

export class skybox {
    constructor(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, opts = {}) {
        this.GL = GL; this.SHADER_PROGRAM = SHADER_PROGRAM;
        this._position = _position; this._color = _color; this._MMatrix = _Mmatrix;
        this._normal = _normal;
        this.POSITION_MATRIX = LIBS.get_I4();
        this.MOVE_MATRIX = LIBS.get_I4(); // Penting, biarkan I4 (identitas)
        this.childs = [];
        this._build(opts);
    }

    _build(opts) {
        const s = opts.size ?? 50;  // Ukuran skybox (sangat besar)
        const color = opts.color ?? [0.1, 0.1, 0.15];
        const vertices = [], faces = [];

        // Normal menghadap ke DALAM (Inward)
        // Stride: 3 pos, 3 col, 3 norm = 9 floats

        // 1. Dinding Belakang (-Z) | Normal (0, 0, 1)
        vertices.push(-s, -s, -s, ...color, 0, 0, 1); vertices.push( s, -s, -s, ...color, 0, 0, 1);
        vertices.push( s,  s, -s, ...color, 0, 0, 1); vertices.push(-s,  s, -s, ...color, 0, 0, 1);
        faces.push(0, 2, 1, 0, 3, 2); // (CCW from inside)

        // 2. Dinding Depan (+Z) | Normal (0, 0, -1)
        vertices.push(-s, -s,  s, ...color, 0, 0, -1); vertices.push( s, -s,  s, ...color, 0, 0, -1);
        vertices.push( s,  s,  s, ...color, 0, 0, -1); vertices.push(-s,  s,  s, ...color, 0, 0, -1);
        faces.push(4, 5, 6, 4, 6, 7);

        // 3. Dinding Kiri (-X) | Normal (1, 0, 0)
        vertices.push(-s, -s,  s, ...color, 1, 0, 0); vertices.push(-s, -s, -s, ...color, 1, 0, 0);
        vertices.push(-s,  s, -s, ...color, 1, 0, 0); vertices.push(-s,  s,  s, ...color, 1, 0, 0);
        faces.push(8, 9, 10, 8, 10, 11);

        // 4. Dinding Kanan (+X) | Normal (-1, 0, 0)
        vertices.push( s, -s,  s, ...color, -1, 0, 0); vertices.push( s, -s, -s, ...color, -1, 0, 0);
        vertices.push( s,  s, -s, ...color, -1, 0, 0); vertices.push( s,  s,  s, ...color, -1, 0, 0);
        faces.push(12, 14, 13, 12, 15, 14);

        // 5. Lantai (-Y) | Normal (0, 1, 0)
        vertices.push(-s, -s,  s, ...color, 0, 1, 0); vertices.push( s, -s,  s, ...color, 0, 1, 0);
        vertices.push( s, -s, -s, ...color, 0, 1, 0); vertices.push(-s, -s, -s, ...color, 0, 1, 0);
        faces.push(16, 17, 18, 16, 18, 19);

        // 6. Langit-langit (+Y) | Normal (0, -1, 0)
        vertices.push(-s,  s,  s, ...color, 0, -1, 0); vertices.push( s,  s,  s, ...color, 0, -1, 0);
        vertices.push( s,  s, -s, ...color, 0, -1, 0); vertices.push(-s,  s, -s, ...color, 0, -1, 0);
        faces.push(20, 22, 21, 20, 23, 22);

        this.vertex = vertices;
        this.faces = faces;
    }

    setup() {
        // Kode setup() ini standar
        this.OBJECT_VERTEX = this.GL.createBuffer();
        this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
        this.GL.bufferData(this.GL.ARRAY_BUFFER, new Float32Array(this.vertex), this.GL.STATIC_DRAW);
        this.OBJECT_FACES = this.GL.createBuffer();
        this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        this.GL.bufferData(this.GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.faces), this.GL.STATIC_DRAW);
    }

    render(PARENT_MATRIX) {
        // Kode render() ini standar, menggunakan stride 36
        const M = LIBS.get_I4();
        LIBS.mul(M, PARENT_MATRIX, this.POSITION_MATRIX);
        LIBS.mul(M, M, this.MOVE_MATRIX); // MOVE_MATRIX akan selalu identitas
        this.GL.useProgram(this.SHADER_PROGRAM);
        this.GL.uniformMatrix4fv(this._MMatrix, false, M);
        this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);

        // Stride 36 (Posisi 3, Warna 3, Normal 3 = 9 floats * 4 bytes)
        this.GL.vertexAttribPointer(this._position, 3, this.GL.FLOAT, false, 36, 0);
        this.GL.vertexAttribPointer(this._color, 3, this.GL.FLOAT, false, 36, 12);
        this.GL.vertexAttribPointer(this._normal, 3, this.GL.FLOAT, false, 36, 24);
        this.GL.enableVertexAttribArray(this._normal);

        this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        this.GL.drawElements(this.GL.TRIANGLES, this.faces.length, this.GL.UNSIGNED_SHORT, 0);
    }
}