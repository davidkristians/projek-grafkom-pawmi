export class ellipsoid {
    constructor(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, opts = {}) {
        this.GL = GL; this.SHADER_PROGRAM = SHADER_PROGRAM;
        this._position = _position; this._color = _color; this._MMatrix = _Mmatrix;
        this._normal = _normal;
        this.POSITION_MATRIX = LIBS.get_I4();
        this.MOVE_MATRIX = LIBS.get_I4();
        this.childs = [];
        this._build(opts.rx ?? 1.0, opts.ry ?? 1.0, opts.rz ?? 1.0, opts.segments ?? 36, opts.rings ?? 24, opts.color ?? [1,1,1]);
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
                const len = Math.sqrt(nx_raw*nx_raw + ny_raw*ny_raw + nz_raw*nz_raw) || 1;
                
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

    render(PARENT_MATRIX) {  }
}
