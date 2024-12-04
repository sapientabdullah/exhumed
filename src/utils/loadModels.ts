import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export const collidableObjects: { mesh: THREE.Object3D; box: THREE.Box3 }[] =
  [];
export function loadModels(
  scene: THREE.Scene,
  loadingManager: THREE.LoadingManager
) {
  const loader = new GLTFLoader(loadingManager);

  const addFence = (x: number, y: number, z: number, rotationY: number) => {
    loader.load('/fence/scene.gltf', (gltf) => {
      const fence = gltf.scene;
      fence.scale.set(4, 4, 4);
      fence.position.set(x, y, z);
      fence.rotation.set(0, rotationY, 0);
      fence.traverse((node) => {
        if ((node as THREE.Mesh).isMesh) {
          node.castShadow = true;
        }
      });
      scene.add(fence);

      const box = new THREE.Box3().setFromObject(fence);
      collidableObjects.push({ mesh: fence, box });
    });
  };

  addFence(13.5, -1.5, 45, Math.PI / 2);
  addFence(34, -1.5, 45, Math.PI / 2);
  addFence(-13.5, -2, 45, -Math.PI / 2);
  addFence(-34, -2, 45, -Math.PI / 2);

  loader.load('/cargo/scene.gltf', (gltf) => {
    const container = gltf.scene;
    container.scale.set(2, 2, 2);
    container.position.set(-30, -0.2, 20);
    container.rotation.set(0, -Math.PI / 2, 0);
    container.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        node.castShadow = true;
      }
    });
    scene.add(container);

    const box = new THREE.Box3().setFromObject(container);
    collidableObjects.push({ mesh: container, box });
  });

  loader.load('/vehicle/scene.gltf', (gltf) => {
    const vehicle = gltf.scene;
    vehicle.scale.set(3, 3, 3);
    vehicle.position.set(-20, -1.2, 1);
    vehicle.rotation.set(0, Math.PI / 10, 0);
    vehicle.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        node.castShadow = true;
      }
    });
    scene.add(vehicle);

    const box = new THREE.Box3().setFromObject(vehicle);
    collidableObjects.push({ mesh: vehicle, box });
  });

  loader.load('/generate/scene.gltf', (gltf) => {
    const generator = gltf.scene;
    generator.scale.set(0.03, 0.03, 0.03);
    generator.position.set(-32, 1.4, 38);
    generator.rotation.set(0, Math.PI / 2, 0);
    generator.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        node.castShadow = true;
      }
    });
    scene.add(generator);

    const box = new THREE.Box3().setFromObject(generator);
    collidableObjects.push({ mesh: generator, box });
  });

  loader.load('/pole/scene.gltf', (gltf) => {
    const pole = gltf.scene;
    pole.scale.set(0.03, 0.03, 0.03);
    pole.position.set(0, 1, 0);
    pole.rotation.set(0, -Math.PI / 2, 0);
    pole.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        node.castShadow = true;
      }
    });
    scene.add(pole);

    const box = new THREE.Box3().setFromObject(pole);
    collidableObjects.push({ mesh: pole, box });
  });

  loader.load('/boxes/scene.gltf', (gltf) => {
    const boxes = gltf.scene;
    boxes.scale.set(10, 10, 10);
    boxes.position.set(-20, -1.2, 20);
    boxes.rotation.set(0, Math.PI / 2, 0);
    boxes.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        node.castShadow = true;
      }
    });
    scene.add(boxes);

    const box = new THREE.Box3().setFromObject(boxes);
    collidableObjects.push({ mesh: boxes, box });
  });

  loader.load('/barrier/scene.gltf', (gltf) => {
    const barrier = gltf.scene;
    barrier.scale.set(2, 2, 2);
    barrier.position.set(12, 1, 45);
    barrier.rotation.set(0, -Math.PI / 2, 0);
    barrier.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        node.castShadow = true;
      }
    });
    scene.add(barrier);

    const box = new THREE.Box3().setFromObject(barrier);
    collidableObjects.push({ mesh: barrier, box });
  });
}
