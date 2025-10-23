export class ellipsoid {
    constructor(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, opts = {}) {
        this.GL = GL; this.SHADER_PROGRAM = SHADER_PROGRAM;
        this._position = _position; this._color = _color; this._MMatrix = _Mmatrix;
        this._normal = _normal; // BARU

        this.POSITION_MATRIX = LIBS.get_I4();
        this.MOVE_MATRIX = LIBS.get_I4();
        this.childs = [];

        const rx = opts.rx ?? 1.0, ry = opts.ry ?? 1.0, rz = opts.rz ?? 1.0;
        const segments = Math.max(3, opts.segments ?? 36);
        const rings = Math.max(2, opts.rings ?? 24);
        const color = opts.color ?? [1,1,1];

        this._build(rx, ry, rz, segments, rings, color);
    }
        
    _build(rx, ry, rz, segments, rings, color) {
        const vertices = [], faces = [];
        for (let i = 0; i <= rings; i++) {
            const u = -Math.PI/2 + (i/rings)*Math.PI, cu = Math.cos(u), su = Math.sin(u);
                for (let j = 0; j <= segments; j++) {
                    const v = (j/segments)*2*Math.PI, cv = Math.cos(v), sv = Math.sin(v);
                    const x = rx*cv*cu, y = ry*su, z = rz*sv*cu;
                
                    const nx_raw = x / (rx * rx);
                    const ny_raw = y / (ry * ry);
                    const nz_raw = z / (rz * rz);
                    const len = Math.sqrt(nx_raw*nx_raw + ny_raw*ny_raw + nz_raw*nz_raw) || 1; // || 1 untuk hindari / 0
                
                    // Stride sekarang 9 (3 pos, 3 col, 3 norm)
                    vertices.push(x,y,z, ...color, nx_raw/len, ny_raw/len, nz_raw/len);
                }
        }
        const rowLen = segments + 1;
        for (let i = 0; i < rings; i++) {
            for (let j = 0; j < segments; j++) {
                const i0=i*rowLen+j, i1=i0+1, i2=(i+1)*rowLen+j, i3=i2+1;
                faces.push(i0,i1,i2, i1,i3,i2);
            }
        }
        this.vertex = vertices; this.faces = faces;
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
        this.GL.vertexAttribPointer(this._color, 3, this.GL.FLOAT, false, 36, 12);

        this.GL.vertexAttribPointer(this._normal, 3, this.GL.FLOAT, false, 36, 24);
        this.GL.enableVertexAttribArray(this._normal); // Aktifkan

        this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        this.GL.drawElements(this.GL.TRIANGLES, this.faces.length, this.GL.UNSIGNED_SHORT, 0);
        this.childs.forEach(c => c.render(M));
    }
}