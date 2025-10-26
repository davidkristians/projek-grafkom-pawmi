import { group } from "./group.js";
import { ellipsoid } from "./ellipsoid.js";
import { pawmotEar } from "./pawmot-ear.js";
import { pawmotTuft } from "./pawmot-tuft.js";
import { ellipticParaboloid } from "./elliptic-paraboloid.js";

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
        
        // BUAT OBJEK DASAR KEPALA
        const baseHead = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, {
            rx: 1.2, ry: 1.1, rz: 1.1, color: PAWMO_ORANGE
        });

        // BUAT OBJEK MONCONG
        const muzzle = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, {
            rx: 0.5, ry: 0.35, rz: 0.09, color: PAWMO_CREAM
        });

        // BUAT OBJEK HIDUNG
        const nose = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, {
            rx: 0.05, ry: 0.05, rz: 0.05, color: PAWMO_BLACK
        });

        // BUAT OBJEK MATA
        const leftEye = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, {
            rx: 0.2, ry: 0.2, rz: 0.15, color: PAWMO_BLACK
        });
        const rightEye = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, {
            rx: 0.2, ry: 0.2, rz: 0.15, color: PAWMO_BLACK
        });
        const leftEyepupil = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, {
            rx: 0.07, ry: 0.07, rz: 0.01, color: PAWMO_WHITE
        });
        const rightEyepupil = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, {
            rx: 0.07, ry: 0.07, rz: 0.01, color: PAWMO_WHITE
        });

        // BUAT OBJEK MULUT
        const mouthOpen = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, {
            rx: 0.2, ry: 0.15, rz: 0.05, color: MOUTH_COLOR
        });

        // BUAT OBJEK PIPI
        const leftCheek = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, {
            rx: 0.35, ry: 0.35, rz: 0.1, color: PAWMO_YELLOW
        });
        const rightCheek = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, {
            rx: 0.35, ry: 0.35, rz: 0.1, color: PAWMO_YELLOW
        });

        // BUAT OBJEK TELINGA
        const Ear = new pawmotEar(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, {
            orange: PAWMO_ORANGE
        });


        // BUAT OBJEK TUFT
        const tuftCenter = new pawmotTuft(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, {
            color: PAWMO_ORANGE
        });
        const tuftLeft1 = new pawmotTuft(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, {
            color: PAWMO_ORANGE
        });
        const tuftLeft2 = new pawmotTuft(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, {
            color: PAWMO_ORANGE
        });
        const tuftRight1 = new pawmotTuft(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, {
            color: PAWMO_ORANGE
        });
        const tuftRight2 = new pawmotTuft(GL, SHADER_PROGRAM, _position, _color, _normal, _Mmatrix, {
            color: PAWMO_ORANGE
        });
        const tuftGroup = new group(_Mmatrix, _normal);

        // ======BAGIAN TRANSFORMASI======
        // TRANSFORMASI MONCONG
        LIBS.set_I4(muzzle.POSITION_MATRIX);
        LIBS.translateZ(muzzle.POSITION_MATRIX, 1);
        LIBS.translateY(muzzle.POSITION_MATRIX, -0.2);
        LIBS.rotateX(muzzle.POSITION_MATRIX, LIBS.degToRad(13));

        // TRANSFORMASI HIDUNG
        LIBS.set_I4(nose.POSITION_MATRIX);
        LIBS.translateZ(nose.POSITION_MATRIX, 1.1);
        LIBS.translateY(nose.POSITION_MATRIX, 0.01);

        // TRANSFORMASI MATA
        LIBS.set_I4(leftEye.POSITION_MATRIX);
        LIBS.translateX(leftEye.POSITION_MATRIX, -0.4);
        LIBS.translateY(leftEye.POSITION_MATRIX, 0.2);
        LIBS.translateZ(leftEye.POSITION_MATRIX, 0.9);

        LIBS.set_I4(rightEye.POSITION_MATRIX);
        LIBS.translateX(rightEye.POSITION_MATRIX, 0.4);
        LIBS.translateY(rightEye.POSITION_MATRIX, 0.2);
        LIBS.translateZ(rightEye.POSITION_MATRIX, 0.9);

        LIBS.set_I4(leftEyepupil.POSITION_MATRIX);
        LIBS.translateX(leftEyepupil.POSITION_MATRIX, -0.4);
        LIBS.translateY(leftEyepupil.POSITION_MATRIX, 0.25);
        LIBS.translateZ(leftEyepupil.POSITION_MATRIX, 1.04);
        LIBS.rotateY(leftEyepupil.POSITION_MATRIX, LIBS.degToRad(5));
        LIBS.rotateX(leftEyepupil.POSITION_MATRIX, LIBS.degToRad(-15));

        LIBS.set_I4(rightEyepupil.POSITION_MATRIX);
        LIBS.translateX(rightEyepupil.POSITION_MATRIX, 0.5);
        LIBS.translateY(rightEyepupil.POSITION_MATRIX, 0.25);
        LIBS.translateZ(rightEyepupil.POSITION_MATRIX, 1.02);
        LIBS.rotateY(rightEyepupil.POSITION_MATRIX, LIBS.degToRad(20));
        LIBS.rotateX(rightEyepupil.POSITION_MATRIX, LIBS.degToRad(-15));

        // TRANSFORMASI MULUT
        LIBS.set_I4(mouthOpen.POSITION_MATRIX);
        LIBS.translateY(mouthOpen.POSITION_MATRIX, -0.25);
        LIBS.translateZ(mouthOpen.POSITION_MATRIX, 1.1);
        LIBS.rotateX(mouthOpen.POSITION_MATRIX, LIBS.degToRad(20));

        // TRANSFORMASI PIPI
        LIBS.set_I4(leftCheek.POSITION_MATRIX);
        LIBS.translateX(leftCheek.POSITION_MATRIX, -0.8);
        LIBS.translateZ(leftCheek.POSITION_MATRIX, 0.7);
        LIBS.translateY(leftCheek.POSITION_MATRIX, -0.12);
        LIBS.rotateY(leftCheek.POSITION_MATRIX, LIBS.degToRad(-45));
        LIBS.rotateZ(leftCheek.POSITION_MATRIX, LIBS.degToRad(10));

        LIBS.set_I4(rightCheek.POSITION_MATRIX);
        LIBS.translateX(rightCheek.POSITION_MATRIX, 0.8);
        LIBS.translateZ(rightCheek.POSITION_MATRIX, 0.7);
        LIBS.translateY(rightCheek.POSITION_MATRIX, -0.12);
        LIBS.rotateY(rightCheek.POSITION_MATRIX, LIBS.degToRad(45));
        LIBS.rotateZ(rightCheek.POSITION_MATRIX, LIBS.degToRad(-10));


        // TRANSFORMASI TUFT
        LIBS.set_I4(tuftCenter.POSITION_MATRIX);
        LIBS.translateY(tuftCenter.POSITION_MATRIX, 1.2);
        LIBS.translateZ(tuftCenter.POSITION_MATRIX, 0.85);
        LIBS.rotateX(tuftCenter.POSITION_MATRIX, LIBS.degToRad(-15));
        LIBS.scale(tuftCenter.POSITION_MATRIX, 1.1, 1.1, 1.1);

        LIBS.set_I4(tuftLeft1.POSITION_MATRIX);
        LIBS.translateX(tuftLeft1.POSITION_MATRIX, -0.2);
        LIBS.translateY(tuftLeft1.POSITION_MATRIX, 1);
        LIBS.translateZ(tuftLeft1.POSITION_MATRIX, 1);
        LIBS.rotateZ(tuftLeft1.POSITION_MATRIX, LIBS.degToRad(20));
        LIBS.rotateY(tuftLeft1.POSITION_MATRIX, LIBS.degToRad(-15));
        LIBS.rotateX(tuftLeft1.POSITION_MATRIX, LIBS.degToRad(10));

        LIBS.set_I4(tuftRight1.POSITION_MATRIX);
        LIBS.translateX(tuftRight1.POSITION_MATRIX, 0.2);
        LIBS.translateY(tuftRight1.POSITION_MATRIX, 1);
        LIBS.translateZ(tuftRight1.POSITION_MATRIX, 1);
        LIBS.rotateZ(tuftRight1.POSITION_MATRIX, LIBS.degToRad(-20));
        LIBS.rotateY(tuftRight1.POSITION_MATRIX, LIBS.degToRad(15));
        LIBS.rotateX(tuftRight1.POSITION_MATRIX, LIBS.degToRad(10));

        LIBS.set_I4(tuftLeft2.POSITION_MATRIX);
        LIBS.translateX(tuftLeft2.POSITION_MATRIX, -0.5);
        LIBS.translateY(tuftLeft2.POSITION_MATRIX, 1);
        LIBS.translateZ(tuftLeft2.POSITION_MATRIX, 0.9);
        LIBS.rotateZ(tuftLeft2.POSITION_MATRIX, LIBS.degToRad(45));
        LIBS.rotateY(tuftLeft2.POSITION_MATRIX, LIBS.degToRad(-15));
        LIBS.scale(tuftLeft2.POSITION_MATRIX, 0.8, 0.8, 0.8);

        LIBS.set_I4(tuftRight2.POSITION_MATRIX);
        LIBS.translateX(tuftRight2.POSITION_MATRIX, 0.5);
        LIBS.translateY(tuftRight2.POSITION_MATRIX, 1);
        LIBS.translateZ(tuftRight2.POSITION_MATRIX, 0.9);
        LIBS.rotateZ(tuftRight2.POSITION_MATRIX, LIBS.degToRad(-45));
        LIBS.rotateY(tuftRight2.POSITION_MATRIX, LIBS.degToRad(15));
        LIBS.scale(tuftRight2.POSITION_MATRIX, 0.8, 0.8, 0.8);

        tuftGroup.childs.push(tuftCenter, tuftLeft1, tuftRight1, tuftLeft2, tuftRight2);

        this.childs.push(
            baseHead, muzzle, nose, leftEye, rightEye, mouthOpen, 
            leftCheek, rightCheek, leftEyepupil, rightEyepupil,
            Ear, tuftGroup
        );

        // Buat smileRef untuk kompatibilitas animasi
        this.smileRef = mouthOpen;
        this.tuftRef = tuftGroup;
    }
}