import { group } from "./group.js";
import { ellipsoid } from "./ellipsoid.js";

export class pawmotTail extends group {
    // ▼▼▼ PERBAIKI CONSTRUCTOR: Tambahkan '_normal' ▼▼▼
    constructor(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, opts = {}) {
        super(_Mmatrix); 

        const tailColor = opts.color ?? [255/255, 240/255, 170/255];

        // ▼▼▼ PERBAIKI PEMBUATAN CHILD: Teruskan '_normal' ▼▼▼
        const baseSegment = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, {
            rx: 0.6, ry: 0.2, rz: 0.1, color: tailColor
        });
        const middleSegment = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, {
            rx: 0.7, ry: 0.2, rz: 0.1, color: tailColor
        });
        const tipSegment = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, {
            rx: 0.8, ry: 0.3, rz: 0.1, color: tailColor
        });

        // Positioning (tidak berubah)
        LIBS.translateX(baseSegment.POSITION_MATRIX, 0);
        LIBS.translateY(baseSegment.POSITION_MATRIX, 0.3);
        LIBS.rotateZ(baseSegment.POSITION_MATRIX, LIBS.degToRad(30));

        LIBS.translateX(middleSegment.POSITION_MATRIX, 0.6);
        LIBS.translateY(middleSegment.POSITION_MATRIX, 1);
        LIBS.rotateZ(middleSegment.POSITION_MATRIX, LIBS.degToRad(40));

        LIBS.translateX(tipSegment.POSITION_MATRIX, 0.8);
        LIBS.translateY(tipSegment.POSITION_MATRIX, 1.8);
        LIBS.rotateZ(tipSegment.POSITION_MATRIX, LIBS.degToRad(60));
        
        this.childs.push(baseSegment, middleSegment, tipSegment);
    }
}