// geometry/group.js
export class group {
    // ▼▼▼ TAMBAHKAN _normal ▼▼▼
    constructor(_Mmatrix, _normal = null) {
        this._MMatrix = _Mmatrix;
        this.POSITION_MATRIX = LIBS.get_I4();
        this.MOVE_MATRIX = LIBS.get_I4();
        this.childs = [];
    }
    // ... (constructor) ...
    setup() {
        this.childs.forEach(c => {
            // Cek dulu apakah 'c' (child) punya fungsi .setup()
            if (typeof c.setup === 'function') {
                c.setup();
            }
        });
    }
 
// ... (sisa render) ...
    render(PARENT_MATRIX) {
        const M = LIBS.get_I4();
        LIBS.mul(M, PARENT_MATRIX, this.POSITION_MATRIX);
        LIBS.mul(M, M, this.MOVE_MATRIX);
        this.childs.forEach(c => c.render(M));
    }
}