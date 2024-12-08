import './style.css';
import * as THREE from 'three';
import { createCrosshairs } from './utils/createCrosshairs';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { AudioManager } from './classes/audioManager';
import { HealthManager } from './classes/healthManager';
import { Capsule } from 'three/examples/jsm/Addons.js';
import { collidableObjects, loadModels } from './utils/loadModels';
import { loadingManager } from './utils/loadingManager';
import { initializeScene } from './utils/initScene';
import { PLAYER } from './config/constants';
import { addEventListeners } from './utils/eventListeners';
import { spawnZombies, zombieGroup, zombieMixers } from './utils/zombieSpawner';
import { createMuzzleFlash } from './utils/createMuzzleFlash';
import { createBloodSplatter } from './utils/createBloodSplatter';
// import GenTerrain from './classes/genTerrain';

addEventListeners();

const { scene, camera, renderer, stats } = initializeScene();

scene.add(zombieGroup);

export { camera };

const audioManager = new AudioManager(camera, loadingManager);

const listener = new THREE.AudioListener();
camera.add(listener);

const backgroundMusic = new THREE.Audio(listener);

const audioLoader = new THREE.AudioLoader();
audioLoader.load('/audio/bg_music2.mp3', function (buffer) {
  backgroundMusic.setBuffer(buffer);
  backgroundMusic.setLoop(true);
  backgroundMusic.setVolume(0.3);
  backgroundMusic.play();
});

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

const playerHealthManager = new HealthManager(100, 100);
let isPlayerNearZombie = false;

function checkPlayerZombieCollision() {
  let isAnyZombieNear = false;

  zombieGroup.children.forEach((zombie) => {
    const distance = zombie.position.distanceTo(playerCollider.end);
    if (distance < 1.5) {
      isAnyZombieNear = true;
    }
  });

  if (isAnyZombieNear) {
    if (!isPlayerNearZombie) {
      isPlayerNearZombie = true;
      playerHealthManager.startHealthDecay(5, 500);
    }
  } else {
    if (isPlayerNearZombie) {
      isPlayerNearZombie = false;
      playerHealthManager.stopHealthDecay();
    }
  }
}

const playerCollider = new Capsule(
  new THREE.Vector3(0, PLAYER.COLLIDER_HEIGHT, 0),
  new THREE.Vector3(0, PLAYER.COLLIDER_HEIGHT, 0),
  PLAYER.COLLIDER_RADIUS
);

const playerVelocity = new THREE.Vector3();
const playerDirection = new THREE.Vector3();
let playerOnFloor = false;

const GRAVITY = PLAYER.GRAVITY;
export const keyStates: { [key: string]: boolean } = {};
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

let isWalking = false;
let isRunning = false;
function controls(deltaTime: number) {
  let speedMultiplier = 1;
  let moving = false;

  if (keyStates['ShiftLeft']) {
    speedMultiplier = 3;
    isRunning = true;
  } else {
    isRunning = false;
  }

  const speedDelta = deltaTime * (playerOnFloor ? 25 : 8) * speedMultiplier;

  if (keyStates['KeyW']) {
    playerVelocity.add(getForwardVector().multiplyScalar(speedDelta));
    moving = true;
  }
  if (keyStates['KeyS']) {
    playerVelocity.add(getForwardVector().multiplyScalar(-speedDelta));
    moving = true;
  }
  if (keyStates['KeyA']) {
    playerVelocity.add(getSideVector().multiplyScalar(-speedDelta));
    moving = true;
  }
  if (keyStates['KeyD']) {
    playerVelocity.add(getSideVector().multiplyScalar(speedDelta));
    moving = true;
  }
  if (playerOnFloor && keyStates['Space']) {
    playerVelocity.y = PLAYER.JUMP_VELOCITY;

    if (audioManager.jumpSound.isPlaying) {
      audioManager.jumpSound.stop();
    }

    audioManager.jumpSound.play();
  }
  isWalking = moving && !isRunning;

  if (isWalking && !audioManager.footstepSound.isPlaying) {
    audioManager.footstepSound.play();
  } else if (!isWalking && audioManager.footstepSound.isPlaying) {
    audioManager.footstepSound.stop();
  }

  if (isRunning && !audioManager.runningSound.isPlaying) {
    audioManager.runningSound.play();
  } else if (!isRunning && audioManager.runningSound.isPlaying) {
    audioManager.runningSound.stop();
  }
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

  playerOnFloor = camera.position.y <= 5;
  if (playerOnFloor) playerVelocity.y = 0;

  const playerBoundingBox = new THREE.Box3().setFromPoints([
    playerCollider.start,
    playerCollider.end,
  ]);

  collidableObjects.forEach(({ box }) => {
    if (playerBoundingBox.intersectsBox(box)) {
      resolveCollision(playerBoundingBox, box);
    }
  });
}

function resolveCollision(playerBox: THREE.Box3, objectBox: THREE.Box3) {
  const playerMin = playerBox.min;
  const playerMax = playerBox.max;
  const objectMin = objectBox.min;
  const objectMax = objectBox.max;

  const overlapX =
    playerMax.x > objectMin.x && playerMin.x < objectMax.x
      ? Math.min(objectMax.x - playerMin.x, playerMax.x - objectMin.x)
      : 0;
  const overlapY =
    playerMax.y > objectMin.y && playerMin.y < objectMax.y
      ? Math.min(objectMax.y - playerMin.y, playerMax.y - objectMin.y)
      : 0;
  const overlapZ =
    playerMax.z > objectMin.z && playerMin.z < objectMax.z
      ? Math.min(objectMax.z - playerMin.z, playerMax.z - objectMin.z)
      : 0;

  if (overlapX > 0 && overlapX < overlapY && overlapX < overlapZ) {
    playerCollider.translate(
      new THREE.Vector3(playerMax.x > objectMin.x ? -overlapX : overlapX, 0, 0)
    );
  } else if (overlapY > 0 && overlapY < overlapX && overlapY < overlapZ) {
    playerCollider.translate(
      new THREE.Vector3(0, playerMax.y > objectMin.y ? -overlapY : overlapY, 0)
    );
    playerOnFloor = true;
    playerVelocity.y = 0;
  } else if (overlapZ > 0) {
    playerCollider.translate(
      new THREE.Vector3(0, 0, playerMax.z > objectMin.z ? -overlapZ : overlapZ)
    );
  }
}

function teleportPlayer() {
  const mapEndX = 0;
  const mapEndZ = 60;

  const playerHeight = 5;

  playerCollider.start.set(mapEndX, playerHeight / 2, mapEndZ);
  playerCollider.end.set(mapEndX, playerHeight, mapEndZ);
  camera.position.copy(playerCollider.end);
  playerVelocity.set(0, 0, 0);
}

teleportPlayer();

const raycaster = new THREE.Raycaster();
const direction = new THREE.Vector3();
const impactPos = new THREE.Vector3();
const impactColor = new THREE.Color();
let bullets: THREE.Mesh[] = [];

let zombieKills = 0;

function updateZombieKillDisplay() {
  const killCountElement = document.getElementById('kill-count');
  if (killCountElement) {
    killCountElement.textContent = zombieKills.toString();
  }
}

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
  let speed = 15;

  let goalPos = camera.position
    .clone()
    .setFromMatrixPosition(crosshairs.matrixWorld);

  const bulletDirection = new THREE.Vector3(0, 0, 0);
  bulletDirection
    .subVectors(bullet.position, goalPos)
    .normalize()
    .multiplyScalar(speed);

  direction.subVectors(goalPos, camera.position);
  raycaster.set(camera.position, direction);
  let intersects = raycaster.intersectObjects(zombieGroup.children, true);

  if (intersects.length > 0) {
    const hitObject = intersects[0].object as THREE.Mesh;
    const zombieHealth = (hitObject as any).health;

    const impactPosition = intersects[0].point;
    const impactNormal = intersects[0].face?.normal
      .clone()
      .applyMatrix3(new THREE.Matrix3().getNormalMatrix(hitObject.matrixWorld));

    if (impactNormal) {
      createBloodSplatter(impactPosition, impactNormal, scene);
    }

    if (!hitObject.userData.isDead && zombieHealth !== undefined) {
      impactPos.copy(intersects[0].point);
      impactColor.copy(
        (
          (intersects[0].object as THREE.Mesh)
            .material as THREE.MeshBasicMaterial
        ).color
      );

      (hitObject as any).health -= 1;

      if ((hitObject as any).health <= 0) {
        hitObject.userData.isDead = true;
        const parentZombie = getZombieParent(hitObject);
        const zombieMixer = (parentZombie as any).mixer as THREE.AnimationMixer;
        const deathAction = (parentZombie as any)
          .deathAction as THREE.AnimationAction;

        zombieMixer.stopAllAction();
        deathAction.reset();
        deathAction.play();

        zombieKills++;
        updateZombieKillDisplay();

        setTimeout(() => {
          zombieGroup.remove(parentZombie);
          parentZombie.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.geometry.dispose();
              if (child.material instanceof THREE.Material) {
                child.material.dispose();
              }
            }
          });
        }, 2000);
      } else {
        hitObject.material.color.set(0xff0000);
        setTimeout(() => {
          hitObject.material.color.set(0xffffff);
        }, 100);
      }
    }
  }

  let scale = 1.0;
  let opacity = 1.0;
  let isExploding = false;

  function update() {
    if (active === true) {
      if (isExploding === false) {
        bullet.position.sub(bulletDirection);

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

function getZombieParent(hitObject: THREE.Object3D): THREE.Mesh {
  let parentZombie = hitObject;
  while (parentZombie.parent && parentZombie.parent !== zombieGroup) {
    parentZombie = parentZombie.parent as THREE.Mesh;
  }
  return parentZombie as THREE.Mesh;
}

let mousePosition = new THREE.Vector2();
export const crosshairs = createCrosshairs();
camera.add(crosshairs);

let bulletCount = 30;

function updateBulletDisplay() {
  let bulletDisplay = document.getElementById('bullet-display');
  if (bulletDisplay) {
    const textElement = bulletDisplay.querySelector('span');
    if (textElement) {
      textElement.textContent = `${bulletCount} / ∞`;
    }
  }
}

updateBulletDisplay();

let recoilAmount = 0.1;
let recoilSpeed = 0.1;
let maxRecoil = 0.3;
let currentRecoil = 0;
let recoilDirection = 0;

const flashlight = new THREE.SpotLight(0xffffff, 2, 50, Math.PI / 4, 0.8, 1);
flashlight.position.set(0.9, -0.9, -1.2);
flashlight.target = new THREE.Object3D();
flashlight.target.position.set(0, 0, -10);

flashlight.angle = Math.PI / 2;
flashlight.penumbra = 1.0;
flashlight.distance = 50;
flashlight.intensity = 20;

scene.add(flashlight);
scene.add(flashlight.target);

function updateFlashlightPosition() {
  if (gun) {
    flashlight.position.copy(gun.getWorldPosition(new THREE.Vector3()));
    flashlight.position.y += 1;
    flashlight.position.x -= 3;

    const flashlightTargetDirection = new THREE.Vector3();
    camera.getWorldDirection(flashlightTargetDirection);
    flashlightTargetDirection.multiplyScalar(10);

    flashlight.target.position.copy(
      flashlight.position.clone().add(flashlightTargetDirection)
    );
    flashlight.target.updateMatrixWorld();
  }
}

let runBobbingTime = 0;
let gunBobbingTime = 0;

const firingRate = 0.1;

let isFiring = false;

let firingInterval: ReturnType<typeof setInterval> | null = null;

let isReloading = false;

export function handleReload() {
  if (!isReloading) {
    isReloading = true;
    audioManager.reloadSound.play();

    setTimeout(() => {
      bulletCount = 30;
      updateBulletDisplay();
      isReloading = false;
    }, 2000);
  }
}

function fireBullet() {
  if (bulletCount > 0) {
    if (audioManager.gunshotSound.isPlaying) {
      audioManager.gunshotSound.stop();
    }
    audioManager.gunshotSound.play();

    audioManager.shellSound.play();

    const bullet = createBullet();
    bullets.push(bullet);
    scene.add(bullet);

    const flashMesh = createMuzzleFlash(gun);
    scene.add(flashMesh);

    setTimeout(() => {
      flashMesh.material.opacity = 0;
    }, 50);
    setTimeout(() => {
      scene.remove(flashMesh);
    }, 100);

    bulletCount--;
    updateBulletDisplay();
    currentRecoil = maxRecoil;
    recoilDirection = Math.random() > 0.5 ? 1 : -1;

    const inactiveBullets = bullets.filter((bullet) => !bullet.userData.active);
    scene.remove(...inactiveBullets);
    bullets = bullets.filter((bullet) => bullet.userData.active);
  } else {
    handleReload();
  }
}

addEventListener('click', () => {
  if (document.pointerLockElement === document.body && !isFiring) {
    fireBullet();
  }
});

document.addEventListener('mousedown', () => {
  if (document.pointerLockElement === document.body && !isFiring) {
    isFiring = true;
    firingInterval = setInterval(fireBullet, firingRate * 1000);
  }
});

document.addEventListener('mouseup', () => {
  isFiring = false;
  if (firingInterval) {
    clearInterval(firingInterval);
    firingInterval = null;
  }
});

// const terrain = new GenTerrain({ chunkSize: 100, maxChunks: 10 });
// scene.add(terrain.terrainChunks);
// // scene.add(terrain.walls);
// scene.add(terrain.trees);

const pauseMenu = document.getElementById('pause-menu');
const resumeButton = document.getElementById('resume-button');
let paused = false;

document.addEventListener('keydown', (event) => {
  if (event.code === 'KeyP') {
    paused = !paused;

    if (paused) {
      pauseMenu!.style.display = 'flex';
      document.exitPointerLock();
    } else {
      pauseMenu!.style.display = 'none';
      clock.getDelta();
    }
  }
});

resumeButton!.addEventListener('click', () => {
  paused = false;
  pauseMenu!.style.display = 'none';
  clock.getDelta();
});

function animate() {
  if (!paused) {
    const deltaTime = clock.getDelta();
    controls(deltaTime);
    updatePlayer(deltaTime);
    updateFlashlightPosition();
    spawnZombies(camera);
    // terrain.update(camera.position);

    if (
      !keyStates['KeyW'] &&
      !keyStates['KeyA'] &&
      !keyStates['KeyS'] &&
      !keyStates['KeyD']
    ) {
      if (audioManager.footstepSound.isPlaying) {
        audioManager.footstepSound.stop();
      }
      if (audioManager.runningSound.isPlaying) {
        audioManager.runningSound.stop();
      }
    }

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

    const zombieSpeed = 4;
    const separationRadius = 2.0;
    const separationStrength = 100.0;
    const groundLevel = 0;

    zombieGroup.children.forEach((zombie, index) => {
      const directionToPlayer = new THREE.Vector3();
      directionToPlayer
        .subVectors(
          new THREE.Vector3(
            playerCollider.end.x,
            groundLevel,
            playerCollider.end.z
          ),
          new THREE.Vector3(zombie.position.x, groundLevel, zombie.position.z)
        )
        .normalize();

      const separationForce = new THREE.Vector3();
      zombieGroup.children.forEach((otherZombie, otherIndex) => {
        if (index !== otherIndex) {
          const distance = zombie.position.distanceTo(otherZombie.position);
          if (distance < separationRadius) {
            const avoidDirection = new THREE.Vector3();
            avoidDirection
              .subVectors(
                new THREE.Vector3(
                  zombie.position.x,
                  groundLevel,
                  zombie.position.z
                ),
                new THREE.Vector3(
                  otherZombie.position.x,
                  groundLevel,
                  otherZombie.position.z
                )
              )
              .normalize()
              .multiplyScalar((separationRadius - distance) / separationRadius);
            separationForce.add(avoidDirection);
          }
        }
      });

      const combinedForce = new THREE.Vector3();
      combinedForce
        .add(directionToPlayer.multiplyScalar(1.0))
        .add(separationForce.multiplyScalar(separationStrength));

      combinedForce.normalize();
      const moveStep = combinedForce.multiplyScalar(zombieSpeed * deltaTime);

      zombie.position.add(new THREE.Vector3(moveStep.x, 0, moveStep.z));
      zombie.position.y = groundLevel;

      zombie.lookAt(
        new THREE.Vector3(
          playerCollider.end.x,
          zombie.position.y,
          playerCollider.end.z
        )
      );
    });

    zombieMixers.forEach((mixer) => {
      mixer.update(deltaTime);
    });
    checkPlayerZombieCollision();
    crosshairs.position.set(mousePosition.x, mousePosition.y, -1);
    bullets.forEach((bullet) => bullet.userData.update());

    if (currentRecoil > 0) {
      camera.position.z -= recoilAmount * recoilDirection;
      gun!.position.z -= recoilAmount * recoilDirection;

      currentRecoil -= recoilSpeed;
      if (currentRecoil < 0) currentRecoil = 0;
    }
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
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
  },
  false
);
