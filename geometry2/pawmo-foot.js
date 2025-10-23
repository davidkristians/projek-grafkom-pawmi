// geometry2/pawmo-foot.js
import { group } from "./group.js";
import { paraboloid } from "./paraboloid.js";

// Helper function (sudah diupgrade untuk menghasilkan normal)
function generateHemiEllipsoid(rx, ry, rz, segments, rings) {
    const vertices = [], faces = [];
    // Bagian atas melengkung
    for (let i = 0; i <= rings; i++) {
        const u = (i / rings) * (Math.PI / 2); 
        const cu = Math.cos(u), su = Math.sin(u);
        for (let j = 0; j <= segments; j++) {
            const v = (j / segments) * 2 * Math.PI;
            const cv = Math.cos(v), sv = Math.sin(v);
            const x = rx * cv * cu, y = ry * su, z = rz * sv * cu;
            const nx_raw = x / (rx * rx), ny_raw = y / (ry * ry), nz_raw = z / (rz * rz);
            const len = Math.sqrt(nx_raw*nx_raw + ny_raw*ny_raw + nz_raw*nz_raw) || 1;
            vertices.push(x, y, z, nx_raw/len, ny_raw/len, nz_raw/len);
        }
    }
    const rowLen = segments + 1;
    for (let i = 0; i < rings; i++) {
        for (let j = 0; j < segments; j++) {
            const i0 = i * rowLen + j, i1 = i0 + 1, i2 = (i + 1) * rowLen + j, i3 = i2 + 1;
            faces.push(i0, i1, i2, i1, i3, i2);
        }
    }
    // Alas datar
    const baseStartIndex = vertices.length / 6;
    vertices.push(0, 0, 0, 0, -1, 0); // Titik tengah
    for (let j = 0; j <= segments; j++) {
        const v = (j / segments) * 2 * Math.PI;
        vertices.push(rx * Math.cos(v), 0, rz * Math.sin(v), 0, -1, 0);
    }
    for (let j = 0; j < segments; j++) {
        faces.push(baseStartIndex, baseStartIndex + j + 2, baseStartIndex + j + 1);
    }
    return { vertices, faces };
}

// Kelas internal untuk telapak kaki (BaseFoot)
class BaseFoot {
    // ▼▼▼ DIUBAH: Tambahkan _normal ▼▼▼
    constructor(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, opts = {}) {
        this.GL=GL; this.SHADER_PROGRAM=SHADER_PROGRAM; this._position=_position; this._color=_color; this._MMatrix=_Mmatrix;
        this._normal = _normal; // BARU
        this.POSITION_MATRIX=LIBS.get_I4(); this.MOVE_MATRIX=LIBS.get_I4();
        this._build(opts);
    }
    _build(opts) {
        const geo = generateHemiEllipsoid(opts.rx ?? 0.5, opts.ry ?? 0.4, opts.rz ?? 0.7, 24, 16);
        const color = opts.color ?? [1,1,1];
        const finalVertices = [];
        for (let i = 0; i < geo.vertices.length; i += 6) {
            const pos = geo.vertices.slice(i, i + 3);
            const norm = geo.vertices.slice(i + 3, i + 6);
            finalVertices.push(...pos, ...color, ...norm);
        }
        this.vertex = finalVertices;
        this.faces = geo.faces;
    }
    setup() {
        this.OBJECT_VERTEX=this.GL.createBuffer(); this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
        this.GL.bufferData(this.GL.ARRAY_BUFFER, new Float32Array(this.vertex), this.GL.STATIC_DRAW);
        this.OBJECT_FACES=this.GL.createBuffer(); this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        this.GL.bufferData(this.GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.faces), this.GL.STATIC_DRAW);
    }
    // ▼▼▼ DIUBAH: Fungsi render ini tidak di-patch, jadi kita perbaiki manual ▼▼▼
    render(PARENT_MATRIX, NMatrixLoc) {
        const M=LIBS.get_I4(); LIBS.mul(M, PARENT_MATRIX, this.POSITION_MATRIX); LIBS.mul(M, M, this.MOVE_MATRIX);
        this.GL.useProgram(this.SHADER_PROGRAM);
        this.GL.uniformMatrix4fv(this._MMatrix, false, M);
        this.GL.uniformMatrix4fv(NMatrixLoc, false, M); // Kirim matriks normal
        this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
        this.GL.vertexAttribPointer(this._position, 3, this.GL.FLOAT, false, 36, 0);
        this.GL.enableVertexAttribArray(this._position);
        this.GL.vertexAttribPointer(this._color, 3, this.GL.FLOAT, false, 36, 12);
        this.GL.enableVertexAttribArray(this._color);
        this.GL.vertexAttribPointer(this._normal, 3, this.GL.FLOAT, false, 36, 24);
        this.GL.enableVertexAttribArray(this._normal);
        this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        this.GL.drawElements(this.GL.TRIANGLES, this.faces.length, this.GL.UNSIGNED_SHORT, 0);
    }
}

// KELAS UTAMA PAWMOFOOT (GROUP)
export class pawmoFoot extends group {
    constructor(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, NMatrixLoc, opts = {}) {
        super(_Mmatrix, _normal);
        const PAW_PAD_COLOR = [224/255, 123/255, 144/255];
        
        // Buat telapak kaki
        const base = new BaseFoot(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, opts);
        
        // Buat bantalan
        const mainPad = new paraboloid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, { rx: 0.25, height: 0.15, rz: 0.3, color: PAW_PAD_COLOR, segments: 12, rings: 12 });
        LIBS.translateY(mainPad.POSITION_MATRIX, -0.1); LIBS.translateZ(mainPad.POSITION_MATRIX, 0.2); LIBS.rotateX(mainPad.POSITION_MATRIX, LIBS.degToRad(-10));

        const toePads = [];
        for (let i = 0; i < 3; i++) {
            toePads.push(new paraboloid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, { rx: 0.1, height: 0.1, rz: 0.1, color: PAW_PAD_COLOR, segments: 8, rings: 8 }));
        }
        
        LIBS.translateX(toePads[0].POSITION_MATRIX, -0.2); LIBS.translateY(toePads[0].POSITION_MATRIX, -0.1); LIBS.translateZ(toePads[0].POSITION_MATRIX, 0.45); LIBS.rotateX(toePads[0].POSITION_MATRIX, LIBS.degToRad(-20));
        LIBS.translateX(toePads[1].POSITION_MATRIX, 0.0);  LIBS.translateY(toePads[1].POSITION_MATRIX, -0.1); LIBS.translateZ(toePads[1].POSITION_MATRIX, 0.5);  LIBS.rotateX(toePads[1].POSITION_MATRIX, LIBS.degToRad(-20));
        LIBS.translateX(toePads[2].POSITION_MATRIX, 0.2);  LIBS.translateY(toePads[2].POSITION_MATRIX, -0.1); LIBS.translateZ(toePads[2].POSITION_MATRIX, 0.45); LIBS.rotateX(toePads[2].POSITION_MATRIX, LIBS.degToRad(-20));

        this.childs.push(base, mainPad, ...toePads);

        // ▼▼▼ DIUBAH: Override fungsi render group untuk handle BaseFoot yang tidak di-patch ▼▼▼
        this.render = function(PARENT_MATRIX) {
            const M = LIBS.get_I4();
            LIBS.mul(M, PARENT_MATRIX, this.POSITION_MATRIX);
            LIBS.mul(M, M, this.MOVE_MATRIX);
            
            // Render BaseFoot secara manual
            base.render(M, NMatrixLoc); 

            // Render anak-anak lain yang sudah di-patch (paraboloid)
            mainPad.render(M);
            toePads.forEach(pad => pad.render(M));
        }
    }
}

