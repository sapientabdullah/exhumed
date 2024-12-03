import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { RGBELoader } from 'three/examples/jsm/Addons.js';
import { loadingManager } from './loadingManager';

export function initializeScene() {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    75,
    innerWidth / innerHeight,
    0.1,
    1000
  );
  camera.rotation.order = 'YXZ';
  scene.add(camera);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.6;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  document.body.appendChild(renderer.domElement);

  const fogColor = 0x000000;
  const fogDensity = 0.05;
  scene.fog = new THREE.FogExp2(fogColor, fogDensity);
  renderer.setClearColor(fogColor);

  const stats = new Stats() as any;
  document.body.appendChild(stats.domElement);

  new RGBELoader(loadingManager).load(
    '/background/background 4K.hdr',
    (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.background = texture;
      scene.environment = texture;
    }
  );

  return { scene, camera, renderer, stats };
}
