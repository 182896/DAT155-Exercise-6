import {BackSide, Mesh, MeshBasicMaterial, SphereGeometry} from "../lib/three.module.js";
import {DoubleSide, PlaneGeometry} from "../../../../DAT155_project/dat155-threejs-template/js/lib/three.module.js";
import {LOD} from "../../../../DAT155_project/dat155-threejs-template/js/lib/three.module";

export default class Grass2 extends Mesh {
    constructor ({textureMap}){
        let objMaterial = new MeshBasicMaterial({transparent: true, map : textureMap});
        objMaterial.depthTest = false;
        objMaterial.side = DoubleSide;
        //let objMaterial = new SpriteMaterial({geometry: geometry, map: textureMap, transparent: true, alphaTest: 0.5, depthTest: false, alphaMap: 0xffffff});
        let object2 = new Mesh(new PlaneGeometry(1,1), objMaterial);
        object2.name = "Billboard";
        object2.receiveShadow = true;
        super(object2);
    }
}