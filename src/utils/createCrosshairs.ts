import * as THREE from "three";

export function createCrosshairs(): THREE.Group {
  const crosshairs = new THREE.Group();
  crosshairs.position.z = -1;

  const crosshairsMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
  const lineGeometry = new THREE.BufferGeometry();
  const lineVerticies = [0, 0.05, 0, 0, 0.02, 0];
  lineGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(lineVerticies, 3)
  );

  for (let i = 0; i < 4; i++) {
    const line = new THREE.Line(lineGeometry, crosshairsMaterial);
    line.rotation.z = Math.PI * i * 0.5;
    crosshairs.add(line);
  }

  return crosshairs;
}
