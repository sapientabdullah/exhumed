import * as THREE from "three";
import { camera, crosshairs } from "../main";

const laserGeometry = new THREE.IcosahedronGeometry(0.05, 2);

export function createLaser(): THREE.Mesh {
  const laserMaterial = new THREE.MeshBasicMaterial({
    color: 0xffcc00,
    transparent: true,
    fog: false,
  });
  const laser = new THREE.Mesh(laserGeometry, laserMaterial);
  laser.position.copy(camera.position);

  let active = true;
  let speed = 0.5;

  let goalPosition = camera.position
    .clone()
    .setFromMatrixPosition(crosshairs.matrixWorld);

  const laserDirection = new THREE.Vector3(0, 0, 0);

  laserDirection
    .subVectors(laser.position, goalPosition)
    .normalize()
    .multiplyScalar(speed);

  function update() {
    laser.position.sub(laserDirection);
  }



  
  laser.userData = { update, active };
  return laser;
}
