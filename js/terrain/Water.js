import {
    Mesh,
    PlaneBufferGeometry,
    ShaderMaterial,
} from "../lib/three.module.js";

export default class water{
    constructor(maxRow, maxCol, segmentRow, segmentCol, uniforms, position){

        let material = new ShaderMaterial({
            uniforms: uniforms,
            vertexShader: document.getElementById("vertexShader").textContent,
            fragmentShader: document.getElementById("fragmentShader").textContent,
        });

        material.fog = true;
        let geometry = new PlaneBufferGeometry(maxRow, maxCol, segmentRow, segmentCol);
        let mesh = new Mesh(geometry, material);
        mesh.doublesided = true;
        mesh.rotation.x = -1.570796;
        mesh.position.set(position.x, position.y, position.z);
        return mesh;
    }
}