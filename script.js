// WebGL (setup + init)
const canvas1 = document.getElementById('canvas1');
const canvas2 = document.getElementById('canvas2');
const gl = canvas1.getContext('webgl') || canvas1.getContext('experimental-webgl');
const gl2 = canvas2.getContext('webgl') || canvas2.getContext('experimental-webgl');
if (!gl || !gl2) {
  alert('WebGL not supported, falling back on experimental-webgl');
}

// shader src
const vertexShaderSource = `
    attribute vec3 pos;
    attribute vec4 col;
    varying vec4 color;
    void main() {
        color = col;
        gl_Position = vec4(pos, 1.0);
    }
`;
const fragmentShaderSource = `
    precision mediump float;
    varying vec4 color;
    void main() {
        gl_FragColor = color;
    }
`;

// compile shader prog
function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}
function createProgram(gl) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.useProgram(program);
  return program;
}

const program = createProgram(gl);
const program2 = createProgram(gl2);

// Möbiusband (buffers + attributes)
const positionBuffer = gl.createBuffer();
const colorBuffer = gl.createBuffer();
const lineIndexBuffer = gl.createBuffer();
const triIndexBuffer = gl.createBuffer();
const posAttribLocation = gl.getAttribLocation(program, 'pos');
const colAttribLocation = gl.getAttribLocation(program, 'col');

// TODO -------------------------------------------------------------------------------
// TODO ---------------------------- canvas 1 - Möbiusband ----------------------------
// TODO -------------------------------------------------------------------------------

// Möbiusband (params)
const m = 64;
const n = 64;
const du = 2 * Math.PI / m;
const dv = 2 / n;
const scale = 0.6; // Adjusted scale to better fit within the canvas

// Möbiusband (arrays - vertices, colors, indices (lines + triangles))
const vertices = new Float32Array(3 * (m + 1) * (n + 1));
const colors = new Float32Array(4 * (m + 1) * (n + 1));
const indicesLines = new Uint16Array(2 * 2 * m * n);
const indicesTris = new Uint16Array(6 * m * n);

// Möbiusband (generate vertex data)
let indexVertex = 0;
let indexColor = 0;
let iLines = 0;
let iTris = 0;

for (let i = 0; i <= m; i++) {
  const u = i * du;
  for (let j = 0; j <= n; j++) {
    const v = -1 + j * dv;

    // Möbiusband (calc pos)
    const x = (1 + v / 2 * Math.cos(u / 2)) * Math.cos(u) * scale;
    const y = (1 + v / 2 * Math.cos(u / 2)) * Math.sin(u) * scale;
    const z = v / 2 * Math.sin(u / 2) * scale;

    // Möbiusband (store vertex positions)
    vertices[indexVertex++] = x;
    vertices[indexVertex++] = y;
    vertices[indexVertex++] = z;

    // calc brightness (for 3D)
    // depends on z-coordinate (brightness is adjusted)
    const brightness = 1.0 - z;

    // Möbiusband (color)
    colors[indexColor++] = 0.4 * brightness;    // R
    colors[indexColor++] = 0.8 * brightness;    // G
    colors[indexColor++] = 0.4 * brightness;    // B
    colors[indexColor++] = 1.0;                 // Alpha

    // Möbiusband (indices lines)
    if (i < m && j < n) {
      const current = i * (n + 1) + j;
      const next = current + (n + 1);

      indicesLines[iLines++] = current;
      indicesLines[iLines++] = current + 1;
      indicesLines[iLines++] = current;
      indicesLines[iLines++] = next;
    }

    // Möbiusband (indices triangles)
    if (i < m && j < n) {
      const current = i * (n + 1) + j;
      const next = current + (n + 1);

      indicesTris[iTris++] = current;
      indicesTris[iTris++] = next;
      indicesTris[iTris++] = current + 1;

      indicesTris[iTris++] = current + 1;
      indicesTris[iTris++] = next;
      indicesTris[iTris++] = next + 1;
    }
  }
}

// Möbiusband (buffer data setup)
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, lineIndexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicesLines, gl.STATIC_DRAW);
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triIndexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicesTris, gl.STATIC_DRAW);

// Möbiusband (render - canvas1)
let fillAreas = true; // Initial state for filled areas

function renderMoebius() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(posAttribLocation, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(posAttribLocation);

  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.vertexAttribPointer(colAttribLocation, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(colAttribLocation);

  if (fillAreas) {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triIndexBuffer);
    gl.drawElements(gl.TRIANGLES, indicesTris.length, gl.UNSIGNED_SHORT, 0);
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, lineIndexBuffer);
  gl.disableVertexAttribArray(colAttribLocation);
  gl.vertexAttrib4f(colAttribLocation, 0.0, 0.0, 0.0, 1.0);
  gl.drawElements(gl.LINES, indicesLines.length, gl.UNSIGNED_SHORT, 0);
}

// TODO --------------------------------------------------------------------------------
// TODO ---------------------------- canvas 2 - Hyperboloid ----------------------------
// TODO --------------------------------------------------------------------------------

// Hyperboloid (params)
const a = 0.4; // Adjusted scale to better fit within the canvas
const b = 0.4; // Adjusted scale to better fit within the canvas
const c = 0.8; // Adjusted scale to better fit within the canvas
const mHyperboloid = 64;
const nHyperboloid = 32;
const duHyperboloid = 2 * Math.PI / mHyperboloid;
const dvHyperboloid = 2 / nHyperboloid;

// Hyperboloid (arrays - vertices, colors, indices (lines + triangles))
const verticesHyperboloid = new Float32Array(3 * (mHyperboloid + 1) * (nHyperboloid + 1));
const colorsHyperboloid = new Float32Array(4 * (mHyperboloid + 1) * (nHyperboloid + 1));
const indicesLinesHyperboloid = new Uint16Array(2 * 2 * mHyperboloid * nHyperboloid);
const indicesTrisHyperboloid = new Uint16Array(6 * mHyperboloid * nHyperboloid);

// Hyperboloid (generate vertex data)
let indexVertexHyperboloid = 0;
let indexColorHyperboloid = 0;
let iLinesHyperboloid = 0;
let iTrisHyperboloid = 0;

for (let i = 0; i <= mHyperboloid; i++) {
  const u = i * duHyperboloid;
  for (let j = 0; j <= nHyperboloid; j++) {
    const v = -1 + j * dvHyperboloid;

    // Hyperboloid (calc pos)
    const x = a * Math.cosh(v) * Math.cos(u);
    const y = b * Math.cosh(v) * Math.sin(u);
    const z = c * Math.sinh(v);

    // Hyperboloid (store vertex pos)
    verticesHyperboloid[indexVertexHyperboloid++] = x;
    verticesHyperboloid[indexVertexHyperboloid++] = y;
    verticesHyperboloid[indexVertexHyperboloid++] = z;

    // calc brightness (for 3D)
    // depends on z-coordinate (brightness is adjusted)
    const brightness = 1.0 - 0.5 * z;

    // Hyperboloid (color)
    colorsHyperboloid[indexColorHyperboloid++] = 0.4 * brightness;    // R
    colorsHyperboloid[indexColorHyperboloid++] = 0.8 * brightness;    // G
    colorsHyperboloid[indexColorHyperboloid++] = 0.4 * brightness;    // B
    colorsHyperboloid[indexColorHyperboloid++] = 1.0;                 // Alpha

    // Hyperboloid (indices lines)
    if (i < mHyperboloid && j < nHyperboloid) {
      const current = i * (nHyperboloid + 1) + j;
      const next = current + (nHyperboloid + 1);

      indicesLinesHyperboloid[iLinesHyperboloid++] = current;
      indicesLinesHyperboloid[iLinesHyperboloid++] = current + 1;
      indicesLinesHyperboloid[iLinesHyperboloid++] = current;
      indicesLinesHyperboloid[iLinesHyperboloid++] = next;
    }

    // Hyperboloid (indices triangles)
    if (i < mHyperboloid && j < nHyperboloid) {
      const current = i * (nHyperboloid + 1) + j;
      const next = current + (nHyperboloid + 1);

      indicesTrisHyperboloid[iTrisHyperboloid++] = current;
      indicesTrisHyperboloid[iTrisHyperboloid++] = next;
      indicesTrisHyperboloid[iTrisHyperboloid++] = current + 1;

      indicesTrisHyperboloid[iTrisHyperboloid++] = current + 1;
      indicesTrisHyperboloid[iTrisHyperboloid++] = next;
      indicesTrisHyperboloid[iTrisHyperboloid++] = next + 1;
    }
  }
}

// Hyperboloid (buffer data setup)
const positionBufferHyperboloid = gl2.createBuffer();
gl2.bindBuffer(gl2.ARRAY_BUFFER, positionBufferHyperboloid);
gl2.bufferData(gl2.ARRAY_BUFFER, verticesHyperboloid, gl2.STATIC_DRAW);

const colorBufferHyperboloid = gl2.createBuffer();
gl2.bindBuffer(gl2.ARRAY_BUFFER, colorBufferHyperboloid);
gl2.bufferData(gl2.ARRAY_BUFFER, colorsHyperboloid, gl2.STATIC_DRAW);

const lineIndexBufferHyperboloid = gl2.createBuffer();
gl2.bindBuffer(gl2.ELEMENT_ARRAY_BUFFER, lineIndexBufferHyperboloid);
gl2.bufferData(gl2.ELEMENT_ARRAY_BUFFER, indicesLinesHyperboloid, gl2.STATIC_DRAW);

const triIndexBufferHyperboloid = gl2.createBuffer();
gl2.bindBuffer(gl2.ELEMENT_ARRAY_BUFFER, triIndexBufferHyperboloid);
gl2.bufferData(gl2.ELEMENT_ARRAY_BUFFER, indicesTrisHyperboloid, gl2.STATIC_DRAW);

const posAttribLocation2 = gl2.getAttribLocation(program2, 'pos');
const colAttribLocation2 = gl2.getAttribLocation(program2, 'col');

// Hyperboloid (render - canvas2)
function renderHyperboloid() {
  gl2.clear(gl2.COLOR_BUFFER_BIT | gl2.DEPTH_BUFFER_BIT);
  gl2.enable(gl2.DEPTH_TEST);
  gl2.depthFunc(gl2.LEQUAL);

  gl2.bindBuffer(gl2.ARRAY_BUFFER, positionBufferHyperboloid);
  gl2.vertexAttribPointer(posAttribLocation2, 3, gl.FLOAT, false, 0, 0);
  gl2.enableVertexAttribArray(posAttribLocation2);

  gl2.bindBuffer(gl2.ARRAY_BUFFER, colorBufferHyperboloid);
  gl2.vertexAttribPointer(colAttribLocation2, 4, gl.FLOAT, false, 0, 0);
  gl2.enableVertexAttribArray(colAttribLocation2);

  // draw filled surface (when fillAreas == true)
  if (fillAreas) {
    gl2.bindBuffer(gl2.ELEMENT_ARRAY_BUFFER, triIndexBufferHyperboloid);
    gl2.drawElements(gl2.TRIANGLES, indicesTrisHyperboloid.length, gl2.UNSIGNED_SHORT, 0);
  }

  // draw wireframe lines
  gl2.bindBuffer(gl2.ELEMENT_ARRAY_BUFFER, lineIndexBufferHyperboloid);
  gl2.disableVertexAttribArray(colAttribLocation2);
  gl2.vertexAttrib4f(colAttribLocation2, 0.0, 0.0, 0.0, 1.0);
  gl2.drawElements(gl2.LINES, indicesLinesHyperboloid.length, gl2.UNSIGNED_SHORT, 0);
}

// init render
renderMoebius();
renderHyperboloid();

// render areas
function render() {
  renderMoebius();
  renderHyperboloid();
}

// Toggle fillAreas with 'C' key
document.addEventListener('keydown', (event) => {
  if (event.key === 'c' || event.key === 'C') {
    fillAreas = !fillAreas;
    render();
  }
});