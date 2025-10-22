// geometry/pawmo-head.js (MODIFIKASI - HANYA EarBulb pakai Paraboloid)
import { group } from "./group.js";
import { ellipsoid } from "./ellipsoid.js";
import { pawmoEar } from "./pawmo-ear.js";
import { pawmoTuft } from "./pawmo-tuft.js";
import { ellipticParaboloid } from "./ellipticParaboloid.js"; // Tetap impor paraboloid

export class pawmoHead extends group {
    constructor(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, opts = {}) {
        super(_Mmatrix, _normal);

        // --- 1. Definisi Warna --- (Tetap Sama)
        const PAWMO_ORANGE = [222 / 255, 133 / 255, 34 / 255];
        const PAWMO_CREAM = [255 / 255, 240 / 255, 200 / 255];
        const PAWMO_BLACK = [0.1, 0.1, 0.1];
        const PAWMO_YELLOW = [253 / 255, 225 / 255, 127 / 255];
        const PAWMO_WHITE = [1.0, 1.0, 1.0];
        const PAWMO_GREEN = [70 / 255, 128 / 255, 107 / 255];

        // --- 2. Pembuatan Objek Geometri ---

        // Kepala, Moncong, Hidung, Mata, Mulut, Pipi (Tetap Sama)
        const baseHead = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, { rx: 1.2, ry: 1.1, rz: 1.1, color: PAWMO_ORANGE });
        const muzzle = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, { rx: 0.6, ry: 0.45, rz: 0.6, color: PAWMO_CREAM });
        const nose = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, { rx: 0.05, ry: 0.05, rz: 0.05, color: PAWMO_BLACK });
        const leftEye = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, { rx: 0.2, ry: 0.2, rz: 0.2, color: PAWMO_BLACK });
        const rightEye = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, { rx: 0.2, ry: 0.2, rz: 0.2, color: PAWMO_BLACK });
        const leftEyepupil = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, { rx: 0.05, ry: 0.05, rz: 0.01, color: PAWMO_WHITE });
        const rightEyepupil = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, { rx: 0.05, ry: 0.05, rz: 0.01, color: PAWMO_WHITE });
        const smile = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, { rx: 0.2, ry: 0.001, rz: 0.03, color: PAWMO_BLACK });
        const leftCheek = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, { rx: 0.4, ry: 0.35, rz: 0.1, color: PAWMO_YELLOW });
        const rightCheek = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, { rx: 0.4, ry: 0.35, rz: 0.1, color: PAWMO_YELLOW });

        // Area Telinga Kiri
        const leftEar = new pawmoEar(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, { orange: PAWMO_ORANGE });
        // ▼▼▼ KEMBALIKAN InnerEar KIRI ke ellipsoid ▼▼▼
        const leftInnerEar = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, {
            rx: 0.25, ry: 0.6, rz: 0.1, color: PAWMO_GREEN
        });
        // ▲▲▲ SELESAI KEMBALIKAN ▲▲▲
        // ▼▼▼ BIARKAN EarBulb KIRI tetap ellipticParaboloid ▼▼▼
        const leftEarBulb = new ellipticParaboloid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, {
            a: 0.25, b: 0.1, c: 0.8, height: 0.4, color: PAWMO_ORANGE, cap: true
        });
        // ▲▲▲ TETAP PARABOLOID ▲▲▲

        // Area Telinga Kanan
        const rightEar = new pawmoEar(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, { orange: PAWMO_ORANGE });
        // ▼▼▼ KEMBALIKAN InnerEar KANAN ke ellipsoid ▼▼▼
        const rightInnerEar = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, {
            rx: 0.25, ry: 0.6, rz: 0.1, color: PAWMO_GREEN
        });
        // ▲▲▲ SELESAI KEMBALIKAN ▲▲▲
        // ▼▼▼ BIARKAN EarBulb KANAN tetap ellipticParaboloid ▼▼▼
        const rightEarBulb = new ellipticParaboloid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, {
            a: 0.25, b: 0.1, c: 0.8, height: 0.4, color: PAWMO_ORANGE, cap: true
        });
        // ▲▲▲ TETAP PARABOLOID ▲▲▲

        // Jambul (Tetap Sama)
        const headTuft = new pawmoTuft(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, { color: PAWMO_ORANGE });


        // --- 3. Pemosisian Objek ---
        // (Posisi Moncong, Hidung, Mata, Mulut, Pipi Tetap Sama)
        LIBS.set_I4(muzzle.POSITION_MATRIX); LIBS.translateZ(muzzle.POSITION_MATRIX, 0.6); LIBS.translateY(muzzle.POSITION_MATRIX, -0.2);
        LIBS.set_I4(nose.POSITION_MATRIX); LIBS.translateZ(nose.POSITION_MATRIX, 1.2); LIBS.translateY(nose.POSITION_MATRIX, -0.1);
        LIBS.set_I4(leftEye.POSITION_MATRIX); LIBS.translateX(leftEye.POSITION_MATRIX, -0.25); LIBS.translateY(leftEye.POSITION_MATRIX, 0.2); LIBS.translateZ(leftEye.POSITION_MATRIX, 0.92);
        LIBS.set_I4(leftEyepupil.POSITION_MATRIX); LIBS.translateX(leftEyepupil.POSITION_MATRIX, -0.2); LIBS.translateY(leftEyepupil.POSITION_MATRIX, 0.3); LIBS.translateZ(leftEyepupil.POSITION_MATRIX, 1.085); LIBS.rotateY(leftEyepupil.POSITION_MATRIX, LIBS.degToRad(10)); LIBS.rotateX(leftEyepupil.POSITION_MATRIX, LIBS.degToRad(-30));
        LIBS.set_I4(rightEye.POSITION_MATRIX); LIBS.translateX(rightEye.POSITION_MATRIX, 0.25); LIBS.translateY(rightEye.POSITION_MATRIX, 0.2); LIBS.translateZ(rightEye.POSITION_MATRIX, 0.92);
        LIBS.set_I4(rightEyepupil.POSITION_MATRIX); LIBS.translateX(rightEyepupil.POSITION_MATRIX, 0.2); LIBS.translateY(rightEyepupil.POSITION_MATRIX, 0.3); LIBS.translateZ(rightEyepupil.POSITION_MATRIX, 1.085); LIBS.rotateY(rightEyepupil.POSITION_MATRIX, LIBS.degToRad(-10)); LIBS.rotateX(rightEyepupil.POSITION_MATRIX, LIBS.degToRad(-30));
        LIBS.set_I4(smile.POSITION_MATRIX); LIBS.translateY(smile.POSITION_MATRIX, -0.3); LIBS.translateX(smile.POSITION_MATRIX, 0.0); LIBS.translateZ(smile.POSITION_MATRIX, 1.18); LIBS.rotateX(smile.POSITION_MATRIX, LIBS.degToRad(50));
        LIBS.set_I4(leftCheek.POSITION_MATRIX); LIBS.translateX(leftCheek.POSITION_MATRIX, -0.8); LIBS.translateZ(leftCheek.POSITION_MATRIX, 0.75); LIBS.translateY(leftCheek.POSITION_MATRIX, -0.12); LIBS.rotateY(leftCheek.POSITION_MATRIX, LIBS.degToRad(-45)); LIBS.rotateX(leftCheek.POSITION_MATRIX, LIBS.degToRad(15)); LIBS.rotateZ(leftCheek.POSITION_MATRIX, LIBS.degToRad(0));
        LIBS.set_I4(rightCheek.POSITION_MATRIX); LIBS.translateX(rightCheek.POSITION_MATRIX, 0.8); LIBS.translateZ(rightCheek.POSITION_MATRIX, 0.75); LIBS.translateY(rightCheek.POSITION_MATRIX, -0.12); LIBS.rotateY(rightCheek.POSITION_MATRIX, LIBS.degToRad(45)); LIBS.rotateX(rightCheek.POSITION_MATRIX, LIBS.degToRad(15)); LIBS.rotateZ(rightCheek.POSITION_MATRIX, LIBS.degToRad(0));

        // --- Posisi Telinga ---
        // Telinga Luar Kiri
        LIBS.set_I4(leftEar.POSITION_MATRIX); LIBS.translateX(leftEar.POSITION_MATRIX, -0.9); LIBS.translateY(leftEar.POSITION_MATRIX, 1.2); LIBS.translateZ(leftEar.POSITION_MATRIX, 0.2); LIBS.rotateY(leftEar.POSITION_MATRIX, LIBS.degToRad(90)); LIBS.rotateX(leftEar.POSITION_MATRIX, LIBS.degToRad(20)); LIBS.rotateZ(leftEar.POSITION_MATRIX, LIBS.degToRad(30));

        // Telinga Dalam Kiri (Ellipsoid) - Gunakan posisi asli
        LIBS.set_I4(leftInnerEar.POSITION_MATRIX);
        LIBS.translateX(leftInnerEar.POSITION_MATRIX, -0.9);
        LIBS.translateY(leftInnerEar.POSITION_MATRIX, 1.2);
        LIBS.translateZ(leftInnerEar.POSITION_MATRIX, 0.02); // Z sedikit berbeda dari outer
        LIBS.rotateY(leftInnerEar.POSITION_MATRIX, LIBS.degToRad(0)); // Rotasi berbeda
        LIBS.rotateX(leftInnerEar.POSITION_MATRIX, LIBS.degToRad(20));
        LIBS.rotateZ(leftInnerEar.POSITION_MATRIX, LIBS.degToRad(30));
        LIBS.translateLocal(leftInnerEar.POSITION_MATRIX, 0, 0, 0.4); // Geser Lokal asli

        // Ear Bulb Kiri (Paraboloid) - Gunakan posisi lama, sesuaikan jika perlu
        LIBS.set_I4(leftEarBulb.POSITION_MATRIX);
        LIBS.translateX(leftEarBulb.POSITION_MATRIX, -0.70);
        LIBS.translateY(leftEarBulb.POSITION_MATRIX, 0.3);
        LIBS.translateZ(leftEarBulb.POSITION_MATRIX, 1.1);
        LIBS.rotateY(leftEarBulb.POSITION_MATRIX, LIBS.degToRad(0));
        LIBS.rotateX(leftEarBulb.POSITION_MATRIX, LIBS.degToRad(-170));
        LIBS.rotateZ(leftEarBulb.POSITION_MATRIX, LIBS.degToRad(30));
        const scaleFactorLeft = 1.5; // Contoh: Perbesar 20%
        LIBS.scale(leftEarBulb.POSITION_MATRIX, scaleFactorLeft, scaleFactorLeft, scaleFactorLeft);
        LIBS.translateLocal(leftEarBulb.POSITION_MATRIX, 0.15, -0.5, 0.4);

        // Telinga Luar Kanan
        LIBS.set_I4(rightEar.POSITION_MATRIX); LIBS.translateX(rightEar.POSITION_MATRIX, 0.9); LIBS.translateY(rightEar.POSITION_MATRIX, 1.2); LIBS.translateZ(rightEar.POSITION_MATRIX, 0.2); LIBS.rotateY(rightEar.POSITION_MATRIX, LIBS.degToRad(-90)); LIBS.rotateX(rightEar.POSITION_MATRIX, LIBS.degToRad(20)); LIBS.rotateZ(rightEar.POSITION_MATRIX, LIBS.degToRad(-30));

        // Telinga Dalam Kanan (Ellipsoid) - Gunakan posisi asli
        LIBS.set_I4(rightInnerEar.POSITION_MATRIX);
        LIBS.translateX(rightInnerEar.POSITION_MATRIX, 0.9);
        LIBS.translateY(rightInnerEar.POSITION_MATRIX, 1.2);
        LIBS.translateZ(rightInnerEar.POSITION_MATRIX, 0.02);
        LIBS.rotateY(rightInnerEar.POSITION_MATRIX, LIBS.degToRad(0));
        LIBS.rotateX(rightInnerEar.POSITION_MATRIX, LIBS.degToRad(20));
        LIBS.rotateZ(rightInnerEar.POSITION_MATRIX, LIBS.degToRad(-30));
        LIBS.translateLocal(rightInnerEar.POSITION_MATRIX, 0, 0, 0.4);

        // Ear Bulb Kanan (Paraboloid) - Gunakan posisi lama, sesuaikan jika perlu
        LIBS.set_I4(rightEarBulb.POSITION_MATRIX);
        LIBS.translateX(rightEarBulb.POSITION_MATRIX, 0.70);
        LIBS.translateY(rightEarBulb.POSITION_MATRIX, 0.3);
        LIBS.translateZ(rightEarBulb.POSITION_MATRIX, 1.1);
        LIBS.rotateY(rightEarBulb.POSITION_MATRIX, LIBS.degToRad(0));
        LIBS.rotateX(rightEarBulb.POSITION_MATRIX, LIBS.degToRad(-170));
        LIBS.rotateZ(rightEarBulb.POSITION_MATRIX, LIBS.degToRad(-30));
        const scaleFactorRight = 1.5; // Contoh: Perbesar 20%
        LIBS.scale(rightEarBulb.POSITION_MATRIX, scaleFactorRight, scaleFactorRight, scaleFactorRight);
        LIBS.translateLocal(rightEarBulb.POSITION_MATRIX, -0.15, -0.5, 0.4);

        // Posisi Jambul (Tetap Sama)
        LIBS.set_I4(headTuft.POSITION_MATRIX); LIBS.translateX(headTuft.POSITION_MATRIX, 0); LIBS.translateY(headTuft.POSITION_MATRIX, 1); LIBS.translateZ(headTuft.POSITION_MATRIX, 0.6); LIBS.rotateX(headTuft.POSITION_MATRIX, LIBS.degToRad(30)); LIBS.rotateY(headTuft.POSITION_MATRIX, LIBS.degToRad(10)); LIBS.rotateZ(headTuft.POSITION_MATRIX, LIBS.degToRad(0));

        // --- 4. Menambahkan Anak ke Grup Kepala ---
        this.childs.push(
            baseHead, muzzle, nose,
            leftEye, rightEye, leftEyepupil, rightEyepupil,
            smile,
            leftCheek, rightCheek,
            leftEar, rightEar, leftInnerEar, rightInnerEar, // InnerEar kembali jadi ellipsoid
            leftEarBulb, rightEarBulb,                     // EarBulb tetap paraboloid
            headTuft
        );
        this.smileRef = smile;
    }
}