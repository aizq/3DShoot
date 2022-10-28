import { _decorator, Component, Node, SkinnedMeshRenderer, Material } from 'cc';
import { EnemyData } from '../config/TEnemy'; import { ResEffect } from '../entity/res-constant';
import { EnemyBase } from './enemy-base';
import { EnemyType } from './enemy-entity';
const { ccclass, property } = _decorator;
/**
 * 光头丧尸
 */
@ccclass('EnemyZombieBald')
export class EnemyZombieBald extends EnemyBase {


    start() {

    }
    public init(index: number) {
        this.enemyId = EnemyType.ZPMBIE_BALD;
        this.allLife = EnemyData[this.enemyId].life;
        this.walkSpeed = EnemyData[this.enemyId].walk_speed;
        this.runSpeed = EnemyData[this.enemyId].run_speed;
        this.allLife = 5;
        this.moveRange = EnemyData[this.enemyId].move_range;
        this.attackRange = EnemyData[this.enemyId].attack_range;
        this.attackTime = EnemyData[this.enemyId].attack_time;
        this.screamTime = EnemyData[this.enemyId].scream_time;
        this.deathTime = EnemyData[this.enemyId].death_time;

        this.sightRange = EnemyData[this.enemyId].sight_range;
        this.ckSightFrq = EnemyData[this.enemyId].ck_sight_frq;
        this.sightAngle = EnemyData[this.enemyId].sight_angle;
        this.radius = EnemyData[this.enemyId].radius;
        this.radius = 0.3;
        this.alarmRange = EnemyData[this.enemyId].alarm_range;

        this.hitEffect = ResEffect.EF_HIT_ENEMY;

        super.init(index);
    }
    /**
     * 当前僵尸没有嘶吼动作
     * @param player 
     * @param screamAudio 
     */
    public enemyScream(screamAudio?: string): void {
        super.enemyScream(screamAudio!);

    }
    public enemyBeAttack(harm: number, screamAudio?: string): void {
        super.enemyBeAttack(harm, screamAudio!);
    }
    public update(dt: number) {
        super.update(dt);
    }

}

