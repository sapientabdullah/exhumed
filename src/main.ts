import './style.css';
import * as THREE from 'three';
import { createCrosshairs } from './utils/createCrosshairs';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import Terrain from './classes/terrain';
import { AudioManager } from './classes/audioManager';
import { Capsule } from 'three/examples/jsm/Addons.js';
import { loadModels } from './utils/loadModels';
import { loadingManager } from './utils/loadingManager';

let w = innerWidth;
let h = innerHeight;

const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
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

const fogColor = 0xd9c57d;
const fogDensity = 0.05;
scene.fog = new THREE.FogExp2(fogColor, fogDensity);
renderer.setClearColor(fogColor);

const stats = new Stats() as any;
document.body.appendChild(stats.domElement);

const audioManager = new AudioManager(camera, loadingManager);

const loader = new GLTFLoader(loadingManager);
let gun: THREE.Object3D;

loader.load('/weapon/scene.gltf', (gltf) => {
  gun = gltf.scene;
  gun.scale.set(10, 10, 10);
  gun.position.set(0.9, -0.9, -1.2);
  gun.rotation.set(0, Math.PI, 0);
  camera.add(gun);
});

loadModels(scene, loadingManager);

const clock = new THREE.Clock();

const zombieLoader = new GLTFLoader(loadingManager);
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

const zombieGroup = new THREE.Group();
const zombieMixers: THREE.AnimationMixer[] = [];
scene.add(zombieGroup);

const numZombies = 5;
for (let i = 0; i < numZombies; i++) {
  zombieLoader.load('/zombie1/scene.gltf', (gltf) => {
    const zombie = gltf.scene;
    zombie.scale.set(0.005, 0.005, 0.005);
    zombie.position.set(
      (Math.random() - 0.5) * 30,
      0,
      (Math.random() - 0.5) * 30
    );

    zombie.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        node.castShadow = true;
      }
    });

    zombieGroup.add(zombie);

    const zombieMixer = new THREE.AnimationMixer(zombie);
    zombieMixers.push(zombieMixer);

    const clip = gltf.animations[0];
    const action = zombieMixer.clipAction(clip);
    action.play();
  });
}

// function moveZombie(deltaTime: number) {
//   if (zombie) {
//     const direction = new THREE.Vector3();
//     direction.subVectors(camera.position, zombie.position).normalize();
//     zombie.position.add(direction.multiplyScalar(1 * deltaTime));
//   }
// }

let isPlayerNearZombie = false;

function checkPlayerZombieCollision() {
  if (zombie) {
    const distance = zombie.position.distanceTo(playerCollider.end);
    if (distance < 1.5) {
      if (!isPlayerNearZombie) {
        isPlayerNearZombie = true;
        startHealthDecay();
      }
    } else {
      if (isPlayerNearZombie) {
        isPlayerNearZombie = false;
        stopHealthDecay();
      }
    }
  }
}

let playerHealth = 100;
const maxHealth = 100;

let healthDecreaseInterval: ReturnType<typeof setInterval> | undefined =
  undefined;

function startHealthDecay() {
  if (!healthDecreaseInterval) {
    healthDecreaseInterval = setInterval(() => {
      if (playerHealth > 0) {
        playerHealth -= 5;
        updateHealthDisplay();
      } else {
        clearInterval(healthDecreaseInterval);
        healthDecreaseInterval = undefined;
        console.log('Player is dead');
      }
    }, 500);
  }
}

function stopHealthDecay() {
  if (healthDecreaseInterval) {
    clearInterval(healthDecreaseInterval);
    healthDecreaseInterval = undefined;
  }
}

function updateHealthDisplay() {
  let healthDisplay = document.getElementById('health-display');
  healthDisplay!.textContent = `${playerHealth} / ${maxHealth}`;
}

updateHealthDisplay();

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
  let speedMultiplier = 1;

  if (keyStates['ShiftLeft']) {
    speedMultiplier = 2;
  }

  const speedDelta = deltaTime * (playerOnFloor ? 25 : 8) * speedMultiplier;

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
  const randomX = Math.random() * 50 - 25;
  const randomZ = Math.random() * 50 - 25;
  playerCollider.start.set(randomX, 0.35, randomZ);
  playerCollider.end.set(randomX, 1, randomZ);
  camera.position.copy(playerCollider.end);
  playerVelocity.set(0, 0, 0);
}

const raycaster = new THREE.Raycaster();
const direction = new THREE.Vector3();
const impactPos = new THREE.Vector3();
const impactColor = new THREE.Color();
let impactZombie: THREE.Object3D | null = null;
let lasers: THREE.Mesh[] = [];

function createBullet() {
  const bulletGeo = new THREE.IcosahedronGeometry(0.05, 2);
  const bulletMat = new THREE.MeshBasicMaterial({
    color: 0xff4500,
    transparent: true,
    fog: false,
    blending: THREE.AdditiveBlending,
  });
  const bullet = new THREE.Mesh(bulletGeo, bulletMat);
  bullet.position.copy(camera.position);
  bullet.rotation.copy(camera.rotation);

  let active = true;
  let speed = 2;

  let goalPos = camera.position
    .clone()
    .setFromMatrixPosition(crosshairs.matrixWorld);

  const laserDirection = new THREE.Vector3(0, 0, 0);
  laserDirection
    .subVectors(bullet.position, goalPos)
    .normalize()
    .multiplyScalar(speed);

  direction.subVectors(goalPos, camera.position);
  raycaster.set(camera.position, direction);
  let intersects = raycaster.intersectObjects(zombieGroup.children, true);

  if (intersects.length > 0) {
    impactPos.copy(intersects[0].point);
    impactColor.copy(
      ((intersects[0].object as THREE.Mesh).material as THREE.MeshBasicMaterial)
        .color
    );
    if (intersects[0].object instanceof THREE.Mesh) {
      impactZombie = intersects[0].object;
      if (impactZombie) {
        zombieGroup.remove(impactZombie);
        impactZombie.scale.setScalar(0.0);
      }
    }
  }

  let scale = 1.0;
  let opacity = 1.0;
  let isExploding = false;

  function update() {
    if (active === true) {
      if (isExploding === false) {
        bullet.position.sub(laserDirection);

        if (bullet.position.distanceTo(impactPos) < 0.5) {
          bullet.position.copy(impactPos);
          bullet.material.color.set(impactColor);
          isExploding = true;
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
        bullet.scale.setScalar(scale);
        bullet.material.opacity = opacity;
        bullet.userData.active = active;
      }
    }
  }
  bullet.userData = { update, active };
  return bullet;
}

const textureLoader = new THREE.TextureLoader(loadingManager);
const muzzleFlashTexture = textureLoader.load('/Fireball Illustration PNG.png');

function createMuzzleFlash() {
  // Create a plane geometry for the muzzle flash
  const flashGeometry = new THREE.PlaneGeometry(10, 10); // Adjust size as needed

  // Create a material with the loaded texture
  const flashMaterial = new THREE.MeshBasicMaterial({
    map: muzzleFlashTexture,
    transparent: true,
    opacity: 1.0,
    depthWrite: false, // Ensures the flash doesn't block other objects
    side: THREE.DoubleSide, // Visible from both sides
    blending: THREE.AdditiveBlending, // Makes it glow
  });
  // Create the mesh
  const flashMesh = new THREE.Mesh(flashGeometry, flashMaterial);

  // Position it at the gun's muzzle (adjust based on your gun model)
  flashMesh.position.set(-10, -0.9, -10); // Example position; tweak to fit
  flashMesh.lookAt(camera.position); // Make it face the camera
  flashMesh.scale.set(1 + Math.random() * 0.5, 1 + Math.random() * 0.5, 1);
  flashMesh.rotation.z = Math.random() * Math.PI * 2; // Random rotation

  return flashMesh;
}

const flashLight = new THREE.PointLight(0xffaa33, 1, 10); // Bright orange light
flashLight.position.set(0.9, -0.9, -1.0); // Match gun muzzle position
scene.add(flashLight);

setTimeout(() => {
  scene.remove(flashLight);
}, 100);

const { terrain } = new Terrain({});
scene.add(terrain);

new RGBELoader(loadingManager).load(
  '/background/background4k.hdr',
  (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture;
  }
);

let mousePosition = new THREE.Vector2();
export const crosshairs = createCrosshairs();
camera.add(crosshairs);

let bulletCount = 30;

function updateBulletDisplay() {
  let bulletDisplay = document.getElementById('bullet-display');
  bulletDisplay!.textContent = `${bulletCount} / Inf`;
}

updateBulletDisplay();

let recoilAmount = 0.1;
let recoilSpeed = 0.1;
let maxRecoil = 0.3;
let currentRecoil = 0;
let recoilDirection = 0;

const listener = new THREE.AudioListener();
camera.add(listener);

addEventListener('click', () => {
  if (document.pointerLockElement === document.body) {
    if (bulletCount > 0) {
      if (audioManager.gunshotSound.isPlaying) {
        audioManager.gunshotSound.stop();
      }
      audioManager.gunshotSound.play();

      audioManager.shellSound.play();

      const laser = createBullet();
      lasers.push(laser);
      scene.add(laser);

      const flashMesh = createMuzzleFlash();
      scene.add(flashMesh);

      setTimeout(() => {
        scene.remove(flashMesh);
      }, 100);

      bulletCount--;
      updateBulletDisplay();

      currentRecoil = maxRecoil;
      recoilDirection = Math.random() > 0.5 ? 1 : -1;

      let inactiveLasers = lasers.filter((l) => l.userData.active === false);
      scene.remove(...inactiveLasers);
      lasers = lasers.filter((l) => l.userData.active === true);
    } else {
      console.log('Out of bullets!');
    }
  }
});

document.addEventListener('keydown', (event) => {
  if (event.code === 'KeyR') {
    audioManager.reloadSound.play();

    setTimeout(() => {
      bulletCount = 30;
      updateBulletDisplay();
      console.log('Reloaded!');
    }, 2000);
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

const flashlight = new THREE.SpotLight(0xffffff, 1, 20, Math.PI / 6, 0.5, 1); // White, intense light, 20 units long range
flashlight.position.set(0.9, -0.9, -1.2); // Position it near the gun muzzle
flashlight.target = new THREE.Object3D(); // Set the target of the flashlight to where the gun is aiming
flashlight.target.position.set(0, 0, -10); // Default target direction (adjust as needed)

// Adjust light properties to make it look like a flashlight
flashlight.angle = Math.PI / 6; // Narrow cone angle (like a flashlight)
flashlight.penumbra = 0.5; // Soft edges on the light
flashlight.distance = 10; // The distance the flashlight can reach

scene.add(flashlight);
scene.add(flashlight.target);

function updateFlashlightPosition() {
  if (gun) {
    flashlight.position.copy(gun.position);
    flashlight.rotation.copy(gun.rotation); // Make the flashlight rotation follow the gun's rotation
    flashlight.target.position.set(
      camera.position.x + Math.sin(camera.rotation.y) * 10, // Direction based on camera's rotation
      camera.position.y,
      camera.position.z + Math.cos(camera.rotation.y) * 10
    );
    flashlight.target.updateMatrixWorld(); // Update the target's world matrix
  }
}

let runBobbingTime = 0;
let gunBobbingTime = 0;

const firingRate = 0.1;

let isFiring = false;
let firingInterval: ReturnType<typeof setInterval> | null = null;

document.addEventListener('mousedown', () => {
  if (document.pointerLockElement === document.body && !isFiring) {
    isFiring = true;
    firingInterval = setInterval(() => {
      if (bulletCount > 0) {
        if (audioManager.gunshotSound.isPlaying) {
          audioManager.gunshotSound.stop();
        }
        audioManager.gunshotSound.play();

        audioManager.shellSound.play();

        const laser = createBullet();
        lasers.push(laser);
        scene.add(laser);

        const flashMesh = createMuzzleFlash();
        scene.add(flashMesh);

        setTimeout(() => {
          scene.remove(flashMesh);
        }, 100);

        bulletCount--;
        updateBulletDisplay();

        currentRecoil = maxRecoil;
        recoilDirection = Math.random() > 0.5 ? 1 : -1;

        let inactiveLasers = lasers.filter((l) => l.userData.active === false);
        scene.remove(...inactiveLasers);
        lasers = lasers.filter((l) => l.userData.active === true);
      } else {
        console.log('Out of bullets!');
      }
    }, firingRate * 1000);
  }
});

document.addEventListener('mouseup', () => {
  isFiring = false;
  if (firingInterval) {
    clearInterval(firingInterval);
    firingInterval = null;
  }
});

function animate() {
  const deltaTime = clock.getDelta();
  controls(deltaTime);
  updatePlayer(deltaTime);
  updateFlashlightPosition();
  updateHealthDisplay();

  if (
    keyStates['KeyW'] ||
    keyStates['KeyA'] ||
    keyStates['KeyS'] ||
    keyStates['KeyD']
  ) {
    runBobbingTime += deltaTime * 10; // bobbing speed
    camera.position.y += Math.sin(runBobbingTime) * 0.08; // bobbing intensity
    gunBobbingTime += deltaTime * 10; // bobbing speed
    gun!.position.y = -0.9 + Math.sin(gunBobbingTime) * 0.1; // bobbing intensity in vertical direction
    gun!.position.x = 0.9 + Math.sin(gunBobbingTime * 0.5) * 0.05; // horizontal sway
    gun!.position.z = -1.2 + Math.cos(gunBobbingTime * 0.5) * 0.05;
  } else {
    runBobbingTime = 0;
    gunBobbingTime = 0;
  }

  zombieMixers.forEach((mixer) => {
    mixer.update(deltaTime);
  });
  // moveZombie(deltaTime);
  checkPlayerZombieCollision();
  crosshairs.position.set(mousePosition.x, mousePosition.y, -1);
  lasers.forEach((laser) => laser.userData.update());

  if (currentRecoil > 0) {
    camera.position.z -= recoilAmount * recoilDirection;
    gun!.position.z -= recoilAmount * recoilDirection;

    currentRecoil -= recoilSpeed;
    if (currentRecoil < 0) currentRecoil = 0;
  }

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
