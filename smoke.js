import * as THREE from "three";

class Particle {
    constructor() {
        const scale = 20 + Math.random() * 20;
        const nLines = 5 + Math.floor(Math.random() * 5);
        const nRows = 5 + Math.floor(Math.random() * 5);
        this.geometry = new THREE.SphereGeometry(scale, nLines, nRows);
        this.material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
    }
}

export default Particle