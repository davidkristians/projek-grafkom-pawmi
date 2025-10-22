import { group } from "../geometry/group.js";
import { TreeGroup } from "./TreeGroup.js";
import { PokeballGroup } from "./PokeballGroup.js";

export class IslandNode extends group {
    
    constructor(_Mmatrix, _normal, env) { 
        super(_Mmatrix, _normal);
        this.env = env; 
        this.gl = env.gl;
        this.app = env.globalApp;
        this.buffers = env.buffers; 
        
        this.ISLAND_GEOMETRY_MATRIX = LIBS.get_I4();
        LIBS.translateY(this.ISLAND_GEOMETRY_MATRIX, -0.05);
        LIBS.rotateX(this.ISLAND_GEOMETRY_MATRIX, -0.28);

        // Buat Pohon
        this.env.treePositions.forEach(treeData => {
            const tree = new TreeGroup(_Mmatrix, _normal, env, treeData);
            this.childs.push(tree);
        });

        // Buat Poké Ball
        this.env.rockPositions.forEach(pokeballData => {
            const pokeball = new PokeballGroup(_Mmatrix, _normal, env, pokeballData);
            this.childs.push(pokeball);
        });
    }

    render(PARENT_MATRIX) {
        const M = LIBS.get_I4();
        LIBS.mul(M, PARENT_MATRIX, this.POSITION_MATRIX);
        LIBS.mul(M, M, this.MOVE_MATRIX);

        const gl = this.gl;
        const app = this.app;
        if (!app.mainProgram) return;
        gl.useProgram(app.mainProgram);

        let islandMv = LIBS.get_I4();
        LIBS.mul(islandMv, M, this.ISLAND_GEOMETRY_MATRIX); 
        this.env._drawObject(this.buffers.island, islandMv); 

        this.childs.forEach(c => c.render(M));
    }
}
