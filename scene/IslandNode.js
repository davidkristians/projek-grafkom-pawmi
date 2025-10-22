// actors/IslandNode.js
import { group } from "../geometry/group.js";
import { TreeGroup } from "./TreeGroup.js";
import { PokeballGroup } from "./PokeballGroup.js";
import { GrassPatch } from "./GrassPatch.js";
// ▼▼▼ IMPOR BARU ▼▼▼
import { WaterfallSource } from "./WaterfallSource.js";
import { WaterfallStream } from "./WaterfallStream.js";

export class IslandNode extends group {

    constructor(_Mmatrix, _normal, env) {
        super(_Mmatrix, _normal);
        this.env = env;
        this.gl = env.gl;
        this.app = env.globalApp;
        this.buffers = env.buffers;

        // Transformasi lokal untuk geometri pulau
        this.ISLAND_GEOMETRY_MATRIX = LIBS.get_I4();
        LIBS.translateY(this.ISLAND_GEOMETRY_MATRIX, -0.05);
        LIBS.rotateX(this.ISLAND_GEOMETRY_MATRIX, -0.28);

        // --- Buat Anak Opaque (yang menggunakan mainProgram) ---

        // 1. Buat Pohon
        this.env.treePositions.forEach(treeData => {
            const tree = new TreeGroup(_Mmatrix, _normal, env, treeData);
            this.childs.push(tree);
        });

        // 2. Buat Poké Ball
        this.env.rockPositions.forEach(pokeballData => {
            const pokeball = new PokeballGroup(_Mmatrix, _normal, env, pokeballData);
            this.childs.push(pokeball);
        });

        // 3. Buat Rumput (Gunakan versi 250 helai, padat di tengah)
        const fullIslandGrass = new GrassPatch(_Mmatrix, _normal, env, {
            bladeCount: 400,
            patchRadius: 2.03
        });
        LIBS.translateY(fullIslandGrass.POSITION_MATRIX, 0.55);
        LIBS.rotateX(fullIslandGrass.POSITION_MATRIX, LIBS.degToRad(-16));
        this.childs.push(fullIslandGrass);

        // --- Buat Anak Transparan (yang menggunakan waterfallProgram) ---

        // Ambil lokasi shader air dari globalApp
        const wProg = this.app.waterfallProgram;
        const wPos = this.app.wPosLoc, wCol = this.app.wColLoc, wNorm = this.app.wNormLoc;
        const wMv = this.app.wMvLoc, wTime = this.app.wTimeLoc;

        // 4. Buat "Lubang" Sumber Air di atas
        this.waterSource = new WaterfallSource(this.gl, wProg, wPos, wCol, wNorm, wMv, wTime);
        // Posisikan di tengah pulau, sedikit di atas rumput
        LIBS.translateY(this.waterSource.POSITION_MATRIX, 0.3); // Sedikit di atas 0.7 (rumput)
        // Putar agar menghadap ke atas
        LIBS.rotateX(this.waterSource.POSITION_MATRIX, LIBS.degToRad(0));

        // 5. Buat Aliran Air Terjun di bawah
        // ...
        // 5. Buat Aliran Air Terjun di bawah
        this.waterStream = new WaterfallStream(this.gl, wProg, wPos, wCol, wNorm, wMv, wTime);
        // Posisikan agar pangkal atas air terjun berada di "lubang"
        LIBS.translateY(this.waterStream.POSITION_MATRIX, 0.13); // Sesuaikan agar bagian atas stream pas dengan lubang
        LIBS.translateZ(this.waterStream.POSITION_MATRIX, 1.1); // Geser sedikit ke belakang agar tidak menutupi lubang
        LIBS.translateX(this.waterStream.POSITION_MATRIX, 0); // Pusat di tengah pulau
        LIBS.rotateX(this.waterStream.POSITION_MATRIX, LIBS.degToRad(-35)); // Sedikit miring ke depan agar alirannya keluar
        // LIBS.translateZ(this.waterStream.POSITION_MATRIX, 0.3); // Ini mungkin tidak perlu lagi atau perlu disesuaikan
        // ...
    }

    render(PARENT_MATRIX) {
        // Hitung matriks model untuk seluruh pulau
        const M = LIBS.get_I4();
        LIBS.mul(M, PARENT_MATRIX, this.POSITION_MATRIX);
        LIBS.mul(M, M, this.MOVE_MATRIX);

        // --- 1. RENDER SEMUA OBJEK OPAQUE (Pulau, Rumput, Pohon, dll) ---
        if (!this.app.mainProgram) return; // Keluar jika shader utama gagal
        this.gl.useProgram(this.app.mainProgram);

        // Gambar geometri dasar pulau
        let islandMv = LIBS.get_I4();
        LIBS.mul(islandMv, M, this.ISLAND_GEOMETRY_MATRIX);
        this.env._drawObject(this.buffers.island, islandMv);

        // Render semua anak opaque (Pohon, Poké Ball, Rumput, Pokémon)
        this.childs.forEach(c => c.render(M));

        // --- 2. RENDER OBJEK TRANSPARAN (Air Terjun) ---
        if (!this.app.waterfallProgram || !this.app.camera) return; // Keluar jika shader air gagal
        this.gl.useProgram(this.app.waterfallProgram);

        // Atur blending untuk transparansi
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.gl.depthMask(false); // Matikan penulisan depth

        // Setel matriks proyeksi untuk shader air
        this.gl.uniformMatrix4fv(this.app.wProjLoc, false, this.app.camera.getProjectionMatrix());

        // Render sumber air
        if (this.waterSource) {
            this.waterSource.render(M);
        }
        // Render aliran air
        if (this.waterStream) {
            this.waterStream.render(M);
        }

        // Kembalikan pengaturan GL ke normal
        this.gl.depthMask(true); // Nyalakan lagi penulisan depth
        this.gl.disable(this.gl.BLEND);
    }
}