import { group } from "../geometry/group.js";

export class RockGroup extends group {
    constructor(_Mmatrix, _normal, env, rockData) {
        super(_Mmatrix, _normal);
        this.env = env;
        this.gl = env.gl;
        this.app = env.globalApp;
        this.buffers = env.buffers;
        this.rockData = rockData; 

        // Atur posisi batu lokal
        LIBS.set_I4(this.POSITION_MATRIX);
        LIBS.translateX(this.POSITION_MATRIX, rockData.pos[0]);
        LIBS.translateY(this.POSITION_MATRIX, 1.08); // Y dasar batu
        LIBS.translateZ(this.POSITION_MATRIX, rockData.pos[2]);
        LIBS.rotateY(this.POSITION_MATRIX, 120);
    }

    render(PARENT_MATRIX) {
        // Hitung matriks M = PARENT_MATRIX * this.POSITION_MATRIX
        const M = LIBS.get_I4();
        LIBS.mul(M, PARENT_MATRIX, this.POSITION_MATRIX);

        // Ganti angka 0.5 dengan sudut rotasi yang Anda inginkan (dalam radian)
        // LIBS.degToRad(30) akan memutar 30 derajat
        const angleInRadians = LIBS.degToRad(90); // Contoh: Putar 45 derajat di sumbu Y
        LIBS.rotateY(M, angleInRadians); 
        // Anda juga bisa pakai rotateX atau rotateZ
        LIBS.rotateX(M, LIBS.degToRad(90)); 
        LIBS.rotateZ(M, LIBS.degToRad(120));

        // Terapkan skala batu lokal (setelah rotasi)
        LIBS.scale(M, this.rockData.scale, this.rockData.scale * 0.7, this.rockData.scale);

        const gl = this.gl;
        const app = this.app;
        gl.useProgram(app.mainProgram); 

        // Gambar Batu menggunakan matriks M yang sudah dirotasi dan diskalakan
        this.env._drawObject(this.buffers.rock, M);
    }
}