import {Mesh, MeshBasicMaterial, SphereGeometry, BackSide} from "../lib/three.module.js";


export default class Skybox extends Mesh {
    constructor ({textureMap, radius, widthSegments, heightSegments}){

        let geometry = new SphereGeometry(radius, widthSegments, heightSegments);
        let material = new MeshBasicMaterial({map: textureMap, side: BackSide});
        super(geometry, material);
    }
}
