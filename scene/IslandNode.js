// scene/IslandNode.js

import { group } from "../geometry/group.js";
// ▼▼▼ BARU: Import grup pohon dan batu ▼▼▼
import { TreeGroup } from "./TreeGroup.js";
import { RockGroup } from "./RockGroup.js";

export class IslandNode extends group {
    
    constructor(_Mmatrix, _normal, env) { 
        super(_Mmatrix, _normal);
        this.env = env; 
        this.gl = env.gl;
        this.app = env.globalApp;
        this.buffers = env.buffers; 
        
        // Transformasi LOKAL untuk geometri pulau (kemiringan, dll)
        this.ISLAND_GEOMETRY_MATRIX = LIBS.get_I4();
        LIBS.translateY(this.ISLAND_GEOMETRY_MATRIX, -0.05);
        LIBS.rotateX(this.ISLAND_GEOMETRY_MATRIX, -0.28);

        // ▼▼▼ BARU: Buat dan tambahkan anak pohon & batu ▼▼▼
        
        // Buat Pohon
        this.env.treePositions.forEach(treeData => {
            const tree = new TreeGroup(_Mmatrix, _normal, env, treeData);
            this.childs.push(tree); // Tambahkan pohon sebagai anak
        });

        // Buat Batu
        this.env.rockPositions.forEach(rockData => {
            const rock = new RockGroup(_Mmatrix, _normal, env, rockData);
            this.childs.push(rock); // Tambahkan batu sebagai anak
        });
        // ▲▲▲ SELESAI ▲▲▲

        // Anak Pokémon akan ditambahkan dari main-scene.js nanti
    }

    render(PARENT_MATRIX) {
        // 1. Hitung matriks 'M' untuk seluruh grup ini
        const M = LIBS.get_I4();
        LIBS.mul(M, PARENT_MATRIX, this.POSITION_MATRIX);
        LIBS.mul(M, M, this.MOVE_MATRIX);

        const gl = this.gl;
        const app = this.app;
        gl.useProgram(app.mainProgram); 

        // 2. Gambar HANYA geometri dasar pulau
        let islandMv = LIBS.get_I4();
        LIBS.mul(islandMv, M, this.ISLAND_GEOMETRY_MATRIX); 
        this.env._drawObject(this.buffers.island, islandMv); 

        // ▼▼▼ HAPUS SEMUA KODE RENDER POHON DAN BATU DARI SINI ▼▼▼
        // const baseY = 0; 
        // // --- Gambar Pohon --- (HAPUS BLOK INI)
        // this.env.treePositions.forEach((tree) => { ... });
        // // --- Gambar Batu --- (HAPUS BLOK INI)
        // this.env.rockPositions.forEach(rock => { ... });
        // ▲▲▲ SELESAI MENGHAPUS ▲▲▲

        // 3. Render semua "anak" (Sekarang termasuk pohon, batu, DAN Pokémon)
        this.childs.forEach(c => c.render(M));
    }
}