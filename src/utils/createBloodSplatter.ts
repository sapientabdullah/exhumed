import * as THREE from 'three';
import { loadingManager } from './loadingManager';
const textureLoader = new THREE.TextureLoader(loadingManager);
const bloodSplatterTexture = textureLoader.load('/blood-splatter.png');

export function createBloodSplatter(
  impactPosition: THREE.Vector3,
  impactNormal: THREE.Vector3,
  scene: THREE.Scene
) {
  const splatterSize = Math.random() * 1.5 + 1.5;
  const splatterGeometry = new THREE.PlaneGeometry(splatterSize, splatterSize);
  const splatterMaterial = new THREE.MeshBasicMaterial({
    map: bloodSplatterTexture,
    transparent: true,
    depthWrite: false,
  });

  const splatter = new THREE.Mesh(splatterGeometry, splatterMaterial);

  splatter.position.copy(impactPosition);

  const quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), impactNormal);
  splatter.quaternion.copy(quaternion);

  scene.add(splatter);

  const fadeDuration = 1;
  const fadeInterval = setInterval(() => {
    splatterMaterial.opacity -= 0.1;
    if (splatterMaterial.opacity <= 0) {
      clearInterval(fadeInterval);
      scene.remove(splatter);
      splatter.geometry.dispose();
      splatter.material.dispose();
    }
  }, (fadeDuration * 1000) / 20);
}
