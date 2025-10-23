import { getBezierPoint, getBezierTangent } from "./bezier.js";

export class pawmotTorso {
    constructor(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, opts = {}) {
        this.GL = GL; this.SHADER_PROGRAM = SHADER_PROGRAM;
        this._position = _position; this._color = _color; this._normal = _normal;
        this._MMatrix = _Mmatrix;
        this.POSITION_MATRIX = LIBS.get_I4();
        this.MOVE_MATRIX = LIBS.get_I4();
        this.childs = [];
        this._build(opts);
    }

    _build(opts) {
        const color = opts.color ?? [1, 1, 1];
        const segments = opts.segments ?? 48;
        const rings = opts.rings ?? 48;
        const p0 = [0, -1.9], p1 = [2.4, -2], p2 = [1.3, 1], p3 = [0, 2];
        const vertices = [], faces = [];

        for (let i = 0; i <= rings; i++) {
            const t = i / rings;
            const profilePoint = getBezierPoint(t, p0, p1, p2, p3);
            const radius = profilePoint.x;
            const y = profilePoint.y;
            const tangent = getBezierTangent(t, p0, p1, p2, p3);
            const normal2D = { x: tangent.y, y: -tangent.x };

            for (let j = 0; j <= segments; j++) {
                const angle = (j / segments) * 2 * Math.PI;
                const x = radius * Math.cos(angle);
                const z = radius * Math.sin(angle);
                const nx = normal2D.x * Math.cos(angle);
                const ny = normal2D.y;
                const nz = normal2D.x * Math.sin(angle);
                const len = Math.sqrt(nx*nx + ny*ny + nz*nz);
                
                // Push 9 data (3 posisi, 3 warna, 3 normal)
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
        this.OBJECT_VERTEX=this.GL.createBuffer(); this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
        this.GL.bufferData(this.GL.ARRAY_BUFFER, new Float32Array(this.vertex), this.GL.STATIC_DRAW);
        this.OBJECT_FACES=this.GL.createBuffer(); this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        this.GL.bufferData(this.GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.faces), this.GL.STATIC_DRAW);
    }
    
    render(PARENT_MATRIX) {
        const M = LIBS.get_I4();
        LIBS.mul(M, PARENT_MATRIX, this.POSITION_MATRIX);
        LIBS.mul(M, M, this.MOVE_MATRIX);

        this.GL.useProgram(this.SHADER_PROGRAM);
        this.GL.uniformMatrix4fv(this._MMatrix, false, M);
        
        this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
        const stride = 36;
        this.GL.vertexAttribPointer(this._position, 3, this.GL.FLOAT, false, stride, 0);
        this.GL.vertexAttribPointer(this._color, 3, this.GL.FLOAT, false, stride, 12);
        this.GL.vertexAttribPointer(this._normal, 3, this.GL.FLOAT, false, stride, 24);

        this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        this.GL.drawElements(this.GL.TRIANGLES, this.faces.length, this.GL.UNSIGNED_SHORT, 0);

        if (this.childs && this.childs.length > 0) {
            this.childs.forEach(c => c.render(M));
        }
    }
}