import { group } from "./group.js";
import { getBezierPoint, getBezierTangent } from "./bezier.js";

// ▼▼▼ DIUBAH: Tambahkan 'export' agar bisa di-patch ▼▼▼
export class RuffSpike {
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
        const segments = 20, rings = 10;
        const p0 = [0, -0.5], p1 = [0.45, -0.4], p2 = [0.3, 0.6], p3 = [0, 0.9];
        const vertices = [], faces = [];
        for (let i = 0; i <= rings; i++) {
            const u = i / rings;
            const profilePoint = getBezierPoint(u, p0, p1, p2, p3);
            const radius = profilePoint.x, y = profilePoint.y;
            const tangent = getBezierTangent(u, p0, p1, p2, p3);
            const normal2D = { x: tangent.y, y: -tangent.x };
            for (let j = 0; j <= segments; j++) {
                const angle = (j / segments) * 2 * Math.PI;
                const flatteningFactor = 0.6;
                const x = (radius * Math.cos(angle)) * flatteningFactor; 
                const z = radius * Math.sin(angle);
                const nx = (normal2D.x * Math.cos(angle)) * flatteningFactor;
                const ny = normal2D.y;
                const nz = normal2D.x * Math.sin(angle);
                const len = Math.sqrt(nx*nx + ny*ny + nz*nz) || 1;
                vertices.push(x, y, z, ...color, nx/len, ny/len, nz/len);
            }
        }
        const rowLen = segments + 1;
        for (let i = 0; i < rings; i++) {
            for (let j = 0; j < segments; j++) {
                const i0 = i*rowLen+j, i1=i0+1, i2=(i+1)*rowLen+j, i3=i2+1;
                faces.push(i0,i1,i2, i1,i3,i2);
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
    render(PARENT_MATRIX) { /* ... This will be patched ... */ }
}


export class pawmotRuff extends group {
    constructor(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, opts = {}) {
        super(_Mmatrix, _normal);
        const spikeCount = 10;
        const radius = 1;

        for (let i = 0; i < spikeCount; i++) {
            const spike = new RuffSpike(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, opts);
            const angle = (i / spikeCount) * 2 * Math.PI;
            
            LIBS.set_I4(spike.POSITION_MATRIX);
            LIBS.translateY(spike.POSITION_MATRIX, -0.2); 

            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            LIBS.translateX(spike.POSITION_MATRIX, x);
            LIBS.translateZ(spike.POSITION_MATRIX, z);
            LIBS.rotateZ(spike.POSITION_MATRIX, -5);
            LIBS.rotateY(spike.POSITION_MATRIX, -angle);
            LIBS.rotateX(spike.POSITION_MATRIX, LIBS.degToRad(10));
            
            this.childs.push(spike);
        }
    }
}