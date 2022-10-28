
import { _decorator, Component, Node, Animation, Vec3 } from 'cc';
import { GunBase, } from './gun-base';
const { ccclass, property } = _decorator;

/**
 * 手枪控制类
 */

@ccclass('GunPistol')
export class GunPistol extends GunBase {
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
        this.type = "pistol";
        this.node.position = new Vec3(-0.179, -0.064, -0.006);
        this.node.eulerAngles = new Vec3(77.68, -22.512, -65.729);
    }
    /**
    * 播放武器的对应动画
    */
    public playGunAmin (status: string): void {
        switch (status) {
            case "default":
                this.animGun.play("default");
                break;
            case "attack":
                this.animGun.play("attack");
                this.animBullet.play("bullet");
                break;
            case "fillBullet":
                this.animGun.play("fillBullet");
                break;
            case "noBullet":
                this.animGun.play("noBullet");
                break;

        }
    }


}
