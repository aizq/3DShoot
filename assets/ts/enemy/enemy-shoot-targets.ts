import { _decorator, Component, Node, CCInteger, Vec3, math, CCFloat, BoxCollider, tween } from 'cc';

import { ResEffect } from '../entity/res-constant';
import { EnemyBase } from './enemy-base';
const { ccclass, property, executeInEditMode } = _decorator;
/**
 * 射击靶心
 */
@ccclass('EnemyShootTargets')
@executeInEditMode
export class EnemyShootTargets extends EnemyBase {
    @property({ type: Node })
    nodeTarget: Node = null!;
    @property({ type: CCInteger, tooltip: "0:静止，1：平移 2：圆周" })
    type: number = 0;
    @property({ type: CCFloat })
    radius: number = 7;
    @property({ type: CCFloat })
    angle: number = 7;
    @property({ type: CCFloat })
    speed: number = 0.001;


    private _tempVec3: Vec3 = new Vec3(0, 0, 0);
    private _startAngle: number = 0;
    private _status: number = 0;
    start () {
        this.hitEffect = ResEffect.EF_HIT_BUILD;
        this._startAngle = this.angle;
        this.allLife = 5;
        this.life = this.allLife;
        this._status = 1;
    }
    public init (index: number) {

    }
    /**
     * 当前僵尸没有嘶吼动作
     * @param player 
     * @param screamAudio 
     */
    public enemyScream (screamAudio?: string): void {

    }
    public enemyBeAttack (harm: number, roraAudio: string): boolean {
        if (this._status === 0) return false;
        this.life--;
        if (this.life <= 0) {
            this.refreshShootTaget();
            return false;
        }
        return true;
    }
    private refreshShootTaget (): void {
        this._status = 0;
        tween(this.nodeTarget)
            .to(0.3, { eulerAngles: new Vec3(-90, 0, 0) })
            .to(3, { eulerAngles: new Vec3(-90, 0, 0) })
            .to(0.3, { eulerAngles: new Vec3(0, 0, 0) })
            .call(() => {
                this.life = this.allLife;
                this._status = 1;
            })
            .start();
    }
    update (deltaTime: number) {
        if (this.type === 2) {
            this._startAngle += this.speed;
            this._tempVec3.x = this.radius * Math.cos(this._startAngle);
            this._tempVec3.z = this.radius * Math.sin(this._startAngle);
            this.node.position = this._tempVec3;
            this.node.forward = this._tempVec3;
        }
    }
}

