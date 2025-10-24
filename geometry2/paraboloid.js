export class paraboloid {
    constructor(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, opts = {}) {
        this.GL = GL; this.SHADER_PROGRAM = SHADER_PROGRAM;
        this._position = _position; this._color = _color; this._MMatrix = _Mmatrix;
        this._normal = _normal;
        this.POSITION_MATRIX = LIBS.get_I4();
        this.MOVE_MATRIX = LIBS.get_I4();
        this.childs = [];

        const rx = opts.rx ?? 1.0;
        const rz = opts.rz ?? 1.0;
        const height = opts.height ?? 1.0; 
        const segments = opts.segments ?? 36;
        const rings = opts.rings ?? 24;
        const color = opts.color ?? [1,1,1];

        this._build(rx, rz, height, segments, rings, color);
    }

    _build(rx, rz, height, segments, rings, color) {
        const vertices = [], faces = [];

        for (let i = 0; i <= rings; i++) {
            const u = i / rings;
            
            for (let j = 0; j <= segments; j++) {
                const v = (j / segments) * 2 * Math.PI;
                const cv = Math.cos(v);
                const sv = Math.sin(v);

                const x = rx * u * cv;
                const y = height * u * u;
                const z = rz * u * sv;

                const tangentU = { x: rx * cv, y: 2 * height * u, z: rz * sv };
                const tangentV = { x: -rx * u * sv, y: 0, z: rz * u * cv };

                let nx = tangentU.y * tangentV.z - tangentU.z * tangentV.y;
                let ny = tangentU.z * tangentV.x - tangentU.x * tangentV.z;
                let nz = tangentU.x * tangentV.y - tangentU.y * tangentV.x;
                
                // normal harus menghadap keluar (y-nya harus negatif)
                if (ny > 0) {
                    nx = -nx; ny = -ny; nz = -nz;
                }
                const len = Math.sqrt(nx*nx + ny*ny + nz*nz) || 1;
                vertices.push(x, y, z, ...color, nx/len, ny/len, nz/len);
            }
        }

        const rowLen = segments + 1;
        for (let i = 0; i < rings; i++) {
            for (let j = 0; j < segments; j++) {
                const i0 = i * rowLen + j, i1 = i0 + 1, i2 = (i + 1) * rowLen + j, i3 = i2 + 1;
                faces.push(i0, i1, i2, i1, i3, i2);
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
