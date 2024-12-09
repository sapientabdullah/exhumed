import * as THREE from 'three';

export function createStreetLight(position: THREE.Vector3) {
  const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 10, 16);
  const poleMaterial = new THREE.MeshStandardMaterial({
    color: 0x333333,
    fog: false,
  });
  const pole = new THREE.Mesh(poleGeometry, poleMaterial);
  pole.position.set(position.x, position.y + 5, position.z);
  pole.castShadow = true;

  const light = new THREE.PointLight(0xffddaa, 75, 150);
  light.position.set(position.x, position.y + 10, position.z);
  light.decay = 2;
  light.castShadow = true;

  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;
  light.shadow.camera.near = 0.5;
  light.shadow.camera.far = 150;

  const bulbGeometry = new THREE.SphereGeometry(0.7, 32, 32);
  const bulbMaterial = new THREE.MeshStandardMaterial({
    emissive: 0xffe599,
    emissiveIntensity: 1,
    fog: false,
  });
  const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
  bulb.position.set(position.x, position.y + 10, position.z);
  bulb.castShadow = true;

  const streetLightGroup = new THREE.Group();
  streetLightGroup.add(pole);
  streetLightGroup.add(light);
  streetLightGroup.add(bulb);

  return streetLightGroup;
}

export const streetlightPositions = [
  new THREE.Vector3(-15, 0, 35),
  new THREE.Vector3(-130, 0, -50),
  new THREE.Vector3(50, 0, -140),
  new THREE.Vector3(-50, 0, -140),
];
