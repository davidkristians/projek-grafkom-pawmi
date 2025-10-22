import { getBezierPoint, getBezierTangent } from "./bezier.js";
import { group } from "./group.js";
import { cone } from "./cone.js";
import { ellipsoid } from "./ellipsoid.js";

// Kelas internal untuk lengan
export class PawmoArm extends group {
    constructor(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, opts = {}) {
        super(_Mmatrix, _normal);
        
        this.GL = GL; this.SHADER_PROGRAM = SHADER_PROGRAM;
        this._position = _position; this._color = _color; this._normal = _normal;
        this._MMatrix = _Mmatrix;
        this.POSITION_MATRIX = LIBS.get_I4(); this.MOVE_MATRIX = LIBS.get_I4();
        this.childs = [];
        this._build(opts);
    }
    _build(opts) {
        const orangeColor = opts.orange, greenColor = opts.green;
        const segments = opts.segments ?? 32, rings = opts.rings ?? 32;
        const p0 = [0.0, -1.0], p1 = [0.3, -0.8], p2 = [1.15, 2.4], p3 = [0.0, 1.8];
        const minY = p0[1], maxY = Math.max(p2[1], p3[1]), totalHeight = maxY - minY;
        const vertices = [], faces = [];
        for (let i = 0; i <= rings; i++) {
            const t = i / rings;
            const profilePoint = getBezierPoint(t, p0, p1, p2, p3);
            const radius = profilePoint.x, y = profilePoint.y;
            const tangent = getBezierTangent(t, p0, p1, p2, p3);
            const normal2D = { x: tangent.y, y: -tangent.x };
            let vertColor = orangeColor;
            const heightT = (y - minY) / totalHeight;
            if (heightT > 0.68) { vertColor = greenColor; }
            for (let j = 0; j <= segments; j++) {
                const angle = (j / segments) * 2 * Math.PI;
                const x = radius * Math.cos(angle), z = radius * Math.sin(angle);
                const nx = normal2D.x * Math.cos(angle);
                const ny = normal2D.y;
                const nz = normal2D.x * Math.sin(angle);
                const len = Math.sqrt(nx*nx + ny*ny + nz*nz) || 1;
                vertices.push(x, y, z, ...vertColor, nx / len, ny / len, nz / len);
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
    }
    render(PARENT_MATRIX) { /* ... This will be patched ... */ }
}

// Kelas utama (group) untuk tangan
export class pawmotHand extends group {
    constructor(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, opts = {}) {
        super(_Mmatrix, _normal);
        
        const pawPad = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, {
            rx: 0.4, ry: 0.2, rz: 0.4, color: opts.green
        });
        const arm = new PawmoArm(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, opts);
        const whiteColor = [1, 1, 1];
        const armTipHeight = (opts.p3_y !== undefined) ? opts.p3_y : 1.8;
        const fingerCount = 4;
        const fingerSpacing = 0.15;

        for (let i = 0; i < fingerCount; i++) {
            const claw = new cone(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, {
                radiusBottom: 0.1, radiusTop: 0.0, height: 0.4, color: whiteColor
            });
            const xOffset = (i - (fingerCount - 1) / 2) * fingerSpacing;
            LIBS.set_I4(claw.POSITION_MATRIX);
            LIBS.rotateY(claw.POSITION_MATRIX, LIBS.degToRad(-90));
            LIBS.translateY(claw.POSITION_MATRIX, armTipHeight + 0.2);
            LIBS.translateX(claw.POSITION_MATRIX, xOffset);
            LIBS.rotateX(claw.POSITION_MATRIX, LIBS.degToRad(-90));
            this.childs.push(claw);
        }

        LIBS.set_I4(pawPad.POSITION_MATRIX);
        LIBS.translateY(pawPad.POSITION_MATRIX, armTipHeight - 0.01);
        
        this.childs.push(arm, pawPad);
    }
}