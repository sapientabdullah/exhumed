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
    container.scale.set(4, 4, 4);
    container.position.set(-30, -0.2, 15);
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
    vehicle.rotation.set(0, Math.PI / 1.6, 0);
    vehicle.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        node.castShadow = true;
      }
    });
    scene.add(vehicle);

    const box = new THREE.Box3().setFromObject(vehicle);
    collidableObjects.push({ mesh: vehicle, box });
  });

  loader.load('/utility-building/scene.gltf', (gltf) => {
    const utilityBuilding = gltf.scene;
    utilityBuilding.scale.set(3, 3, 3);
    utilityBuilding.position.set(-30, 0, 38);
    utilityBuilding.rotation.set(0, Math.PI, 0);
    utilityBuilding.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        node.castShadow = true;
      }
    });
    scene.add(utilityBuilding);
  });

  loader.load('/graffiti-building/scene.gltf', (gltf) => {
    const graffitiBuilding = gltf.scene;
    graffitiBuilding.scale.set(2, 2, 2);
    graffitiBuilding.position.set(-150, 8, -60);
    graffitiBuilding.rotation.set(-Math.PI / 2, 0, 0);
    graffitiBuilding.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        node.castShadow = true;
      }
    });
    scene.add(graffitiBuilding);
  });

  loader.load('/barrier/scene.gltf', (gltf) => {
    const barrier = gltf.scene;
    barrier.scale.set(0.45, 0.45, 0.45);
    barrier.position.set(0, -1, 45);
    barrier.rotation.set(0, Math.PI, 0);
    barrier.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        node.castShadow = true;
      }
    });
    scene.add(barrier);

    const box = new THREE.Box3().setFromObject(barrier);
    collidableObjects.push({ mesh: barrier, box });
  });

  loader.load('/zombie-hospital/scene.gltf', (gltf) => {
    const hospital = gltf.scene;
    hospital.scale.set(2.5, 2.5, 2.5);
    hospital.position.set(0, 0, -200);
    hospital.rotation.set(0, Math.PI * 2, 0);
    hospital.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        node.castShadow = true;
      }
    });
    scene.add(hospital);
  });
}
