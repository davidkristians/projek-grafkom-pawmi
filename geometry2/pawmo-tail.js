// geometry/pawmo-tail.js
import { group } from "./group.js";
import { ellipsoid } from "./ellipsoid.js";

export class pawmoTail extends group {
    // ▼▼▼ TAMBAHKAN _normal dan teruskan ke 'super' & anak ▼▼▼
    constructor(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, opts = {}) {
        super(_Mmatrix, _normal); // BARU

        const tailColor = opts.color ?? [255 / 255, 240 / 255, 170 / 255];

        const baseSegment = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, {
           rx: 0.7, ry: 0.2, rz: 0.35,
            color: tailColor
        });

        const middleSegment = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, {
           
            rx: 1, ry: 0.2, rz: 0.4,
            color: tailColor
        });

        //         const tipSegment = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, {
        //             rx: 0.5, ry: 0.2, rz: 0.3,
        //             color: tailColor
        //         });

        // (Kode positioning tetap sama)
        LIBS.translateX(middleSegment.POSITION_MATRIX, 0.05);
        LIBS.translateY(middleSegment.POSITION_MATRIX, 1.3);
        LIBS.rotateZ(middleSegment.POSITION_MATRIX, LIBS.degToRad(60));
        LIBS.rotateY(middleSegment.POSITION_MATRIX, LIBS.degToRad(0));
        LIBS.rotateX(middleSegment.POSITION_MATRIX, LIBS.degToRad(0));

        LIBS.translateX(baseSegment.POSITION_MATRIX, 0.0);
        LIBS.translateY(baseSegment.POSITION_MATRIX, 0.6);
        LIBS.rotateZ(baseSegment.POSITION_MATRIX, LIBS.degToRad(40));
        LIBS.rotateY(baseSegment.POSITION_MATRIX, LIBS.degToRad(0));
        LIBS.rotateX(baseSegment.POSITION_MATRIX, LIBS.degToRad(0));
        //         LIBS.translateX(tipSegment.POSITION_MATRIX, 0.6);
        //         LIBS.translateY(tipSegment.POSITION_MATRIX, 0.5);

        this.childs.push(baseSegment);
        this.childs.push(middleSegment);
        //         this.childs.push(tipSegment);
    }
}