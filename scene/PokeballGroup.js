import { group } from "../geometry/group.js";
import { hemisphere } from "../geometry/hemisphere.js";
import { cylinder } from "../geometry/cylinder.js";
import { ellipsoid } from "../geometry/ellipsoid.js";

export class PokeballGroup extends group {
    constructor(_Mmatrix, _normal, env, pokeballData) {
        super(_Mmatrix, _normal);
        this.env = env;
        this.gl = env.gl;
        this.app = env.globalApp;
        this.pokeballData = pokeballData;

        // --- Inisialisasi warna ---
        const POKEBALL_RED = [0.9, 0.1, 0.1];
        const POKEBALL_WHITE = [0.95, 0.95, 0.95];
        const POKEBALL_BLACK = [0.1, 0.1, 0.1];
        const POKEBALL_BUTTON_WHITE = [0.85, 0.85, 0.85];

        // --- Buat instansi geometri ---
        const baseRadius = 0.2 * (this.pokeballData.scale ?? 1.0);
        const bandHeight = baseRadius * 0.15;
        const buttonBaseRadius = baseRadius * 0.35;
        const buttonRingRadius = baseRadius * 0.45;
        const buttonCenterRadius = baseRadius * 0.2;

        const topHemisphere = new hemisphere(this.gl, this.app.mainProgram, this.app.posLoc, this.app.colLoc, this.app.mvLoc, this.app.normLoc, {
            radius: baseRadius, color: POKEBALL_RED, topHalf: true, segments: 24, rings: 12
        });
        const bottomHemisphere = new hemisphere(this.gl, this.app.mainProgram, this.app.posLoc, this.app.colLoc, this.app.mvLoc, this.app.normLoc, {
            radius: baseRadius, color: POKEBALL_WHITE, topHalf: false, segments: 24, rings: 12
        });
        const blackBand = new cylinder(this.gl, this.app.mainProgram, this.app.posLoc, this.app.colLoc, this.app.mvLoc, this.app.normLoc, {
            radius: baseRadius + 0.005, height: bandHeight, color: POKEBALL_BLACK, segments: 24, capTop: false, capBottom: false
        });
        const buttonBase = new cylinder(this.gl, this.app.mainProgram, this.app.posLoc, this.app.colLoc, this.app.mvLoc, this.app.normLoc, {
            radius: buttonBaseRadius, height: bandHeight * 1.4, color: POKEBALL_BUTTON_WHITE, segments: 16
        });
        const buttonRing = new cylinder(this.gl, this.app.mainProgram, this.app.posLoc, this.app.colLoc, this.app.mvLoc, this.app.normLoc, {
            radius: buttonRingRadius, height: bandHeight * 0.5, color: POKEBALL_BLACK, segments: 16
        });
        const buttonCenter = new ellipsoid(this.gl, this.app.mainProgram, this.app.posLoc, this.app.colLoc, this.app.mvLoc, this.app.normLoc, {
            rx: buttonCenterRadius, ry: bandHeight * 0.3, rz: buttonCenterRadius, color: POKEBALL_WHITE, segments: 12, rings: 6
        });

        // --- transformasi posisi ---
        LIBS.rotateX(buttonBase.POSITION_MATRIX, LIBS.degToRad(90));
        LIBS.rotateX(buttonRing.POSITION_MATRIX, LIBS.degToRad(90));
        LIBS.rotateX(buttonCenter.POSITION_MATRIX, LIBS.degToRad(90));

        const buttonOffsetZ = baseRadius;
        LIBS.translateZ(buttonRing.POSITION_MATRIX, buttonOffsetZ);
        LIBS.translateZ(buttonBase.POSITION_MATRIX, buttonOffsetZ + bandHeight * 0.1);
        LIBS.translateZ(buttonCenter.POSITION_MATRIX, buttonOffsetZ + bandHeight * 0.3);

        this.childs.push(topHemisphere, bottomHemisphere, blackBand, buttonRing, buttonBase, buttonCenter);
        this.childs.forEach(c => c.setup());

        // --- Atur keseluruhan posisi pokeballGroup nya  ---
        LIBS.set_I4(this.POSITION_MATRIX);
        LIBS.translateX(this.POSITION_MATRIX, pokeballData.pos[0]);
        LIBS.rotateX(this.POSITION_MATRIX, LIBS.degToRad(-10));
        
        // Periksa apakah ini bola sebelah kanan atau bukan (yang memiliki nilai pos[0] positif)
        if (pokeballData.pos[0] > 0) {
            // Jika ya, pakai nilai Y yang lebih rendah untuk menurunkannya
            LIBS.translateY(this.POSITION_MATRIX, 1.08); // Turunkan sedikit
        } else {
            // Jika tidak berarto bola sebelah kiri, gunakan posisi Y yang normal
            LIBS.translateY(this.POSITION_MATRIX, 1.2);
        }
        LIBS.translateZ(this.POSITION_MATRIX, pokeballData.pos[2]);
    }
}

