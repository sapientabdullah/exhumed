import * as THREE from 'three';
import { ImprovedNoise } from 'three/examples/jsm/Addons.js';
class Terrain {
  terrain: THREE.Group;
  terrainMesh: THREE.Mesh;
  walls: THREE.Mesh[];
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
    this.walls = this.createWalls();

    this.terrain.add(this.terrainMesh);
    this.walls.forEach((wall) => this.terrain.add(wall));
  }
  createTerrain(): THREE.Mesh {
    const terrainGeometry = new THREE.PlaneGeometry(
      this.width,
      this.height,
      this.widthSegments,
      this.heightSegments
    );
    const terrainMaterial = new THREE.MeshStandardMaterial({
      color: this.color,
      flatShading: true,
    });

    const positionAttribute = terrainGeometry.attributes.position;
    const noise = new ImprovedNoise();
    const scale = 15;

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
  createWalls(): THREE.Mesh[] {
    const wallHeight = 10;
    const wallThickness = 1;
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b4513,
    });

    const walls = [];

    const frontWall = new THREE.Mesh(
      new THREE.BoxGeometry(this.width, wallHeight, wallThickness),
      wallMaterial
    );
    frontWall.position.set(0, wallHeight / 2, -this.height / 2);
    walls.push(frontWall);

    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(this.width, wallHeight, wallThickness),
      wallMaterial
    );
    backWall.position.set(0, wallHeight / 2, this.height / 2);
    walls.push(backWall);

    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, wallHeight, this.height),
      wallMaterial
    );
    leftWall.position.set(-this.width / 2, wallHeight / 2, 0);
    walls.push(leftWall);

    const rightWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, wallHeight, this.height),
      wallMaterial
    );
    rightWall.position.set(this.width / 2, wallHeight / 2, 0);
    walls.push(rightWall);

    return walls;
  }
}

export default Terrain;
