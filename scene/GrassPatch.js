import { group } from "../geometry/group.js";
import { cone } from "../geometry/cone.js";

export class GrassPatch extends group {
    constructor(_Mmatrix, _normal, env, opts = {}) {
        super(_Mmatrix, _normal);
        this.env = env;
        this.app = env.globalApp;
        this.gl = env.gl;

        const bladeCount = opts.bladeCount ?? 150; // Tingkatkan jumlah helai rumput agar lebih lebat
        const patchRadius = opts.patchRadius ?? 2.0; // Tingkatkan radius agar menutupi seluruh pulau
        const grassColor = opts.color ?? [0.2, 0.6, 0.2]; // Grass green color

        for (let i = 0; i < bladeCount; i++) {
            const bladeHeight = 0.2 + Math.random() * 0.2; // Ukuran height nya random
            const bladeRadius = 0.01 + Math.random() * 0.01; // Radius kecil

            // Create a cone instance
            const blade = new cone(this.gl, this.app.mainProgram, this.app.posLoc, this.app.colLoc, this.app.mvLoc, this.app.normLoc, {
                radiusBottom: bladeRadius,
                radiusTop: 0.0,
                height: bladeHeight,
                color: grassColor,
                segments: 4
            });

            // Random position within the patch radius
            const angle = Math.random() * Math.PI * 2;
            const radiusPos = Math.sqrt(Math.random()) * patchRadius; // More even distribution
            LIBS.set_I4(blade.POSITION_MATRIX);
            LIBS.translateX(blade.POSITION_MATRIX, Math.cos(angle) * radiusPos);
            LIBS.translateY(blade.POSITION_MATRIX, 0.5); // Ground level
            LIBS.translateZ(blade.POSITION_MATRIX, Math.sin(angle) * radiusPos);
            
            // Putar 90 derajat di sumbu X agar berdiri tegak.
            LIBS.rotateX(blade.POSITION_MATRIX, LIBS.degToRad(-90)); 
            
            LIBS.rotateZ(blade.POSITION_MATRIX, LIBS.degToRad(80)); // Sedikit miring kiri/kanan
            LIBS.rotateY(blade.POSITION_MATRIX, LIBS.degToRad(Math.random() * 360)-5); // Putar acak di sumbu Y (agar hadapnya acak)
            // Geser sedikit ke atas agar pangkalnya pas di permukaan
            LIBS.translateY(blade.POSITION_MATRIX, bladeHeight / 2); // Pusatkan pangkal kerucut di 0,0,0 lokalnya

            this.childs.push(blade);
        }

        this.childs.forEach(c => c.setup());
    }
}