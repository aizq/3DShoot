import { _decorator, Node, Vec3, geometry, misc, math, } from "cc";
import MapLevel0Obj, { MapLevel0Data } from "../config/TMapLevel0";
import PoolManager from "../core/pool-manager";
import { EnemyBase } from "./enemy-base";
import { EnemyMoveType, EnemyType } from "./enemy-entity";
import { ResAudio, ResEnemy, ResKey } from "../entity/res-constant";
import { PlayerMgr } from "../player/player-mgr";
import { GameEntity } from "../game/game-entity";
import EventManager from "../core/event-manager";
/**
 * 敌人管理
 */
export class EnemyController {
    private _node: Node = null!;

    /**
    * 敌人集合
    */
    private _enemyMap: Map<number, EnemyBase> = new Map();
    public get enemyMap () {
        return this._enemyMap;
    }
    public set enemyMap (val) {
        this._enemyMap = val;
    }
    /**
     * 统计丧尸索引
     */
    private _enemyIndex: number = 0;
    /**
    * 目标玩家
    */
    private _targetPlayer: PlayerMgr = null!;
    /**
     * 记录敌人的死亡位置
     */
    private _enemyDeathPositions: Vec3[] = [];
    public get enemyDeathPositions () {
        return this._enemyDeathPositions;
    }

    /**
     *就行发起攻击计时 
     */
    private _nearlyTraceDt: number = 0;

    constructor (node: Node) {
        this._node = node;
        this._enemyDeathPositions = [];
    }
    public setTargetPlayer (player: PlayerMgr): void {
        this._targetPlayer = player;
        for (let enemy of this._enemyMap.values()) {
            enemy.setTargetPlayer(this._targetPlayer);
        }

    }
    /**
     * 初始化丧尸
     * @param isAll  是否初始化所有的丧尸 
     * @returns 
     */
    public initEnemy (isAll: boolean = true): number {
        let num: number = 0;
        if (!GameEntity.mapData) return num;
        for (let key in GameEntity.mapData) {
            let data: MapLevel0Obj = GameEntity.mapData[key];
            if (data.type === 0) {
                if (!isAll) {
                    if (data.invade === 0) continue;
                    if (math.random() < 0.5) continue;
                }
                let pos: Vec3 = new Vec3();
                let position: string[] = data.position.split(",");
                pos.x = Number(position[0]);
                pos.y = Number(position[1]);
                pos.z = Number(position[2]);
                if (data.kind_id === EnemyType.ZPMBIE_BALD) {
                    this.addZombieBald(pos);
                } else if (data.kind_id === EnemyType.ZPMBIE_DEVILS) {
                    this.addZombieDevils(pos);
                }
                num++;
            }
        }
        return num;
    }
    /**
     * 创建光头丧尸
     * @param portalId  从那个传送门出生
     * @param pos  portalId=-1 时 直接再当前pos出生
     */
    private addZombieBald (pos: Vec3): void {
        let node: Node = PoolManager.instance.getNode(ResEnemy.ENEMY_ZOMBIE_BALD);
        let comp: EnemyBase = node.getComponent(EnemyBase)!;
        if (pos) node.position = pos;
        this._node.addChild(node);
        comp.init(this._enemyIndex);
        comp.setTargetPlayer(this._targetPlayer);
        this.enemyMap.set(this._enemyIndex, comp);
        this._enemyIndex++;

    }
    /**
     * 创建鬼子桑斯
     */
    private addZombieDevils (pos: Vec3): void {
        let node: Node = PoolManager.instance.getNode(ResEnemy.ENEMY_ZOMBIE_DECVILS);
        let comp: EnemyBase = node.getComponent(EnemyBase)!;
        if (pos) node.position = pos;
        this._node.addChild(node);
        comp.init(this._enemyIndex);
        comp.setTargetPlayer(this._targetPlayer);
        this.enemyMap.set(this._enemyIndex, comp);
        this._enemyIndex++;
    }

    public update (dt: number): void {
        this.checkEnemyAndPlayerByDis(dt);

        this.checkNearlyEnemyTrace(dt);
    }
    /**
     * 就近检测敌人对玩家发起追踪攻击
     * 3秒内无追踪时
     */
    public checkNearlyEnemyTrace (dt: number): void {
        let enemyMoveState: number = 0;
        let isExistTrace: boolean = false;

        for (let enemy of this._enemyMap.values()) {
            enemyMoveState = enemy.getMoveState();
            if ((enemyMoveState === EnemyMoveType.RUN || enemyMoveState == EnemyMoveType.ATTACK)) {
                isExistTrace = true;
            }
        }
        if (isExistTrace) {
            this._nearlyTraceDt = 0;
        } else {
            this._nearlyTraceDt += dt;
            if (this._nearlyTraceDt >= 3) {
                let minDis: number = 999;
                let _enemy: EnemyBase = null!;
                for (let enemy of this._enemyMap.values()) {
                    if (enemy.distance < minDis) {
                        minDis = enemy.distance;
                        _enemy = enemy;
                    }
                }
                if (minDis < 10) {
                    _enemy.enemyScream(ResAudio.AUDIO_ZOMBIE_SCREAM);
                }
            }
        }
    }

    /**
     * 每帧检测敌人和玩家的距离关系
     */
    public checkEnemyAndPlayerByDis (dt: number): void {
        if (!GameEntity.enemyActive) return
        let enemyMoveState: number = 0;
        for (let enemy of this._enemyMap.values()) {
            enemyMoveState = enemy.getMoveState();
            let dis: number = Vec3.distance(this._targetPlayer.position, enemy.position);
            enemy.distance = dis;
            if (dis < enemy.alarmRange) {
                if ((enemyMoveState === EnemyMoveType.IDLE || enemyMoveState == EnemyMoveType.WALK)) {
                    //僵尸在站立/行走状态时 如果玩家进入攻击范围 -播放怒吼动作
                    enemy.enemyScream(ResAudio.AUDIO_ZOMBIE_SCREAM);
                }

            }
        }
    }


    /**
     * 清除丧尸的锁定的目标玩家
     */
    public cleanAllEnemyTargetPlayer (): void {
        for (let enemy of this._enemyMap.values()) {
            enemy.releaseTargetPlayer();
        }
    }
    public getEnemyPostion (index: number): Vec3 {
        let enemy: EnemyBase = this._enemyMap.get(index)!;
        return enemy.position;
    }
    public enemyDeath (index: number): void {
        let enemy: EnemyBase = this._enemyMap.get(index)!;
        this._enemyDeathPositions.push(enemy.position.clone());
    }
    /**
    * 敌人移除
    */
    public removeEnemy (index: number): void {
        this._enemyMap.delete(index);
    }
    /**
     * 获取当前局内存活的丧尸数量
     */
    public getEnemyNum (): number {
        return this._enemyMap.size;
    }

    public cleanAllEnemy (): void {
        for (let enemy of this._enemyMap.values()) {
            enemy.node.removeFromParent();
            PoolManager.instance.putNode(enemy.node);
        }
        this._enemyMap.clear();
        this._enemyIndex = 0;
    }
    /**
     * 开启扫描
     */
    public openScan (pos: Vec3, radius: number, time: number): void {
        for (let enemy of this._enemyMap.values()) {
            enemy.openScan(pos, radius, time);
        }
    }
}