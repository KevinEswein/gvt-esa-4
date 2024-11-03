const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(500, 500);  // Set the renderer size to 500x500px

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);  // Initial aspect ratio set to 1
camera.position.z = 5;

const createParametricSurface = (uMin, uMax, vMin, vMax, uSegments, vSegments, parametricFunction) => {
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  const indices = [];
  const colors = [];

  for (let i = 0; i <= uSegments; i++) {
    for (let j = 0; j <= vSegments; j++) {
      const u = uMin + (uMax - uMin) * (i / uSegments);
      const v = vMin + (vMax - vMin) * (j / vSegments);
      const [x, y, z] = parametricFunction(u, v);
      positions.push(x, y, z);

      // Color based on position (simple gradient)
      const color = new THREE.Color((x + 1) / 2, (y + 1) / 2, (z + 1) / 2);
      colors.push(color.r, color.g, color.b);
    }
  }

  for (let i = 0; i < uSegments; i++) {
    for (let j = 0; j < vSegments; j++) {
      const a = i * (vSegments + 1) + j;
      const b = i * (vSegments + 1) + (j + 1);
      const c = (i + 1) * (vSegments + 1) + (j + 1);
      const d = (i + 1) * (vSegments + 1) + j;

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const material = new THREE.MeshBasicMaterial({ vertexColors: true, wireframe: true });
  return new THREE.Mesh(geometry, material);
};

const parametricFunction1 = (u, v) => {
  const x = Math.sin(u) * Math.cos(v);
  const y = Math.sin(u) * Math.sin(v);
  const z = Math.cos(u);
  return [x, y, z];
};

const parametricFunction2 = (u, v) => {
  const x = u * Math.cos(v);
  const y = u * Math.sin(v);
  const z = v;
  return [x, y, z];
};

const surface1 = createParametricSurface(0, Math.PI, 0, 2 * Math.PI, 50, 50, parametricFunction1);
const surface2 = createParametricSurface(-1, 1, -1, 1, 50, 50, parametricFunction2);

scene.add(surface1);
scene.add(surface2);

const animate = () => {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
};

animate();

// Eigene Parametrisierung erstellen
const parametricFunction3 = (u, v) => {
  const x = Math.sin(u) * Math.cos(v);
  const y = Math.sin(u) * Math.sin(v);
  const z = Math.cos(u) + 0.5 * Math.sin(4 * u);
  return [x, y, z];
};

const surface3 = createParametricSurface(0, Math.PI, 0, 2 * Math.PI, 50, 50, parametricFunction3);
scene.add(surface3);

// Interaktion (B-Button = Fläche umschalten)
let currentSurface = 0;
const surfaces = [surface1, surface2, surface3];

document.addEventListener('keydown', (event) => {
  if (event.key === 'b' || event.key === 'B') {
    scene.remove(surfaces[currentSurface]);
    currentSurface = (currentSurface + 1) % surfaces.length;
    scene.add(surfaces[currentSurface]);
  }
});

// Schieberegler zur Anpassung des Aspect-Ratios der Kamera
const aspectRatioInput = document.getElementById('aspectRatio');
aspectRatioInput.addEventListener('input', (event) => {
  camera.aspect = parseFloat(event.target.value);
  camera.updateProjectionMatrix();
});