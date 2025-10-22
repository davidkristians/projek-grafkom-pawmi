// scene/BranchesNode.js

import { group } from "../geometry/group.js";

export class BranchesNode extends group {
    constructor(_Mmatrix, _normal, env) {
        super(_Mmatrix, _normal);
        this.env = env;
        this.gl = env.gl;
        this.app = env.globalApp;
        this.buffers = env.buffers;

        // Posisi node cabang relatif thd TreeGroup (bisa di 0,0,0 jika cabang dihitung dari sana)
        LIBS.set_I4(this.POSITION_MATRIX);
        // Jika perlu offset Y untuk semua cabang, tambahkan di sini
        // LIBS.translateY(this.POSITION_MATRIX, 0.75); // treeBaseY
    }

    render(PARENT_MATRIX) {
        // Hitung matriks dasar M = PARENT_MATRIX * this.POSITION_MATRIX
        const M = LIBS.get_I4();
        LIBS.mul(M, PARENT_MATRIX, this.POSITION_MATRIX);

        const gl = this.gl;
        const app = this.app;
        gl.useProgram(app.mainProgram);

        const treeBaseY = 0.75; // Perlu Y dasar pohon untuk kalkulasi tinggi cabang

        // --- Gambar Cabang ---
        const branches = [ { angle: 0.5, dist: 0.15, height: 0.6, tilt: 0.6 }, { angle: -0.8, dist: 0.18, height: 0.5, tilt: 0.65 }, { angle: 2.0, dist: 0.12, height: 0.7, tilt: 0.55 }, { angle: 3.5, dist: 0.16, height: 0.65, tilt: 0.6 } ];
        branches.forEach(br => {
            let branchMv = LIBS.get_I4();
            LIBS.mul(branchMv, M, branchMv); // Mulai dari matriks node cabang M
            // Terapkan transformasi LOKAL cabang
            LIBS.translateY(branchMv, treeBaseY + br.height); // Y cabang relatif thd pulau
            LIBS.rotateY(branchMv, br.angle); // Rotasi Y lokal cabang
            LIBS.rotateZ(branchMv, br.tilt); // Rotasi Z lokal cabang (kemiringan)
            LIBS.translateX(branchMv, br.dist); // Geser X lokal cabang
            this.env._drawObject(this.buffers.branch, branchMv);
        });
    }
}