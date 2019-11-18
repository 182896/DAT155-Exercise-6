import {DoubleSide, Mesh, MeshBasicMaterial, PlaneGeometry, SpriteMaterial, Sprite} from "../lib/three.module.js";
export default class Grass{

    constructor ({textureMap}){
        // make the billboard
        let objMaterial = new SpriteMaterial({transparent: true, map : textureMap});
        objMaterial.depthTest = false;
        objMaterial.side = DoubleSide;
        //let objMaterial = new SpriteMaterial({geometry: geometry, map: textureMap, transparent: true, alphaTest: 0.5, depthTest: false, alphaMap: 0xffffff});
        let object2 = new Sprite(objMaterial);
        object2.name = "Billboard";
        object2.receiveShadow = true;

        return(object2);
    }
}
