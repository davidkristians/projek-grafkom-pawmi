import { group } from "./group.js";
import { ellipsoid } from "./ellipsoid.js";

export class pawmoEar extends group {
    constructor(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, opts = {}) {
        super(_Mmatrix, _normal); // teruskan _normal nya ke parent
        const orange = opts.orange ?? [1, 0.5, 0];
        const outerEar = new ellipsoid(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, {
            rx: 0.3, 
            ry: 0.8, 
            rz: 0.5, 
            color: orange
        });

        this.childs.push(outerEar);
    }
}
