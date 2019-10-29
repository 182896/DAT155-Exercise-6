/*import {DoubleSide, Mesh, MeshBasicMaterial, PlaneGeometry} from "../lib/three.module.js";
import {LOD} from "../../../../DAT155_project/dat155-threejs-template/js/lib/three.module.js";
import {TextureLoader} from "../lib/three.module.js";

export default class Grass extends Mesh{
    constructor ({textureMap, height, width}){
        // make the billboard

        let objMaterial = new MeshBasicMaterial({transparent: true, map : textureMap});
        objMaterial.depthTest = false;
        objMaterial.side = DoubleSide;
        let object2 = new Mesh(new PlaneGeometry(width,height), objMaterial);
        object2.name = "Billboard";
        object2.receiveShadow = true;

        scene.traverse(function(object){
            if (object instanceof  LOD){
                object.update(camera);
                object.children[1].quaternion.copy(camera, quaternion);
            }
        });
        super({objMaterial, object2});
    }
}
const GrassTexture = new TextureLoader().load('resources/textures/grassbillboardtexture.jpg');
const grass = new Grass({textureMap:GrassTexture,height:1, width:1});
grass.position.set(0,10,0);
scene.add(grass);
*/
