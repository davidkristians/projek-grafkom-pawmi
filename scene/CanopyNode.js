// scene/CanopyNode.js

import { group } from "../geometry/group.js";

export class CanopyNode extends group {
    constructor(_Mmatrix, _normal, env) {
        super(_Mmatrix, _normal);
        this.env = env;
        this.gl = env.gl;
        this.app = env.globalApp;
        this.buffers = env.buffers;

        // Atur posisi LOKAL kanopi relatif terhadap TreeGroup
        LIBS.set_I4(this.POSITION_MATRIX);
        // Posisi Y dasar kanopi
        LIBS.translateY(this.POSITION_MATRIX, 0.75 + 1.0); // treeBaseY + 1.0
    }

    render(PARENT_MATRIX) {
        // Hitung matriks dasar M = PARENT_MATRIX * this.POSITION_MATRIX
        const M = LIBS.get_I4();
        LIBS.mul(M, PARENT_MATRIX, this.POSITION_MATRIX);

        const gl = this.gl;
        const app = this.app;
        gl.useProgram(app.mainProgram);

        // --- Gambar Daun Tengah ---
        let leaf1Mv = LIBS.get_I4();
        LIBS.mul(leaf1Mv, M, leaf1Mv); // Mulai dari matriks kanopi M
        LIBS.scale(leaf1Mv, 1.3, 1.1, 1.3);
        this.env._drawObject(this.buffers.leafSphere1, leaf1Mv);

        // --- Gambar Gugus Daun Tambahan ---
        const leafClusters = [ [0.35, 0.25, 0.25], [-0.35, 0.2, -0.25], [0.25, -0.15, -0.35], [-0.25, 0.15, 0.35], [0.15, 0.35, -0.15], [-0.15, -0.1, 0.25] ];
        leafClusters.forEach((offset, oi) => {
            let leafExtraMv = LIBS.get_I4();
            LIBS.mul(leafExtraMv, M, leafExtraMv); // Mulai dari matriks kanopi M
            // Terapkan offset LOKAL relatif terhadap kanopi
            LIBS.translateX(leafExtraMv, offset[0]);
            LIBS.translateY(leafExtraMv, offset[1]);
            LIBS.translateZ(leafExtraMv, offset[2]);
            const scaleVal = 0.85 + (oi % 3) * 0.05;
            LIBS.scale(leafExtraMv, scaleVal, scaleVal * 0.95, scaleVal);
            const bufferChoice = oi % 3 === 0 ? this.buffers.leafSphere1 : oi % 3 === 1 ? this.buffers.leafSphere2 : this.buffers.leafSphere3;
            this.env._drawObject(bufferChoice, leafExtraMv);
        });
    }
}