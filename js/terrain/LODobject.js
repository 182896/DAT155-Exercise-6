import {IcosahedronBufferGeometry, LOD, Mesh, MeshLambertMaterial} from "../lib/three.module.js";

export default class LODobject{
    constructor(color){
    let geometry = [

    [ new IcosahedronBufferGeometry( 3, 4 ), 20 ],
    [ new IcosahedronBufferGeometry( 3, 3 ), 40 ],
    [ new IcosahedronBufferGeometry( 3, 2 ), 60 ],
    [ new IcosahedronBufferGeometry( 3, 1 ), 80 ],
    [ new IcosahedronBufferGeometry( 3, 0 ), 100 ]

];

let material = new MeshLambertMaterial( { color: color, wireframe: true , reflectivity: 0.8} );

let i, mesh, lod;


    lod = new LOD();

    for (i = 0; i < geometry.length; i++) {

        mesh = new Mesh(geometry[i][0], material);
        mesh.scale.set(1.5, 1.5, 1.5);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.updateMatrix();
        mesh.matrixAutoUpdate = false;
        lod.addLevel(mesh, geometry[i][1]);

    }

lod.position.set(0, 30, 0);
return lod;
}
}