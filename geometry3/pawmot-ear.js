import { group } from "./group.js";
import { ellipsoid } from "./ellipsoid.js";
import { ellipticParaboloid } from "./elliptic-paraboloid.js";

export class pawmotEar extends group {
    constructor(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, opts = {}) {
        super(_Mmatrix, _normal);

        // INISIALISASI WARNA
        const PAWMO_ORANGE = [252 / 255, 178 / 255, 98 / 255];
        const PAWMO_GREEN = [70 / 255, 128 / 255, 107 / 255];

        // BUAT OBJEK KUPING DASAR
        const leftOuterEar = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, {
            rx: 0.25, ry: 1.2, rz: 0.5, color: PAWMO_ORANGE
        });
        const rightOuterEar = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, {
            rx: 0.25, ry: 1.2, rz: 0.5, color: PAWMO_ORANGE
        });

        // BUAT OBJEK IJO-IJO KUPING
         const leftInnerEar = new ellipticParaboloid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, {
            a: 0.15, b: 0.05, c: 0.2, color: PAWMO_GREEN, cap: true
        });
        const rightInnerEar = new ellipticParaboloid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, {
            a: 0.15, b: 0.05, c: 0.2, color: PAWMO_GREEN, cap: true
        });

        // BUAT OBJEK TRAGUS KUNING TELINGA
        const leftEarBulb = new ellipticParaboloid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, {
            a: 0.15, b: 0.05, c: 0.2, color: PAWMO_ORANGE, cap: true
        });
        const rightEarBulb = new ellipticParaboloid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, {
            a: 0.15, b: 0.05, c: 0.2, color: PAWMO_ORANGE, cap: true
        });


        // TRANSFORMASI TELINGA
        LIBS.set_I4(leftOuterEar.POSITION_MATRIX);
        LIBS.translateX(leftOuterEar.POSITION_MATRIX, -0.9);
        LIBS.translateY(leftOuterEar.POSITION_MATRIX, 1.2);
        LIBS.translateZ(leftOuterEar.POSITION_MATRIX, 0.2);
        LIBS.rotateY(leftOuterEar.POSITION_MATRIX, LIBS.degToRad(90));
        LIBS.rotateX(leftOuterEar.POSITION_MATRIX, LIBS.degToRad(20));
        LIBS.rotateZ(leftOuterEar.POSITION_MATRIX, LIBS.degToRad(30));

        LIBS.set_I4(rightOuterEar.POSITION_MATRIX);
        LIBS.translateX(rightOuterEar.POSITION_MATRIX, 0.9);
        LIBS.translateY(rightOuterEar.POSITION_MATRIX, 1.2);
        LIBS.translateZ(rightOuterEar.POSITION_MATRIX, 0.2);
        LIBS.rotateY(rightOuterEar.POSITION_MATRIX, LIBS.degToRad(-90));
        LIBS.rotateX(rightOuterEar.POSITION_MATRIX, LIBS.degToRad(20));
        LIBS.rotateZ(rightOuterEar.POSITION_MATRIX, LIBS.degToRad(-30));

        LIBS.set_I4(leftInnerEar.POSITION_MATRIX);
        LIBS.translateX(leftInnerEar.POSITION_MATRIX, -1.1);
        LIBS.translateY(leftInnerEar.POSITION_MATRIX, 1.5);
        LIBS.translateZ(leftInnerEar.POSITION_MATRIX, 1);
        LIBS.rotateY(leftInnerEar.POSITION_MATRIX, LIBS.degToRad(0));
        LIBS.rotateX(leftInnerEar.POSITION_MATRIX, LIBS.degToRad(-160));
        LIBS.rotateZ(leftInnerEar.POSITION_MATRIX, LIBS.degToRad(40));
        LIBS.translateLocal(leftInnerEar.POSITION_MATRIX, 0, 0, 0.4);

        LIBS.set_I4(rightInnerEar.POSITION_MATRIX);
        LIBS.translateX(rightInnerEar.POSITION_MATRIX, 1.1);
        LIBS.translateY(rightInnerEar.POSITION_MATRIX, 1.5);
        LIBS.translateZ(rightInnerEar.POSITION_MATRIX, 1);
        LIBS.rotateY(rightInnerEar.POSITION_MATRIX, LIBS.degToRad(0));
        LIBS.rotateX(rightInnerEar.POSITION_MATRIX, LIBS.degToRad(-160));
        LIBS.rotateZ(rightInnerEar.POSITION_MATRIX, LIBS.degToRad(-40));
        LIBS.translateLocal(rightInnerEar.POSITION_MATRIX, 0, 0, 0.4);

        LIBS.set_I4(leftEarBulb.POSITION_MATRIX);
        LIBS.translateX(leftEarBulb.POSITION_MATRIX, -0.7);
        LIBS.translateY(leftEarBulb.POSITION_MATRIX, 0.7);
        LIBS.translateZ(leftEarBulb.POSITION_MATRIX, 0.8);
        LIBS.rotateY(leftEarBulb.POSITION_MATRIX, LIBS.degToRad(0));
        LIBS.rotateX(leftEarBulb.POSITION_MATRIX, LIBS.degToRad(-160));
        LIBS.rotateZ(leftEarBulb.POSITION_MATRIX, LIBS.degToRad(40));
        LIBS.translateLocal(leftEarBulb.POSITION_MATRIX, 0.15, -0.5, 0.4);

        LIBS.set_I4(rightEarBulb.POSITION_MATRIX);
        LIBS.translateX(rightEarBulb.POSITION_MATRIX, 0.7);
        LIBS.translateY(rightEarBulb.POSITION_MATRIX, 0.7);
        LIBS.translateZ(rightEarBulb.POSITION_MATRIX, 0.8);
        LIBS.rotateY(rightEarBulb.POSITION_MATRIX, LIBS.degToRad(0));
        LIBS.rotateX(rightEarBulb.POSITION_MATRIX, LIBS.degToRad(-160));
        LIBS.rotateZ(rightEarBulb.POSITION_MATRIX, LIBS.degToRad(-40));
        LIBS.translateLocal(rightEarBulb.POSITION_MATRIX, -0.15, -0.5, 0.4);
        
        this.childs.push(leftOuterEar, rightOuterEar, leftInnerEar, rightInnerEar,
            leftEarBulb, rightEarBulb,);
    }
}