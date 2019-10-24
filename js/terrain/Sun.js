import {Mesh, MeshBasicMaterial, SphereGeometry} from "../lib/three.module.js";

export default class Sun extends Mesh {
    constructor({textureMap, radius, height, width}) {

    let geometry = new SphereGeometry(radius, width, height);
    let material = new MeshBasicMaterial({color: textureMap});
    super(geometry, material);
}
}