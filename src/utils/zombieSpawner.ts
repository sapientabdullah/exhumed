import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let zombieLoader = new GLTFLoader();
const zombieGroup = new THREE.Group();
const zombieMixers: THREE.AnimationMixer[] = [];

let lastZombieSpawnPosition = new THREE.Vector3();
const spawnDistanceThreshold = 50;

function spawnZombies(camera: THREE.Camera) {
  const distanceToLastSpawn = camera.position.distanceTo(
    lastZombieSpawnPosition
  );

  if (distanceToLastSpawn > spawnDistanceThreshold) {
    const numNewZombies = 3;

    for (let i = 0; i < numNewZombies; i++) {
      zombieLoader.load('/zombie/scene.gltf', (gltf) => {
        const zombie = gltf.scene;
        zombie.scale.set(0.25, 0.25, 0.25);
        zombie.position.set(
          (Math.random() - 0.5) * 100 + camera.position.x,
          0,
          (Math.random() - 0.5) * 100 + camera.position.z
        );

        zombie.traverse((node) => {
          if ((node as THREE.Mesh).isMesh) {
            node.castShadow = true;
            (node as any).health = Math.floor(Math.random() * 5) + 5;
          }
        });

        zombieGroup.add(zombie);

        const zombieMixer = new THREE.AnimationMixer(zombie);
        zombieMixers.push(zombieMixer);

        const walkAction = zombieMixer.clipAction(gltf.animations[1]);
        walkAction.setEffectiveTimeScale(4);
        walkAction.play();

        const attackAction = zombieMixer.clipAction(gltf.animations[2]);
        attackAction.setLoop(THREE.LoopRepeat, Infinity);

        const deathAction = zombieMixer.clipAction(gltf.animations[3]);

        (zombie as any).deathAction = deathAction;
        (zombie as any).walkAction = walkAction;
        (zombie as any).attackAction = attackAction;
        (zombie as any).mixer = zombieMixer;
      });
    }

    lastZombieSpawnPosition.set(
      camera.position.x,
      camera.position.y,
      camera.position.z
    );
  }
}

export { spawnZombies, zombieGroup, zombieMixers };
