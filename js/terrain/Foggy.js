import {Fog} from "../lib/three.module.js";

export default class Foggy extends Fog{
    constructor(){
        let near = 0.01;
        let far = 1;
        let color = 0xffffff;
        super(color, near, far);
    }
}