import * as THREE from "three";

class Tree {
  tree: THREE.Group;
  trunkColor: number;
  foliageColor: number;
  scaleFactor: number;
  constructor({
    trunkColor = 0x8b4513,
    foliageColor = 0x228b22,
    scaleFactor = 1,
  }: {
    trunkColor?: number;
    foliageColor?: number;
    scaleFactor?: number;
  }) {
    this.scaleFactor = scaleFactor;
    this.trunkColor = trunkColor;
    this.foliageColor = foliageColor;
    this.tree = this.createTree(scaleFactor);
  }
  createTree(scaleFactor: number): THREE.Group {
    const tree = new THREE.Group();

    const treeGeometry = new THREE.CylinderGeometry(0.1, 0.5, 3, 8);
    const treeMaterial = new THREE.MeshBasicMaterial({
      color: this.trunkColor,
    });
    const treeTrunk = new THREE.Mesh(treeGeometry, treeMaterial);
    treeTrunk.position.set(5, 1.5, 5);

    const foliageGeometry = new THREE.SphereGeometry(1.5, 8, 8);
    const foliageMaterial = new THREE.MeshBasicMaterial({
      color: this.foliageColor,
    });
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);

    foliage.position.set(5, 4, 5);

    tree.add(treeTrunk);
    tree.add(foliage);

    tree.scale.set(scaleFactor, scaleFactor, scaleFactor);

    return tree;
  }
}
export default Tree;
