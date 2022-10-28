
import { _decorator, Component, Node, SkeletalAnimation, Vec3, AnimationState, Quat, animation, BoxCollider, ITriggerEvent, CapsuleCollider, Collider, ICollisionEvent, SkinnedMeshRenderer, Material, tween, misc, geometry, PhysicsSystem, PhysicsRayResult } from 'cc';
import { AgentConfig } from '../../lib/NavMesh/NavMesh';
import { EColliderGroup, EColliderMask, EColliderType } from '../collider/collider-constants';
import { ColliderNode } from '../collider/collider-node';
import AudioManager from '../core/audio-manager';
import EventManager from '../core/event-manager';
import PoolManager from '../core/pool-manager';
import { GameEvent } from '../entity/event-entity';
import { ResAudio, ResEffect, ResKey } from '../entity/res-constant';

import { GameEntity } from '../game/game-entity';
import { PlayerMgr } from '../player/player-mgr';
import { EnemyAnim } from './enemy-anim';
import { EnemyAnimName, EnemyMoveType, EnemyState } from './enemy-entity';
import { EnemyModle } from './enemy-modle';
const { ccclass, property, type } = _decorator;

/**
 */

@ccclass('EnemyBase')
export class EnemyBase extends Component {
    /**
    * 骨骼动画节点
    */
    @type(SkeletalAnimation)
    public skeletalAnim: SkeletalAnimation = null!;
    /**
     * 武器节点 用来检测碰撞
     */
    @type(Node)
    public nodeWeapon: Node = null!;
    @type(EnemyModle)
    public enemyModleComp: EnemyModle = null!;
    private _navMeshAgentId: number = 0
    public get navMeshAgentId() {
        return this._navMeshAgentId;
    }
    private _initPos: Vec3 = null!;
    private _moveType: number = -1;

    _position: Vec3 = null!;
    get position() {
        this._position = this.node.position;
        return this._position;
    }
    public getWorldPosition(): Vec3 { 
        return this.node.worldPosition;
    }

    /**
     * 当前僵尸类型
     */
    public enemyId: number = 0;

    /**
     * 局内敌人唯一标识
     */
    public index: number = -1;

    /**
     * 僵尸状态
     * 激活和非激活状态
     */
    public _state: number = EnemyState.DISENABLE;
    /**
     * 攻击范围
     */
    public attackRange: number = 0;
    /**
     * 攻击耗时
     */
    public attackTime: number = 0;
    /**
     * 嘶吼耗时
     */
    public screamTime: number = 0;
    /**
     * 移动速度
     */
    public walkSpeed: number = 0;
    public runSpeed: number = 0;
    /**
     * 死亡时间
     */
    public deathTime: number = 0;
    /**
     * 生命值
     */
    public life: number = 0;
    public allLife: number = 0;
    /**
     * 随机巡视范围
     */
    public moveRange: number = 0;
    /**
     * 自身半径
     */
    public radius: number = 0;
    /**
     * 视线检测频率
     */
    public ckSightFrq: number = 0;
    /**
     * 视线正前方角度
     */
    public sightAngle: number = 0;
    /**
     * 视线范围
     */
    public sightRange: number = 0;
    /**
    * 惊扰范围
    */
    public alarmRange: number = 0;
    /**
     * 被攻击时候的效果
     */
    public hitEffect: string = ResEffect.EF_HIT_ENEMY;
    /**
     * 距离玩家的距离
     */
    public distance: number = 0;




    public meshRenderer: SkinnedMeshRenderer[] = [];

    /**
     * 当前动作类型
     */
    private _animState: string = "";

    /**
     * 目标玩家
     */
    private _targetPlayer: PlayerMgr = null!;

    private _tempDis: number = 0;
    /**
     * 寻路刷新频率
     **/
    private _pathRefreshDt: number = 0;



    private _tempPos: Vec3 = new Vec3(0, 0, 0);
    private _tempPos1: Vec3 = new Vec3(0, 0, 0);
    private _tempVec: Vec3 = new Vec3(0, 0, 0);
    private _tempVec1: Vec3 = new Vec3(0, 0, 0);
    // private _tempPlayerVec: Vec3 = new Vec3(0, 0, 0);
    private _tempLookVec: Vec3 = new Vec3(0, 0, 0);
    //丧尸追踪玩家的时间
    private _traceTime: number = 0;

    private _tempLookAtQ: Quat = new Quat();
    private _tempIconLookAtQ: Quat = new Quat();
    private _tempIconPos: Vec3 = new Vec3(0, 0, 0);


    private _attackSchedule: MFunction = null!;
    private _screamSchedule: MFunction = null!;


    //扫描时间
    private _scanTime: number = 0;
    private _scanRaduis: number = 0;
    private _scanCenter: Vec3 = null!;

    /**
     * 检测追踪
     */
    private _cheakTraceDt: number = 0;

    private _ray: geometry.Ray = new geometry.Ray();

    start() {

    }
    public init(index: number) {
        this.life = this.allLife;
        this._moveType = EnemyMoveType.IDLE;
        this._state = EnemyState.DISENABLE;
        this.index = index;
        this._targetPlayer = null!;
        this._cheakTraceDt = 0;
        this.startGame();
    }
    private startGame(): void {
        this._state = EnemyState.ENABLE;
        this.setAnimState(EnemyAnimName.IDLE);
        this.initWeaponAttack();
        this.initNavMeshAgent();
        this.enemyWalkMove();
    }
    public setTargetPlayer(player: PlayerMgr): void {
        this._targetPlayer = player;
    }
    public initWeaponAttack(): void {
        if (!this.nodeWeapon) return;
        this.nodeWeapon.active = false;
        let enemyAnim: EnemyAnim = this.skeletalAnim.node.getComponent(EnemyAnim)!;
        enemyAnim.init(
            () => {
                this.nodeWeapon.active = true;
                // console.log("开始攻击");
            },
            () => {
                this.nodeWeapon.active = false;
                // console.log("结束攻击");
            });
        let collider: Collider = this.nodeWeapon.getComponent(Collider)!;
        if (collider) {
            // console.log("监听武器攻击：", collider);
            //设置武器的group和mask
            collider.setGroup(EColliderGroup.ENEMY_WEAPON);
            collider.setMask(EColliderMask.ENEMY_WEAPON);

            collider.on("onTriggerEnter", this.attackPlayerTrigger, this);
        }
    }
    /**
     * 初始化navmesh代理
     */
    public initNavMeshAgent(): void {
        let pos = GameEntity.navMeshMrg.getClosestPoint(this.node.position);
        this._initPos = pos.clone();
        this.node.setPosition(pos);
        let config: AgentConfig = {
            radius: this.radius,
            height: 1,
            maxAcceleration: this.walkSpeed / 2.0,
            maxSpeed: this.walkSpeed,
            collisionQueryRange: 0.3,
            pathOptimizationRange: 0.0,
            separationWeight: 1.0,
        }
        this._navMeshAgentId = GameEntity.navMeshCorwd.addAgent(pos, config);
    }


    // public getState(): number {
    //     return this._state;
    // }
    public getMoveState(): number {
        return this._moveType;
    }
    public getAnimState(): string {
        return this._animState;
    }

    private setAnimState(name: string): void {
        this._animState = name;
        this.skeletalAnim.crossFade(name, 0.3);
    }
    /**
     * 敌人朝向玩家嘶吼，并且开始追踪攻击
     * @param player 
     * @returns 
     */
    public enemyScream(screamAudio: string): void {
        if (this._state === EnemyState.DISENABLE) return;
        if (this._moveType === EnemyMoveType.SCREAM) return;
        if (!this._targetPlayer) return;
        this.enemyWarningTips(0);
        this._traceTime = 0;
        if (this._moveType === EnemyMoveType.RUN || this._moveType === EnemyMoveType.ATTACK) {
            // //已经是追踪状态  直接追踪
            // // console.log("已经是追踪状态-----");
            // this.enemyTraceMove();
            return;
        } else {
            if (this.screamTime <= 0) {
                this.enemyScreamSchedule();
            } else {
                console.log("声音：====",screamAudio);
                if (screamAudio) AudioManager.instance.playSound(screamAudio);
                //先嘶吼在追踪
                this.setAnimState(EnemyAnimName.SCREAM);
                this._moveType = EnemyMoveType.SCREAM;
                //传送到当前脚底下
                let agentPosition = GameEntity.navMeshCorwd.getAgentPosition(this.navMeshAgentId);
                GameEntity.navMeshCorwd.agentTeleport(this.navMeshAgentId, agentPosition);
                this._screamSchedule = () => {
                    this.enemyScreamSchedule();
                }
                this.scheduleOnce(this._screamSchedule, this.screamTime);
            }
        }
    }
    public enemyScreamSchedule(): void {
        this.enemyRunMove();
    }

    /**
     * 巡视移动 -走
     */
    private enemyWalkMove(): void {
        if (this._moveType !== EnemyMoveType.WALK) {
            this.setAnimState(EnemyAnimName.WALK);
        }
        this._state = EnemyState.WALK;
        this._moveType = EnemyMoveType.WALK;
        this._pathRefreshDt = 10;
        let config: AgentConfig = {
            maxAcceleration: this.walkSpeed * 4,   //加速度  v=at   t=0.016*3   a=v/t
            maxSpeed: this.walkSpeed,
        };
        GameEntity.navMeshCorwd.updateAgentConfig(this.navMeshAgentId, config);

    }
    /**
     * 追踪移动 跑
     */
    public enemyRunMove(): void {
        if (this._moveType !== EnemyMoveType.RUN) {
            this.setAnimState(EnemyAnimName.RUN);
        }
        this._state = EnemyState.RUN;
        this._moveType = EnemyMoveType.RUN;
        this._pathRefreshDt = 10;
        let config: AgentConfig = {
            maxAcceleration: this.runSpeed * 4,   // (0.016 * 3)
            maxSpeed: this.runSpeed,
        }
        GameEntity.navMeshCorwd.updateAgentConfig(this.navMeshAgentId, config);


    }
    update(deltaTime: number) {
        this.updateMoveToTarget(deltaTime);
        this.updateEnemyPosition();
        this.refreshScanState(deltaTime);
        this.checkEnemyTracePlayer(deltaTime);
    }

    /**
     * 根据刷新频率刷新玩家寻路
     */
    private updateMoveToTarget(dt: number): void {
        if (this._state === EnemyState.DISENABLE) return;
        if (this._moveType === EnemyMoveType.ATTACK || this._moveType === EnemyMoveType.SCREAM) return;

        this._pathRefreshDt += dt;
        this._traceTime += dt;
        if (this._moveType === EnemyMoveType.WALK) {
            //巡视的时候自动回血  1秒会0.5  
            if (this.life < this.allLife) {
                this.life += dt * 0.5;
            } else {
                this.life = this.allLife;
            }
            if (this._pathRefreshDt >= 8.0) {
                this.moveToRandomWalkTarget();
                this._pathRefreshDt = 0;
            }
        } else if (this._moveType === EnemyMoveType.RUN) {
            if (this._pathRefreshDt >= 0.2) {
                this.moveToPlayerRunTarget();
                this._pathRefreshDt = 0;
            }
        }
    }
    /**
     * 以初始目标为中心，在一定范围内随机寻找一个目标点进行寻路移动
     */
    private moveToRandomWalkTarget(): void {
        let radius: number = this.moveRange;
        this._tempPos.x = this._initPos.x + (Math.random() * radius * 2 - radius);
        this._tempPos.z = this._initPos.z + (Math.random() * radius * 2 - radius);
        this._tempPos = GameEntity.navMeshMrg.getClosestPoint(this._tempPos);
        GameEntity.navMeshCorwd.agentMoveTarget(this.navMeshAgentId, this._tempPos);
    }
    /**
    * 以玩家为目标点进行追踪
    */
    private moveToPlayerRunTarget(): void {
        //目标玩家为空
        if (this._targetPlayer === null) {
            this.enemyWalkMove();
            return;
        }
        //追踪开始5秒内距离还大与20m  丧尸取消追踪  并且回血
        if (Vec3.distance(this.node.position, this._targetPlayer.position) > 15 && this._traceTime > 4) {
            this.enemyWalkMove();
            return;
        }


        this._tempPos = GameEntity.navMeshMrg.getClosestPoint(this._targetPlayer.position);
        GameEntity.navMeshCorwd.agentMoveTarget(this.navMeshAgentId, this._tempPos);
    }
    /**
     * 当前敌人被攻击
     * @param roraAudio 
     * @returns 
     */
    public enemyBeAttack(harm: number, roraAudio: string): void {
        if (this._state === EnemyState.DISENABLE) return;
        this.enemyScream(roraAudio);
        this._traceTime = 0;
        //生命值
        // EventManager.emit(GameEvent.HIT_ENEMY, [this.enemyId, this.life, this.allLife, 1]);
        this.life -= harm;
        if (this.life <= 0) {
            this.enemyDie();
        }
    }
    /**
     * 攻击范围警告提示
     */
    public enemyWarningTips(type: number): void {
        // if (!this.nodeWarningRange) return;
        // if (type === 0) {
        //     this.nodeWarningRange.active = false;
        // } else if (type === 1) {
        //     this.nodeWarningRange.active = true;
        // }
    }
    /**
     * 更新敌人位置
     */
    private updateEnemyPosition(): void {
        if (this._state === EnemyState.DISENABLE) return;
        this._tempPos = GameEntity.navMeshCorwd.getAgentPosition(this.navMeshAgentId);
        this.node.position = this._tempPos;
        if (this._moveType === EnemyMoveType.RUN) {
            if (this._targetPlayer === null) {
                this.enemyWalkMove();
                return;
            }
            this._tempDis = Vec3.distance(this._targetPlayer.position, this.position);
            if (this._tempDis <= this.attackRange) {
                //传送到当前脚底下
                GameEntity.navMeshCorwd.agentTeleport(this.navMeshAgentId, this._tempPos);
                this.lookAt(this._targetPlayer.position);
                this.enemyAttack();
                return;
            }
        }
        //获取下一个点
        this._tempPos1 = GameEntity.navMeshCorwd.getAgentNextTargetPath(this.navMeshAgentId);
        this._tempPos1.y = this.node.position.y;
        this.lookAt(this._tempPos1);
        // EventManager.emit(GameEvent.ENEMY_STATUS_CHANGE, [this.index, this._state, this.position.x, this.position.y, this.position.z]);
    }
    /**
     * 检测敌人追踪玩家
     */
    private checkEnemyTracePlayer(dt: number): void {
        if (!GameEntity.enemyActive) return
        if (this._state === EnemyState.DISENABLE) return;
        if (this._moveType !== EnemyMoveType.WALK) return;
        if (!this._targetPlayer) return;
        this._cheakTraceDt += dt;
        if (this._cheakTraceDt >= this.ckSightFrq) {   //追踪的检测频率  配表
            this._cheakTraceDt = 0;
            let dis: number = Vec3.distance(this._targetPlayer.position, this.position);
            if (dis < this.sightRange) {
                this.frontVec(this._tempVec);
                this._tempVec1.x = this._targetPlayer.position.x - this.position.x;
                this._tempVec1.y = 0;
                this._tempVec1.z = this._targetPlayer.position.z - this.position.z;
                //计算两个向量之间的弧度
                let angle: number = Vec3.angle(this._tempVec, this._tempVec1);
                //弧度转角度
                angle = misc.radiansToDegrees(angle);
                // console.log("视觉范围检测：",angle);
                if (angle < this.sightAngle) {  //视觉范围  7   配表
                    //进行一个射线检测
                    geometry.Ray.fromPoints(this._ray, new Vec3(this.position.x, this.position.y + 1.8, this.position.z), new Vec3(this._targetPlayer.position.x, this._targetPlayer.position.y + 1.7, this._targetPlayer.position.z));
                    PhysicsSystem.instance.raycastClosest(this._ray, EColliderMask.SIGHT_RAY, dis);
                    // console.log("视线范围内进行射线检测：", PhysicsSystem.instance.raycastClosestResult);
                    let screamAudio: string = ResAudio.AUDIO_ZOMBIE_SCREAM;
                    let result: PhysicsRayResult = PhysicsSystem.instance.raycastClosestResult
                    if (result && result.collider) {
                        let colliderNode: Node = PhysicsSystem.instance.raycastClosestResult.collider.node;
                        let colliderNodeComp: ColliderNode = colliderNode.getComponent(ColliderNode)!;
                        // if (colliderNodeComp && colliderNodeComp.type === EColliderType.STATIC) {
                        //     screamAudio = null!;
                        // }
                    }
                    this.enemyScream(screamAudio);

                }
            }
        }
    }
    /**
     * 僵尸发起攻击
     */
    private enemyAttack(): void {
        if (this._targetPlayer === null) {
            this.enemyWalkMove();
            return;
        }
        this._moveType = EnemyMoveType.ATTACK;
        //朝向玩家
        this.setAnimState(EnemyAnimName.ATTACK);
        this._attackSchedule = () => {
            this.enemyOnceAttackComplete();
        };
        this.scheduleOnce(this._attackSchedule, this.attackTime);

    }
    /**
     * 一次攻击完毕检测时继续攻击还是追钟
     */
    private enemyOnceAttackComplete(): void {
        // console.log("开始攻击");
        if (this._state === EnemyState.DISENABLE) return;
        //目标玩家为空
        if (this._targetPlayer === null) {
            this.enemyWalkMove();
            return;
        }
        this._tempDis = Vec3.distance(this._targetPlayer.position, this.node.position);
        if (this._tempDis <= this.attackRange) {   //防止传送后位置发生偏移
            this.lookAt(this._targetPlayer.position);
            this.enemyAttack();
            return;
        } else {
            this.enemyRunMove();
        }
    }
    /**
     * 释放攻击或追踪状态 的目标玩家
     */
    public releaseTargetPlayer(): void {
        this._targetPlayer = null!;
    }


    private lookAt(target: Vec3): void {
        this._tempLookVec.x = target.x;
        this._tempLookVec.y = target.y;
        this._tempLookVec.z = target.z;
        this._tempLookVec.subtract(this.node.position);
        this._tempLookVec.normalize();
        Quat.fromViewUp(this._tempLookAtQ, this._tempLookVec);
        this.node.rotation = this._tempLookAtQ;
    }
    public openScan(pos: Vec3, radius: number, time: number): void {
        this._scanCenter = pos;
        this._scanTime = time;
        this._scanRaduis = radius;
    }
    private refreshScanState(dt: number): void {
        if (this._scanTime <= 0) return;
        this._scanTime -= dt;
        if (this._scanTime > 0) {
            let dis: number = Vec3.distance(this.position, this._scanCenter);
            if (dis < this._scanRaduis) {
                this.enemyModleComp.openScanPerspective()
            } else {
                this.enemyModleComp.closeScanPerspective()
            }
        } else {
            this.enemyModleComp.closeScanPerspective()
        }
    }
    /**
     * 获取前方的向量
     */
    public frontVec(out: Vec3): void {
        let selfRadians = misc.degreesToRadians(this.node.eulerAngles.y);
        let x = this.node.position.x + 1 * Math.sin(selfRadians);
        let z = this.node.position.z + 1 * Math.cos(selfRadians);
        let y = this.node.position.y;

        out.x = x - this.node.position.x;
        out.y = 0;
        out.z = z - this.node.position.z;
    }

    private enemyDie(): void {
        this._state = EnemyState.DISENABLE;
        if (this.nodeWeapon) this.nodeWeapon.active = false;

        this.unschedule(this._screamSchedule);
        this.unschedule(this._attackSchedule);
        this.setAnimState(EnemyAnimName.DEATH);
        this.scheduleOnce(() => {
            EventManager.emit(GameEvent.ENEMY_DIE, this.index, this.position.x, this.position.y, this.position.z);
            this.dieDisappear();
        }, 0.5);

    }

    /**
    * 死亡消失
    */
    public dieDisappear(): void {
        this.enemyModleComp.deathVanish(() => {
            this.node.removeFromParent();
            PoolManager.instance.putNode(this.node);
            EventManager.emit(GameEvent.ENEMY_DIE_REMOVE, this.index);
        });

    }


    public attackPlayerTrigger(event: ITriggerEvent): void {
        //获取另一个碰撞器
        let other: Node = event.otherCollider.node;
        if (other.name === "player" && event.otherCollider.type === Collider.Type.CAPSULE) {
            EventManager.emit(GameEvent.PLAYER_BE_ATTACK);
        }
    }

    public getActive() {
        if (this._state === EnemyState.DISENABLE) {
            return false;
        }
        return true;
    }

    onDisable() {

    }
}
