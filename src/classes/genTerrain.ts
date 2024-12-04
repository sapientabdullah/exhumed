// import * as THREE from 'three';
// import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// import { loadingManager } from '../utils/loadingManager';

// class GenTerrain {
//   terrainChunks: THREE.Group;
//   walls: THREE.Group;
//   chunkSize: number;
//   maxChunks: number;
//   noiseGenerator: ImprovedNoise;
//   seed: number;
//   trees: THREE.Group;
//   textureLoader: THREE.TextureLoader;
//   gltfLoader: GLTFLoader;

//   constructor({
//     chunkSize = 100,
//     maxChunks = 10,
//   }: {
//     chunkSize?: number;
//     maxChunks?: number;
//   }) {
//     this.chunkSize = chunkSize;
//     this.maxChunks = maxChunks;
//     this.terrainChunks = new THREE.Group();
//     this.walls = new THREE.Group();
//     this.noiseGenerator = new ImprovedNoise();
//     this.seed = Math.random() * 100;
//     this.trees = new THREE.Group();

//     this.textureLoader = new THREE.TextureLoader(loadingManager);
//     this.gltfLoader = new GLTFLoader(loadingManager);

//     // Add static walls
//     this.addStaticWalls();

//     // Generate initial terrain chunks in front
//     for (let i = 0; i < this.maxChunks; i++) {
//       this.addChunk(0, -i * chunkSize); // Generate chunks forward
//     }
//   }
//   addStaticWalls(): void {
//     const wallHeight = 15;
//     const wallThickness = 1;

//     const loader = new THREE.TextureLoader();
//     const wallTexture = loader.load(
//       '/wall_textures/plaster_brick_01_diff_4k.jpg'
//     );
//     const normalMap = loader.load(
//       '/wall_textures/plaster_brick_01_nor_gl_4k.jpg'
//     );

//     wallTexture.wrapS = THREE.RepeatWrapping;
//     wallTexture.wrapT = THREE.RepeatWrapping;
//     wallTexture.repeat.set(this.maxChunks, 1);

//     const wallMaterial = new THREE.MeshStandardMaterial({
//       map: wallTexture,
//       normalMap: normalMap,
//       roughness: 0.7,
//       metalness: 0.1,
//     });

//     // Left wall
//     const leftWallGeometry = new THREE.BoxGeometry(
//       wallThickness,
//       wallHeight,
//       this.maxChunks * this.chunkSize
//     );
//     const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
//     leftWall.position.set(
//       -this.chunkSize / 2 - wallThickness / 2,
//       wallHeight / 2,
//       -(this.maxChunks * this.chunkSize) / 2
//     );
//     this.walls.add(leftWall);

//     // Right wall
//     const rightWallGeometry = new THREE.BoxGeometry(
//       wallThickness,
//       wallHeight,
//       this.maxChunks * this.chunkSize
//     );
//     const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
//     rightWall.position.set(
//       this.chunkSize / 2 + wallThickness / 2,
//       wallHeight / 2,
//       -(this.maxChunks * this.chunkSize) / 2
//     );
//     this.walls.add(rightWall);

//     // Back wall (correct placement at positive Z boundary)
//     const backWallGeometry = new THREE.BoxGeometry(
//       this.chunkSize,
//       wallHeight,
//       wallThickness
//     );
//     const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
//     backWall.position.set(
//       0,
//       wallHeight / 2,
//       this.chunkSize / 2 + wallThickness / 2
//     );
//     this.walls.add(backWall);
//   }

//   addChunk(xOffset: number, zOffset: number): void {
//     const geometry = new THREE.PlaneGeometry(
//       this.chunkSize,
//       this.chunkSize,
//       50,
//       50
//     );

//     const loader = new THREE.TextureLoader();
//     const grassTexture = loader.load('/textures/sparse_grass_diff_4k.jpg');
//     const normalTexture = loader.load('/textures/sparse_grass_nor_gl_4k.jpg');

//     grassTexture.wrapS = THREE.RepeatWrapping;
//     grassTexture.wrapT = THREE.RepeatWrapping;
//     grassTexture.repeat.set(10, 10);

//     const material = new THREE.MeshStandardMaterial({
//       map: grassTexture,
//       normalMap: normalTexture,
//     });

//     geometry.rotateX(-Math.PI / 2);

//     const vertices = geometry.attributes.position.array;
//     for (let i = 0; i < vertices.length; i += 3) {
//       const x = vertices[i] + xOffset;
//       const z = vertices[i + 2] + zOffset;
//       vertices[i + 1] =
//         this.noiseGenerator.noise(x / 50, z / 50, this.seed) * 5; // Adjust scale as needed
//     }
//     geometry.attributes.position.needsUpdate = true;
//     geometry.computeVertexNormals();

//     const mesh = new THREE.Mesh(geometry, material);
//     mesh.position.set(xOffset, 0, zOffset);
//     this.terrainChunks.add(mesh);

//     // Optionally add trees to the chunk
//     this.addTreesToChunk(xOffset, zOffset);
//   }

//   addTreesToChunk(xOffset: number, zOffset: number): void {
//     const loader = new GLTFLoader();
//     loader.load('/pine-large.glb', (gltf) => {
//       const treeModel = gltf.scene;
//       const treeCount = Math.floor(Math.random() * 10) + 5; // Random tree count per chunk

//       for (let i = 0; i < treeCount; i++) {
//         const randomX = Math.random() * this.chunkSize - this.chunkSize / 2;
//         const randomZ = Math.random() * this.chunkSize - this.chunkSize / 2;

//         const height = this.getTerrainHeight(
//           randomX + xOffset,
//           randomZ + zOffset
//         );

//         const tree = treeModel.clone();
//         tree.position.set(randomX + xOffset, height, randomZ + zOffset);

//         const randomScale = Math.random() * 0.4 + 0.1;
//         tree.scale.set(randomScale, randomScale, randomScale);

//         this.trees.add(tree);
//       }
//     });
//   }

//   getTerrainHeight(x: number, z: number): number {
//     return this.noiseGenerator.noise(x / 50, z / 50, this.seed) * 5; // Adjust scale as needed
//   }

//   update(playerPosition: THREE.Vector3): void {
//     const playerChunkX = Math.floor(playerPosition.x / this.chunkSize);
//     const playerChunkZ = Math.floor(playerPosition.z / this.chunkSize);

//     // Define the boundaries for chunk generation
//     const minX = -this.chunkSize / 2; // Left boundary
//     const maxX = this.chunkSize / 2; // Right boundary
//     const maxZ = this.chunkSize / 2; // Back wall boundary (positive Z)

//     // Filter out chunks outside the boundaries
//     this.terrainChunks.children = this.terrainChunks.children.filter(
//       (chunk) => {
//         return (
//           chunk.position.x >= minX &&
//           chunk.position.x <= maxX &&
//           chunk.position.z <= maxZ // Allow chunks only within the front region
//         );
//       }
//     );

//     // Generate chunks within bounds
//     for (let i = -1; i <= 1; i++) {
//       for (let j = 0; j <= 2; j++) {
//         // Generate only forward within the bounds
//         const chunkX = (playerChunkX + i) * this.chunkSize;
//         const chunkZ = (playerChunkZ - j) * this.chunkSize;

//         // Respect X and Z boundaries
//         if (chunkX < minX || chunkX > maxX || chunkZ > maxZ) continue;

//         const exists = this.terrainChunks.children.some(
//           (chunk) => chunk.position.x === chunkX && chunk.position.z === chunkZ
//         );

//         if (!exists) {
//           this.addChunk(chunkX, chunkZ);
//         }
//       }
//     }
//   }
// }

// export default GenTerrain;

import * as THREE from 'three';
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

class GenTerrain {
  terrainChunks: THREE.Group;
  chunkSize: number;
  maxChunks: number;
  noiseGenerator: ImprovedNoise;
  seed: number;
  trees: THREE.Group;

  constructor({
    chunkSize = 100,
    maxChunks = 10,
  }: {
    chunkSize?: number;
    maxChunks?: number;
    color?: number;
  }) {
    this.chunkSize = chunkSize;
    this.maxChunks = maxChunks;
    this.terrainChunks = new THREE.Group();
    this.noiseGenerator = new ImprovedNoise();
    this.seed = Math.random() * 100;
    this.trees = new THREE.Group();

    // Generate initial chunks
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        this.addChunk(i * chunkSize, j * chunkSize);
      }
    }
  }

  addChunk(xOffset: number, zOffset: number): void {
    const geometry = new THREE.PlaneGeometry(
      this.chunkSize,
      this.chunkSize,
      50,
      50
    );
    const loader = new THREE.TextureLoader();
    const grassTexture = loader.load('/textures/sparse_grass_diff_4k.jpg');
    const normalTexture = loader.load('/textures/sparse_grass_nor_gl_4k.jpg');

    grassTexture.wrapS = THREE.RepeatWrapping;
    grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(10, 10);

    const material = new THREE.MeshStandardMaterial({
      map: grassTexture,
      normalMap: normalTexture,
    });

    geometry.rotateX(-Math.PI / 2);

    const vertices = geometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i] + xOffset;
      const z = vertices[i + 2] + zOffset;
      vertices[i + 1] =
        this.noiseGenerator.noise(x / 50, z / 50, this.seed) * 5; // Adjust scale as needed
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(xOffset, 0, zOffset);
    this.terrainChunks.add(mesh);

    // Optionally, add trees to this chunk
    this.addTreesToChunk(xOffset, zOffset);
  }

  addTreesToChunk(xOffset: number, zOffset: number): void {
    const loader = new GLTFLoader();
    loader.load('/pine-large.glb', (gltf) => {
      const treeModel = gltf.scene;
      const treeCount = Math.floor(Math.random() * 10) + 5; // Random tree count per chunk

      for (let i = 0; i < treeCount; i++) {
        const randomX = Math.random() * this.chunkSize - this.chunkSize / 2;
        const randomZ = Math.random() * this.chunkSize - this.chunkSize / 2;

        const height = this.getTerrainHeight(
          randomX + xOffset,
          randomZ + zOffset
        );

        const tree = treeModel.clone();
        tree.position.set(randomX + xOffset, height, randomZ + zOffset);

        const randomScale = Math.random() * 0.4 + 0.1;
        tree.scale.set(randomScale, randomScale, randomScale);

        this.trees.add(tree);
      }
    });
  }

  getTerrainHeight(x: number, z: number): number {
    return this.noiseGenerator.noise(x / 50, z / 50, this.seed) * 5; // Adjust scale as needed
  }

  update(playerPosition: THREE.Vector3): void {
    const playerChunkX = Math.floor(playerPosition.x / this.chunkSize);
    const playerChunkZ = Math.floor(playerPosition.z / this.chunkSize);

    // Remove chunks outside the view
    this.terrainChunks.children = this.terrainChunks.children.filter(
      (chunk) => {
        const dx = Math.abs(chunk.position.x / this.chunkSize - playerChunkX);
        const dz = Math.abs(chunk.position.z / this.chunkSize - playerChunkZ);
        return dx <= 1 && dz <= 1;
      }
    );

    // Add new chunks
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const chunkX = (playerChunkX + i) * this.chunkSize;
        const chunkZ = (playerChunkZ + j) * this.chunkSize;
        const exists = this.terrainChunks.children.some(
          (chunk) => chunk.position.x === chunkX && chunk.position.z === chunkZ
        );
        if (!exists) {
          this.addChunk(chunkX, chunkZ);
        }
      }
    }
  }
}

export default GenTerrain;
