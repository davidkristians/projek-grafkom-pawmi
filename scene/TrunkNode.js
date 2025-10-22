// scene/TrunkNode.js

import { group } from "../geometry/group.js";

export class TrunkNode extends group {
    constructor(_Mmatrix, _normal, env) {
        super(_Mmatrix, _normal);
        this.env = env;
        this.gl = env.gl;
        this.app = env.globalApp;
        this.buffers = env.buffers;

        // Atur posisi LOKAL batang relatif terhadap TreeGroup
        LIBS.set_I4(this.POSITION_MATRIX);
        // Posisi Y dasar akan diterapkan di render TreeGroup,
        // jadi di sini kita bisa mulai dari 0 atau atur offset jika perlu
        LIBS.translateY(this.POSITION_MATRIX, 0.75); // Y dasar batang
    }

    render(PARENT_MATRIX) {
        // Hitung matriks M = PARENT_MATRIX * this.POSITION_MATRIX
        const M = LIBS.get_I4();
        LIBS.mul(M, PARENT_MATRIX, this.POSITION_MATRIX);

        const gl = this.gl;
        const app = this.app;
        gl.useProgram(app.mainProgram);

        // Gambar Batang
        this.env._drawObject(this.buffers.treeTrunk, M);
    }
}