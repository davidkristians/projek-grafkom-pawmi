// actors/WaterfallSource.js
export class WaterfallSource {
    constructor(gl, shaderProgram, posLoc, colLoc, normLoc, mvLoc, timeLoc) {
        this.GL = gl;
        this.SHADER_PROGRAM = shaderProgram;
        this._position = posLoc;
        this._color = colLoc;
        this._normal = normLoc;
        this._MMatrix = mvLoc;
        this._uTime = timeLoc;

        this.POSITION_MATRIX = LIBS.get_I4();
        this.MOVE_MATRIX = LIBS.get_I4();
        this.childs = []; // Tidak punya anak

        const radius = 0.6;
        const segments = 16;
        // ▼▼▼ WARNA DIUBAH DI SINI ▼▼▼
        const color = [0.2, 0.5, 0.9]; // Biru agak pekat
        // ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲ ▲▲▲

        let vertices = [0, 0, 0];
        let colors = [...color];
        let normals = [0, 1, 0];
        let faces = [];

        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            vertices.push(x, 0, z);
            colors.push(...color);
            normals.push(0, 1, 0);
        }

        for (let i = 1; i <= segments; i++) {
            faces.push(0, i, i + 1);
        }

        this.vertices = new Float32Array(vertices);
        this.colors = new Float32Array(colors);
        this.normals = new Float32Array(normals);
        this.faces = new Uint16Array(faces);

        this.setup();
    }

    setup() {
        this.OBJECT_VERTEX = this.GL.createBuffer();
        this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
        this.GL.bufferData(this.GL.ARRAY_BUFFER, this.vertices, this.GL.STATIC_DRAW);

        this.OBJECT_COLORS = this.GL.createBuffer();
        this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_COLORS);
        this.GL.bufferData(this.GL.ARRAY_BUFFER, this.colors, this.GL.STATIC_DRAW);

        this.OBJECT_NORMALS = this.GL.createBuffer();
        this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_NORMALS);
        this.GL.bufferData(this.GL.ARRAY_BUFFER, this.normals, this.GL.STATIC_DRAW);

        this.OBJECT_FACES = this.GL.createBuffer();
        this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        this.GL.bufferData(this.GL.ELEMENT_ARRAY_BUFFER, this.faces, this.GL.STATIC_DRAW);
    }

    render(PARENT_MATRIX) {
        const M = LIBS.get_I4();
        LIBS.mul(M, PARENT_MATRIX, this.POSITION_MATRIX);
        LIBS.mul(M, M, this.MOVE_MATRIX);

        // Set matriks dan waktu
        this.GL.uniformMatrix4fv(this._MMatrix, false, M);
        this.GL.uniform1f(this._uTime, Date.now() / 1000.0); // Waktu dalam detik

        // Atur atribut
        this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
        this.GL.vertexAttribPointer(this._position, 3, this.GL.FLOAT, false, 0, 0);
        this.GL.enableVertexAttribArray(this._position);

        this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_COLORS);
        this.GL.vertexAttribPointer(this._color, 3, this.GL.FLOAT, false, 0, 0);
        this.GL.enableVertexAttribArray(this._color);

        this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_NORMALS);
        this.GL.vertexAttribPointer(this._normal, 3, this.GL.FLOAT, false, 0, 0);
        this.GL.enableVertexAttribArray(this._normal);

        // Gambar
        this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        this.GL.drawElements(this.GL.TRIANGLES, this.faces.length, this.GL.UNSIGNED_SHORT, 0);

        // Disable setelah render (penting jika IslandNode tidak handle)
        this.GL.disableVertexAttribArray(this._position);
        this.GL.disableVertexAttribArray(this._color);
        this.GL.disableVertexAttribArray(this._normal);
    }
}