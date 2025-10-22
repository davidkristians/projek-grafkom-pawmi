// actors/pawmi.js

// Impor animasi spesifik
import { animatePawmi } from '../animations/pawmi.js'; // <-- Path relatif baru

// Impor geometri (path relatif baru terhadap root)
import { group } from "../geometry/group.js";
import { pawmoCurvedTorso } from "../geometry/pawmoCurvedTorso.js";
import { pawmoHead } from "../geometry/pawmo-head.js";
import { pawmoTail } from "../geometry/pawmo-tail.js";
import { pawmoEar } from "../geometry/pawmo-ear.js";
import { pawmoHand, PawmoArm } from "../geometry/pawmo-hand.js";
import { ellipsoid } from "../geometry/ellipsoid.js";
import { cone } from "../geometry/cone.js";
import { pawmoFoot } from "../geometry/pawmo-foot.js";
import { pawmoTuft } from "../geometry/pawmo-tuft.js";
import { pawmoTorsoSegment } from "../geometry/pawmoTorsoSegment.js";


// Fungsi patchRenderPrototype (Tetap sama, tidak perlu diubah)
function patchRenderPrototype(proto, normMatLoc) {
    const originalRender = proto.render;
    proto.render = function (PARENT_MATRIX) {
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

// Fungsi utama pembuat Pawmi
export function createPawmi(animationLoop) {
    const app = window.myApp;
    if (!app || !app.gl) { console.error("Aplikasi Pulau belum siap!"); return; }
    const GL = app.gl;
    const SHADER_PROGRAM = app.mainProgram;
    const _pos = app.posLoc, _col = app.colLoc, _normal = app.normLoc, _Mmatrix = app.mvLoc, _NMatrixLoc = app.normMatLoc;

    // Terapkan Patch ke prototipe geometri (hanya perlu sekali, tapi aman diulang)
    patchRenderPrototype(ellipsoid.prototype, _NMatrixLoc);
    patchRenderPrototype(cone.prototype, _NMatrixLoc);
    patchRenderPrototype(pawmoFoot.prototype, _NMatrixLoc);
    patchRenderPrototype(pawmoTuft.prototype, _NMatrixLoc);
    patchRenderPrototype(pawmoTorsoSegment.prototype, _NMatrixLoc);
    patchRenderPrototype(PawmoArm.prototype, _NMatrixLoc);

    // Definisi Warna Pawmi
    const PAWMI_ORANGE = [200 / 255, 110 / 255, 20 / 255];
    const PAWMI_WHITE = [238 / 255, 238 / 255, 238 / 255];

    // Buat Rig Pawmi
    const PawmiRig = new group(_Mmatrix, _normal);

    // Pembuatan Objek Geometri
    const Torso = new pawmoCurvedTorso(GL, SHADER_PROGRAM, _pos, _col, _Mmatrix, _normal, { color: PAWMI_ORANGE });
    const Left_Hand = new pawmoHand(GL, SHADER_PROGRAM, _pos, _col, _Mmatrix, _normal, { orange: PAWMI_ORANGE, white: PAWMI_WHITE });
    const Right_Hand = new pawmoHand(GL, SHADER_PROGRAM, _pos, _col, _Mmatrix, _normal, { orange: PAWMI_ORANGE, white: PAWMI_WHITE });
    const Left_Foot = new pawmoFoot(GL, SHADER_PROGRAM, _pos, _col, _Mmatrix, _normal, { color: PAWMI_ORANGE });
    const Right_Foot = new pawmoFoot(GL, SHADER_PROGRAM, _pos, _col, _Mmatrix, _normal, { color: PAWMI_ORANGE });
    const Tail = new pawmoTail(GL, SHADER_PROGRAM, _pos, _col, _Mmatrix, _normal, {});
    const Head = new pawmoHead(GL, SHADER_PROGRAM, _pos, _col, _Mmatrix, _normal, {});

    // Pemosisian Objek Relatif
    LIBS.set_I4(Left_Hand.POSITION_MATRIX); LIBS.translateX(Left_Hand.POSITION_MATRIX, -1.3); LIBS.translateY(Left_Hand.POSITION_MATRIX, 0); LIBS.translateZ(Left_Hand.POSITION_MATRIX, 1); LIBS.rotateX(Left_Hand.POSITION_MATRIX, LIBS.degToRad(50)); LIBS.rotateZ(Left_Hand.POSITION_MATRIX, LIBS.degToRad(180)); LIBS.rotateY(Left_Hand.POSITION_MATRIX, LIBS.degToRad(-15));
    LIBS.set_I4(Right_Hand.POSITION_MATRIX); LIBS.translateX(Right_Hand.POSITION_MATRIX, 1.3); LIBS.translateY(Right_Hand.POSITION_MATRIX, 0); LIBS.translateZ(Right_Hand.POSITION_MATRIX, 1); LIBS.rotateX(Right_Hand.POSITION_MATRIX, LIBS.degToRad(50)); LIBS.rotateZ(Right_Hand.POSITION_MATRIX, LIBS.degToRad(180)); LIBS.rotateY(Right_Hand.POSITION_MATRIX, LIBS.degToRad(15));
    LIBS.set_I4(Left_Foot.POSITION_MATRIX); LIBS.scale(Left_Foot.POSITION_MATRIX, 0.65, 0.65, 0.65); LIBS.translateX(Left_Foot.POSITION_MATRIX, -0.5); LIBS.translateY(Left_Foot.POSITION_MATRIX, -1.65); LIBS.translateZ(Left_Foot.POSITION_MATRIX, 0.2); LIBS.rotateX(Left_Foot.POSITION_MATRIX, LIBS.degToRad(10));
    LIBS.set_I4(Right_Foot.POSITION_MATRIX); LIBS.scale(Right_Foot.POSITION_MATRIX, 0.65, 0.65, 0.65); LIBS.translateX(Right_Foot.POSITION_MATRIX, 0.5); LIBS.translateY(Right_Foot.POSITION_MATRIX, -1.65); LIBS.translateZ(Right_Foot.POSITION_MATRIX, 0.2); LIBS.rotateX(Right_Foot.POSITION_MATRIX, LIBS.degToRad(10));
    LIBS.set_I4(Tail.POSITION_MATRIX); LIBS.rotateY(Tail.POSITION_MATRIX, LIBS.degToRad(90)); LIBS.translateY(Tail.POSITION_MATRIX, -1.2); LIBS.translateZ(Tail.POSITION_MATRIX, -1.4);
    const topTorsoMatrix = Torso.getTopMatrix(); LIBS.mul(Head.POSITION_MATRIX, topTorsoMatrix, LIBS.get_I4()); LIBS.translateLocal(Head.POSITION_MATRIX, 0, 0.2, 0); LIBS.rotateX(Head.POSITION_MATRIX, LIBS.degToRad(-30));

    // Penggabungan Rig
    PawmiRig.childs.push(Torso, Left_Hand, Right_Hand, Left_Foot, Right_Foot, Tail, Head);
    Torso.childs.push(Left_Hand, Right_Hand);

    // Simpan Referensi Animasi
    PawmiRig.torsoRef = Torso;
    PawmiRig.tailRef = Tail;
    PawmiRig.mouthRef = Head.smileRef;
    PawmiRig.leftHandMove = Left_Hand.MOVE_MATRIX;
    PawmiRig.rightHandMove = Right_Hand.MOVE_MATRIX;
    PawmiRig.headMove = Head.MOVE_MATRIX;

    // Setup buffer
    PawmiRig.setup();

    // Posisikan Aktor LOKAL di atas pulau
    // const islandPositions = app.islandPositions; // <-- HAPUS
    LIBS.set_I4(PawmiRig.POSITION_MATRIX);
    LIBS.translateY(PawmiRig.POSITION_MATRIX, 1.09); // Ini adalah offset Y LOKAL
    // LIBS.translateX(PawmiRig.POSITION_MATRIX, islandPositions[0][0]); // <-- HAPUS
    // LIBS.translateZ(PawmiRig.POSITION_MATRIX, islandPositions[0][2]); // <-- HAPUS
    LIBS.scale(PawmiRig.POSITION_MATRIX, 0.2, 0.2, 0.2);

    // Tambahkan Aktor ke daftar render global
    // app.actors.push(PawmiRig); // <-- HAPUS

    // Daftarkan fungsi animasinya
    animationLoop.registerActorAnimation(PawmiRig, animatePawmi);

    console.log("--- PAWMI SUKSES DIBUAT ---");
    
    return PawmiRig; // <-- BARU: Kembalikan Rig
}