// Ambil LIBS dari window (sudah di-load oleh index.html)
const LIBS = window.LIBS;

export class Environment {
    constructor(canvasId, globalApp) {
        this.globalApp = globalApp;
        this.canvas = document.getElementById(canvasId);

        const gl = this.canvas.getContext('webgl', {
            alpha: false, antialias: true, depth: true, stencil: false,
            preserveDrawingBuffer: false, powerPreference: "high-performance"
        });

        if (!gl) { alert('WebGL not supported'); }

        this.gl = gl;
        this.globalApp.gl = gl; // Simpan ke global

        // Anisotropic Filtering
        const ext = gl.getExtension('EXT_texture_filter_anisotropic');
        if (ext) {
            const max = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
            console.log('Anisotropic filtering enabled:', max);
        }

        // Bind 'this' untuk resize handler
        this.resizeCanvas = this.resizeCanvas.bind(this);
        window.addEventListener('resize', this.resizeCanvas);
    }

    setup() {
        this.resizeCanvas(); // Panggil sekali saat setup
        this._setupShaders();
        this._setupCloudShaders();
        this._setupWaterfallShader();
        this._getShaderLocations();
        this._createAllGeometry(); // Buat data geometri
        this._createAllBuffers();  // Buat buffer WebGL
        this._setupScenePositions(); // Simpan data posisi pohon/batu
    }

    resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    _createShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compilation error in ' + (type === gl.VERTEX_SHADER ? 'Vertex' : 'Fragment') + ' Shader:');
            console.error(gl.getShaderInfoLog(shader)); // Log error kompilasi
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    _setupShaders() {
        const gl = this.gl;

        // --- Shader Utama: Vertex Shader ---
        const vsSource = `
            attribute vec4 aPosition;
            attribute vec3 aColor;
            attribute vec3 aNormal;
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;
            uniform mat4 uNormalMatrix;
            varying vec3 vColor;
            varying vec3 vNormal;
            varying vec3 vPosition;
            varying float vAO;
            void main() {
                gl_Position = uProjectionMatrix * uModelViewMatrix * aPosition;
                vec4 worldPos = uModelViewMatrix * aPosition;
                vPosition = worldPos.xyz;
                vec4 transformedNormal = uNormalMatrix * vec4(aNormal, 0.0);
                vNormal = normalize(transformedNormal.xyz);
                vAO = 1.0 - (aPosition.y * 0.1);
                vAO = clamp(vAO, 0.7, 1.0);
                vColor = aColor;
            }`;

        // --- Shader Utama: Fragment Shader ---
        const fsSource = `
            precision highp float;
            varying vec3 vColor;
            varying vec3 vNormal;
            varying vec3 vPosition;
            varying float vAO;

            void main() {
                vec3 sunDir = normalize(vec3(0.7, 0.8, 0.5));
                vec3 sunColor = vec3(1.0, 0.98, 0.90);
                float specularStrength = 0.6;
                float shininess = 32.0;

                float ambientStrength = 0.4;
                vec3 ambientColor = vec3(0.6, 0.65, 0.7);
                vec3 ambient = ambientStrength * ambientColor * vColor;

                vec3 norm = normalize(vNormal);
                float diff = max(dot(norm, sunDir), 0.0);
                vec3 diffuse = diff * sunColor * vColor;

                vec3 viewDir = normalize(-vPosition);
                vec3 halfwayDir = normalize(sunDir + viewDir);
                float spec = pow(max(dot(norm, halfwayDir), 0.0), shininess);
                vec3 specular = specularStrength * spec * sunColor;

                vec3 lighting = ambient + diffuse + specular;

                lighting *= vAO;
                lighting = pow(lighting, vec3(1.0/2.2)); // Gamma Correction

                gl_FragColor = vec4(lighting, 1.0);
            }`;

        const vertexShader = this._createShader(gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this._createShader(gl.FRAGMENT_SHADER, fsSource);

        if (!vertexShader || !fragmentShader) {
            console.error("Main shader creation failed. Cannot proceed with linking.");
            return;
        }

        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Main shader program linking failed:', gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
            this.mainProgram = null;
            this.globalApp.mainProgram = null;
            return;
        }

        this.mainProgram = program;
        this.globalApp.mainProgram = program;
    }

    _setupCloudShaders() {
        const gl = this.gl;

        // --- Shader Awan: Vertex Shader ---
        const cloudVsSource = `
            attribute vec3 aPosition;
            attribute vec3 aColor;
            attribute vec3 aNormal;
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;
            varying vec3 vColor;
            varying vec3 vNormal;
            varying vec3 vPosition;
            varying vec3 vWorldPos;
            void main() {
                vec4 mvPosition = uModelViewMatrix * vec4(aPosition, 1.0);
                gl_Position = uProjectionMatrix * mvPosition;
                vPosition = mvPosition.xyz;
                vWorldPos = aPosition;
                vNormal = normalize(aNormal);
                vColor = aColor;
            }`;

        // --- Shader Awan: Fragment Shader ---
        const cloudFsSource = `
            precision highp float;
            varying vec3 vColor;
            varying vec3 vNormal;
            varying vec3 vPosition;
            varying vec3 vWorldPos;
            void main() {
                vec3 sunDir = normalize(vec3(0.3, 0.85, 0.4));
                float sunDiff = max(dot(vNormal, sunDir), 0.0);
                float wrapDiff = (sunDiff * 0.5 + 0.5);
                wrapDiff = pow(wrapDiff, 1.5);
                vec3 skyDir = vec3(0.0, 1.0, 0.0);
                float skyDiff = dot(vNormal, skyDir) * 0.5 + 0.5;
                float backLight = max(0.0, -dot(vNormal, sunDir));
                backLight = pow(backLight, 2.0) * 0.4;
                float lighting = skyDiff * 0.85 + wrapDiff * 0.5 + backLight * 0.3;
                lighting = clamp(lighting, 0.8, 1.25);
                vec3 viewDir = normalize(-vPosition);
                float edge = dot(viewDir, vNormal);
                edge = smoothstep(0.0, 1.0, edge);
                edge = pow(edge, 1.8);
                vec3 finalColor = vColor * lighting;
                finalColor += vec3(0.08, 0.09, 0.1) * pow(wrapDiff, 3.0);
                float alpha = mix(0.94, 0.98, edge);
                gl_FragColor = vec4(finalColor, alpha);
            }`;

        const cloudVs = this._createShader(gl.VERTEX_SHADER, cloudVsSource);
        const cloudFs = this._createShader(gl.FRAGMENT_SHADER, cloudFsSource);

        if (!cloudVs || !cloudFs) {
            console.error("Cloud shader creation failed.");
            return;
        }

        const cloudProgram = gl.createProgram();
        gl.attachShader(cloudProgram, cloudVs);
        gl.attachShader(cloudProgram, cloudFs);
        gl.linkProgram(cloudProgram);

        if (!gl.getProgramParameter(cloudProgram, gl.LINK_STATUS)) {
            console.error('Cloud shader program linking failed:', gl.getProgramInfoLog(cloudProgram));
            gl.deleteProgram(cloudProgram);
            this.cloudProgram = null;
            this.globalApp.cloudProgram = null;
            return;
        }

        this.cloudProgram = cloudProgram;
        this.globalApp.cloudProgram = cloudProgram;
    }

    // Ganti fungsi lama di environment.js dengan ini
    _setupWaterfallShader() {
        const gl = this.gl;

        // --- Shader Air Terjun: Vertex Shader ---
        const vsSource = `attribute vec4 aPosition;
        attribute vec3 aColor;
        attribute vec3 aNormal;
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
        uniform float uTime;
        varying vec3 vColor;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
            vec4 pos = aPosition;
            
            // Tambahkan animasi riak
            pos.x += sin(pos.y * 2.5 + uTime * 5.0) * 0.08;
            pos.z += cos(pos.y * 2.5 + uTime * 5.0) * 0.08;

            // Hitung faktor lengkungan (bend)
            float bendFactor = (pos.y / -2.5); // Asumsi tinggi air -2.5
            bendFactor = pow(bendFactor, 2.0); 

            // Terapkan lengkungan ke arah Z (ke depan)
            float bendAmount = 1.0; 
            pos.z += bendFactor * bendAmount;

            gl_Position = uProjectionMatrix * uModelViewMatrix * pos;
            vPosition = pos.xyz;
            vNormal = normalize(aNormal);
            vColor = aColor;
        }`;

        // --- Shader Air Terjun: Fragment Shader ---
        const fsSource = `precision highp float;
        varying vec3 vColor;
        varying vec3 vPosition;
        varying vec3 vNormal;
        uniform float uTime;

        void main() {
            float foam = sin(vPosition.y * 5.0 - uTime * 10.0) * 0.5 + 0.5;
            foam = smoothstep(0.6, 1.0, foam) * 0.8;
            vec3 foamColor = vec3(0.8, 0.9, 1.0) * foam;
            vec3 finalColor = vColor + foamColor;
            gl_FragColor = vec4(finalColor, 0.85);
        }`;

        const vertexShader = this._createShader(gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this._createShader(gl.FRAGMENT_SHADER, fsSource);

        if (!vertexShader || !fragmentShader) {
            console.error("Waterfall shader creation failed."); return;
        }

        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Waterfall shader program linking failed:', gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
            this.waterfallProgram = null;
            this.globalApp.waterfallProgram = null;
            return;
        }

        this.waterfallProgram = program;
        this.globalApp.waterfallProgram = program;
        console.log("--- WATERFALL SHADER SUKSES DIBUAT ---");
    }

    _getShaderLocations() {
        const gl = this.gl;
        // Lokasi Program Utama
        if (this.mainProgram) {
            gl.useProgram(this.mainProgram);
            this.globalApp.posLoc = gl.getAttribLocation(this.mainProgram, 'aPosition');
            this.globalApp.colLoc = gl.getAttribLocation(this.mainProgram, 'aColor');
            this.globalApp.normLoc = gl.getAttribLocation(this.mainProgram, 'aNormal');
            this.globalApp.mvLoc = gl.getUniformLocation(this.mainProgram, 'uModelViewMatrix');
            this.globalApp.projLoc = gl.getUniformLocation(this.mainProgram, 'uProjectionMatrix');
            this.globalApp.normMatLoc = gl.getUniformLocation(this.mainProgram, 'uNormalMatrix');
        } else {
            console.error("Main shader program not available for getting locations.");
        }

        // Lokasi Program Awan
        if (this.cloudProgram) {
            gl.useProgram(this.cloudProgram);
            this.cPositionLocation = gl.getAttribLocation(this.cloudProgram, 'aPosition');
            this.cColorLocation = gl.getAttribLocation(this.cloudProgram, 'aColor');
            this.cNormalLocation = gl.getAttribLocation(this.cloudProgram, 'aNormal');
            this.cModelViewLocation = gl.getUniformLocation(this.cloudProgram, 'uModelViewMatrix');
            this.cProjectionLocation = gl.getUniformLocation(this.cloudProgram, 'uProjectionMatrix');
        } else {
            console.error("Cloud shader program not available for getting locations.");
        }

        if (this.waterfallProgram) {
            gl.useProgram(this.waterfallProgram);
            // Simpan lokasi ke globalApp agar bisa diakses IslandNode
            this.globalApp.wPosLoc = gl.getAttribLocation(this.waterfallProgram, 'aPosition');
            this.globalApp.wColLoc = gl.getAttribLocation(this.waterfallProgram, 'aColor');
            this.globalApp.wNormLoc = gl.getAttribLocation(this.waterfallProgram, 'aNormal');
            this.globalApp.wMvLoc = gl.getUniformLocation(this.waterfallProgram, 'uModelViewMatrix');
            this.globalApp.wProjLoc = gl.getUniformLocation(this.waterfallProgram, 'uProjectionMatrix');
            this.globalApp.wTimeLoc = gl.getUniformLocation(this.waterfallProgram, 'uTime');
        } else {
            console.error("Waterfall shader program not available for getting locations.");
        }
    }

    _createAllGeometry() {
        // Simpan semua data geometri mentah
        this.islandGeo = this._createHexagonIsland(2.5, 1.5);
        this.treeTrunkGeo = this._createCurvedTrunk(1.5, 0.18, 0.08, 18, 0.3);
        this.branchGeo = this._createBranch(0.45, 0.06, 12);
        this.leafSphere1Geo = this._createDetailedSphere(0.55, 28, [1.0, 0.72, 0.82], true);
        this.leafSphere2Geo = this._createDetailedSphere(0.45, 24, [0.98, 0.68, 0.78], true);
        this.leafSphere3Geo = this._createDetailedSphere(0.38, 22, [1.0, 0.75, 0.85], true);
        this.rockGeo = this._createDetailedSphere(0.2, 16, [0.50, 0.50, 0.48], false);
        this.cloudGeo = this._createCloud(1.0);
    }

    _createAllBuffers() {
        // Buat buffer WebGL dari data geometri
        this.buffers = {
            island: this._createBuffers(this.islandGeo),
            treeTrunk: this._createBuffers(this.treeTrunkGeo),
            branch: this._createBuffers(this.branchGeo),
            leafSphere1: this._createBuffers(this.leafSphere1Geo),
            leafSphere2: this._createBuffers(this.leafSphere2Geo),
            leafSphere3: this._createBuffers(this.leafSphere3Geo),
            rock: this._createBuffers(this.rockGeo),
            cloud: this._createBuffers(this.cloudGeo)
        };
    }

    _setupScenePositions() {
        // Data posisi statis untuk panggung
        this.treePositions = [{ pos: [-1.3, 0, -0.6], rotation: 0.2 }, { pos: [1.4, 0, -0.9], rotation: -0.3 }];
        this.rockPositions = [
            { pos: [-1.6, 0, 0.9], scale: 1.1 },
            { pos: [1.5, 0, 0.6], scale: 0.9 }
            // Dua batu belakang sudah dihapus
        ];
        this.globalApp.islandPositions = [[-6, 0, 0], [0, 0, 0], [6, 0, 0]];
    }

    // --- Fungsi Render Utama (Versi Pulau = Awan) ---
    render(viewMatrix, projectionMatrix) {
        const gl = this.gl;
        const camera = this.globalApp.camera;

        // 1. Setup Frame
        gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.clearColor(0.53, 0.81, 0.92, 1.0); gl.clearDepth(1.0);

        // Kita butuh ini untuk Awan dan Pulau
        const viewMatrixNoRot = camera.getViewMatrixNoRotation();

        // 2. Render Awan (jika program cloud ada dan kamera ada)
        if (this.cloudProgram && this.cProjectionLocation && this.buffers.cloud && camera) {
            gl.useProgram(this.cloudProgram);
            gl.uniformMatrix4fv(this.cProjectionLocation, false, projectionMatrix);

            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            gl.depthMask(false);

            if (this.globalApp.cloudSystem && this.globalApp.cloudSystem.clouds) {
                for (const cloudData of this.globalApp.cloudSystem.clouds) {
                    let cloudMv = LIBS.get_I4();
                    // Kalikan dengan view matrix tanpa rotasi
                    LIBS.mul(cloudMv, viewMatrixNoRot, cloudMv);
                    // Terapkan transformasi lokal awan
                    LIBS.translateX(cloudMv, cloudData.x);
                    LIBS.translateY(cloudMv, cloudData.y);
                    LIBS.translateZ(cloudMv, cloudData.z);
                    LIBS.rotateY(cloudMv, cloudData.rotY);
                    LIBS.scale(cloudMv, cloudData.size, cloudData.size * 0.6, cloudData.size * 0.9);
                    this._drawCloud(this.buffers.cloud, cloudMv);
                }
            }

            gl.depthMask(true);
            gl.disable(gl.BLEND);
        }

        // 3. Render Scene Graph & Pulau
        if (this.mainProgram && this.globalApp.projLoc && this.globalApp.actors) {
            gl.useProgram(this.mainProgram);
            gl.uniformMatrix4fv(this.globalApp.projLoc, false, projectionMatrix);

            // Render pulau di sini secara manual, menggunakan data posisi dari 'this.globalApp.islandPositions'
            // dan matriks 'viewMatrixNoRot'.
            if (this.globalApp.islandPositions && this.buffers.island) {
                // for (const pos of this.globalApp.islandPositions) {
                //     let islandMv = LIBS.get_I4();
                    
                //     // Kalikan dengan view matrix TANPA rotasi (LOGIKA AWAN)
                //     LIBS.mul(islandMv, viewMatrixNoRot, islandMv);
                    
                //     // Terapkan transformasi lokal (posisi)
                //     LIBS.translateX(islandMv, pos[0]);
                //     LIBS.translateY(islandMv, pos[1]);
                //     LIBS.translateZ(islandMv, pos[2]);
                    
                //     // Gambar pulau menggunakan draw function yang normal (bukan _drawCloud)
                //     this._drawObject(this.buffers.island, islandMv);
                // }
            }

            // Render scene graph menggunakan viewMatrix biasa (DENGAN rotasi)
            // PENTING: Pastikan 'IslandNode' tidak ada lagi di dalam 'this.globalApp.actors'
            for (const actor of this.globalApp.actors) {
                actor.render(viewMatrix);
            }
        }
    }

    // --- Fungsi Helper Draw ---
    _drawCloud(bufferSet, modelViewMatrix) {
        const gl = this.gl;
        if (!this.cModelViewLocation || !bufferSet) return;
        gl.uniformMatrix4fv(this.cModelViewLocation, false, modelViewMatrix);

        let attributesEnabled = 0; // Bitmask to track enabled attributes

        if (this.cPositionLocation !== null && this.cPositionLocation !== -1 && bufferSet.position) {
            gl.bindBuffer(gl.ARRAY_BUFFER, bufferSet.position);
            gl.enableVertexAttribArray(this.cPositionLocation);
            gl.vertexAttribPointer(this.cPositionLocation, 3, gl.FLOAT, false, 0, 0);
            attributesEnabled |= 1;
        }
        if (this.cColorLocation !== null && this.cColorLocation !== -1 && bufferSet.color) {
            gl.bindBuffer(gl.ARRAY_BUFFER, bufferSet.color);
            gl.enableVertexAttribArray(this.cColorLocation);
            gl.vertexAttribPointer(this.cColorLocation, 3, gl.FLOAT, false, 0, 0);
            attributesEnabled |= 2;
        }
        if (this.cNormalLocation !== null && this.cNormalLocation !== -1 && bufferSet.normal) {
            gl.bindBuffer(gl.ARRAY_BUFFER, bufferSet.normal);
            gl.enableVertexAttribArray(this.cNormalLocation);
            gl.vertexAttribPointer(this.cNormalLocation, 3, gl.FLOAT, false, 0, 0);
            attributesEnabled |= 4;
        }

        if (bufferSet.index) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferSet.index);
            gl.drawElements(gl.TRIANGLES, bufferSet.indexCount, gl.UNSIGNED_SHORT, 0);
        } else {
            console.warn("Index buffer missing for cloud drawing");
        }

        if (attributesEnabled & 1) gl.disableVertexAttribArray(this.cPositionLocation);
        if (attributesEnabled & 2) gl.disableVertexAttribArray(this.cColorLocation);
        if (attributesEnabled & 4) gl.disableVertexAttribArray(this.cNormalLocation);
    }

    _drawObject(bufferSet, modelViewMatrix) {
        const gl = this.gl;
        const app = this.globalApp;

        if (!app.mvLoc || !app.normMatLoc || !bufferSet) return;
        gl.uniformMatrix4fv(app.mvLoc, false, modelViewMatrix);
        gl.uniformMatrix4fv(app.normMatLoc, false, modelViewMatrix);

        let attributesEnabled = 0; // Bitmask

        if (app.posLoc !== null && app.posLoc !== -1 && bufferSet.position) {
            gl.bindBuffer(gl.ARRAY_BUFFER, bufferSet.position);
            gl.enableVertexAttribArray(app.posLoc);
            gl.vertexAttribPointer(app.posLoc, 3, gl.FLOAT, false, 0, 0);
            attributesEnabled |= 1;
        }
        if (app.colLoc !== null && app.colLoc !== -1 && bufferSet.color) {
            gl.bindBuffer(gl.ARRAY_BUFFER, bufferSet.color);
            gl.enableVertexAttribArray(app.colLoc);
            gl.vertexAttribPointer(app.colLoc, 3, gl.FLOAT, false, 0, 0);
            attributesEnabled |= 2;
        }
        if (app.normLoc !== null && app.normLoc !== -1 && bufferSet.normal) {
            gl.bindBuffer(gl.ARRAY_BUFFER, bufferSet.normal);
            gl.enableVertexAttribArray(app.normLoc);
            gl.vertexAttribPointer(app.normLoc, 3, gl.FLOAT, false, 0, 0);
            attributesEnabled |= 4;
        }

        if (bufferSet.index) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferSet.index);
            gl.drawElements(gl.TRIANGLES, bufferSet.indexCount, gl.UNSIGNED_SHORT, 0);
        } else {
            console.warn("Index buffer missing for object drawing", bufferSet);
        }

        // Disable only the attributes that were enabled
        if (attributesEnabled & 1) gl.disableVertexAttribArray(app.posLoc);
        if (attributesEnabled & 2) gl.disableVertexAttribArray(app.colLoc);
        if (attributesEnabled & 4) gl.disableVertexAttribArray(app.normLoc);
    }

    // --- Fungsi Geometri ---
    _createDetailedSphere(radius, segments, baseColor, addDetail = false) { const vertices = []; const colors = []; const normals = []; const indices = []; const segs = Math.floor(segments * 1.5); for (let lat = 0; lat <= segs; lat++) { const theta = lat * Math.PI / segs; const sinTheta = Math.sin(theta); const cosTheta = Math.cos(theta); for (let lon = 0; lon <= segs; lon++) { const phi = lon * 2 * Math.PI / segs; const sinPhi = Math.sin(phi); const cosPhi = Math.cos(phi); const x = cosPhi * sinTheta; const y = cosTheta; const z = sinPhi * sinTheta; const noise = addDetail ? (Math.sin(phi * 4) * Math.sin(theta * 4) * 0.03) : 0; const r = radius + noise; vertices.push(r * x, r * y, r * z); normals.push(x, y, z); let colorVar = 1.0; if (addDetail) { colorVar = 0.96 + Math.random() * 0.08; colorVar *= (0.92 + y * 0.08); } colors.push(baseColor[0] * colorVar, baseColor[1] * colorVar, baseColor[2] * colorVar); } } for (let lat = 0; lat < segs; lat++) { for (let lon = 0; lon < segs; lon++) { const first = lat * (segs + 1) + lon; const second = first + segs + 1; indices.push(first, second, first + 1); indices.push(second, second + 1, first + 1); } } return { vertices: new Float32Array(vertices), colors: new Float32Array(colors), normals: new Float32Array(normals), indices: new Uint16Array(indices) }; }
    _createCurvedTrunk(height, baseRadius, topRadius, segments, curveAmount) { const vertices = []; const colors = []; const normals = []; const indices = []; const heightSegments = 20; const radialSegments = segments; for (let h = 0; h <= heightSegments; h++) { const v = h / heightSegments; const y = v * height; const curveX = Math.sin(v * Math.PI * 1.2) * curveAmount; const curveZ = Math.cos(v * Math.PI * 2.5) * curveAmount * 0.4; const radius = baseRadius + (topRadius - baseRadius) * v; for (let r = 0; r <= radialSegments; r++) { const u = r / radialSegments; const theta = u * Math.PI * 2; const barkNoise = Math.sin(theta * 8 + v * 12) * 0.015; const finalRadius = radius + barkNoise; const x = Math.cos(theta) * finalRadius + curveX; const z = Math.sin(theta) * finalRadius + curveZ; vertices.push(x, y, z); const nx = Math.cos(theta); const nz = Math.sin(theta); normals.push(nx, 0, nz); const colorVar = 0.8 + Math.sin(theta * 5 + v * 10) * 0.2; const darken = 0.88 + v * 0.12; colors.push(0.36 * colorVar * darken, 0.23 * colorVar * darken, 0.13 * colorVar * darken); } } for (let h = 0; h < heightSegments; h++) { for (let r = 0; r < radialSegments; r++) { const current = h * (radialSegments + 1) + r; const next = current + radialSegments + 1; indices.push(current, next, current + 1); indices.push(current + 1, next, next + 1); } } return { vertices: new Float32Array(vertices), colors: new Float32Array(colors), normals: new Float32Array(normals), indices: new Uint16Array(indices) }; }
    _createBranch(length, radius, segments) { const vertices = []; const colors = []; const normals = []; const indices = []; const heightSegments = 10; const radialSegments = segments; for (let h = 0; h <= heightSegments; h++) { const v = h / heightSegments; const y = v * length; const currentRadius = radius * (1 - v * 0.6); const bendX = v * v * 0.1; for (let r = 0; r <= radialSegments; r++) { const u = r / radialSegments; const theta = u * Math.PI * 2; const x = Math.cos(theta) * currentRadius + bendX; const z = Math.sin(theta) * currentRadius; vertices.push(x, y, z); normals.push(Math.cos(theta), 0, Math.sin(theta)); const colorVar = 0.85 + Math.sin(theta * 3) * 0.15; colors.push(0.33 * colorVar, 0.21 * colorVar, 0.11 * colorVar); } } for (let h = 0; h < heightSegments; h++) { for (let r = 0; r < radialSegments; r++) { const current = h * (radialSegments + 1) + r; const next = current + radialSegments + 1; indices.push(current, next, current + 1); indices.push(current + 1, next, next + 1); } } return { vertices: new Float32Array(vertices), colors: new Float32Array(colors), normals: new Float32Array(normals), indices: new Uint16Array(indices) }; }
    _createHexagonIsland(size, height) { const vertices = []; const colors = []; const normals = []; const indices = []; const topGrassColor = [0.68, 0.84, 0.37]; const sideSoilColor = [0.57, 0.44, 0.30]; const rockTopColor = [0.47, 0.37, 0.30]; const rockMidColor = [0.40, 0.32, 0.27]; const rockBottomColor = [0.32, 0.30, 0.32]; const rockDarkColor = [0.27, 0.25, 0.27]; const topCenter = vertices.length / 3; vertices.push(0, height / 2, 0); colors.push(...topGrassColor); normals.push(0, 1, 0); for (let i = 0; i <= 6; i++) { const angle = (i / 6) * Math.PI * 2; const x = Math.cos(angle) * size; const z = Math.sin(angle) * size; vertices.push(x, height / 2, z); colors.push(...topGrassColor); normals.push(0, 1, 0); } const soilStart = vertices.length / 3; for (let i = 0; i <= 6; i++) { const angle = (i / 6) * Math.PI * 2; const x = Math.cos(angle) * size; const z = Math.sin(angle) * size; vertices.push(x, height / 2 - 0.15, z); colors.push(...sideSoilColor); const nx = Math.cos(angle); const nz = Math.sin(angle); normals.push(nx, 0, nz); } const layers = [{ y: height / 2 - 0.15, scale: 0.95, color: rockTopColor }, { y: height / 4, scale: 0.85, color: rockMidColor }, { y: 0, scale: 0.70, color: rockMidColor }, { y: -height / 4, scale: 0.55, color: rockBottomColor }, { y: -height / 2 + 0.3, scale: 0.40, color: rockDarkColor }, { y: -height / 2, scale: 0.25, color: rockDarkColor }]; const layerStarts = []; layers.forEach((layer, layerIdx) => { const startIdx = vertices.length / 3; layerStarts.push(startIdx); const segments = 8; for (let i = 0; i <= segments; i++) { const angle = (i / segments) * Math.PI * 2; const randomOffset = (Math.sin(angle * 3 + layerIdx) * 0.1 + Math.cos(angle * 5) * 0.08) * layer.scale; const finalScale = layer.scale + randomOffset; const x = Math.cos(angle) * size * finalScale; const z = Math.sin(angle) * size * finalScale; vertices.push(x, layer.y, z); const colorVar = 0.92 + Math.random() * 0.16; colors.push(layer.color[0] * colorVar, layer.color[1] * colorVar, layer.color[2] * colorVar); const nx = Math.cos(angle); const nz = Math.sin(angle); normals.push(nx, -0.3, nz); } }); const bottomTip = vertices.length / 3; vertices.push(0, -height / 2 - 0.2, 0); colors.push(...rockDarkColor); normals.push(0, -1, 0); for (let i = 1; i <= 6; i++) { indices.push(topCenter, i, i + 1); } const grassEdgeStart = 1; for (let i = 0; i < 6; i++) { const t1 = grassEdgeStart + i; const t2 = grassEdgeStart + i + 1; const b1 = soilStart + i; const b2 = soilStart + i + 1; indices.push(t1, b1, t2); indices.push(t2, b1, b2); } const firstRockStart = layerStarts[0]; for (let i = 0; i < 7; i++) { const s1 = soilStart + i; const s2 = soilStart + i + 1; const r1 = firstRockStart + i; const r2 = firstRockStart + i + 1; indices.push(s1, r1, s2); indices.push(s2, r1, r2); } for (let layer = 0; layer < layerStarts.length - 1; layer++) { const currentStart = layerStarts[layer]; const nextStart = layerStarts[layer + 1]; const segments = 8; for (let i = 0; i < segments; i++) { const c1 = currentStart + i; const c2 = currentStart + i + 1; const n1 = nextStart + i; const n2 = nextStart + i + 1; indices.push(c1, n1, c2); indices.push(c2, n1, n2); } } const lastLayerStart = layerStarts[layerStarts.length - 1]; for (let i = 0; i < 8; i++) { const l1 = lastLayerStart + i; const l2 = lastLayerStart + i + 1; indices.push(l1, bottomTip, l2); } return { vertices: new Float32Array(vertices), colors: new Float32Array(colors), normals: new Float32Array(normals), indices: new Uint16Array(indices) }; }
    
    _createCloud(size) { const vertices = []; const colors = []; const normals = []; const indices = []; const cloudColorTop = [0.98, 0.99, 1.0]; const cloudColorMid = [0.94, 0.96, 0.98]; const cloudColorBottom = [0.82, 0.86, 0.92]; const spheres = [{ x: 0, y: 0, z: 0, r: size * 1.5 }, { x: -size * 1.2, y: -0.05, z: 0.1, r: size * 1.0 }, { x: -size * 2.0, y: -0.1, z: -0.05, r: size * 0.75 }, { x: -size * 2.6, y: 0.05, z: 0, r: size * 0.5 }, { x: size * 1.3, y: 0, z: -0.1, r: size * 1.1 }, { x: size * 2.2, y: -0.08, z: 0.05, r: size * 0.8 }, { x: size * 2.8, y: 0.1, z: 0, r: size * 0.45 }, { x: -size * 0.8, y: 0.55, z: 0, r: size * 0.7 }, { x: size * 0.5, y: 0.6, z: -0.05, r: size * 0.65 }, { x: -size * 1.6, y: 0.45, z: 0.08, r: size * 0.55 }, { x: size * 1.5, y: 0.5, z: 0.1, r: size * 0.6 }, { x: -size * 0.5, y: -0.35, z: 0, r: size * 0.85 }, { x: size * 0.6, y: -0.3, z: 0, r: size * 0.8 }, { x: size * 1.8, y: -0.25, z: 0, r: size * 0.6 }, { x: -size * 1.5, y: -0.3, z: 0, r: size * 0.7 }, { x: -size * 0.2, y: 0.75, z: 0.05, r: size * 0.4 }, { x: size * 0.9, y: 0.7, z: -0.08, r: size * 0.35 }, { x: -size * 2.3, y: 0.3, z: 0, r: size * 0.42 }, { x: size * 2.5, y: 0.35, z: 0, r: size * 0.38 }]; spheres.forEach(sphere => { const segments = 16; const startVertex = vertices.length / 3; for (let lat = 0; lat <= segments; lat++) { const theta = lat * Math.PI / segments; const sinTheta = Math.sin(theta); const cosTheta = Math.cos(theta); for (let lon = 0; lon <= segments; lon++) { const phi = lon * 2 * Math.PI / segments; const sinPhi = Math.sin(phi); const cosPhi = Math.cos(phi); const x = cosPhi * sinTheta; const y = cosTheta; const z = sinPhi * sinTheta; const deform = 1.0 + Math.sin(phi * 2.5) * Math.cos(theta * 1.8) * 0.08; const vx = sphere.x + sphere.r * x * deform; const vy = sphere.y + sphere.r * y * deform; const vz = sphere.z + sphere.r * z * deform; vertices.push(vx, vy, vz); normals.push(x, y, z); const worldY = vy; let finalColor; if (worldY > 0.4) { const t = (worldY - 0.4) / 0.6; finalColor = [cloudColorMid[0] + (cloudColorTop[0] - cloudColorMid[0]) * t, cloudColorMid[1] + (cloudColorTop[1] - cloudColorMid[1]) * t, cloudColorMid[2] + (cloudColorTop[2] - cloudColorMid[2]) * t]; } else if (worldY > -0.2) { finalColor = [...cloudColorMid]; } else { const t = (worldY + 0.5) / 0.3; const clampedT = Math.max(0, Math.min(1, t)); finalColor = [cloudColorBottom[0] + (cloudColorMid[0] - cloudColorBottom[0]) * clampedT, cloudColorBottom[1] + (cloudColorMid[1] - cloudColorBottom[1]) * clampedT, cloudColorBottom[2] + (cloudColorMid[2] - cloudColorBottom[2]) * clampedT]; } const colorVar = 0.99 + Math.random() * 0.02; colors.push(finalColor[0] * colorVar, finalColor[1] * colorVar, finalColor[2] * colorVar); } } for (let lat = 0; lat < segments; lat++) { for (let lon = 0; lon < segments; lon++) { const first = startVertex + lat * (segments + 1) + lon; const second = first + segments + 1; indices.push(first, second, first + 1); indices.push(second, second + 1, first + 1); } } }); return { vertices: new Float32Array(vertices), colors: new Float32Array(colors), normals: new Float32Array(normals), indices: new Uint16Array(indices) }; }

    _createBuffers(geometry) {
        const gl = this.gl;
        const posBuffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer); gl.bufferData(gl.ARRAY_BUFFER, geometry.vertices, gl.STATIC_DRAW);
        const colBuffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, colBuffer); gl.bufferData(gl.ARRAY_BUFFER, geometry.colors, gl.STATIC_DRAW);
        const normBuffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, normBuffer); gl.bufferData(gl.ARRAY_BUFFER, geometry.normals, gl.STATIC_DRAW);
        const idxBuffer = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuffer); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW);
        return { position: posBuffer, color: colBuffer, normal: normBuffer, index: idxBuffer, indexCount: geometry.indices.length };
    }
}