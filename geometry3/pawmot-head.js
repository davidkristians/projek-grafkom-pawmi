import { group } from "./group.js";
import { ellipsoid } from "./ellipsoid.js";
import { pawmotEar } from "./pawmot-ear.js";
import { pawmotTuft } from "./pawmot-tuft.js";

export class pawmotHead extends group {
    constructor(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, opts = {}) {
        super(_Mmatrix, _normal);
        
        const PAWMO_ORANGE = [252/255, 178/255, 98/255];
        const PAWMO_CREAM = [255/255, 240/255, 200/255];
        const PAWMO_BLACK = [0.1, 0.1, 0.1];
        const PAWMO_YELLOW = [253/255, 225/255, 127/255];
        const PAWMO_WHITE = [1.0, 1.0, 1.0];
        const PAWMO_GREEN = [70 / 255, 128 / 255, 107 / 255];
        const MOUTH_COLOR = [0.2, 0.1, 0.1];
        
        const baseHead = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, { rx: 1.2, ry: 1.1, rz: 1.1, color: PAWMO_ORANGE });
        const muzzle = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, { rx: 0.5, ry: 0.35, rz: 0.09, color: PAWMO_CREAM });
        const nose = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, { rx: 0.05, ry: 0.05, rz: 0.05, color: PAWMO_BLACK });
        const leftEye = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, { rx: 0.2, ry: 0.2, rz: 0.15, color: PAWMO_BLACK });
        const rightEye = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, { rx: 0.2, ry: 0.2, rz: 0.15, color: PAWMO_BLACK });
        const leftEyepupil = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, { rx: 0.07, ry: 0.07, rz: 0.01, color: PAWMO_WHITE });
        const rightEyepupil = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, { rx: 0.07, ry: 0.07, rz: 0.01, color: PAWMO_WHITE });
        const mouthOpen = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, { rx: 0.2, ry: 0.15, rz: 0.05, color: MOUTH_COLOR });
        const leftCheek = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, { rx: 0.35, ry: 0.35, rz: 0.1, color: PAWMO_YELLOW });
        const rightCheek = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, { rx: 0.35, ry: 0.35, rz: 0.1, color: PAWMO_YELLOW });
        const leftEar = new pawmotEar(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, { orange: PAWMO_ORANGE });
        const rightEar = new pawmotEar(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, { orange: PAWMO_ORANGE });
        const leftInnerEar = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, { rx: 0.25, ry: 0.6, rz: 0.1, color: PAWMO_GREEN });
        const rightInnerEar = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, { rx: 0.25, ry: 0.6, rz: 0.1, color: PAWMO_GREEN });
        const leftEarBulb = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, { rx: 0.25, ry: 0.4, rz: 0.1, color: PAWMO_ORANGE });
        const rightEarBulb = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, { rx: 0.25, ry: 0.4, rz: 0.1, color: PAWMO_ORANGE });
        const tuftCenter = new pawmotTuft(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, { color: PAWMO_ORANGE });
        const tuftLeft1 = new pawmotTuft(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, { color: PAWMO_ORANGE });
        const tuftLeft2 = new pawmotTuft(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, { color: PAWMO_ORANGE });
        const tuftRight1 = new pawmotTuft(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, { color: PAWMO_ORANGE });
        const tuftRight2 = new pawmotTuft(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, { color: PAWMO_ORANGE });
        const tuftGroup = new group(_Mmatrix, _normal);

        LIBS.set_I4(muzzle.POSITION_MATRIX); LIBS.translateZ(muzzle.POSITION_MATRIX, 1); LIBS.translateY(muzzle.POSITION_MATRIX, -0.2); LIBS.rotateX(muzzle.POSITION_MATRIX, LIBS.degToRad(13));
        LIBS.set_I4(nose.POSITION_MATRIX); LIBS.translateZ(nose.POSITION_MATRIX, 1.1); LIBS.translateY(nose.POSITION_MATRIX, 0.01);
        LIBS.set_I4(leftEye.POSITION_MATRIX); LIBS.translateX(leftEye.POSITION_MATRIX, -0.4); LIBS.translateY(leftEye.POSITION_MATRIX, 0.2); LIBS.translateZ(leftEye.POSITION_MATRIX, 0.9);
        LIBS.set_I4(rightEye.POSITION_MATRIX); LIBS.translateX(rightEye.POSITION_MATRIX, 0.4); LIBS.translateY(rightEye.POSITION_MATRIX, 0.2); LIBS.translateZ(rightEye.POSITION_MATRIX, 0.9);
        LIBS.set_I4(leftEyepupil.POSITION_MATRIX); LIBS.translateX(leftEyepupil.POSITION_MATRIX, -0.4); LIBS.translateY(leftEyepupil.POSITION_MATRIX, 0.25); LIBS.translateZ(leftEyepupil.POSITION_MATRIX, 1.04); LIBS.rotateY(leftEyepupil.POSITION_MATRIX, LIBS.degToRad(5)); LIBS.rotateX(leftEyepupil.POSITION_MATRIX, LIBS.degToRad(-15));
        LIBS.set_I4(rightEyepupil.POSITION_MATRIX); LIBS.translateX(rightEyepupil.POSITION_MATRIX, 0.5); LIBS.translateY(rightEyepupil.POSITION_MATRIX, 0.25); LIBS.translateZ(rightEyepupil.POSITION_MATRIX, 1.02); LIBS.rotateY(rightEyepupil.POSITION_MATRIX, LIBS.degToRad(20)); LIBS.rotateX(rightEyepupil.POSITION_MATRIX, LIBS.degToRad(-15));
        LIBS.set_I4(mouthOpen.POSITION_MATRIX); LIBS.translateY(mouthOpen.POSITION_MATRIX, -0.25); LIBS.translateZ(mouthOpen.POSITION_MATRIX, 1.1); LIBS.rotateX(mouthOpen.POSITION_MATRIX, LIBS.degToRad(20));
        LIBS.set_I4(leftCheek.POSITION_MATRIX); LIBS.translateX(leftCheek.POSITION_MATRIX, -0.8); LIBS.translateZ(leftCheek.POSITION_MATRIX, 0.7); LIBS.translateY(leftCheek.POSITION_MATRIX, -0.12); LIBS.rotateY(leftCheek.POSITION_MATRIX, LIBS.degToRad(-45)); LIBS.rotateZ(leftCheek.POSITION_MATRIX, LIBS.degToRad(10));
        LIBS.set_I4(rightCheek.POSITION_MATRIX); LIBS.translateX(rightCheek.POSITION_MATRIX, 0.8); LIBS.translateZ(rightCheek.POSITION_MATRIX, 0.7); LIBS.translateY(rightCheek.POSITION_MATRIX, -0.12); LIBS.rotateY(rightCheek.POSITION_MATRIX, LIBS.degToRad(45)); LIBS.rotateZ(rightCheek.POSITION_MATRIX, LIBS.degToRad(-10));
        LIBS.set_I4(leftEar.POSITION_MATRIX); LIBS.translateX(leftEar.POSITION_MATRIX, -0.9); LIBS.translateY(leftEar.POSITION_MATRIX, 1.2); LIBS.translateZ(leftEar.POSITION_MATRIX, 0.2); LIBS.rotateY(leftEar.POSITION_MATRIX, LIBS.degToRad(90)); LIBS.rotateX(leftEar.POSITION_MATRIX, LIBS.degToRad(20)); LIBS.rotateZ(leftEar.POSITION_MATRIX, LIBS.degToRad(30));
        LIBS.set_I4(leftInnerEar.POSITION_MATRIX); LIBS.translateX(leftInnerEar.POSITION_MATRIX, -0.9); LIBS.translateY(leftInnerEar.POSITION_MATRIX, 1.2); LIBS.translateZ(leftInnerEar.POSITION_MATRIX, 0); LIBS.rotateY(leftInnerEar.POSITION_MATRIX, LIBS.degToRad(0)); LIBS.rotateX(leftInnerEar.POSITION_MATRIX, LIBS.degToRad(20)); LIBS.rotateZ(leftInnerEar.POSITION_MATRIX, LIBS.degToRad(30)); LIBS.translateLocal(leftInnerEar.POSITION_MATRIX, 0, 0, 0.4);
        LIBS.set_I4(rightEar.POSITION_MATRIX); LIBS.translateX(rightEar.POSITION_MATRIX, 0.9); LIBS.translateY(rightEar.POSITION_MATRIX, 1.2); LIBS.translateZ(rightEar.POSITION_MATRIX, 0.2); LIBS.rotateY(rightEar.POSITION_MATRIX, LIBS.degToRad(-90)); LIBS.rotateX(rightEar.POSITION_MATRIX, LIBS.degToRad(20)); LIBS.rotateZ(rightEar.POSITION_MATRIX, LIBS.degToRad(-30));
        LIBS.set_I4(rightInnerEar.POSITION_MATRIX); LIBS.translateX(rightInnerEar.POSITION_MATRIX, 0.9); LIBS.translateY(rightInnerEar.POSITION_MATRIX, 1.2); LIBS.translateZ(rightInnerEar.POSITION_MATRIX, 0); LIBS.rotateY(rightInnerEar.POSITION_MATRIX, LIBS.degToRad(0)); LIBS.rotateX(rightInnerEar.POSITION_MATRIX, LIBS.degToRad(20)); LIBS.rotateZ(rightInnerEar.POSITION_MATRIX, LIBS.degToRad(-30)); LIBS.translateLocal(rightInnerEar.POSITION_MATRIX, 0, 0, 0.4);
        LIBS.set_I4(leftEarBulb.POSITION_MATRIX); LIBS.translateX(leftEarBulb.POSITION_MATRIX, -1.15); LIBS.translateY(leftEarBulb.POSITION_MATRIX, 1.2); LIBS.translateZ(leftEarBulb.POSITION_MATRIX, 0.20); LIBS.rotateY(leftEarBulb.POSITION_MATRIX, LIBS.degToRad(0)); LIBS.rotateX(leftEarBulb.POSITION_MATRIX, LIBS.degToRad(33)); LIBS.rotateZ(leftEarBulb.POSITION_MATRIX, LIBS.degToRad(40)); LIBS.translateLocal(leftEarBulb.POSITION_MATRIX, 0.15, -0.5, 0.4);
        LIBS.set_I4(rightEarBulb.POSITION_MATRIX); LIBS.translateX(rightEarBulb.POSITION_MATRIX, 1.15); LIBS.translateY(rightEarBulb.POSITION_MATRIX, 1.2); LIBS.translateZ(rightEarBulb.POSITION_MATRIX, 0.20); LIBS.rotateY(rightEarBulb.POSITION_MATRIX, LIBS.degToRad(0)); LIBS.rotateX(rightEarBulb.POSITION_MATRIX, LIBS.degToRad(33)); LIBS.rotateZ(rightEarBulb.POSITION_MATRIX, LIBS.degToRad(-40)); LIBS.translateLocal(rightEarBulb.POSITION_MATRIX, -0.15, -0.5, 0.4);
        LIBS.set_I4(tuftCenter.POSITION_MATRIX); LIBS.translateY(tuftCenter.POSITION_MATRIX, 1.2); LIBS.translateZ(tuftCenter.POSITION_MATRIX, 0.85); LIBS.rotateX(tuftCenter.POSITION_MATRIX, LIBS.degToRad(-15)); LIBS.scale(tuftCenter.POSITION_MATRIX, 1.1, 1.1, 1.1);
        LIBS.set_I4(tuftLeft1.POSITION_MATRIX); LIBS.translateX(tuftLeft1.POSITION_MATRIX, -0.2); LIBS.translateY(tuftLeft1.POSITION_MATRIX, 1); LIBS.translateZ(tuftLeft1.POSITION_MATRIX, 1); LIBS.rotateZ(tuftLeft1.POSITION_MATRIX, LIBS.degToRad(20)); LIBS.rotateY(tuftLeft1.POSITION_MATRIX, LIBS.degToRad(-15)); LIBS.rotateX(tuftLeft1.POSITION_MATRIX, LIBS.degToRad(10));
        LIBS.set_I4(tuftRight1.POSITION_MATRIX); LIBS.translateX(tuftRight1.POSITION_MATRIX, 0.2); LIBS.translateY(tuftRight1.POSITION_MATRIX, 1); LIBS.translateZ(tuftRight1.POSITION_MATRIX, 1); LIBS.rotateZ(tuftRight1.POSITION_MATRIX, LIBS.degToRad(-20)); LIBS.rotateY(tuftRight1.POSITION_MATRIX, LIBS.degToRad(15)); LIBS.rotateX(tuftRight1.POSITION_MATRIX, LIBS.degToRad(10));
        LIBS.set_I4(tuftLeft2.POSITION_MATRIX); LIBS.translateX(tuftLeft2.POSITION_MATRIX, -0.5); LIBS.translateY(tuftLeft2.POSITION_MATRIX, 1); LIBS.translateZ(tuftLeft2.POSITION_MATRIX, 0.9); LIBS.rotateZ(tuftLeft2.POSITION_MATRIX, LIBS.degToRad(45)); LIBS.rotateY(tuftLeft2.POSITION_MATRIX, LIBS.degToRad(-15)); LIBS.scale(tuftLeft2.POSITION_MATRIX, 0.8, 0.8, 0.8);
        LIBS.set_I4(tuftRight2.POSITION_MATRIX); LIBS.translateX(tuftRight2.POSITION_MATRIX, 0.5); LIBS.translateY(tuftRight2.POSITION_MATRIX, 1); LIBS.translateZ(tuftRight2.POSITION_MATRIX, 0.9); LIBS.rotateZ(tuftRight2.POSITION_MATRIX, LIBS.degToRad(-45)); LIBS.rotateY(tuftRight2.POSITION_MATRIX, LIBS.degToRad(15)); LIBS.scale(tuftRight2.POSITION_MATRIX, 0.8, 0.8, 0.8);

        tuftGroup.childs.push(tuftCenter, tuftLeft1, tuftRight1, tuftLeft2, tuftRight2);

        this.childs.push(
            baseHead, muzzle, nose, leftEye, rightEye, mouthOpen, 
            leftCheek, rightCheek, leftEyepupil, rightEyepupil,
            leftEar, rightEar, leftInnerEar, rightInnerEar,
            leftEarBulb, rightEarBulb,
            tuftGroup
        );

        // ▼▼▼ PERBAIKAN: Buat smileRef untuk kompatibilitas animasi ▼▼▼
        this.smileRef = mouthOpen;
        this.tuftRef = tuftGroup;
    }
}