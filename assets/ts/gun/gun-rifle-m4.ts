
import { _decorator, Component, Node, Animation, Vec3, Tween, tween } from 'cc';
import { GunRifle } from './gun-rifle';
const { ccclass, property } = _decorator;

const DEFAULT_POSITION = new Vec3(-0.095, -0.049, -0.003);
const DEFAULT_EULERANGLE = new Vec3(-116.537, -33.587, -62.711);
const SPECIAL_POSITION = new Vec3(-0.086, -0.03, -0.007);
const SPECIAL_EULERANGLE = new Vec3(-141.979, -71.479, -85.748);

/**
 * 步枪控制类 M4
 */

@ccclass('GunRifleM4')
export class GunRifleM4 extends GunRifle {
    private _isAttack: boolean = false;
    private _isFillBullet: boolean = false;

    private _tween: MAny = null!;


    public init() {

    }
    /**
    * 站立状态
    */
    public idleState(): void {
        // if (this._isAttack) return;
        // if (this._isFillBullet) return;
        if (this.state === 0) return;
        this.setDefalutTransform();
        this.state = 0;
    }
    /**
     * 行走状态
     */
    public walkState(): void {
        // if (this._isAttack) return;
        // if (this._isFillBullet) return;
        if (this.state === 1) return;
        this.setDefalutTransform();
        this.state = 1;
        console.log("walkState=======================");
    }
    /**
     * 跑步状态
     */
    public runState(): void {
        // if (this._isAttack) return;
        // if (this._isFillBullet) return;
        if (this.state === 2) return;
        this.setDefalutTransform();
        this.state = 2;
    }

    private setDefalutTransform(): void {
        if (this._tween) {
            this._tween.stop();
            this._tween = null;;
        }
        if (this.state === 3) {
            this._tween = tween(this.node)
                .to(0.1, { position: DEFAULT_POSITION, eulerAngles: DEFAULT_EULERANGLE })
                .start();
        } else {
            this.node.position = DEFAULT_POSITION;
            this.node.eulerAngles = DEFAULT_EULERANGLE;
        }
    }
    // public fillBulletState(isStart: boolean): void {
    //     if (this._isAttack) return;
    //     if (this.state === 4) return;
    //     if (isStart) {
    //         this._isFillBullet = true;
    //         this.setDefalutTransform();
    //         this.state = 4;
    //     } else {
    //         this._isFillBullet = false;
    //     }
    // }
    /**
     * 攻击状态
     */
    public attackState(): void {
        this.setSpecialTransform();
        this.state = 3;
        console.log("attackState=======================");
    }

    private setSpecialTransform(): void {
        if (this._tween) {
            this._tween.stop();
            this._tween = null;;
        }
        this.node.position = SPECIAL_POSITION;
        this.node.eulerAngles = SPECIAL_EULERANGLE;
    }


}
