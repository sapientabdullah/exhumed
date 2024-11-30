import './style.css';
import * as THREE from 'three';
import { createCrosshairs } from './utils/createCrosshairs';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js';
import Terrain from './classes/terrain';
import { Tree } from '@dgreenheck/ez-tree';
import { Capsule } from 'three/examples/jsm/Addons.js';

new GUI();

const stats = new Stats() as any;
document.body.appendChild(stats.domElement);

const loader = new GLTFLoader();
let gun;

loader.load('/gun/scene.gltf', (gltf) => {
  gun = gltf.scene;
  gun.scale.set(0.005, 0.005, 0.005);
  gun.position.set(0.9, -0.9, -1.2);
  camera.add(gun);
});

let w = innerWidth;
let h = innerHeight;
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.rotation.order = 'YXZ';
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.6;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const clock = new THREE.Clock();

const zombieLoader = new GLTFLoader();
let zombie: THREE.Group, zombieMixer: THREE.AnimationMixer;

zombieLoader.load('/zombie1/scene.gltf', (gltf) => {
  zombie = gltf.scene;
  zombie.scale.set(0.009, 0.009, 0.009);
  zombie.position.set(5, 0, 5);
  zombie.traverse((node) => {
    if ((node as THREE.Mesh).isMesh) {
      node.castShadow = true;
    }
  });
  scene.add(zombie);
  zombieMixer = new THREE.AnimationMixer(zombie);
  const clip = gltf.animations[0];
  const action = zombieMixer.clipAction(clip);
  action.play();
});

function moveZombie(deltaTime: number) {
  if (zombie) {
    const direction = new THREE.Vector3();
    direction.subVectors(camera.position, zombie.position).normalize();
    zombie.position.add(direction.multiplyScalar(1 * deltaTime));
  }
}

function checkPlayerZombieCollision() {
  if (zombie) {
    const distance = zombie.position.distanceTo(playerCollider.end);
    if (distance < 1.5) {
      console.log('Zombie collided with the player!');
      teleportPlayer();
    }
  }
}

const boxGroup = new THREE.Group();
scene.add(boxGroup);

const numBoxes = 55;
const size = 0.5;
const boxGeo = new THREE.BoxGeometry(size, size, size);
for (let i = 0; i < numBoxes; i++) {
  const pos = new THREE.Vector3(
    (Math.random() - 0.5) * 30,
    size / 2,
    (Math.random() - 0.5) * 30
  );

  const color = new THREE.Color().setHSL(Math.random(), 1, 0.5);
  const boxMat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.5,
  });

  const hitBox = new THREE.Mesh(boxGeo, boxMat);
  hitBox.name = 'box';
  hitBox.position.copy(pos);

  const rote = new THREE.Vector3(
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI
  );
  hitBox.rotation.set(rote.x, rote.y, rote.z);

  const edges = new THREE.EdgesGeometry(boxGeo, 0.2);
  const lineMat = new THREE.LineBasicMaterial({ color });
  const boxLines = new THREE.LineSegments(edges, lineMat);
  boxLines.position.copy(pos);
  boxLines.rotation.set(rote.x, rote.y, rote.z);

  hitBox.userData.box = boxLines;
  boxGroup.add(hitBox);
  scene.add(boxLines);
}

const playerCollider = new Capsule(
  new THREE.Vector3(0, 0.35, 0),
  new THREE.Vector3(0, 1, 0),
  0.35
);

const playerVelocity = new THREE.Vector3();
const playerDirection = new THREE.Vector3();
let playerOnFloor = false;

const GRAVITY = 30;
const keyStates: { [key: string]: boolean } = {};
document.addEventListener('keydown', (event) => (keyStates[event.code] = true));
document.addEventListener('keyup', (event) => (keyStates[event.code] = false));

function getForwardVector() {
  camera.getWorldDirection(playerDirection);
  playerDirection.y = 0;
  playerDirection.normalize();
  return playerDirection;
}

function getSideVector() {
  camera.getWorldDirection(playerDirection);
  playerDirection.y = 0;
  playerDirection.normalize();
  playerDirection.cross(camera.up);
  return playerDirection;
}

function controls(deltaTime: number) {
  const speedDelta = deltaTime * (playerOnFloor ? 25 : 8);

  if (keyStates['KeyW'])
    playerVelocity.add(getForwardVector().multiplyScalar(speedDelta));
  if (keyStates['KeyS'])
    playerVelocity.add(getForwardVector().multiplyScalar(-speedDelta));
  if (keyStates['KeyA'])
    playerVelocity.add(getSideVector().multiplyScalar(-speedDelta));
  if (keyStates['KeyD'])
    playerVelocity.add(getSideVector().multiplyScalar(speedDelta));
  if (playerOnFloor && keyStates['Space']) playerVelocity.y = 15;
}

function updatePlayer(deltaTime: number) {
  let damping = Math.exp(-4 * deltaTime) - 1;

  if (!playerOnFloor) {
    playerVelocity.y -= GRAVITY * deltaTime;
    damping *= 0.1;
  }

  playerVelocity.addScaledVector(playerVelocity, damping);

  const deltaPosition = playerVelocity.clone().multiplyScalar(deltaTime);
  playerCollider.translate(deltaPosition);

  playerCollisions();
  camera.position.copy(playerCollider.end);
}

function playerCollisions() {
  if (camera.position.y <= -25) teleportPlayer();

  playerOnFloor = camera.position.y <= 1;
  if (playerOnFloor) playerVelocity.y = 0;
}

function teleportPlayer() {
  playerCollider.start.set(0, 0.35, 0);
  playerCollider.end.set(0, 1, 0);
  camera.position.copy(playerCollider.end);
  playerVelocity.set(0, 0, 0);
}

const raycaster = new THREE.Raycaster();
const direction = new THREE.Vector3();
const impactPos = new THREE.Vector3();
const impactColor = new THREE.Color();
let impactBox: THREE.LineSegments | null = null;
let lasers: THREE.Mesh[] = [];
const laserGeo = new THREE.IcosahedronGeometry(0.05, 2);

function createLaser() {
  const laserMat = new THREE.MeshBasicMaterial({
    color: 0xffcc00,
    transparent: true,
    fog: false,
  });
  const laserBolt = new THREE.Mesh(laserGeo, laserMat);
  laserBolt.position.copy(camera.position);

  let active = true;
  let speed = 0.5;

  let goalPos = camera.position
    .clone()
    .setFromMatrixPosition(crosshairs.matrixWorld);

  const laserDirection = new THREE.Vector3(0, 0, 0);
  laserDirection
    .subVectors(laserBolt.position, goalPos)
    .normalize()
    .multiplyScalar(speed);

  direction.subVectors(goalPos, camera.position);
  raycaster.set(camera.position, direction);
  let intersects = raycaster.intersectObjects([...boxGroup.children], true);

  if (intersects.length > 0) {
    impactPos.copy(intersects[0].point);
    impactColor.copy(
      ((intersects[0].object as THREE.Mesh).material as THREE.MeshBasicMaterial)
        .color
    );
    if (intersects[0].object.name === 'box') {
      impactBox = intersects[0].object.userData.box;
      boxGroup.remove(intersects[0].object);
    }
  }

  let scale = 1.0;
  let opacity = 1.0;
  let isExploding = false;

  function update() {
    if (active === true) {
      if (isExploding === false) {
        laserBolt.position.sub(laserDirection);

        if (laserBolt.position.distanceTo(impactPos) < 0.5) {
          laserBolt.position.copy(impactPos);
          laserBolt.material.color.set(impactColor);
          isExploding = true;
          impactBox?.scale.setScalar(0.0);
        }
      } else {
        if (opacity > 0.01) {
          scale += 0.2;
          opacity *= 0.85;
        } else {
          opacity = 0.0;
          scale = 0.01;
          active = false;
        }
        laserBolt.scale.setScalar(scale);
        laserBolt.material.opacity = opacity;
        laserBolt.userData.active = active;
      }
    }
  }
  laserBolt.userData = { update, active };
  return laserBolt;
}

const { terrain } = new Terrain({});
scene.add(terrain);

const tree = new Tree();
tree.options.seed = 12345;
tree.options.branch.levels = 3;

tree.generate();
scene.add(tree);

new RGBELoader().load('/background/background4k.hdr', (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;
  scene.environment = texture;
});

let mousePosition = new THREE.Vector2();
export const crosshairs = createCrosshairs();
camera.add(crosshairs);

addEventListener('click', () => {
  if (document.pointerLockElement === document.body) {
    const laser = createLaser();
    lasers.push(laser);
    scene.add(laser);
    let inactiveLasers = lasers.filter((l) => l.userData.active === false);
    scene.remove(...inactiveLasers);
    lasers = lasers.filter((l) => l.userData.active === true);
  }
});

document.body.addEventListener('mousemove', (event) => {
  if (document.pointerLockElement === document.body) {
    camera.rotation.y -= event.movementX / 500;
    camera.rotation.x -= event.movementY / 500;
    camera.rotation.x = Math.max(
      -Math.PI / 2,
      Math.min(Math.PI / 2, camera.rotation.x)
    );
  }
});

document.addEventListener('click', () => {
  if (document.pointerLockElement !== document.body) {
    document.body.requestPointerLock();
  }
});
document.addEventListener('keydown', (event) => {
  if (
    event.code === 'Escape' &&
    document.pointerLockElement === document.body
  ) {
    document.exitPointerLock();
  }
});

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

function animate() {
  const deltaTime = clock.getDelta();
  controls(deltaTime);
  updatePlayer(deltaTime);
  if (zombieMixer) {
    zombieMixer.update(deltaTime);
  }
  moveZombie(deltaTime);
  checkPlayerZombieCollision();
  crosshairs.position.set(mousePosition.x, mousePosition.y, -1);
  lasers.forEach((laser) => laser.userData.update());
  render();
  stats.update();
  requestAnimationFrame(animate);
}

function render() {
  renderer.render(scene, camera);
}

animate();

addEventListener(
  'resize',
  () => {
    w = window.innerWidth;
    h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    render();
  },
  false
);
