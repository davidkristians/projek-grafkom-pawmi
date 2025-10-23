export class hemisphere {
    constructor(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, opts = {}) {
        this.GL = GL; this.SHADER_PROGRAM = SHADER_PROGRAM;
        this._position = _position; this._color = _color; this._MMatrix = _Mmatrix;
        this._normal = _normal;

        this.POSITION_MATRIX = LIBS.get_I4();
        this.MOVE_MATRIX = LIBS.get_I4();
        this.childs = [];

        const radius = opts.radius ?? 1.0;
        const segments = Math.max(3, opts.segments ?? 36);
        const rings = Math.max(2, opts.rings ?? 18);
        const color = opts.color ?? [1,1,1];
        const topHalf = opts.topHalf ?? true;

        this._build(radius, segments, rings, color, topHalf);
    }

    _build(radius, segments, rings, color, topHalf) {
        const vertices = [], faces = [];
        const PI_HALF = Math.PI / 2;

        for (let i = 0; i <= rings; i++) {
            const u = topHalf ? (i / rings) * PI_HALF : -PI_HALF + (i / rings) * PI_HALF;
            const cu = Math.cos(u);
            const su = Math.sin(u);

            for (let j = 0; j <= segments; j++) {
                const v = (j / segments) * 2 * Math.PI;
                const cv = Math.cos(v);
                const sv = Math.sin(v);

                const x = radius * cv * cu;
                const y = radius * su;
                const z = radius * sv * cu;

                const nx = cv * cu;
                const ny = su;
                const nz = sv * cu;
                const len = Math.sqrt(nx*nx + ny*ny + nz*nz) || 1;

                vertices.push(x, y, z, ...color, nx / len, ny / len, nz / len);
            }
        }

        const rowLen = segments + 1;
        for (let i = 0; i < rings; i++) {
            for (let j = 0; j < segments; j++) {
                const i0 = i * rowLen + j;
                const i1 = i0 + 1;
                const i2 = (i + 1) * rowLen + j;
                const i3 = i2 + 1;
                if (topHalf) {
                    faces.push(i0, i1, i2, i1, i3, i2);
                } else {
                    faces.push(i0, i2, i1, i1, i2, i3);
                }
            }
        }

        const capY = 0;
        const capNormalY = topHalf ? -1 : 1;
        const capCenterIndex = vertices.length / 9;

        vertices.push(0, capY, 0, ...color, 0, capNormalY, 0);

        for (let j = 0; j <= segments; j++) {
            const v = (j / segments) * 2 * Math.PI;
            const x = radius * Math.cos(v);
            const z = radius * Math.sin(v);
            vertices.push(x, capY, z, ...color, 0, capNormalY, 0);
        }

        for (let j = 0; j < segments; j++) {
            if (topHalf) {
                faces.push(capCenterIndex, capCenterIndex + j + 2, capCenterIndex + j + 1);
            } else {
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
        const M = LIBS.get_I4();
        LIBS.mul(M, PARENT_MATRIX, this.POSITION_MATRIX);
        LIBS.mul(M, M, this.MOVE_MATRIX);
        this.GL.useProgram(this.SHADER_PROGRAM);
        this.GL.uniformMatrix4fv(this._MMatrix, false, M);
        
        this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
        this.GL.vertexAttribPointer(this._position, 3, this.GL.FLOAT, false, 36, 0);
        this.GL.enableVertexAttribArray(this._position);
        this.GL.vertexAttribPointer(this._color, 3, this.GL.FLOAT, false, 36, 12);
        this.GL.enableVertexAttribArray(this._color);
        this.GL.vertexAttribPointer(this._normal, 3, this.GL.FLOAT, false, 36, 24);
        this.GL.enableVertexAttribArray(this._normal);

        this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        this.GL.drawElements(this.GL.TRIANGLES, this.faces.length, this.GL.UNSIGNED_SHORT, 0);

        this.GL.disableVertexAttribArray(this._position);
        this.GL.disableVertexAttribArray(this._color);
        this.GL.disableVertexAttribArray(this._normal);

        this.childs.forEach(c => c.render(M));
    }
}
