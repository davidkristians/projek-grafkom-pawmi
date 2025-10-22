// geometry/pawmo-ear.js
import { group } from "./group.js";
import { ellipsoid } from "./ellipsoid.js";

export class pawmoEar extends group {
    // ▼▼▼ DIUBAH: Tambahkan _normal ▼▼▼
    constructor(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, opts = {}) {
        super(_Mmatrix, _normal); // Teruskan _normal ke parent

        const orange = opts.orange ?? [1, 0.5, 0];

        // ▼▼▼ DIUBAH: Teruskan _normal ke anak (ellipsoid) ▼▼▼
        const outerEar = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, {
            rx: 0.3, 
            ry: 0.8, 
            rz: 0.5, 
            color: orange
        });

        this.childs.push(outerEar);
    }
}
