import { group } from "./group.js";
import { ellipsoid } from "./ellipsoid.js";

export class pawmotEar extends group { // Nama kelas tetap pawmoEar agar konsisten
    constructor(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, opts = {}) {
        super(_Mmatrix, _normal); // DIUBAH: Teruskan _normal
        const orange = opts.orange ?? [1, 0.5, 0];

        const outerEar = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, {
            rx: 0.25, ry: 1.2, rz: 0.5, color: orange
        });
        
        this.childs.push(outerEar);
    }
}