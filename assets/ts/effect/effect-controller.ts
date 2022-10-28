import { _decorator, Node, Vec3, instantiate, } from "cc";
import PoolManager from "../core/pool-manager";
import { EffectBase } from "./effect-base";
import { EffectGrenadesBlast } from "./effect-grenades-blast";
import { EffectHitBuild } from "./effect-hit-build";
import { EffectHitEnemy } from "./effect-hit-enemy";
import { ResEffect, } from "../entity/res-constant";
import { ResLoad } from "../core/res-load";
import { EffectOpenFire } from "./effect-open-fire";
import { EffectKillTips } from "./effect-kill-tips";
import { EffectFireBallistic } from "./effect-fire-ballistic";

/**
 * 动效管理
 */
export class EffectController {


    private _node: Node = null!;
    // private _uiNode: Node = null!;
    constructor (node: Node) {
        this._node = node;
    }
    /**
     * 预热使用到的
     */
    public preHeating () {
        let pos: Vec3 = new Vec3(0, 0, 0);
        let normal: Vec3 = new Vec3(0, 0, 0);
        this.hitBuildEffect(pos, normal, 0.5);
        this.hitEnemyEffect(pos, normal, 0.5);
        // this.gasTankBlastEffect(pos, 0.5);
        this.addOpenFireEffect();
    }
    /**
     * 开火特效
     */
    public addOpenFireEffect (): void {
        let openFireEffect: Node = PoolManager.instance.getNode(ResEffect.EF_OPEN_FIRE);
        openFireEffect.position = new Vec3(0, 0, 0);
        this._node.addChild(openFireEffect);
        let comp: EffectOpenFire = openFireEffect.getComponent(EffectOpenFire)!;
        comp.show(0.2);
    }
    /**
     * 击中建筑物效果
     * @param hitPoint 
     * @param hitNormal 
     */
    public hitBuildEffect (hitPoint: Vec3, hitNormal: Vec3, time: number = 1.0): void {
        //射击到了障碍物 添加特效
        let effect = PoolManager.instance.getNode(ResEffect.EF_HIT_BUILD);
        this._node.addChild(effect);
        effect.position = hitPoint;
        effect.forward = hitNormal;
        let comp: EffectHitBuild = effect.getComponent(EffectHitBuild)!;
        comp.show(time);
    }
    public hitBuildEffectToBody (node: Node, hitPoint: Vec3, hitNormal: Vec3, time: number = 1.0): void {
        //射击到了障碍物 添加特效
        let effect = PoolManager.instance.getNode(ResEffect.EF_HIT_BUILD);
        node.addChild(effect);
        effect.worldPosition = hitPoint;
        effect.forward = hitNormal;
        let comp: EffectHitBuild = effect.getComponent(EffectHitBuild)!;
        comp.show(time);
    }
    /**
     * 击中敌人
     * @param hitPoint 
     * @param hitNormal 
     */
    public hitEnemyEffect (hitPoint: Vec3, hitNormal: Vec3, time: number = 0.5): void {
        let effect = PoolManager.instance.getNode(ResEffect.EF_HIT_ENEMY);
        this._node.addChild(effect);
        effect.position = hitPoint;
        effect.forward = hitNormal;
        let comp: EffectHitBuild = effect.getComponent(EffectHitEnemy)!;
        comp.show(time);
    }
    public killTipsEffect (uiRoot: Node, time: number = 0.5): void {
        let effect = PoolManager.instance.getNode(ResEffect.EF_KILL_TIPS);
        uiRoot.addChild(effect);
        let comp: EffectKillTips = effect.getComponent(EffectKillTips)!;
        comp.show(time);
    }
    /**
     * 添加开火弹道效果
     * @param start 
     * @param end 
     */
    public addfireBallistic(start:Vec3,end:Vec3 ,time: number = 0.5):void{
        let effect = PoolManager.instance.getNode(ResEffect.EF_FIRE_BALLISTIC);
        this._node.addChild(effect);
        let comp: EffectFireBallistic = effect.getComponent(EffectFireBallistic)!;
        comp.startPos = start;
        comp.endPos = end;
        console.log("添加射击弹道效果");
        comp.show(time);
    }
    public cleanAll (): void {

    }

}