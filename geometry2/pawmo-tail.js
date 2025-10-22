// geometry2/pawmo-tail.js
import { group } from "./group.js";
import { ellipsoid } from "./ellipsoid.js"; // Pastikan ellipsoid sudah di-upgrade

export class pawmoTail extends group {
    // ▼▼▼ DIUBAH: Tambahkan _normal ▼▼▼
    constructor(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, opts = {}) {
        super(_Mmatrix, _normal); // Teruskan _normal ke parent

        const tailColor = opts.color ?? [255/255, 240/255, 170/255];

        // ▼▼▼ DIUBAH: Teruskan _normal ke SEMUA anak (ellipsoid) ▼▼▼
        const baseSegment = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, {
            rx: 0.6, ry: 0.2, rz: 0.4,
            color: tailColor
        });

        const middleSegment = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, {
            rx: 0.4, ry: 0.2, rz: 0.35,
            color: tailColor
        });

        const tipSegment = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, {
            rx: 0.5, ry: 0.2, rz: 0.3,
            color: tailColor
        });

        // Positioning (SAMA PERSIS)
        LIBS.translateX(middleSegment.POSITION_MATRIX, 0.4);
        LIBS.translateY(middleSegment.POSITION_MATRIX, 0.25);
        LIBS.translateX(tipSegment.POSITION_MATRIX, 0.6);
        LIBS.translateY(tipSegment.POSITION_MATRIX, 0.5);

        this.childs.push(baseSegment, middleSegment, tipSegment);
    }
    // setup() dan render() diwarisi dari group.js
}