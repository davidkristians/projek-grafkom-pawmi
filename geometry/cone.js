export class cone {
    constructor(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, opts = {}) {
        this.GL = GL; this.SHADER_PROGRAM = SHADER_PROGRAM;
        this._position = _position; this._color = _color; this._MMatrix = _Mmatrix;
        this._normal = _normal;
        this.POSITION_MATRIX = LIBS.get_I4(); this.MOVE_MATRIX = LIBS.get_I4(); this.childs = [];
        this._build(opts);
    }

    _build(opts) {
        const radiusBottom = opts.radiusBottom ?? 0.2;
        const radiusTop = opts.radiusTop ?? 0.0;
        const height = opts.height ?? 0.5;
        const segments = opts.segments ?? 12;
        const color = opts.color ?? [1,1,1];
        const v = [], idx = []; const x0=0, x1=height; const TWO_PI=Math.PI*2;

        const n_x = height;
        const n_y = radiusBottom - radiusTop;
        const len = Math.sqrt(n_x*n_x + n_y*n_y);
        const n_x_norm = n_x / len;
        const n_y_norm = n_y / len;

        for (let s=0; s<=segments; s++) {
            const a=(s/segments)*TWO_PI, cA=Math.cos(a), sA=Math.sin(a);
            const nx = n_x_norm * cA;
            const ny = n_y_norm;
            const nz = n_x_norm * sA;
            // Stride: 3 pos, 3 col, 3 norm = 9
            v.push(x1, radiusTop*cA, radiusTop*sA, ...color, nx, ny, nz);
            v.push(x0, radiusBottom*cA, radiusBottom*sA, ...color, nx, ny, nz);
        }
        for (let s=0; s<segments; s++) {
            const i0=s*2, i1=i0+2;
            idx.push(i0, i0+1, i1, i1, i0+1, i1+1);
        }
        
        const baseCenterIdx = v.length/9; // Stride 9
        v.push(x0,0,0, ...color, -1, 0, 0);
        for(let s=0; s<=segments; s++){ 
            const a=(s/segments)*TWO_PI; 
            v.push(x0,radiusBottom*Math.cos(a),radiusBottom*Math.sin(a),...color, -1, 0, 0); 
        }
        for (let s = 0; s < segments; s++){
                idx.push(baseCenterIdx, baseCenterIdx + s + 2, baseCenterIdx + s + 1);
        }

        if (radiusTop > 0) {
            const topCenterIdx = v.length/9; // Stride 9
            v.push(x1,0,0, ...color, 1, 0, 0);
            for(let s=0; s<=segments; s++){ 
                const a=(s/segments)*TWO_PI; 
                v.push(x1,radiusTop*Math.cos(a),radiusTop*Math.sin(a),...color, 1, 0, 0); 
            }
            for (let s = 0; s < segments; s++){
                idx.push(topCenterIdx, topCenterIdx + s + 1, topCenterIdx + s + 2);
            }
        }
        this.vertex=v; this.faces=idx;
        }
        
    setup() {
        this.OBJECT_VERTEX=this.GL.createBuffer(); this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
        this.GL.bufferData(this.GL.ARRAY_BUFFER, new Float32Array(this.vertex), this.GL.STATIC_DRAW);
        this.OBJECT_FACES=this.GL.createBuffer(); this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        this.GL.bufferData(this.GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.faces), this.GL.STATIC_DRAW);
        this.childs.forEach(c=>c.setup());
    }
        
    render(PARENT_MATRIX) {
        const M=LIBS.get_I4(); LIBS.mul(M, PARENT_MATRIX, this.POSITION_MATRIX); LIBS.mul(M, M, this.MOVE_MATRIX);
        this.GL.useProgram(this.SHADER_PROGRAM); this.GL.uniformMatrix4fv(this._MMatrix, false, M);
        this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);

        this.GL.vertexAttribPointer(this._position, 3, this.GL.FLOAT, false, 36, 0);
        this.GL.vertexAttribPointer(this._color, 3, this.GL.FLOAT, false, 36, 12);
        this.GL.vertexAttribPointer(this._normal, 3, this.GL.FLOAT, false, 36, 24);
        this.GL.enableVertexAttribArray(this._normal); // Aktifkan

        this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        this.GL.drawElements(this.GL.TRIANGLES, this.faces.length, this.GL.UNSIGNED_SHORT, 0);
        this.childs.forEach(c=>c.render(M));
    }
}