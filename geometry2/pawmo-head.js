import { group } from "./group.js";
import { ellipsoid } from "./ellipsoid.js";
import { pawmoEar } from "./pawmo-ear.js"; 
import { pawmoTuft } from "./pawmo-tuft.js";

export class pawmoHead extends group {
    constructor(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, opts = {}) {
        super(_Mmatrix, _normal); // Teruskan _normal ke parent

        const PAWMO_ORANGE = [236/255, 187/255, 98/255];
        const PAWMO_CREAM = [255/255, 240/255, 200/255];
        const PAWMO_BLACK = [0.1, 0.1, 0.1];
        const PAWMO_YELLOW = [253/255, 225/255, 127/255];
        const PAWMO_WHITE = [1.0, 1.0, 1.0];
        const PAWMO_GREEN = [70/255, 128/255, 107/255];

        const baseHead = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, { rx: 1.2, ry: 1.1, rz: 1.1, color: PAWMO_ORANGE });
        const muzzle = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, { rx: 0.6, ry: 0.45, rz: 0.6, color: PAWMO_CREAM });
        const nose = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, { rx: 0.05, ry: 0.05, rz: 0.05, color: PAWMO_BLACK });
        const leftEye = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, { rx: 0.15, ry: 0.15, rz: 0.15, color: PAWMO_BLACK });
        const rightEye = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, { rx: 0.15, ry: 0.15, rz: 0.15, color: PAWMO_BLACK });
        const leftEyepupil = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, { rx: 0.05, ry: 0.05, rz: 0.01, color: PAWMO_WHITE });
        const rightEyepupil = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, { rx: 0.05, ry: 0.05, rz: 0.01, color: PAWMO_WHITE });
        const mouthLeft = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, { rx: 0.15, ry: 0.02, rz: 0.03, color: PAWMO_BLACK });
        const mouthRight = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, { rx: 0.15, ry: 0.02, rz: 0.03, color: PAWMO_BLACK });
        const leftCheek = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, { rx: 0.25, ry: 0.35, rz: 0.2, color: PAWMO_YELLOW });
        const rightCheek = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, { rx: 0.25, ry: 0.35, rz: 0.2, color: PAWMO_YELLOW });
        
        const leftEar = new pawmoEar(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, { orange: PAWMO_ORANGE });
        const rightEar = new pawmoEar(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, { orange: PAWMO_ORANGE });
        const leftInnerEar = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, { rx: 0.25, ry: 0.6, rz: 0.1, color: PAWMO_GREEN });
        const rightInnerEar = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, { rx: 0.25, ry: 0.6, rz: 0.1, color: PAWMO_GREEN });
        const leftEarBulb = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, { rx: 0.25, ry: 0.4, rz: 0.1, color: PAWMO_ORANGE });
        const rightEarBulb = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, { rx: 0.25, ry: 0.4, rz: 0.1, color: PAWMO_ORANGE });
        const leftEarBulb2 = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, { rx: 0.17, ry: 0.3, rz: 0.1, color: PAWMO_ORANGE });
        const rightEarBulb2 = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, { rx: 0.17, ry: 0.3, rz: 0.1, color: PAWMO_ORANGE });
        
        const headTuft = new pawmoTuft(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, { color: PAWMO_ORANGE });
        const headTuft2 = new pawmoTuft(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, { color: PAWMO_ORANGE });
        
        // --- Positioning ---
        LIBS.set_I4(muzzle.POSITION_MATRIX); LIBS.translateZ(muzzle.POSITION_MATRIX, 0.6); LIBS.translateY(muzzle.POSITION_MATRIX, -0.2);
        LIBS.set_I4(nose.POSITION_MATRIX); LIBS.translateZ(nose.POSITION_MATRIX, 1.2); LIBS.translateY(nose.POSITION_MATRIX, -0.1);
        LIBS.set_I4(leftEye.POSITION_MATRIX); LIBS.translateX(leftEye.POSITION_MATRIX, -0.4); LIBS.translateY(leftEye.POSITION_MATRIX, 0.2); LIBS.translateZ(leftEye.POSITION_MATRIX, 0.9);
        LIBS.set_I4(rightEye.POSITION_MATRIX); LIBS.translateX(rightEye.POSITION_MATRIX, 0.4); LIBS.translateY(rightEye.POSITION_MATRIX, 0.2); LIBS.translateZ(rightEye.POSITION_MATRIX, 0.9);
        LIBS.set_I4(leftEyepupil.POSITION_MATRIX); LIBS.translateX(leftEyepupil.POSITION_MATRIX, -0.4); LIBS.translateY(leftEyepupil.POSITION_MATRIX, 0.2); LIBS.translateZ(leftEyepupil.POSITION_MATRIX, 1.05);
        LIBS.set_I4(rightEyepupil.POSITION_MATRIX); LIBS.translateX(rightEyepupil.POSITION_MATRIX, 0.4); LIBS.translateY(rightEyepupil.POSITION_MATRIX, 0.2); LIBS.translateZ(rightEyepupil.POSITION_MATRIX, 1.05);
        LIBS.set_I4(mouthLeft.POSITION_MATRIX); LIBS.translateY(mouthLeft.POSITION_MATRIX, -0.3); LIBS.translateX(mouthLeft.POSITION_MATRIX, -0.1); LIBS.translateZ(mouthLeft.POSITION_MATRIX, 1.2); LIBS.rotateZ(mouthLeft.POSITION_MATRIX, LIBS.degToRad(-20));
        LIBS.set_I4(mouthRight.POSITION_MATRIX); LIBS.translateY(mouthRight.POSITION_MATRIX, -0.3); LIBS.translateX(mouthRight.POSITION_MATRIX, 0.1); LIBS.translateZ(mouthRight.POSITION_MATRIX, 1.2); LIBS.rotateZ(mouthRight.POSITION_MATRIX, LIBS.degToRad(20));
        LIBS.set_I4(leftCheek.POSITION_MATRIX); LIBS.translateX(leftCheek.POSITION_MATRIX, -0.8); LIBS.translateZ(leftCheek.POSITION_MATRIX, 0.65); LIBS.translateY(leftCheek.POSITION_MATRIX, -0.12); LIBS.rotateY(leftCheek.POSITION_MATRIX, LIBS.degToRad(-55));
        LIBS.set_I4(rightCheek.POSITION_MATRIX); LIBS.translateX(rightCheek.POSITION_MATRIX, 0.8); LIBS.translateZ(rightCheek.POSITION_MATRIX, 0.65); LIBS.translateY(rightCheek.POSITION_MATRIX, -0.12); LIBS.rotateY(rightCheek.POSITION_MATRIX, LIBS.degToRad(55));
        LIBS.set_I4(leftEar.POSITION_MATRIX); LIBS.translateX(leftEar.POSITION_MATRIX, -0.9); LIBS.translateY(leftEar.POSITION_MATRIX, 1.2); LIBS.translateZ(leftEar.POSITION_MATRIX, 0.2); LIBS.rotateY(leftEar.POSITION_MATRIX, LIBS.degToRad(90)); LIBS.rotateX(leftEar.POSITION_MATRIX, LIBS.degToRad(20)); LIBS.rotateZ(leftEar.POSITION_MATRIX, LIBS.degToRad(30));
        LIBS.set_I4(leftInnerEar.POSITION_MATRIX); LIBS.translateX(leftInnerEar.POSITION_MATRIX, -0.9); LIBS.translateY(leftInnerEar.POSITION_MATRIX, 1.2); LIBS.translateZ(leftInnerEar.POSITION_MATRIX, 0.02); LIBS.rotateY(leftInnerEar.POSITION_MATRIX, LIBS.degToRad(0)); LIBS.rotateX(leftInnerEar.POSITION_MATRIX, LIBS.degToRad(20)); LIBS.rotateZ(leftInnerEar.POSITION_MATRIX, LIBS.degToRad(30));
        LIBS.translateLocal(leftInnerEar.POSITION_MATRIX, 0, 0, 0.4);
        LIBS.set_I4(rightEar.POSITION_MATRIX); LIBS.translateX(rightEar.POSITION_MATRIX, 0.9); LIBS.translateY(rightEar.POSITION_MATRIX, 1.2); LIBS.translateZ(rightEar.POSITION_MATRIX, 0.2); LIBS.rotateY(rightEar.POSITION_MATRIX, LIBS.degToRad(-90)); LIBS.rotateX(rightEar.POSITION_MATRIX, LIBS.degToRad(20)); LIBS.rotateZ(rightEar.POSITION_MATRIX, LIBS.degToRad(-30));
        LIBS.set_I4(rightInnerEar.POSITION_MATRIX); LIBS.translateX(rightInnerEar.POSITION_MATRIX, 0.9); LIBS.translateY(rightInnerEar.POSITION_MATRIX, 1.2); LIBS.translateZ(rightInnerEar.POSITION_MATRIX, 0.02); LIBS.rotateY(rightInnerEar.POSITION_MATRIX, LIBS.degToRad(0)); LIBS.rotateX(rightInnerEar.POSITION_MATRIX, LIBS.degToRad(20)); LIBS.rotateZ(rightInnerEar.POSITION_MATRIX, LIBS.degToRad(-30));
        LIBS.translateLocal(rightInnerEar.POSITION_MATRIX, 0, 0, 0.4);
        LIBS.set_I4(leftEarBulb.POSITION_MATRIX); LIBS.translateX(leftEarBulb.POSITION_MATRIX, -1.15); LIBS.translateY(leftEarBulb.POSITION_MATRIX, 1.2); LIBS.translateZ(leftEarBulb.POSITION_MATRIX, 0.45); LIBS.rotateY(leftEarBulb.POSITION_MATRIX, LIBS.degToRad(0)); LIBS.rotateX(leftEarBulb.POSITION_MATRIX, LIBS.degToRad(33)); LIBS.rotateZ(leftEarBulb.POSITION_MATRIX, LIBS.degToRad(40));
        LIBS.translateLocal(leftEarBulb.POSITION_MATRIX, 0.15, -0.5, 0.4);
        LIBS.set_I4(rightEarBulb.POSITION_MATRIX); LIBS.translateX(rightEarBulb.POSITION_MATRIX, 1.15); LIBS.translateY(rightEarBulb.POSITION_MATRIX, 1.2); LIBS.translateZ(rightEarBulb.POSITION_MATRIX, 0.45); LIBS.rotateY(rightEarBulb.POSITION_MATRIX, LIBS.degToRad(0)); LIBS.rotateX(rightEarBulb.POSITION_MATRIX, LIBS.degToRad(33)); LIBS.rotateZ(rightEarBulb.POSITION_MATRIX, LIBS.degToRad(-40));
        LIBS.translateLocal(rightEarBulb.POSITION_MATRIX, -0.15, -0.5, 0.4);
        LIBS.set_I4(leftEarBulb2.POSITION_MATRIX); LIBS.translateX(leftEarBulb2.POSITION_MATRIX, -2); LIBS.translateY(leftEarBulb2.POSITION_MATRIX, 0.5); LIBS.translateZ(leftEarBulb2.POSITION_MATRIX, 0.65); LIBS.rotateY(leftEarBulb2.POSITION_MATRIX, LIBS.degToRad(0)); LIBS.rotateX(leftEarBulb2.POSITION_MATRIX, LIBS.degToRad(33)); LIBS.rotateZ(leftEarBulb2.POSITION_MATRIX, LIBS.degToRad(90));
        LIBS.translateLocal(leftEarBulb2.POSITION_MATRIX, 0.15, -1, 0.6);
        LIBS.set_I4(rightEarBulb2.POSITION_MATRIX); LIBS.translateX(rightEarBulb2.POSITION_MATRIX, 2); LIBS.translateY(rightEarBulb2.POSITION_MATRIX, 0.5); LIBS.translateZ(rightEarBulb2.POSITION_MATRIX, 0.6); LIBS.rotateY(rightEarBulb2.POSITION_MATRIX, LIBS.degToRad(0)); LIBS.rotateX(rightEarBulb2.POSITION_MATRIX, LIBS.degToRad(33)); LIBS.rotateZ(rightEarBulb2.POSITION_MATRIX, LIBS.degToRad(-90));
        LIBS.translateLocal(rightEarBulb2.POSITION_MATRIX, -0.15, -1, 0.65);
        LIBS.set_I4(headTuft.POSITION_MATRIX); LIBS.translateX(headTuft.POSITION_MATRIX, 0); LIBS.translateY(headTuft.POSITION_MATRIX, 1); LIBS.translateZ(headTuft.POSITION_MATRIX, 0.4); LIBS.rotateX(headTuft.POSITION_MATRIX, LIBS.degToRad(30)); LIBS.rotateY(headTuft.POSITION_MATRIX, LIBS.degToRad(10)); LIBS.rotateZ(headTuft.POSITION_MATRIX, LIBS.degToRad(-30));
        LIBS.set_I4(headTuft2.POSITION_MATRIX); LIBS.scale(headTuft2.POSITION_MATRIX, 0.5, 0.5, 0.5); LIBS.translateX(headTuft2.POSITION_MATRIX, 0.1); LIBS.translateY(headTuft2.POSITION_MATRIX, 1.3); LIBS.translateZ(headTuft2.POSITION_MATRIX, 0.5); LIBS.rotateX(headTuft2.POSITION_MATRIX, LIBS.degToRad(30)); LIBS.rotateY(headTuft2.POSITION_MATRIX, LIBS.degToRad(10)); LIBS.rotateZ(headTuft2.POSITION_MATRIX, LIBS.degToRad(-20));

        // Push isi di kepala
        this.childs.push(
            baseHead, muzzle, nose, leftEye, rightEye, mouthLeft, mouthRight, 
            leftCheek, rightCheek, leftEyepupil, rightEyepupil,
            leftEar, rightEar, leftInnerEar, rightInnerEar,
            leftEarBulb, rightEarBulb,leftEarBulb2, rightEarBulb2,
            headTuft, headTuft2
        );
        
        this.smileRef = new group(_Mmatrix, _normal);
        this.smileRef.childs.push(mouthLeft, mouthRight);
    }
}
