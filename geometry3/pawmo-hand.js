// geometry/pawmo-hand.js
// ▼▼▼ BARU: Import fungsi tangent ▼▼▼
import { getBezierPoint, getBezierTangent } from "./bezier.js";
import { group } from "./group.js";
import { cone } from "./cone.js";

export class PawmoArm {
    // ▼▼▼ TAMBAHKAN _normal ▼▼▼
    constructor(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, opts = {}) {
        this.GL=GL; this.SHADER_PROGRAM=SHADER_PROGRAM; this._position=_position; this._color=_color; this._MMatrix=_Mmatrix;
        this._normal = _normal; // BARU
        this.POSITION_MATRIX=LIBS.get_I4(); this.MOVE_MATRIX=LIBS.get_I4();
        this._build(opts);
    }
    _build(opts) {
        const orangeColor = opts.orange, whiteColor = opts.white;
        const segments = opts.segments ?? 32, rings = opts.rings ?? 32;
        const p0 = [0.0, -1.0], p1 = [0.3, -0.8], p2 = [1.15, 2.4], p3 = [0.0, 1.8];
        const minY = p0[1], maxY = Math.max(p2[1], p3[1]), totalHeight = maxY - minY;
        const vertices=[], faces=[];
        for (let i=0; i<=rings; i++) {
            const t=i/rings, profilePoint=getBezierPoint(t,p0,p1,p2,p3), radius=profilePoint.x, y=profilePoint.y;
            
            // ▼▼▼ BARU: Hitung normal dari tangent ▼▼▼
            const tangent = getBezierTangent(t, p0, p1, p2, p3);
            let n_x = tangent.y;
            let n_y = -tangent.x;
            const len = Math.sqrt(n_x*n_x + n_y*n_y) || 1;
            const n_x_norm = n_x / len;
            const n_y_norm = n_y / len;
            // ▲▲▲ SELESAI ▲▲▲

            let vertColor=orangeColor;
            const heightT=(y-minY)/totalHeight;
            if(heightT>0.68){ vertColor=whiteColor; }
            
            for (let j=0; j<=segments; j++) {
                const angle=(j/segments)*2*Math.PI, 
                      cosA = Math.cos(angle), 
                      sinA = Math.sin(angle),
                      x=radius*cosA, 
                      z=radius*sinA;

                // ▼▼▼ BARU: Normal 3D ▼▼▼
                const nx = n_x_norm * cosA;
                const ny = n_y_norm;
                const nz = n_x_norm * sinA;
                
                vertices.push(x,y,z, ...vertColor, nx, ny, nz);
            }
        }
        const rowLen=segments+1;
        for (let i=0; i<rings; i++) {
            for (let j=0; j<segments; j++) {
                const i0=i*rowLen+j, i1=i0+1, i2=(i+1)*rowLen+j, i3=i2+1;
                faces.push(i0,i1,i2, i1,i3,i2);
            }
        }
        this.vertex=vertices; this.faces=faces;
    }
    setup() {
        this.OBJECT_VERTEX=this.GL.createBuffer(); this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
        this.GL.bufferData(this.GL.ARRAY_BUFFER, new Float32Array(this.vertex), this.GL.STATIC_DRAW);
        this.OBJECT_FACES=this.GL.createBuffer(); this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        this.GL.bufferData(this.GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.faces), this.GL.STATIC_DRAW);
    }
    render(PARENT_MATRIX) {
        const M=LIBS.get_I4(); LIBS.mul(M,PARENT_MATRIX, this.POSITION_MATRIX); LIBS.mul(M, M, this.MOVE_MATRIX);
        this.GL.useProgram(this.SHADER_PROGRAM); this.GL.uniformMatrix4fv(this._MMatrix, false, M);
        this.GL.bindBuffer(this.GL.ARRAY_BUFFER, this.OBJECT_VERTEX);

        // ▼▼▼ BARU: Stride 36 (9 floats * 4 bytes) ▼▼▼
        this.GL.vertexAttribPointer(this._position, 3, this.GL.FLOAT, false, 36, 0);
        this.GL.vertexAttribPointer(this._color, 3, this.GL.FLOAT, false, 36, 12);
        // ▼▼▼ BARU: Pointer untuk normal ▼▼▼
        this.GL.vertexAttribPointer(this._normal, 3, this.GL.FLOAT, false, 36, 24);
        this.GL.enableVertexAttribArray(this._normal); // Aktifkan

        this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        this.GL.drawElements(this.GL.TRIANGLES, this.faces.length, this.GL.UNSIGNED_SHORT, 0);
    }
}

export class pawmoHand extends group {
    // ▼▼▼ TAMBAHKAN _normal dan teruskan ke 'super' & anak ▼▼▼
    constructor(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, opts = {}) {
        super(_Mmatrix, _normal); // BARU

        const arm = new PawmoArm(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, opts); // BARU
        
        const whiteColor = opts.white ?? [1,1,1];
        const armTipHeight = (opts.p3_y !== undefined) ? opts.p3_y : 1.8;
        
        const fingerCount = 3;
        const fingerSpacing = 0.15;

// geometry/pawmo-hand.js -> class pawmoHand -> constructor

// ... kode sebelumnya ...

        for (let i = 0; i < fingerCount; i++) {
            // ▼▼▼ Tambahkan _normal saat memanggil cone ▼▼▼
            const finger = new cone(GL, SHADER_PROGRAM, _position, _color, _Mmatrix, _normal, {
                radiusBottom: 0.1, radiusTop: 0.0, height: 0.3, color: whiteColor
            });

            const xOffset = (i - (fingerCount - 1) / 2) * fingerSpacing;

            LIBS.set_I4(finger.POSITION_MATRIX);

            // Urutan transformasi ini penting:
            LIBS.rotateY(finger.POSITION_MATRIX, LIBS.degToRad(-90)); // Arahkan sumbu X ke samping
            LIBS.translateY(finger.POSITION_MATRIX, armTipHeight);  // Pindahkan ke ujung lengan
            LIBS.translateX(finger.POSITION_MATRIX, xOffset);         // Geser jari ke samping
            // LIBS.translateZ(finger.POSITION_MATRIX, 0);   // JANGAN LAKUKAN INI DULU
            LIBS.rotateX(finger.POSITION_MATRIX, LIBS.degToRad(-90)); // Arahkan jari ke depan (sumbu Z lokal jadi ke depan)

            // ▼▼▼ PERBAIKAN: Geser sedikit ke depan SETELAH rotasi X ▼▼▼
            const slightOffset = 0.01; // Jarak kecil untuk menghindari Z-fighting
            LIBS.translateZ(finger.POSITION_MATRIX, slightOffset);
            // ▲▲▲ SELESAI PERBAIKAN ▲▲▲


            LIBS.rotateZ(finger.POSITION_MATRIX, LIBS.degToRad(0)); // (Ini tidak melakukan apa-apa, bisa dihapus)
            
            this.childs.push(finger);
        }

// ... kode setelahnya ...

        this.childs.push(arm);
    }
}