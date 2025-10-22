// actors/pawmot.js

// Impor animasi spesifik
import { animatePawmot } from '../animations/pawmot.js';

// Impor geometri dari geometry3
import { group } from "../geometry3/group.js";
import { pawmoCurvedTorso } from "../geometry3/pawmoCurvedTorso.js";
import { pawmoHead } from "../geometry3/pawmo-head.js";
import { pawmoTail } from "../geometry3/pawmo-tail.js";
import { pawmoEar } from "../geometry3/pawmo-ear.js";
import { pawmoHand, PawmoArm } from "../geometry3/pawmo-hand.js";
import { ellipsoid } from "../geometry3/ellipsoid.js";
import { cone } from "../geometry3/cone.js";
import { pawmoFoot } from "../geometry3/pawmo-foot.js";
import { pawmoTuft } from "../geometry3/pawmo-tuft.js";
import { pawmoTorsoSegment } from "../geometry3/pawmoTorsoSegment.js";

// Fungsi patchRenderPrototype (Salin dari pawmi.js)
function patchRenderPrototype(proto, normMatLoc) {
    const originalRender = proto.render;
    proto.render = function(PARENT_MATRIX) {
        const M = LIBS.get_I4();
        LIBS.mul(M, PARENT_MATRIX, this.POSITION_MATRIX);
        LIBS.mul(M, M, this.MOVE_MATRIX);
        this.GL.useProgram(this.SHADER_PROGRAM);
        this.GL.uniformMatrix4fv(this._MMatrix, false, M);
        this.GL.uniformMatrix4fv(normMatLoc, false, M); // uNormalMatrix
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

// Fungsi utama pembuat Pawmot
export function createPawmot(animationLoop) {
    const app = window.myApp;
    if (!app || !app.gl) { console.error("Aplikasi Pulau belum siap!"); return; }
    const GL = app.gl;
    const SHADER_PROGRAM = app.mainProgram;
    const _pos = app.posLoc, _col = app.colLoc, _normal = app.normLoc, _Mmatrix = app.mvLoc, _NMatrixLoc = app.normMatLoc;

    // Terapkan Patch
    patchRenderPrototype(ellipsoid.prototype, _NMatrixLoc);
    patchRenderPrototype(cone.prototype, _NMatrixLoc);
    patchRenderPrototype(pawmoFoot.prototype, _NMatrixLoc);
    patchRenderPrototype(pawmoTuft.prototype, _NMatrixLoc);
    patchRenderPrototype(pawmoTorsoSegment.prototype, _NMatrixLoc);
    patchRenderPrototype(PawmoArm.prototype, _NMatrixLoc);

    // Definisi Warna (Contoh: Sedikit lebih terang)
    const PAWMOT_ORANGE_LIGHT = [240 / 255, 150 / 255, 50 / 255];
    const PAWMOT_WHITE = [238 / 255, 238 / 255, 238 / 255];

    // Buat Rig Pawmot
    const PawmotRig = new group(_Mmatrix, _normal);

    // Pembuatan Objek Geometri (Gunakan warna Pawmot)
    const Torso = new pawmoCurvedTorso(GL, SHADER_PROGRAM, _pos, _col, _Mmatrix, _normal, { color: PAWMOT_ORANGE_LIGHT });
    const Left_Hand = new pawmoHand(GL, SHADER_PROGRAM, _pos, _col, _Mmatrix, _normal, { orange: PAWMOT_ORANGE_LIGHT, white: PAWMOT_WHITE });
    const Right_Hand = new pawmoHand(GL, SHADER_PROGRAM, _pos, _col, _Mmatrix, _normal, { orange: PAWMOT_ORANGE_LIGHT, white: PAWMOT_WHITE });
    const Left_Foot = new pawmoFoot(GL, SHADER_PROGRAM, _pos, _col, _Mmatrix, _normal, { color: PAWMOT_ORANGE_LIGHT });
    const Right_Foot = new pawmoFoot(GL, SHADER_PROGRAM, _pos, _col, _Mmatrix, _normal, { color: PAWMOT_ORANGE_LIGHT });
    const Tail = new pawmoTail(GL, SHADER_PROGRAM, _pos, _col, _Mmatrix, _normal, { color: PAWMOT_ORANGE_LIGHT });
    const Head = new pawmoHead(GL, SHADER_PROGRAM, _pos, _col, _Mmatrix, _normal, {}); // Asumsi warna kepala diatur di dalam kelas

    // Pemosisian Objek Relatif (SAMA seperti Pawmi)
    LIBS.set_I4(Left_Hand.POSITION_MATRIX); LIBS.translateX(Left_Hand.POSITION_MATRIX, -1.3); LIBS.translateY(Left_Hand.POSITION_MATRIX, 0); LIBS.translateZ(Left_Hand.POSITION_MATRIX, 1); LIBS.rotateX(Left_Hand.POSITION_MATRIX, LIBS.degToRad(50)); LIBS.rotateZ(Left_Hand.POSITION_MATRIX, LIBS.degToRad(180)); LIBS.rotateY(Left_Hand.POSITION_MATRIX, LIBS.degToRad(-15));
    LIBS.set_I4(Right_Hand.POSITION_MATRIX); LIBS.translateX(Right_Hand.POSITION_MATRIX, 1.3); LIBS.translateY(Right_Hand.POSITION_MATRIX, 0); LIBS.translateZ(Right_Hand.POSITION_MATRIX, 1); LIBS.rotateX(Right_Hand.POSITION_MATRIX, LIBS.degToRad(50)); LIBS.rotateZ(Right_Hand.POSITION_MATRIX, LIBS.degToRad(180)); LIBS.rotateY(Right_Hand.POSITION_MATRIX, LIBS.degToRad(15));
    LIBS.set_I4(Left_Foot.POSITION_MATRIX); LIBS.scale(Left_Foot.POSITION_MATRIX, 0.65, 0.65, 0.65); LIBS.translateX(Left_Foot.POSITION_MATRIX, -0.5); LIBS.translateY(Left_Foot.POSITION_MATRIX, -1.65); LIBS.translateZ(Left_Foot.POSITION_MATRIX, 0.2); LIBS.rotateX(Left_Foot.POSITION_MATRIX, LIBS.degToRad(10));
    LIBS.set_I4(Right_Foot.POSITION_MATRIX); LIBS.scale(Right_Foot.POSITION_MATRIX, 0.65, 0.65, 0.65); LIBS.translateX(Right_Foot.POSITION_MATRIX, 0.5); LIBS.translateY(Right_Foot.POSITION_MATRIX, -1.65); LIBS.translateZ(Right_Foot.POSITION_MATRIX, 0.2); LIBS.rotateX(Right_Foot.POSITION_MATRIX, LIBS.degToRad(10));
    LIBS.set_I4(Tail.POSITION_MATRIX); LIBS.rotateY(Tail.POSITION_MATRIX, LIBS.degToRad(90)); LIBS.translateY(Tail.POSITION_MATRIX, -1.2); LIBS.translateZ(Tail.POSITION_MATRIX, -1.4);
    const topTorsoMatrix = Torso.getTopMatrix(); LIBS.mul(Head.POSITION_MATRIX, topTorsoMatrix, LIBS.get_I4()); LIBS.translateLocal(Head.POSITION_MATRIX, 0, 0.2, 0); LIBS.rotateX(Head.POSITION_MATRIX, LIBS.degToRad(-30));

    // Penggabungan Rig
    PawmotRig.childs.push(Torso, Left_Hand, Right_Hand, Left_Foot, Right_Foot, Tail, Head);
    Torso.childs.push(Left_Hand, Right_Hand);

    // Simpan Referensi Animasi
    PawmotRig.torsoRef = Torso;
    PawmotRig.tailRef = Tail;
    PawmotRig.mouthRef = Head.smileRef;
    PawmotRig.leftHandMove = Left_Hand.MOVE_MATRIX;
    PawmotRig.rightHandMove = Right_Hand.MOVE_MATRIX;
    PawmotRig.headMove = Head.MOVE_MATRIX;

    // Setup buffer
    PawmotRig.setup();

    // Posisikan Aktor LOKAL di atas pulau
    // const islandPositions = app.islandPositions; // <-- HAPUS
    LIBS.set_I4(PawmotRig.POSITION_MATRIX);
    // LIBS.translateX(PawmotRig.POSITION_MATRIX, islandPositions[2][0]); // <-- HAPUS
    LIBS.translateY(PawmotRig.POSITION_MATRIX, 1.1); // Offset Y LOKAL
    // LIBS.translateZ(PawmotRig.POSITION_MATRIX, islandPositions[2][2]); // <-- HAPUS
    LIBS.scale(PawmotRig.POSITION_MATRIX, 0.2, 0.2, 0.2); 

    // Tambahkan Aktor ke daftar render global
    // app.actors.push(PawmotRig); // <-- HAPUS

    // Daftarkan fungsi animasinya
    animationLoop.registerActorAnimation(PawmotRig, animatePawmot);

    console.log("--- PAWMOT SUKSES DIBUAT ---");
    
    return PawmotRig; // <-- BARU: Kembalikan Rig
}