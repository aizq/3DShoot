
import { _decorator, Component, Node, Prefab, instantiate, Vec3 } from 'cc';
import PoolManager from '../core/pool-manager';
import { ResLoad } from '../core/res-load';
import { EffectBase } from '../effect/effect-base';
import { EffectOpenFire } from '../effect/effect-open-fire';
import { ResEffect, ResKey } from '../entity/res-constant';
const { ccclass, property } = _decorator;


@ccclass('GunBase')
export class GunBase extends Component {
    @property({ type: Node })
    openFireBase: Node = null!;

    private _state: number = 0;
    /**
     * 枪的持有状态 
     * 0 idle
     * 1 walk
     * 2 run
     * 3 attack
     * 4 fillBullet
     * -1 未持有
     */
    public get state() {
        return this._state;
    }
    public set state(val: number) {
        this._state = val;
    }

    // public gunId: number = 0;
    // /**
    //  * 枪的类型 手枪还是步枪
    //  */
    // public type: string = '';

    start() {

    }
    public init() {

    }
    /**
     * 站立状态
     */
    public idleState(): void {
    }
    /**
     * 行走状态
     */
    public walkState(): void {
    }
    /**
     * 跑步状态
     */
    public runState(): void {
    }

    /**
     * 攻击状态
     */
    public attackState(): void {
    }
    /**
     * 装弹状态
     */
    public fillBulletState(): void {
    }
    // public playGunAmin (status: string): void {
    // }
    /**
     * 添加开火特效
     */
    public openFireEffect(): void {
        let openFireEffect: Node = PoolManager.instance.getNode(ResEffect.EF_OPEN_FIRE);
        openFireEffect.position = new Vec3(0, 0, 0);
        this.openFireBase.addChild(openFireEffect);
        let comp: EffectOpenFire = openFireEffect.getComponent(EffectOpenFire)!;
        comp.show(0.2);
    }
    public getMuzzleWorldPos():Vec3{
        return  this.openFireBase.getWorldPosition();
    }

}
