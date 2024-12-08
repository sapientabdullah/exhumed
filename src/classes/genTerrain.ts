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
    const grassTexture = loader.load(
      '/ground-texture/brown_mud_dry_diff_4k.jpg'
    );
    const normalTexture = loader.load(
      '/ground-texture/brown_mud_dry_nor_gl_4k.jpg'
    );

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
        this.noiseGenerator.noise(x / 50, z / 50, this.seed) * 5;
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(xOffset, 0, zOffset);
    this.terrainChunks.add(mesh);

    this.addTreesToChunk(xOffset, zOffset);
  }

  addTreesToChunk(xOffset: number, zOffset: number): void {
    const loader = new GLTFLoader();
    loader.load('/pine-large.glb', (gltf) => {
      const treeModel = gltf.scene;
      const treeCount = Math.floor(Math.random() * 10) + 5;

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
    return this.noiseGenerator.noise(x / 50, z / 50, this.seed) * 5;
  }

  update(playerPosition: THREE.Vector3): void {
    const playerChunkX = Math.floor(playerPosition.x / this.chunkSize);
    const playerChunkZ = Math.floor(playerPosition.z / this.chunkSize);

    this.terrainChunks.children = this.terrainChunks.children.filter(
      (chunk) => {
        const dx = Math.abs(chunk.position.x / this.chunkSize - playerChunkX);
        const dz = Math.abs(chunk.position.z / this.chunkSize - playerChunkZ);
        return dx <= 1 && dz <= 1;
      }
    );

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
