export class cylinder {
    constructor(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, opts = {}) {
        this.GL = GL; this.SHADER_PROGRAM = SHADER_PROGRAM;
        this._position = _position; this._color = _color; this._MMatrix = _Mmatrix;
        this._normal = _normal;
        this.POSITION_MATRIX = LIBS.get_I4(); this.MOVE_MATRIX = LIBS.get_I4(); this.childs = [];

        const radius = opts.radius ?? 0.2;
        const height = opts.height ?? 0.5;
        const segments = opts.segments ?? 12;
        const color = opts.color ?? [1,1,1];
        const capTop = opts.capTop ?? true;
        const capBottom = opts.capBottom ?? true;

        this._build(radius, height, segments, color, capTop, capBottom);
    }

    _build(radius, height, segments, color, capTop, capBottom) {
        const v = [], idx = [];
        const halfHeight = height / 2;
        const y_top = halfHeight;
        const y_bottom = -halfHeight;
        const TWO_PI = Math.PI * 2;

        for (let s = 0; s <= segments; s++) {
            const angle = (s / segments) * TWO_PI;
            const cosA = Math.cos(angle);
            const sinA = Math.sin(angle);
            const x = radius * cosA;
            const z = radius * sinA;
            const nx = cosA, ny = 0, nz = sinA;
            v.push(x, y_top, z, ...color, nx, ny, nz);
            v.push(x, y_bottom, z, ...color, nx, ny, nz);
        }

        for (let s = 0; s < segments; s++) {
            const i0 = s * 2, i1 = i0 + 1, i2 = i0 + 2, i3 = i0 + 3;
            idx.push(i0, i1, i2, i1, i3, i2);
        }

        if (capTop) {
            const topCenterIdx = v.length / 9;
            v.push(0, y_top, 0, ...color, 0, 1, 0);
            for (let s = 0; s <= segments; s++) {
                const angle = (s / segments) * TWO_PI;
                v.push(radius * Math.cos(angle), y_top, radius * Math.sin(angle), ...color, 0, 1, 0);
            }
            for (let s = 0; s < segments; s++) {
                idx.push(topCenterIdx, topCenterIdx + s + 1, topCenterIdx + s + 2);
            }
        }

        if (capBottom) {
            const bottomCenterIdx = v.length / 9;
            v.push(0, y_bottom, 0, ...color, 0, -1, 0);
            for (let s = 0; s <= segments; s++) {
                const angle = (s / segments) * TWO_PI;
                v.push(radius * Math.cos(angle), y_bottom, radius * Math.sin(angle), ...color, 0, -1, 0);
            }
            for (let s = 0; s < segments; s++) {
                idx.push(bottomCenterIdx, bottomCenterIdx + s + 2, bottomCenterIdx + s + 1);
            }
        }

        this.vertex = v;
        this.faces = idx;
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
