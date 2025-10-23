export class cone {
    constructor(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, opts = {}) {
        this.GL = GL; this.SHADER_PROGRAM = SHADER_PROGRAM;
        this._position = _position; this._color = _color; this._normal = _normal;
        this._MMatrix = _Mmatrix;
        this.POSITION_MATRIX = LIBS.get_I4(); this.MOVE_MATRIX = LIBS.get_I4(); this.childs = [];
        this._build(opts);
    }
    _build(opts) {
        const rb = opts.radiusBottom ?? 0.2; const rt = opts.radiusTop ?? 0.0;
        const h = opts.height ?? 0.5; const seg = opts.segments ?? 12;
        const color = opts.color ?? [1,1,1];
        const v = [], f = []; const TWO_PI = Math.PI*2;
        
        const n_y = rb - rt;
        const n_x = h;
        const len = Math.sqrt(n_x*n_x + n_y*n_y);
        const ny_norm = n_y / len;
        const nx_norm = n_x / len;

        for (let s = 0; s <= seg; s++) {
            const angle = (s/seg) * TWO_PI, cA = Math.cos(angle), sA = Math.sin(angle);
            const nx = nx_norm * cA;
            const ny = ny_norm;
            const nz = nx_norm * sA;
            v.push(h/2, rt*cA, rt*sA, ...color, nx, ny, nz);
            v.push(-h/2, rb*cA, rb*sA, ...color, nx, ny, nz);
        }
        for (let s=0; s<seg; s++) { const i=s*2; f.push(i, i+1, i+2, i+2, i+1, i+3); }
        
        const baseCenterIdx = v.length/9; v.push(-h/2,0,0, ...color, 0,-1,0);
        for(let s=0; s<=seg; s++) { const a=(s/seg)*TWO_PI; v.push(-h/2,rb*Math.cos(a),rb*Math.sin(a),...color, 0,-1,0); }
        for(let s=0; s<seg; s++) { f.push(baseCenterIdx, baseCenterIdx+s+2, baseCenterIdx+s+1); }
        
        if (rt > 0) {
            const topCenterIdx = v.length/9; v.push(h/2,0,0, ...color, 0,1,0);
            for(let s=0; s<=seg; s++) { const a=(s/seg)*TWO_PI; v.push(h/2,rt*Math.cos(a),rt*Math.sin(a),...color, 0,1,0); }
            for(let s=0; s<seg; s++) { f.push(topCenterIdx, topCenterIdx+s+1, topCenterIdx+s+2); }
        }
        this.vertex = v; this.faces = f;
    }
    setup() {
        this.OBJECT_VERTEX = this.GL.createBuffer();
        this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
        this.GL.bufferData(this.GL.ARRAY_BUFFER, new Float32Array(this.vertex), this.GL.STATIC_DRAW);
        this.OBJECT_FACES = this.GL.createBuffer();
        this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        this.GL.bufferData(this.GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.faces), this.GL.STATIC_DRAW);
    }
    render(PARENT_MATRIX) {  }
}