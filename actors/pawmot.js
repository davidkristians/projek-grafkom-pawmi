// Impor animasi
import { animatePawmot } from '../animations/pawmot.js';

// Impor geometri dari geometry3
import { group } from "../geometry3/group.js";
import { pawmotTorso } from "../geometry3/pawmot-torso.js";
import { pawmotHead } from "../geometry3/pawmot-head.js";
import { pawmotTail } from "../geometry3/pawmot-tail.js";
import { pawmotHand, PawmoArm } from "../geometry3/pawmot-hand.js";
import { ellipsoid } from "../geometry3/ellipsoid.js";
import { cone } from "../geometry3/cone.js";
import { pawmotFoot } from "../geometry3/pawmot-foot.js";
import { pawmotRuff, RuffSpike } from "../geometry3/pawmot-ruff.js";
import { pawmotTuft } from "../geometry3/pawmot-tuft.js";
import { paraboloid } from "../geometry3/paraboloid.js"; // Butuh untuk pawmot-foot

// Fungsi patchRenderPrototype untuk merender objek
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

// Fungsi utama unt membuat Pawmot
export function createPawmot(animationLoop) {
    const app = window.myApp;
    if (!app || !app.gl) { console.error("Aplikasi Pulau belum siap!"); return; }
    const GL = app.gl;
    const SHADER_PROGRAM = app.mainProgram;
    const _pos = app.posLoc, _col = app.colLoc, _normal = app.normLoc, _Mmatrix = app.mvLoc, _NMatrixLoc = app.normMatLoc;

    // Menerapkan patch render
    patchRenderPrototype(ellipsoid.prototype, _NMatrixLoc);
    patchRenderPrototype(cone.prototype, _NMatrixLoc);
    patchRenderPrototype(pawmotFoot.prototype, _NMatrixLoc);
    patchRenderPrototype(PawmoArm.prototype, _NMatrixLoc);
    patchRenderPrototype(pawmotTorso.prototype, _NMatrixLoc); // Patch Torso
    patchRenderPrototype(RuffSpike.prototype, _NMatrixLoc); // Patch RuffSpike
    patchRenderPrototype(pawmotTuft.prototype, _NMatrixLoc); // Patch Tuft

    // Inisialisasi Warna
    const PAWMOT_ORANGE_LIGHT = [240 / 255, 150 / 255, 50 / 255];
    const PAWMOT_GREEN = [70 / 255, 128 / 255, 107 / 255];

    // Buat Rig Pawmot
    const PawmotRig = new group(_Mmatrix, _normal);

    // Pembuatan Objek Geometri
    // Bagian Badan
    const Torso = new pawmotTorso(GL, SHADER_PROGRAM, _pos, _col, _normal, _Mmatrix, {
        color: PAWMOT_ORANGE_LIGHT
    });
    // Bagian Tangan Kiri
    const Left_Hand = new pawmotHand(GL, SHADER_PROGRAM, _pos, _col, _normal, _Mmatrix, {
        orange: PAWMOT_ORANGE_LIGHT, green: PAWMOT_GREEN
    });
    // Bagian Tangan Kanan
    const Right_Hand = new pawmotHand(GL, SHADER_PROGRAM, _pos, _col, _normal, _Mmatrix, {
        orange: PAWMOT_ORANGE_LIGHT, green: PAWMOT_GREEN
    });
    // Bagian Kaki Kiri
    const Left_Foot = new pawmotFoot(GL, SHADER_PROGRAM, _pos, _col, _normal, _Mmatrix, {
        color: PAWMOT_ORANGE_LIGHT
    });
    // Bagian Kaki Kanan
    const Right_Foot = new pawmotFoot(GL, SHADER_PROGRAM, _pos, _col, _normal, _Mmatrix, {
        color: PAWMOT_ORANGE_LIGHT
    });
    // Bagian Ekor
    const Tail = new pawmotTail(GL, SHADER_PROGRAM, _pos, _col, _normal, _Mmatrix, {});
    // Bagian Kepala
    const Head = new pawmotHead(GL, SHADER_PROGRAM, _pos, _col, _normal, _Mmatrix, {});
    // Bagian Bulu-Bulu Leher 
    const Ruff = new pawmotRuff(GL, SHADER_PROGRAM, _pos, _col, _normal, _Mmatrix, {
        color: PAWMOT_ORANGE_LIGHT
    });

    // Pemosisian Objek Relatif
    // Badan
    LIBS.set_I4(Torso.POSITION_MATRIX);
    LIBS.translateY(Torso.POSITION_MATRIX, 0.4);

    // Tangan Kiri
    LIBS.set_I4(Left_Hand.POSITION_MATRIX);
    LIBS.translateX(Left_Hand.POSITION_MATRIX, -1);
    LIBS.translateY(Left_Hand.POSITION_MATRIX, 1);
    LIBS.translateZ(Left_Hand.POSITION_MATRIX, 0.5);
    LIBS.rotateX(Left_Hand.POSITION_MATRIX, LIBS.degToRad(50));
    LIBS.rotateZ(Left_Hand.POSITION_MATRIX, LIBS.degToRad(180));
    LIBS.rotateY(Left_Hand.POSITION_MATRIX, LIBS.degToRad(-15));

    // Tangan Kanan
    LIBS.set_I4(Right_Hand.POSITION_MATRIX);
    LIBS.translateX(Right_Hand.POSITION_MATRIX, 1);
    LIBS.translateY(Right_Hand.POSITION_MATRIX, 1);
    LIBS.translateZ(Right_Hand.POSITION_MATRIX, 0.5);
    LIBS.rotateX(Right_Hand.POSITION_MATRIX, LIBS.degToRad(50));
    LIBS.rotateZ(Right_Hand.POSITION_MATRIX, LIBS.degToRad(180));
    LIBS.rotateY(Right_Hand.POSITION_MATRIX, LIBS.degToRad(15));

    // Kaki Kiri
    LIBS.set_I4(Left_Foot.POSITION_MATRIX);
    LIBS.scale(Left_Foot.POSITION_MATRIX, 0.65, 0.65, 0.65);
    LIBS.translateX(Left_Foot.POSITION_MATRIX, -0.5);
    LIBS.translateY(Left_Foot.POSITION_MATRIX, -1.65);
    LIBS.translateZ(Left_Foot.POSITION_MATRIX, 0.2);
    LIBS.rotateX(Left_Foot.POSITION_MATRIX, LIBS.degToRad(-10));

    // Kaki Kanan
    LIBS.set_I4(Right_Foot.POSITION_MATRIX);
    LIBS.scale(Right_Foot.POSITION_MATRIX, 0.65, 0.65, 0.65);
    LIBS.translateX(Right_Foot.POSITION_MATRIX, 0.5);
    LIBS.translateY(Right_Foot.POSITION_MATRIX, -1.65);
    LIBS.translateZ(Right_Foot.POSITION_MATRIX, 0.2);
    LIBS.rotateX(Right_Foot.POSITION_MATRIX, LIBS.degToRad(-10));

    // Ekor
    LIBS.set_I4(Tail.POSITION_MATRIX);
    LIBS.rotateY(Tail.POSITION_MATRIX, LIBS.degToRad(90));
    LIBS.translateY(Tail.POSITION_MATRIX, -1.2);
    LIBS.translateZ(Tail.POSITION_MATRIX, -1.4);

    // Posisi kepala manual karena torso tidak punya getTopMatrix()
    LIBS.set_I4(Head.POSITION_MATRIX);
    LIBS.translateY(Head.POSITION_MATRIX, 2.4); // disamakan dengan tinggi torso
    LIBS.rotateX(Head.POSITION_MATRIX, LIBS.degToRad(-10));

    // Posisi bulu-bulu di leher
    LIBS.set_I4(Ruff.POSITION_MATRIX);
    LIBS.translateY(Ruff.POSITION_MATRIX, 1.8);

    // Penggabungan Rig
    PawmotRig.childs.push(Torso, Left_Hand, Right_Hand, Left_Foot, Right_Foot, Tail, Head, Ruff);

    // Simpan Referensi Animasi
    PawmotRig.torsoRef = Torso;
    PawmotRig.tailRef = Tail;
    PawmotRig.mouthRef = Head.smileRef;
    PawmotRig.leftHandMove = Left_Hand.MOVE_MATRIX;
    PawmotRig.rightHandMove = Right_Hand.MOVE_MATRIX;
    PawmotRig.headMove = Head.MOVE_MATRIX;
    PawmotRig.ruffRef = Ruff;
    PawmotRig.tuftRef = Head.tuftRef;

    // Setup buffer
    PawmotRig.setup();

    // Posisikan Aktor LOKAL di atas pulau
    LIBS.set_I4(PawmotRig.POSITION_MATRIX);
    LIBS.translateY(PawmotRig.POSITION_MATRIX, 1.1); // Offset Y LOKAL
    LIBS.scale(PawmotRig.POSITION_MATRIX, 0.2, 0.2, 0.2); 

    PawmotRig.movementState = {
        baseY: 1.38, // Y-offset awal
        baseScale: 0.2, // Skala awal
        currentX: 0, // Posisi X saat ini (relatif ke pusat pulau)
        currentZ: 0, // Posisi Z saat ini
        currentFacingAngle: Math.random() * 2 * Math.PI, // Arah hadap saat ini (radian)
        targetFacingAngle: Math.random() * 2 * Math.PI,  // Arah tujuan (radian)
        timeToNextChange: 0, // Waktu (detik) sampai ganti arah
        speed: 0.5, // Kecepatan gerak (unit per detik)
        turnSpeed: LIBS.degToRad(60), // Kecepatan belok (90 deg/detik)

        // Data kalo ada tabrakan dan tanah miring
        pawmotRadius: 0.4, // radius tabrakan Pawmot (dibuat agak besar)
        
        // Ambil dari IslandNode.js -> fullIslandGrass -> rotateX
        grassTiltRad: LIBS.degToRad(-16.0), 
        
        // Hardcode posisi obstacle dari environment.js
        obstacles: [
            // Pohon 1 (pos: [-1.3, 0, -0.6])
            { x: -1.3, z: -0.6, r: 0.25 }, 
            // Pohon 2 (pos: [1.4, 0, -0.9])
            { x: 1.4, z: -0.9, r: 0.25 },
            // Pokeball 1 (pos: [-1.6, 0, 0.9])
            { x: -1.6, z: 0.9, r: 0.2 },
            // Pokeball 2 (pos: [1.5, 0, 0.6])
            { x: 1.5, z: 0.6, r: 0.2 }
        ],

        isEvading: false,  // Untuk cek apakah sedang dalam mode menghindar?
        evadeTimer: 0  ,    // Timer untuk durasi menghindar obstacle

        isPausing: false,  // Untuk cek apakah sedang berhenti?
        pauseTimer: 0,      // Timer untuk durasi berhenti

        isSeekingCenter: false // Untuk cek apakah sedang berjalan ke tengah?
        
    };

    // Daftarkan fungsi animasinya
    animationLoop.registerActorAnimation(PawmotRig, animatePawmot);

    console.log("--- PAWMOT SUKSES DIBUAT ---");
    
    return PawmotRig;
}