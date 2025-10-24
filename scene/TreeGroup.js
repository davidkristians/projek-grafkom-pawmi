import { group } from "../geometry/group.js";
import { TrunkNode } from "./TrunkNode.js";
import { CanopyNode } from "./CanopyNode.js";
import { BranchesNode } from "./BranchesNode.js";

export class TreeGroup extends group {
    constructor(_Mmatrix, _normal, env, treeData) {
        super(_Mmatrix, _normal);
        this.env = env;
        this.gl = env.gl;
        this.app = env.globalApp;
        this.buffers = env.buffers;
        this.treeData = treeData; 

        // Atur posisi & rotasi pohon lokal ini relatif terhadap induk (IslandNode)
        LIBS.set_I4(this.POSITION_MATRIX);
        LIBS.translateX(this.POSITION_MATRIX, treeData.pos[0]);
        // Y base diatur di dalam TrunkNode dan CanopyNode
        LIBS.translateZ(this.POSITION_MATRIX, treeData.pos[2]);
        LIBS.translateY(this.POSITION_MATRIX, -0.23); // Y dasar pohon
        LIBS.rotateY(this.POSITION_MATRIX, treeData.rotation);

        const trunk = new TrunkNode(_Mmatrix, _normal, env);
        const canopy = new CanopyNode(_Mmatrix, _normal, env);
        const branches = new BranchesNode(_Mmatrix, _normal, env);
        LIBS.translateY(canopy.POSITION_MATRIX, 0.3);

        this.childs.push(trunk);
        this.childs.push(canopy);
        // this.childs.push(branches);
    }

    render(PARENT_MATRIX) {
        // Hitung matriks M = PARENT_MATRIX * this.POSITION_MATRIX
        const M = LIBS.get_I4();
        LIBS.mul(M, PARENT_MATRIX, this.POSITION_MATRIX);
        LIBS.mul(M, M, this.MOVE_MATRIX);

        this.childs.forEach(c => c.render(M));
    }
}