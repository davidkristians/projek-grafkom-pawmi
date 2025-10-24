import { group } from "../geometry/group.js";
import { TreeGroup } from "./TreeGroup.js";
import { PokeballGroup } from "./PokeballGroup.js";
import { GrassPatch } from "./GrassPatch.js";
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

        // --- Buat Anak Opaque ---
        // Buat Pohon
        this.env.treePositions.forEach(treeData => {
            const tree = new TreeGroup(_Mmatrix, _normal, env, treeData);
            this.childs.push(tree);
            LIBS.translateY(tree.POSITION_MATRIX, 0.35); // Posisi Y agar pas di atas tanah
        });

        // Buat pokeball
        this.env.rockPositions.forEach(pokeballData => {
            const pokeball = new PokeballGroup(_Mmatrix, _normal, env, pokeballData);
            this.childs.push(pokeball);
             LIBS.translateY(pokeball.POSITION_MATRIX, 0.15); // Posisi Y agar pas di atas tanah
        });
       

        // Buat rumput
        const fullIslandGrass = new GrassPatch(_Mmatrix, _normal, env, {
            bladeCount: 400,
            patchRadius: 2.03
        });
        LIBS.translateY(fullIslandGrass.POSITION_MATRIX, 0.45);
        LIBS.rotateX(fullIslandGrass.POSITION_MATRIX, LIBS.degToRad(0));
        this.childs.push(fullIslandGrass);

        // Ambil lokasi shader air dari globalApp
        const wProg = this.app.waterfallProgram;
        const wPos = this.app.wPosLoc, wCol = this.app.wColLoc, wNorm = this.app.wNormLoc;
        const wMv = this.app.wMvLoc, wTime = this.app.wTimeLoc;

        // Buat lubang sumber air di atas
        this.waterSource = new WaterfallSource(this.gl, wProg, wPos, wCol, wNorm, wMv, wTime);
        // Posisikan di tengah pulau, sedikit di atas rumput
        LIBS.translateY(this.waterSource.POSITION_MATRIX, 0.3); // Sedikit di atas 0.7 (rumput)
        // Putar agar menghadap ke atas
        LIBS.rotateX(this.waterSource.POSITION_MATRIX, LIBS.degToRad(0));

        // Buat Aliran Air Terjun di bawah
        this.waterStream = new WaterfallStream(this.gl, wProg, wPos, wCol, wNorm, wMv, wTime);
        // Transformasi pangkal atas air terjun berada di "lubang"
        LIBS.translateY(this.waterStream.POSITION_MATRIX, 0.13); // Sesuaikan atas stream pas dengan lubang
        LIBS.translateZ(this.waterStream.POSITION_MATRIX, 1.1); // Geser sedikit ke belakang
        LIBS.translateX(this.waterStream.POSITION_MATRIX, 0); // Pusat di tengah pulau
        LIBS.rotateX(this.waterStream.POSITION_MATRIX, LIBS.degToRad(-35)); // Sedikit miring ke depan agar alirannya keluar
    }


    render(PARENT_MATRIX) {
        // --- Hitung matriks model-view tanpa rotasi kamera ---
        // Ambil view matrix TANPA rotasi langsung dari kamera
        const viewMatrixNoRot = this.app.camera.getViewMatrixNoRotation();

        // Hitung matriks model-view tanpa rotasi untuk seluruh IslandNode
        const M_no_rot = LIBS.get_I4();
        // Gabungkan world position pulau dengan view matrix tanpa rotasi
        LIBS.mul(M_no_rot, viewMatrixNoRot, this.POSITION_MATRIX); // view_no_rot * world_pos
        LIBS.mul(M_no_rot, M_no_rot, this.MOVE_MATRIX);     // (view_no_rot * world_pos) * local_move

        // Matriks ini (M_no_rot) akan digunakan untuk semua objek di dalam pulau ini.
        LIBS.rotateY(M_no_rot, this.app.islandRotY);
        LIBS.rotateX(M_no_rot, this.app.islandRotX);

        // --- Render semua objek opaque (pulau & isinya) ---
        if (!this.app.mainProgram) return;
        this.gl.useProgram(this.app.mainProgram);

        // Gambar geometri dasar pulau pakai M_no_rot
        let islandGeometryMv = LIBS.get_I4();
        LIBS.mul(islandGeometryMv, M_no_rot, this.ISLAND_GEOMETRY_MATRIX);
        LIBS.rotateX(islandGeometryMv,0 ); // Animasi goyang pelan
        this.env._drawObject(this.buffers.island, islandGeometryMv);

        // (pohon, pokeball, rumput, pokemon)
        this.childs.forEach(c => c.render(M_no_rot));

        // --- render objek transparan (Air Terjun) ---
        if (!this.app.waterfallProgram || !this.app.camera) return;
        this.gl.useProgram(this.app.waterfallProgram);

        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.gl.depthMask(false);

        this.gl.uniformMatrix4fv(this.app.wProjLoc, false, this.app.camera.getProjectionMatrix());

        if (this.waterSource) {
            this.waterSource.render(M_no_rot);
        }
        if (this.waterStream) {
            this.waterStream.render(M_no_rot);
        }

        this.gl.depthMask(true);
        this.gl.disable(this.gl.BLEND);
    }
}