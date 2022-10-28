import { _decorator, Component,  Animation } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ScanRobot')
export class ScanRobot extends Component {
    @property({ type: Animation })
    anim: Animation = null!;
    start () {

    }
    init (): void {
        this.anim.play();
    }


    update (deltaTime: number) {

    }
}


