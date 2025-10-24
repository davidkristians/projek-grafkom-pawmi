// actors/WaterfallStream.js
export class WaterfallStream {
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
        this.childs = [];

        const height = 3; // Tinggi aliran air
        const topRadius = 0.5; // Radius di bagian atas (asal air)
        const bottomRadius = 0.8; // Radius di bagian bawah (saat menyebar)
        const segmentsH = 20; // Jumlah segmen vertikal untuk kelancaran lengkungan
        const segmentsR = 12; // Jumlah segmen radial
        const color = [0.3, 0.6, 1.0]; // Biru lebih terang

        let vertices = [];
        let colors = [];
        let normals = [];
        let faces = [];

        // Buat silinder yang meruncing (truncated cone) untuk aliran air
        for (let i = 0; i <= segmentsH; i++) {
            const y = (i / segmentsH) * -height; // Posisi Y dari atas (0) ke bawah (-height)
            const currentRadius = topRadius + (bottomRadius - topRadius) * (i / segmentsH); // Radius yang berubah

            for (let j = 0; j <= segmentsR; j++) {
                const angle = (j / segmentsR) * Math.PI * 2;
                const x = Math.cos(angle) * currentRadius;
                const z = Math.sin(angle) * currentRadius;

                vertices.push(x, y, z);
                colors.push(...color);

                let normalX = x / currentRadius;
                let normalZ = z / currentRadius;
                normals.push(normalX, 0, normalZ); // Normal horisontal
            }
        }

        for (let i = 0; i < segmentsH; i++) {
            for (let j = 0; j < segmentsR; j++) {
                const first = i * (segmentsR + 1) + j;
                const second = first + segmentsR + 1;

                faces.push(first, second, first + 1);
                faces.push(second, second + 1, first + 1);
            }
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

        this.GL.uniformMatrix4fv(this._MMatrix, false, M);
        this.GL.uniform1f(this._uTime, Date.now() / 1000.0);

        this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
        this.GL.vertexAttribPointer(this._position, 3, this.GL.FLOAT, false, 0, 0);
        this.GL.enableVertexAttribArray(this._position);

        this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_COLORS);
        this.GL.vertexAttribPointer(this._color, 3, this.GL.FLOAT, false, 0, 0);
        this.GL.enableVertexAttribArray(this._color);

        this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_NORMALS);
        this.GL.vertexAttribPointer(this._normal, 3, this.GL.FLOAT, false, 0, 0);
        this.GL.enableVertexAttribArray(this._normal);

        this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        this.GL.drawElements(this.GL.TRIANGLES, this.faces.length, this.GL.UNSIGNED_SHORT, 0);

        // Disable setelah render
        this.GL.disableVertexAttribArray(this._position);
        this.GL.disableVertexAttribArray(this._color);
        this.GL.disableVertexAttribArray(this._normal);
    }
}