
import { _decorator, Component, Node, Animation, Vec3 } from 'cc';
import { GunBase, } from './gun-base';
const { ccclass, property } = _decorator;

/**
 * 步枪控制类
 * 
 */

@ccclass('GunRifle')
export class GunRifle extends GunBase {
    /**
     * 动画
     */
    @property({ type: Animation })
    animGun: Animation = null!;
    @property({ type: Animation })
    animBullet: Animation = null!;

    onLoad () {
    }
    start () {
    }
    public init() { 
        // this.type = "rifle";
    }
    // /**
    //  * 设置当前状态
    //  * 与玩家状态对应
    //  */
    // public setState(state:number): void { 
        
    // }
    
}
