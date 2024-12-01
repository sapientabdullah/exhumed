import * as THREE from 'three';
import { ImprovedNoise } from 'three/examples/jsm/Addons.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

class Terrain {
  terrain: THREE.Group;
  terrainMesh: THREE.Mesh;
  road: THREE.Mesh;
  trees: THREE.Group;
  width: number;
  height: number;
  widthSegments: number;
  heightSegments: number;
  color: number;

  constructor({
    width = 100,
    height = 100,
    widthSegments = 100,
    heightSegments = 100,
    color = 0x2e8b57,
  }: {
    width?: number;
    height?: number;
    widthSegments?: number;
    heightSegments?: number;
    color?: number;
  }) {
    this.width = width;
    this.color = color;
    this.height = height;
    this.widthSegments = widthSegments;
    this.heightSegments = heightSegments;

    this.terrain = new THREE.Group();
    this.terrainMesh = this.createTerrain();
    this.road = this.createRoad();
    this.trees = this.createTrees();

    this.terrain.add(this.terrainMesh);
    this.terrain.add(this.road);
    this.terrain.add(this.trees);
  }

  createTerrain(): THREE.Mesh {
    const terrainGeometry = new THREE.PlaneGeometry(
      this.width,
      this.height,
      this.widthSegments,
      this.heightSegments
    );
    const loader = new THREE.TextureLoader();
    const grassTexture = loader.load('/textures/sparse_grass_diff_4k.jpg');
    const normalTexture = loader.load('/textures/sparse_grass_nor_gl_4k.jpg');

    grassTexture.wrapS = THREE.RepeatWrapping;
    grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(10, 10);

    const terrainMaterial = new THREE.MeshStandardMaterial({
      map: grassTexture,
      normalMap: normalTexture,
    });

    const positionAttribute = terrainGeometry.attributes.position;
    const noise = new ImprovedNoise();
    const scale = 100;

    for (let i = 0; i < positionAttribute.count; i++) {
      const x = positionAttribute.getX(i);
      const y = positionAttribute.getY(i);

      const height = noise.noise(x / scale, y / scale, 0) * 5;
      positionAttribute.setZ(i, height);
    }

    positionAttribute.needsUpdate = true;

    const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
    terrain.rotation.x = -Math.PI / 2;

    return terrain;
  }

  createRoad(): THREE.Mesh {
    const roadWidth = 10;
    const roadLength = this.height;
    const roadGeometry = new THREE.PlaneGeometry(roadWidth, roadLength);
    const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });

    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.position.y = 0.1;

    return road;
  }

  createTrees(): THREE.Group {
    const treeGroup = new THREE.Group();
    const loader = new GLTFLoader();
    loader.load('/pine-large.glb', (gltf) => {
      const treeModel = gltf.scene;
      treeModel.scale.set(0.3, 0.3, 0.3);
      const treeSpacing = 10;
      const treeCount = Math.floor(this.height / treeSpacing);

      for (let i = 0; i < treeCount; i++) {
        const leftTree = treeModel.clone();
        leftTree.position.set(-5, 0, i * treeSpacing - this.height / 2);

        const rightTree = treeModel.clone();
        rightTree.position.set(5, 0, i * treeSpacing - this.height / 2);

        treeGroup.add(leftTree, rightTree);
      }
    });

    return treeGroup;
  }
}

export default Terrain;
