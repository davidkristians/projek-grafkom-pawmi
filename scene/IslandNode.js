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
        LIBS.translateY(this.ISLAND_GEOMETRY_MATRIX, 0.3);
        LIBS.rotateX(this.ISLAND_GEOMETRY_MATRIX, 0);

        // --- Buat Anak Opaque (yang menggunakan mainProgram) ---

        // 1. Buat Pohon
        this.env.treePositions.forEach(treeData => {
            const tree = new TreeGroup(_Mmatrix, _normal, env, treeData);
            this.childs.push(tree);
            LIBS.translateY(tree.POSITION_MATRIX, 0.35); // Sesuaikan posisi Y agar pas di atas tanah
        });

        // 2. Buat Poké Ball
        this.env.rockPositions.forEach(pokeballData => {
            const pokeball = new PokeballGroup(_Mmatrix, _normal, env, pokeballData);
            this.childs.push(pokeball);
             LIBS.translateY(pokeball.POSITION_MATRIX, 0.15); // Sesuaikan posisi Y agar pas di atas tanah
        });
       

        // 3. Buat Rumput (Gunakan versi 250 helai, padat di tengah)
        const fullIslandGrass = new GrassPatch(_Mmatrix, _normal, env, {
            bladeCount: 400,
            patchRadius: 2.03
        });
        LIBS.translateY(fullIslandGrass.POSITION_MATRIX, 0.45);
        LIBS.rotateX(fullIslandGrass.POSITION_MATRIX, LIBS.degToRad(0));
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

 // actors/IslandNode.js

    render(PARENT_MATRIX) { // PARENT_MATRIX di sini SEBENARNYA tidak terpakai lagi,
                             // tapi kita biarkan agar struktur panggilan tetap sama.
        // --- 1. Hitung Matriks Model-View TANPA Rotasi Kamera ---
        // Ambil view matrix TANPA rotasi langsung dari kamera
        const viewMatrixNoRot = this.app.camera.getViewMatrixNoRotation();

        // Hitung matriks Model-View TANPA ROTASI untuk SELURUH IslandNode
        const M_no_rot = LIBS.get_I4();
        // Gabungkan world position pulau DENGAN view matrix tanpa rotasi
        LIBS.mul(M_no_rot, viewMatrixNoRot, this.POSITION_MATRIX); // view_no_rot * world_pos
        LIBS.mul(M_no_rot, M_no_rot, this.MOVE_MATRIX);     // (view_no_rot * world_pos) * local_move

        // Matriks ini (M_no_rot) akan digunakan untuk SEMUA objek di dalam pulau ini.
        LIBS.rotateY(M_no_rot, this.app.islandRotY);
        LIBS.rotateX(M_no_rot, this.app.islandRotX);

        // --- 2. RENDER SEMUA OBJEK OPAQUE (Pulau & Isinya) ---
        if (!this.app.mainProgram) return;
        this.gl.useProgram(this.app.mainProgram);

        // Gambar geometri dasar pulau pakai M_no_rot
        // (Kita perlu terapkan transformasi lokal geometri pulau secara terpisah)
        let islandGeometryMv = LIBS.get_I4();
        LIBS.mul(islandGeometryMv, M_no_rot, this.ISLAND_GEOMETRY_MATRIX);
        LIBS.rotateX(islandGeometryMv,0 ); // Animasi goyang pelan
        this.env._drawObject(this.buffers.island, islandGeometryMv);

        // ▼▼▼ UBAH: Render semua anak opaque pakai M_no_rot ▼▼▼
        // (Pohon, Poké Ball, Rumput, Pokémon)
        this.childs.forEach(c => c.render(M_no_rot));
        // ▲▲▲ SELESAI ▲▲▲

        // --- 3. RENDER OBJEK TRANSPARAN (Air Terjun) ---
        if (!this.app.waterfallProgram || !this.app.camera) return;
        this.gl.useProgram(this.app.waterfallProgram);

        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.gl.depthMask(false);

        this.gl.uniformMatrix4fv(this.app.wProjLoc, false, this.app.camera.getProjectionMatrix());

        // ▼▼▼ UBAH: Render sumber air & aliran air pakai M_no_rot ▼▼▼
        if (this.waterSource) {
            this.waterSource.render(M_no_rot);
        }
        if (this.waterStream) {
            this.waterStream.render(M_no_rot);
        }
        // ▲▲▲ SELESAI ▲▲▲

        this.gl.depthMask(true);
        this.gl.disable(this.gl.BLEND);
    }
}