// geometry/pawmo-ear.js
import { group } from "./group.js";
import { ellipsoid } from "./ellipsoid.js";

export class pawmoEar extends group {
    // ▼▼▼ TAMBAHKAN _normal dan teruskan ke 'super' ▼▼▼
    constructor(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, opts = {}) {
        super(_Mmatrix, _normal); // BARU

        const orange = opts.orange ?? [1, 0.5, 0];

        // 1. Bagian Luar Telinga (Oranye)
        // ▼▼▼ Tambahkan _normal saat memanggil ellipsoid ▼▼▼
        const outerEar = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, {
            rx: 0.3,   // Lebar
            ry: 0.8,   // Tinggi
            rz: 0.5,   // Kedalaman
            color: orange
        });

        // 2. (Kode innerEar sudah dihapus, ini benar)

        // 3. Tambahkan HANYA outerEar ke dalam grup
        this.childs.push(outerEar);
    }
}