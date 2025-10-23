import { animatePawmo } from '../animations/pawmo.js';

// ▼▼▼ DIUBAH: Import pawmoTorso, HAPUS yang curved ▼▼▼
import { group } from "../geometry2/group.js";
import { pawmoTorso } from "../geometry2/pawmo-torso.js"; // Ganti ke torso lama
import { pawmoHead } from "../geometry2/pawmo-head.js";
import { pawmoTail } from "../geometry2/pawmo-tail.js";
import { pawmoHand, PawmoArm } from "../geometry2/pawmo-hand.js";
import { ellipsoid } from "../geometry2/ellipsoid.js";
import { cone } from "../geometry2/cone.js";
import { pawmoFoot } from "../geometry2/pawmo-foot.js";
import { pawmoTuft } from "../geometry2/pawmo-tuft.js";
import { paraboloid } from "../geometry2/paraboloid.js"; // Butuh untuk pawmo-foot

// Fungsi patchRenderPrototype (Untuk Geometri yang digambar)
function patchRenderPrototype(proto, normMatLoc) {
    proto.render = function(PARENT_MATRIX) {
        const M = LIBS.get_I4();
        LIBS.mul(M, PARENT_MATRIX, this.POSITION_MATRIX);
        LIBS.mul(M, M, this.MOVE_MATRIX);
        this.GL.useProgram(this.SHADER_PROGRAM);
        this.GL.uniformMatrix4fv(this._MMatrix, false, M);
        this.GL.uniformMatrix4fv(normMatLoc, false, M);
        this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
        this.GL.vertexAttribPointer(this._position, 3, this.GL.FLOAT, false, 36, 0);
        this.GL.enableVertexAttribArray(this._position);
        this.GL.vertexAttribPointer(this._color, 3, this.GL.FLOAT, false, 36, 12);
        this.GL.enableVertexAttribArray(this._color);
        this.GL.vertexAttribPointer(this._normal, 3, this.GL.FLOAT, false, 36, 24);
        this.GL.enableVertexAttribArray(this._normal);
        this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        this.GL.drawElements(this.GL.TRIANGLES, this.faces.length, this.GL.UNSIGNED_SHORT, 0);
        if (this.childs && this.childs.length > 0) {
            this.childs.forEach(c => c.render(M));
        }
    }
}

// ▼▼▼ PERBAIKAN: Fungsi patchRenderPrototype BARU khusus untuk GROUP ▼▼▼
// Group tidak digambar, hanya mengalikan matriks dan me-render anaknya
function patchGroupRenderPrototype(proto) {
    proto.render = function(PARENT_MATRIX) {
        const M = LIBS.get_I4();
        // Gabungkan matriks induk dengan POSISI & GERAKAN group ini
        LIBS.mul(M, PARENT_MATRIX, this.POSITION_MATRIX);
        LIBS.mul(M, M, this.MOVE_MATRIX);
        
        // Panggil render untuk semua anak dengan matriks baru (M)
        if (this.childs && this.childs.length > 0) {
            this.childs.forEach(c => c.render(M));
        }
    }
}
// ▲▲▲ SELESAI FUNGSI BARU ▲▲▲

// Fungsi utama pembuat Pawmo
export function createPawmo(animationLoop) {
    const app = window.myApp;
    if (!app || !app.gl) { console.error("Aplikasi belum siap!"); return; }
    const GL = app.gl;
    const SHADER_PROGRAM = app.mainProgram;
    const {posLoc: _pos, colLoc: _col, normLoc: _normal, mvLoc: _Mmatrix, normMatLoc: _NMatrixLoc} = app;

    // ▼▼▼ PERBAIKAN: Gunakan patchGroupRenderPrototype untuk group ▼▼▼
    patchGroupRenderPrototype(group.prototype);

    // ▼▼▼ DIUBAH: Patch sisanya ▼▼▼
    patchRenderPrototype(ellipsoid.prototype, _NMatrixLoc);
    patchRenderPrototype(cone.prototype, _NMatrixLoc);
    patchRenderPrototype(paraboloid.prototype, _NMatrixLoc); // Patch paraboloid untuk bantalan kaki
    patchRenderPrototype(pawmoTuft.prototype, _NMatrixLoc);
    patchRenderPrototype(pawmoTorso.prototype, _NMatrixLoc); // Patch torso lama
    patchRenderPrototype(PawmoArm.prototype, _NMatrixLoc);
    // pawmoFoot tidak perlu di-patch karena render-nya sudah di-override manual

    const PAWMO_ORANGE = [236/255, 187/255, 98/255];
    const PAWMO_WHITE = [238/255, 238/255, 238/255];

    const PawmoRig = new group(_Mmatrix, _normal);

    // ▼▼▼ DIUBAH: Gunakan pawmoTorso ▼▼▼
    const Torso = new pawmoTorso(GL, SHADER_PROGRAM, _pos, _col, _Mmatrix, _normal, { color: PAWMO_ORANGE });
    const Left_Hand = new pawmoHand(GL, SHADER_PROGRAM, _pos, _col, _Mmatrix, _normal, { orange: PAWMO_ORANGE, white: PAWMO_WHITE });
    const Right_Hand = new pawmoHand(GL, SHADER_PROGRAM, _pos, _col, _Mmatrix, _normal, { orange: PAWMO_ORANGE, white: PAWMO_WHITE });
    // ▼▼▼ DIUBAH: Teruskan NMatrixLoc ke pawmoFoot ▼▼▼
    const Left_Foot = new pawmoFoot(GL, SHADER_PROGRAM, _pos, _col, _Mmatrix, _normal, _NMatrixLoc, { color: PAWMO_ORANGE });
    const Right_Foot = new pawmoFoot(GL, SHADER_PROGRAM, _pos, _col, _Mmatrix, _normal, _NMatrixLoc, { color: PAWMO_ORANGE });
    const Tail = new pawmoTail(GL, SHADER_PROGRAM, _pos, _col, _Mmatrix, _normal, {});
    const Head = new pawmoHead(GL, SHADER_PROGRAM, _pos, _col, _Mmatrix, _normal, {});

    // ▼▼▼ DIUBAH: Gunakan positioning dari main.js lama ▼▼▼
    LIBS.set_I4(Left_Hand.POSITION_MATRIX); LIBS.translateX(Left_Hand.POSITION_MATRIX, -1.5); LIBS.translateY(Left_Hand.POSITION_MATRIX, 0.7); LIBS.rotateZ(Left_Hand.POSITION_MATRIX, LIBS.degToRad(120)); LIBS.rotateY(Left_Hand.POSITION_MATRIX, LIBS.degToRad(20));
    LIBS.set_I4(Right_Hand.POSITION_MATRIX); LIBS.translateX(Right_Hand.POSITION_MATRIX, 1.5); LIBS.translateY(Right_Hand.POSITION_MATRIX, 0.7); LIBS.rotateZ(Right_Hand.POSITION_MATRIX, LIBS.degToRad(-120)); LIBS.rotateY(Right_Hand.POSITION_MATRIX, LIBS.degToRad(-20));
    LIBS.set_I4(Left_Foot.POSITION_MATRIX); LIBS.translateX(Left_Foot.POSITION_MATRIX, -0.6); LIBS.translateY(Left_Foot.POSITION_MATRIX, -1.7); LIBS.translateZ(Left_Foot.POSITION_MATRIX, 0.4);
    LIBS.set_I4(Right_Foot.POSITION_MATRIX); LIBS.translateX(Right_Foot.POSITION_MATRIX, 0.6); LIBS.translateY(Right_Foot.POSITION_MATRIX, -1.7); LIBS.translateZ(Right_Foot.POSITION_MATRIX, 0.4);
    LIBS.set_I4(Tail.POSITION_MATRIX); LIBS.rotateY(Tail.POSITION_MATRIX, LIBS.degToRad(90)); LIBS.translateY(Tail.POSITION_MATRIX, -1.2); LIBS.translateZ(Tail.POSITION_MATRIX, -1.4);
    LIBS.set_I4(Head.POSITION_MATRIX); LIBS.translateY(Head.POSITION_MATRIX, 2.0); // <-- Posisi kepala sederhana

    // ▼▼▼ DIUBAH: Penggabungan Rig sederhana ▼▼▼
    PawmoRig.childs.push(Torso, Left_Hand, Right_Hand, Left_Foot, Right_Foot, Tail, Head);

    // Simpan Referensi Animasi
    PawmoRig.torsoRef = Torso;
    PawmoRig.tailRef = Tail;
    PawmoRig.mouthRef = Head.smileRef;
    PawmoRig.leftHandMove = Left_Hand.MOVE_MATRIX;
    PawmoRig.rightHandMove = Right_Hand.MOVE_MATRIX;
    PawmoRig.headMove = Head.MOVE_MATRIX;
    PawmoRig.leftFootMove = Left_Foot.MOVE_MATRIX;
    PawmoRig.rightFootMove = Right_Foot.MOVE_MATRIX;

    PawmoRig.setup();

    // Posisikan Aktor LOKAL di atas pulau
    LIBS.set_I4(PawmoRig.POSITION_MATRIX);
    LIBS.translateY(PawmoRig.POSITION_MATRIX, 2);
    LIBS.translateX(PawmoRig.POSITION_MATRIX, 0.5);
    LIBS.translateZ(PawmoRig.POSITION_MATRIX, 0.5);
    LIBS.scale(PawmoRig.POSITION_MATRIX, 0.2, 0.2, 0.2); 

    animationLoop.registerActorAnimation(PawmoRig, animatePawmo);

    console.log("--- PAWMO SUKSES DIBUAT (Opsi A: Torso Sederhana) ---");
    return PawmoRig;
}

