// geometry/paraboloid.js

export class paraboloid {
    constructor(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, opts = {}) {
        this.GL = GL; this.SHADER_PROGRAM = SHADER_PROGRAM;
        this._position = _position; this._color = _color; this._MMatrix = _Mmatrix;
        
        this.POSITION_MATRIX = LIBS.get_I4();
        this.MOVE_MATRIX = LIBS.get_I4();
        this.childs = [];

        // rx: radius di sumbu X, rz: radius di sumbu Z
        // height: ketinggian paraboloid di sumbu Y
        const rx = opts.rx ?? 1.0;
        const rz = opts.rz ?? 1.0;
        const height = opts.height ?? 1.0; 
        const segments = Math.max(3, opts.segments ?? 36);
        const rings = Math.max(2, opts.rings ?? 24);
        const color = opts.color ?? [1,1,1];

        this._build(rx, rz, height, segments, rings, color);
    }

    _build(rx, rz, height, segments, rings, color) {
        const vertices = [], faces = [];

        // u = 0 (vertex bawah) sampai 1 (lingkar atas)
        for (let i = 0; i <= rings; i++) {
            const u = i / rings;
            
            // v = 0 sampai 2*PI (melingkar)
            for (let j = 0; j <= segments; j++) {
                const v = (j / segments) * 2 * Math.PI;
                const cv = Math.cos(v);
                const sv = Math.sin(v);

                // ▼▼▼ Rumus Parametrik Elliptic Paraboloid ▼▼▼
                const x = rx * u * cv;
                const y = height * u * u; // Kunci: y proporsional dengan u^2
                const z = rz * u * sv;
                // ▲▲▲ --------------------------------- ▲▲▲

                vertices.push(x, y, z, ...color);
            }
        }

        // Logika faces sama persis dengan ellipsoid
        const rowLen = segments + 1;
        for (let i = 0; i < rings; i++) {
            for (let j = 0; j < segments; j++) {
                const i0 = i * rowLen + j, i1 = i0 + 1, i2 = (i + 1) * rowLen + j, i3 = i2 + 1;
                faces.push(i0, i1, i2, i1, i3, i2);
            }
        }
        
        this.vertex = vertices; this.faces = faces;
    }

    // setup() dan render() sama persis dengan ellipsoid.js
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
        this.GL.vertexAttribPointer(this._position, 3, this.GL.FLOAT, false, 24, 0);
        this.GL.vertexAttribPointer(this._color, 3, this.GL.FLOAT, false, 24, 12);
        this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        this.GL.drawElements(this.GL.TRIANGLES, this.faces.length, this.GL.UNSIGNED_SHORT, 0);
        this.childs.forEach(c => c.render(M));
    }
}