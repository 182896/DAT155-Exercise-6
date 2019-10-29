import {Mesh, MeshPhongMaterial, SphereGeometry} from "../lib/three.module.js";

export default class Moon extends Mesh {
    constructor({textureMap, radius, height, width}) {

        let geometry = new SphereGeometry(radius, width, height);
        let material = new MeshPhongMaterial({map: textureMap});
        super(geometry, material);
    }
}