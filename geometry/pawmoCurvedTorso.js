// geometry/pawmoCurvedTorso.js (MODIFIKASI UNTUK POSTUR BUNGKUK)
import { group } from "./group.js";
import { pawmoTorsoSegment } from "./pawmoTorsoSegment.js"; // Import segmen

export class pawmoCurvedTorso extends group {
    constructor(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, opts = {}) {
        super(_Mmatrix, _normal);

        const color = opts.color ?? [1, 1, 1];

        // --- Buat 3 Segmen ---
        const segment1 = new pawmoTorsoSegment(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, {
            color: color,
            tStart: 0.0,
            tEnd: 0.4
        });

        const segment2 = new pawmoTorsoSegment(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, {
            color: color,
            tStart: 0.4,
            tEnd: 0.7
        });

        const segment3 = new pawmoTorsoSegment(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, {
            color: color,
            tStart: 0.7,
            tEnd: 1.0
        });

        // --- Posisikan dan Rotasi Segmen ---

        // Segmen 1 (bawah) tetap di origin
        LIBS.set_I4(segment1.POSITION_MATRIX);
        LIBS.translateX(segment1.POSITION_MATRIX, 0.0); // Geser X (kiri/kanan)
        LIBS.translateY(segment1.POSITION_MATRIX, 0.0); // Geser Y (atas/bawah)
        LIBS.translateZ(segment1.POSITION_MATRIX, 0.13); // Geser Z (depan/belakang)
        LIBS.rotateX(segment1.POSITION_MATRIX, LIBS.degToRad(34)); // Miring X (depan/belakang)
        LIBS.rotateY(segment1.POSITION_MATRIX, LIBS.degToRad(0)); // Putar Y (kiri/kanan)
        LIBS.rotateZ(segment1.POSITION_MATRIX, LIBS.degToRad(0)); // Miring Z (samping)

        // Posisikan Segmen 2 di atas Segmen 1
        LIBS.set_I4(segment2.POSITION_MATRIX);
        LIBS.translateY(segment2.POSITION_MATRIX, segment1.endPoint.y); 
        // ▼▼▼ BARU: Miringkan sedikit ke DEPAN ▼▼▼
        LIBS.rotateX(segment2.POSITION_MATRIX, LIBS.degToRad(25)); // Coba 15 derajat

        // Posisikan Segmen 3 di atas Segmen 2
        LIBS.set_I4(segment3.POSITION_MATRIX);
        // Salin transformasi dari segmen 2
        LIBS.mul(segment3.POSITION_MATRIX, segment2.POSITION_MATRIX, segment3.POSITION_MATRIX);
        // Geser ke atas SEPANJANG SUMBU LOKAL segmen 2
        LIBS.translateLocal(segment3.POSITION_MATRIX, 0, segment2.endPoint.y - segment1.endPoint.y, 0);
        // ▼▼▼ BARU: Miringkan LAGI ke DEPAN ▼▼▼
        LIBS.rotateX(segment3.POSITION_MATRIX, LIBS.degToRad(30)); // Coba 20 derajat (total jadi ~35)

        // ▼▼▼ BARU: Simpan referensi ke segmen atas ▼▼▼
        this.topSegment = segment3;
        // ▲▲▲ SELESAI ▲▲▲

        // Tambahkan segmen sebagai anak
        this.childs.push(segment1);
        this.childs.push(segment2);
     
    }

    // ▼▼▼ BARU: Method untuk mendapatkan matriks leher ▼▼▼
    getTopMatrix() {
        return this.topSegment.POSITION_MATRIX;
    }
    // ▲▲▲ SELESAI ▲▲▲
}