
import { _decorator, Component, Node, director, isValid, Scene, FogInfo } from 'cc';
import AudioManager from '../core/audio-manager';
const { ccclass, property, type } = _decorator;

@ccclass('AlphaUI')
export class AlphaUI extends Component {
    @type(Node)
    nodeIcon: Node = null!;

    start() {
        this.scheduleOnce(() => {
            console.log("开始加载场景");
            director.preloadScene("loading", () => {
                director.loadScene("loading");
                console.log("进入加载场景");
            });
        }, 1);
        // let scene: Scene = director.getScene()!;
        // this.scheduleOnce(() => {
        //     console.log("设置雾的类型--");
        //     scene.globals.fog.type = FogInfo.FogType.EXP;
        //     console.log("设置雾的类型++");
        // }, 0.1);
    }


}