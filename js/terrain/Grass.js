import {SpriteMaterial} from "../../../../DAT155_project/dat155-threejs-template/js/lib/three.module.js";
import {Sprite} from "../../../../DAT155_project/dat155-threejs-template/js/lib/three.module.js";
export default class Grass{

    constructor ({texture}){
        // make the billboard
        const objMaterial = new SpriteMaterial({transparent: true, map : texture, opacity: 0.7});
        objMaterial.transparent = true;
        objMaterial.depthTest = true;
        objMaterial.recieveShadows= true;
        objMaterial.fog =true;
        //let objMaterial = new SpriteMaterial({geometry: geometry, map: textureMap, transparent: true, alphaTest: 0.5, depthTest: false, alphaMap: 0xffffff});
        //const geometry = new PlaneBufferGeometry(1, 1, 1, 1);
        const object2 = new Sprite(objMaterial);
        object2.name = "Billboard";

        return(object2);
    }
}