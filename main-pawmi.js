// main-pawmi.js

// 1. IMPOR SEMUA KELAS GEOMETRI PAWMI
// (Grup)
import { group } from "./geometry/group.js";
import { pawmoCurvedTorso } from "./geometry/pawmoCurvedTorso.js";
import { pawmoHead } from "./geometry/pawmo-head.js";
import { pawmoTail } from "./geometry/pawmo-tail.js";
import { pawmoEar } from "./geometry/pawmo-ear.js";
// (Grup dan Daun)
import { pawmoHand, PawmoArm } from "./geometry/pawmo-hand.js"; // Impor PawmoArm yang sudah di-export

// (Dedaunan / Leaf Nodes)
import { ellipsoid } from "./geometry/ellipsoid.js";
import { cone } from "./geometry/cone.js";
import { pawmoFoot } from "./geometry/pawmo-foot.js";
import { pawmoTuft } from "./geometry/pawmo-tuft.js";
import { pawmoTorsoSegment } from "./geometry/pawmoTorsoSegment.js";

// 2. HELPER "MONKEY-PATCH"
// (Fungsi patchRenderPrototype Anda tetap sama)
function patchRenderPrototype(proto, normMatLoc) {
    // Simpan fungsi render asli
    const originalRender = proto.render;

    // Ganti dengan fungsi baru
    proto.render = function(PARENT_MATRIX) {
        // --- Bagian ini adalah 90% salinan dari render asli Pawmi ---
        const M = LIBS.get_I4();
        LIBS.mul(M, PARENT_MATRIX, this.POSITION_MATRIX);
        LIBS.mul(M, M, this.MOVE_MATRIX);

        this.GL.useProgram(this.SHADER_PROGRAM);
        this.GL.uniformMatrix4fv(this._MMatrix, false, M); // Mengatur uModelViewMatrix

        // ▼▼▼ INI ADALAH PERBAIKAN KITA ▼▼▼
        // Atur uNormalMatrix agar sama dengan uModelViewMatrix,
        // persis seperti yang dilakukan oleh shader Pulau.
        this.GL.uniformMatrix4fv(normMatLoc, false, M);
        // ▲▲▲ SELESAI ▲▲▲

        this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);

        // Setup Atribut (Stride 36 byte)
        this.GL.vertexAttribPointer(this._position, 3, this.GL.FLOAT, false, 36, 0);
        this.GL.enableVertexAttribArray(this._position);

        this.GL.vertexAttribPointer(this._color, 3, this.GL.FLOAT, false, 36, 12);
        this.GL.enableVertexAttribArray(this._color);

        this.GL.vertexAttribPointer(this._normal, 3, this.GL.FLOAT, false, 36, 24);
        this.GL.enableVertexAttribArray(this._normal);

        this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        this.GL.drawElements(this.GL.TRIANGLES, this.faces.length, this.GL.UNSIGNED_SHORT, 0);

        // Cek dulu jika this.childs ada SEBELUM me-looping
        if (this.childs && this.childs.length > 0) {
            this.childs.forEach(c => c.render(M));
        }
    }
}


// 3. FUNGSI UTAMA PEMBUAT PAWMI
// ▼▼▼ TAMBAHKAN 'export' DI SINI ▼▼▼
export function createPawmi() {
    // Ambil variabel global yang diekspos oleh index.html
    const app = window.myApp;
    if (!app || !app.gl) {
        console.error("Aplikasi Pulau belum siap!");
        return;
    }

    const GL = app.gl;
    const SHADER_PROGRAM = app.mainProgram; // Gunakan shader Pulau

    // Petakan nama lokasi shader Pulau ke nama yang diharapkan Pawmi
    const _pos = app.posLoc;       // aPosition
    const _col = app.colLoc;       // aColor
    const _normal = app.normLoc;   // aNormal
    const _Mmatrix = app.mvLoc;      // uModelViewMatrix
    const _NMatrixLoc = app.normMatLoc; // uNormalMatrix (BARU)

    // --- Terapkan Patch ke semua prototipe "Leaf Node" Pawmi ---
    // Ini harus dijalankan SEBELUM kita membuat objek baru
    patchRenderPrototype(ellipsoid.prototype, _NMatrixLoc);
    patchRenderPrototype(cone.prototype, _NMatrixLoc);
    patchRenderPrototype(pawmoFoot.prototype, _NMatrixLoc);
    patchRenderPrototype(pawmoTuft.prototype, _NMatrixLoc);
    patchRenderPrototype(pawmoTorsoSegment.prototype, _NMatrixLoc);
    patchRenderPrototype(PawmoArm.prototype, _NMatrixLoc);
    // --- Patch selesai ---

    // Definisi Warna Pawmi
    const PAWMO_ORANGE = [222 / 255, 133 / 255, 34 / 255];
    const PAWMO_WHITE = [238 / 255, 238 / 255, 238 / 255];

    // Buat Rig Pawmi (kode ini sama seperti main.js Pawmi sebelumnya)
    const PawmiRig = new group(_Mmatrix, _normal); // _normal di sini hanya dummy

    // Berikan semua pointer yang dipetakan ke konstruktor Pawmi
    const Torso = new pawmoCurvedTorso(GL, SHADER_PROGRAM, _pos, _col, _Mmatrix, _normal, { color: PAWMO_ORANGE });
    const Left_Hand = new pawmoHand(GL, SHADER_PROGRAM, _pos, _col, _Mmatrix, _normal, { orange: PAWMO_ORANGE, white: PAWMO_WHITE });
    const Right_Hand = new pawmoHand(GL, SHADER_PROGRAM, _pos, _col, _Mmatrix, _normal, { orange: PAWMO_ORANGE, white: PAWMO_WHITE });
    const Left_Foot = new pawmoFoot(GL, SHADER_PROGRAM, _pos, _col, _Mmatrix, _normal, { color: PAWMO_ORANGE });
    const Right_Foot = new pawmoFoot(GL, SHADER_PROGRAM, _pos, _col, _Mmatrix, _normal, { color: PAWMO_ORANGE });
    const Tail = new pawmoTail(GL, SHADER_PROGRAM, _pos, _col, _Mmatrix, _normal, {});
    const Head = new pawmoHead(GL, SHADER_PROGRAM, _pos, _col, _Mmatrix, _normal, {});

    // Posisikan bagian tubuh Pawmi (relatif terhadap Rig)
    // (Kode LIBS.set_I4... untuk tangan, kaki, ekor, kepala tetap sama)
    LIBS.set_I4(Left_Hand.POSITION_MATRIX);
    LIBS.translateX(Left_Hand.POSITION_MATRIX, -1.3); LIBS.translateY(Left_Hand.POSITION_MATRIX, 0); LIBS.translateZ(Left_Hand.POSITION_MATRIX, 1);
    LIBS.rotateX(Left_Hand.POSITION_MATRIX, LIBS.degToRad(50)); LIBS.rotateZ(Left_Hand.POSITION_MATRIX, LIBS.degToRad(180)); LIBS.rotateY(Left_Hand.POSITION_MATRIX, LIBS.degToRad(-15));
    LIBS.set_I4(Right_Hand.POSITION_MATRIX);
    LIBS.translateX(Right_Hand.POSITION_MATRIX, 1.3); LIBS.translateY(Right_Hand.POSITION_MATRIX, 0); LIBS.translateZ(Right_Hand.POSITION_MATRIX, 1);
    LIBS.rotateX(Right_Hand.POSITION_MATRIX, LIBS.degToRad(50)); LIBS.rotateZ(Right_Hand.POSITION_MATRIX, LIBS.degToRad(180)); LIBS.rotateY(Right_Hand.POSITION_MATRIX, LIBS.degToRad(15));
    LIBS.set_I4(Left_Foot.POSITION_MATRIX);
    LIBS.scale(Left_Foot.POSITION_MATRIX, 0.65, 0.65, 0.65); LIBS.translateX(Left_Foot.POSITION_MATRIX, -0.5); LIBS.translateY(Left_Foot.POSITION_MATRIX, -1.65); LIBS.translateZ(Left_Foot.POSITION_MATRIX, 0.2);
    LIBS.rotateX(Left_Foot.POSITION_MATRIX, LIBS.degToRad(10));
    LIBS.set_I4(Right_Foot.POSITION_MATRIX);
    LIBS.scale(Right_Foot.POSITION_MATRIX, 0.65, 0.65, 0.65); LIBS.translateX(Right_Foot.POSITION_MATRIX, 0.5); LIBS.translateY(Right_Foot.POSITION_MATRIX, -1.65); LIBS.translateZ(Right_Foot.POSITION_MATRIX, 0.2);
    LIBS.rotateX(Right_Foot.POSITION_MATRIX, LIBS.degToRad(10));
    LIBS.set_I4(Tail.POSITION_MATRIX);
    LIBS.rotateY(Tail.POSITION_MATRIX, LIBS.degToRad(90)); LIBS.translateY(Tail.POSITION_MATRIX, -1.2); LIBS.translateZ(Tail.POSITION_MATRIX, -1.4);
    const topTorsoMatrix = Torso.getTopMatrix();
    LIBS.mul(Head.POSITION_MATRIX, topTorsoMatrix, LIBS.get_I4());
    LIBS.translateLocal(Head.POSITION_MATRIX, 0, 0.2, 0);
    LIBS.rotateX(Head.POSITION_MATRIX, LIBS.degToRad(-30));

    PawmiRig.childs.push(Torso, Left_Hand, Right_Hand, Left_Foot, Right_Foot, Tail, Head);
    Torso.childs.push(Left_Hand, Right_Hand);

    PawmiRig.childs.push(Torso, Left_Hand, Right_Hand, Left_Foot, Right_Foot, Tail, Head);

    // ▼▼▼ SIMPAN REFERENSI UNTUK ANIMASI ▼▼▼
    PawmiRig.torsoRef = Torso;
    PawmiRig.tailRef = Tail;
    PawmiRig.mouthRef = Head.smileRef;

    PawmiRig.leftHandMove = Left_Hand.MOVE_MATRIX;
    PawmiRig.rightHandMove = Right_Hand.MOVE_MATRIX;
    PawmiRig.headMove = Head.MOVE_MATRIX;   
    // ▲▲▲ SELESAI ▲▲▲

    // Setup buffer Pawmi
    PawmiRig.setup();

    // Posisikan Pawmi di Pulau Tengah (Pulau [1])
    LIBS.set_I4(PawmiRig.POSITION_MATRIX);
    LIBS.translateY(PawmiRig.POSITION_MATRIX, 1.4);   // Naikkan sedikit
    LIBS.translateX(PawmiRig.POSITION_MATRIX, 0.7);   // Posisi X di pulau
    LIBS.translateZ(PawmiRig.POSITION_MATRIX, 0.9);   // Posisi Z di pulau
    LIBS.scale(PawmiRig.POSITION_MATRIX, 0.2, 0.2, 0.2); // Kecilkan Pawmi

    // Tambahkan Pawmi ke daftar render global
    app.actors.push(PawmiRig);
    console.log("--- PAWMI SUKSES DIBUAT ---");
    console.log("Shader yang digunakan:", SHADER_PROGRAM);
    console.log("Jumlah aktor di scene:", app.actors.length);
}

// 4. TUNGGU APLIKASI PULAU DIMUAT, LALU BUAT PAWMI
// ▼▼▼ HAPUS BLOK INI ▼▼▼
/*
window.addEventListener('load', () => {
    // Beri sedikit waktu agar GL selesai inisialisasi
    setTimeout(createPawmi, 100);
});
*/
// ▲▲▲ SELESAI ▲▲▲