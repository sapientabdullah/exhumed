import * as THREE from 'three';
import { ImprovedNoise } from 'three/examples/jsm/Addons.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

class Terrain {
  terrain: THREE.Group;
  terrainMesh: THREE.Mesh;
  path: THREE.Mesh;
  trees: THREE.Group;
  width: number;
  height: number;
  widthSegments: number;
  heightSegments: number;
  color: number;
  walls: THREE.Group;

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
    this.path = this.createPath();
    this.trees = this.createTrees();
    this.walls = new THREE.Group();

    this.addWalls();

    this.terrain.add(this.terrainMesh);
    this.terrain.add(this.path);
    this.terrain.add(this.trees);
    this.terrain.add(this.walls);
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

  createPath(): THREE.Mesh {
    const pathWidth = 10;
    const pathLength = this.height;

    const loader = new THREE.TextureLoader();
    const pathTexture = loader.load(
      '/ground-texture/forest_ground_04_diff_4k.jpg'
    );
    const pathNormalTexture = loader.load(
      '/ground-texture/forest_ground_04_nor_gl_4k.jpg'
    );

    pathTexture.wrapS = THREE.RepeatWrapping;
    pathTexture.wrapT = THREE.RepeatWrapping;
    pathTexture.repeat.set(1, pathLength / 10);

    pathNormalTexture.wrapS = THREE.RepeatWrapping;
    pathNormalTexture.wrapT = THREE.RepeatWrapping;
    pathNormalTexture.repeat.set(1, pathLength / 10);

    const pathMaterial = new THREE.MeshStandardMaterial({
      map: pathTexture,
      normalMap: pathNormalTexture,
    });

    const pathGeometry = new THREE.PlaneGeometry(pathWidth, pathLength);
    const path = new THREE.Mesh(pathGeometry, pathMaterial);

    path.rotation.x = -Math.PI / 2;
    path.position.y = 0.1;

    return path;
  }
  createTrees(): THREE.Group {
    const treeGroup = new THREE.Group();
    const loader = new GLTFLoader();

    loader.load('/pine-large.glb', (gltf) => {
      const treeModel = gltf.scene;

      const treeCount = 100;
      const maxSize = 0.5;
      const minSize = 0.1;
      const pathWidth = 10;

      for (let i = 0; i < treeCount; i++) {
        const randomX = Math.random() * this.width - this.width / 2;
        const randomZ = Math.random() * this.height - this.height / 2;

        if (Math.abs(randomX) < pathWidth / 2) {
          i--;
          continue;
        }

        const height = this.getTerrainHeight(randomX, randomZ);

        const tree = treeModel.clone();
        tree.position.set(randomX, height, randomZ);

        const randomScale = Math.random() * (maxSize - minSize) + minSize;
        tree.scale.set(randomScale, randomScale, randomScale);

        treeGroup.add(tree);
      }
    });

    return treeGroup;
  }
  addWalls() {
    const loader = new THREE.TextureLoader();
    const wallTexture = loader.load(
      '/wall_textures/plaster_brick_01_diff_4k.jpg'
    );
    const normalMap = loader.load(
      '/wall_textures/plaster_brick_01_nor_gl_4k.jpg'
    );

    wallTexture.wrapS = THREE.RepeatWrapping;
    wallTexture.wrapT = THREE.RepeatWrapping;
    const repeatX = 10;
    const repeatY = 1;
    wallTexture.repeat.set(repeatX, repeatY);

    const wallMaterial = new THREE.MeshStandardMaterial({
      map: wallTexture,
      normalMap: normalMap,
      roughness: 0.7,
      metalness: 0.1,
    });

    const leftWallGeometry = new THREE.BoxGeometry(1, 15, this.height);
    const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    leftWall.position.set(-this.width / 2 - 0.5, 4, 0);

    const rightWallGeometry = new THREE.BoxGeometry(1, 15, this.height);
    const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
    rightWall.position.set(this.width / 2 + 0.5, 4, 0);

    const topWallGeometry = new THREE.BoxGeometry(this.width, 15, 1);
    const topWall = new THREE.Mesh(topWallGeometry, wallMaterial);
    topWall.position.set(0, 4, this.height / 2 + 0.5);

    this.walls.add(leftWall);
    this.walls.add(rightWall);
    this.walls.add(topWall);
  }
  getTerrainHeight(x: number, z: number): number {
    const terrainGeometry = this.terrainMesh.geometry;
    const positionAttribute = terrainGeometry.attributes.position;

    for (let i = 0; i < positionAttribute.count; i++) {
      const terrainX = positionAttribute.getX(i);
      const terrainZ = positionAttribute.getY(i);

      if (Math.abs(terrainX - x) < 1 && Math.abs(terrainZ - z) < 1) {
        return positionAttribute.getZ(i);
      }
    }
    return 0;
  }
}

export default Terrain;
