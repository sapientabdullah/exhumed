import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function loadModels(
  scene: THREE.Scene,
  loadingManager: THREE.LoadingManager
) {
  const loader = new GLTFLoader(loadingManager);

  loader.load('/fence/scene.gltf', (gltf) => {
    const fence = gltf.scene;
    fence.scale.set(1, 1, 1);
    fence.position.set(30, 0, 30);
    fence.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        node.castShadow = true;
      }
    });
    scene.add(fence);
  });

  loader.load('/cargo/scene.gltf', (gltf) => {
    const container = gltf.scene;
    container.scale.set(1, 1, 1);
    container.position.set(10, 0, 10);
    container.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        node.castShadow = true;
      }
    });
    scene.add(container);
  });

  loader.load('/vehicle/scene.gltf', (gltf) => {
    const vehicle = gltf.scene;
    vehicle.scale.set(0.5, 0.5, 0.5);
    vehicle.position.set(20, 0, 30);
    vehicle.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        node.castShadow = true;
      }
    });
    scene.add(vehicle);
  });

  loader.load('/generate/scene.gltf', (gltf) => {
    const generator = gltf.scene;
    generator.scale.set(0.01, 0.01, 0.01);
    generator.position.set(20, 1, 20);
    generator.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        node.castShadow = true;
      }
    });
    scene.add(generator);
  });

  loader.load('/pole/scene.gltf', (gltf) => {
    const pole = gltf.scene;
    pole.scale.set(0.01, 0.01, 0.01);
    pole.position.set(20, 1, 20);
    pole.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        node.castShadow = true;
      }
    });
    scene.add(pole);
  });

  loader.load('/boxes/scene.gltf', (gltf) => {
    const boxes = gltf.scene;
    boxes.scale.set(5, 5, 5);
    boxes.position.set(20, 1, 20);
    boxes.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        node.castShadow = true;
      }
    });
    scene.add(boxes);
  });

  loader.load('/barrier/scene.gltf', (gltf) => {
    const barrier = gltf.scene;
    barrier.scale.set(1, 1, 1);
    barrier.position.set(20, 1, 20);
    barrier.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        node.castShadow = true;
      }
    });
    scene.add(barrier);
  });
}
