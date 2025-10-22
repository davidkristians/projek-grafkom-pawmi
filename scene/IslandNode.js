import { group } from "../geometry/group.js";
import { TreeGroup } from "./TreeGroup.js";
import { PokeballGroup } from "./PokeballGroup.js";
// Import the new GrassPatch
import { GrassPatch } from "./GrassPatch.js";

export class IslandNode extends group {

    constructor(_Mmatrix, _normal, env) {
        super(_Mmatrix, _normal);
        this.env = env;
        this.gl = env.gl;
        this.app = env.globalApp;
        this.buffers = env.buffers;

        // Local transformation for the island base geometry
        this.ISLAND_GEOMETRY_MATRIX = LIBS.get_I4();
        LIBS.translateY(this.ISLAND_GEOMETRY_MATRIX, -0.05);
        LIBS.rotateX(this.ISLAND_GEOMETRY_MATRIX, -0.28);

        // --- Create Island Children ---

        // 1. Create Trees
        this.env.treePositions.forEach(treeData => {
            const tree = new TreeGroup(_Mmatrix, _normal, env, treeData);
            this.childs.push(tree);
        });

        // 2. Create Poké Balls
        this.env.rockPositions.forEach(pokeballData => {
            const pokeball = new PokeballGroup(_Mmatrix, _normal, env, pokeballData);
            this.childs.push(pokeball);
        });

        // 3. Create a single, large Grass Patch covering the island
        const fullIslandGrass = new GrassPatch(_Mmatrix, _normal, env, { 
            bladeCount: 400, // Tingkatkan jumlah helai rumput untuk cakupan penuh
            patchRadius: 2.02 // Radius harus sedikit kurang dari radius pulau agar tidak meluber
        });
        LIBS.translateY(fullIslandGrass.POSITION_MATRIX, 0.6); // Angkat seluruh patch rumput ke permukaan pulau
        LIBS.rotateX(fullIslandGrass.POSITION_MATRIX, -0.25 ); // Sesuaikan kemiringan dengan pulau
        this.childs.push(fullIslandGrass);

        // Pokémon actor will be added later from main-scene.js
    }

    render(PARENT_MATRIX) {
        // Calculate the final matrix for this island node
        const M = LIBS.get_I4();
        LIBS.mul(M, PARENT_MATRIX, this.POSITION_MATRIX);
        LIBS.mul(M, M, this.MOVE_MATRIX);

        if (!this.app.mainProgram) return; // Exit if main shader failed
        this.gl.useProgram(this.app.mainProgram);

        // Draw ONLY the island base geometry
        let islandMv = LIBS.get_I4();
        LIBS.mul(islandMv, M, this.ISLAND_GEOMETRY_MATRIX);
        this.env._drawObject(this.buffers.island, islandMv);

        // Render all children (Trees, Poké Balls, Grass Patches, and Pokémon)
        this.childs.forEach(c => c.render(M));
    }
}