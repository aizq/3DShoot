

import { _decorator, Component, Node, SkeletalAnimation, ITriggerEvent, misc, RigidBody, game, Prefab, instantiate, math, Animation, animation, EventKeyboard, input, Input, KeyCode, isValid, Vec3, CapsuleCollider } from 'cc';

import { GunRifle } from '../gun/gun-rifle';
import { EColliderGroup, EColliderMask } from '../collider/collider-constants';
import { CharacterController } from './character-controller';
import { MoveAnimState, StateMachineMgr } from './state-machine/state-machine-mgr';
import { CameraMgr } from './camera-mgr';
import AudioManager from '../core/audio-manager';
import { ResAudio } from '../entity/res-constant';
import { GameUIData } from '../ui/ui-entity';
import EventManager from '../core/event-manager';
import { GameEntity } from '../game/game-entity';
import { GameEvent } from '../entity/event-entity';
const { ccclass, property, type } = _decorator;
export enum MoveType {
    WALK = 1,
    RUN = 2,
    IDLE = 0,
}
enum PLAYERSPEED {
    WALK = 2,
    RUN = 5.0,
    IDLE = 0,
}


/**
 * Predefined variables
 * Name = PlayerBase
 * DateTime = Mon Nov 29 2021 15:55:23 GMT+0800 (中国标准时间)
 * Author = carlosyzy
 * 玩家角色控制类
 */


@ccclass('PlayerMgr')
export class PlayerMgr extends Component {
    @property({ type: animation.AnimationController })
    animationController: animation.AnimationController = null!;

    @property({ type: Node })
    private nodeHeadSkel: Node = null!;
    @property({ type: Node })
    private nodeFootLSkel: Node = null!;
    @property({ type: Node })
    private nodeFootRSkel: Node = null!;

    @property({ type: Node })
    gunRifleM4Node: Node = null!;
    private _rifleM4Node: GunRifle = null!;

    /**
     * 胸骨
     */
    @property({ type: Node })
    thoraxNode: Node = null!;
    private _thoraxNodeEuler: Vec3 = new Vec3();
    private _thoraxAngle: number = 0;

    /**
     * 玩家位置
     */
    _position: Vec3 = null!;
    get position () {
        this._position = this.node.position;
        return this._position;
    }
    /**
     * 动画状态机管理器
     */
    private _stateMachineMgr: StateMachineMgr = null!;
    /**
     * 角色控制器
     */
    private _characterController: CharacterController = null!;
    /**
    * 刚体组件
    */
    public _rigidBody: RigidBody = null!;
    /**
     * 相机管理器
     */
    public _cameraMgr: CameraMgr = null!;

    private _camera: Node = null!;
    public set camera (val: Node) {
        this._camera = val;
    }


    /**
     * 玩家生命值
     */
    private _life: number = 3;
    private _lifeResidue: number = 10;


    /**
     * 动画状态机
     */
    private _moveState: number = 0;
    private _speed: number = 0;
    private _isMove: boolean = false;
    private _isJump: boolean = false;
    /**
    * 正在射击
    */
    private _isShooting: boolean = false;
    /**
     * 被攻击
     */
    private _isBeAttack: boolean = false;
    /**
     * 死亡过程中
     */
    private _isDeath: boolean = false;
    /**
     * 填弹过程中
     */
    private _isFillBullet: boolean = false;




    /**
    * 移动角度
    */
    private _moveAngle: number = 0;
    /**
    * 旋转控制因素
    */
    private _rotateFactor: number = 0.2;


    //临时数据
    private _tempVec0: Vec3 = new Vec3();
    private _tempVec1: Vec3 = new Vec3();

    onLoad () {

    }
    start () {

    }
    onEnable () {
    }
    public init (): void {
        this._stateMachineMgr = new StateMachineMgr(this, this.animationController);
        this._stateMachineMgr.idle();
        this._characterController = this.node.getComponent(CharacterController)!;
        this._characterController.setColliderTranfrom(0);
        this._rifleM4Node = this.gunRifleM4Node.getComponent(GunRifle)!;
        this._rifleM4Node.idleState();

        this._cameraMgr = new CameraMgr(this.node);
        if (this._camera) {
            this._cameraMgr.camera = this._camera;
        } else {
            console.warn("player mgr 未绑定摄像机节点");
        }

        //胸骨
        this._thoraxAngle = 0;


        // 刚体
        this._rigidBody = this.node.getComponent(RigidBody)!;
        this._rigidBody.setGroup(EColliderGroup.PLAYER_CHARACTRE_CONTROLLER);
        this._rigidBody.setMask(EColliderMask.PLAYER_CHARACTRE_CONTROLLER);

        //生命值
        this._life = 8;
        this._lifeResidue = 8;
        GameUIData.PLAYER_LIFE = this._life;
        GameUIData.PLAYER_RESIDUE_LIFE = this._lifeResidue;
        this._isDeath = false;

    }

    /**
     * 开始移动
     * @param type 移动类型  走 跑 
     * @param angle 即将移动的方向与正前方的夹角
     */
    public startMove (angle: number, isRun: boolean): void {

        this._moveAngle = angle;
        this._isMove = true;
        let vertical: number = 0;
        let horizontal: number = 0;
        if (angle >= 0 && angle <= 90) {
            horizontal = -1 * angle / 90;
            vertical = 1;
        } else if (angle >= 270 && angle <= 360) {
            horizontal = 1.0 - (angle - 270) / 90;
            vertical = 1;
        } else {
            horizontal = (angle - 90) / 90 - 1.0;
            vertical = -1;
        }
        this._stateMachineMgr.setVertical(vertical);
        this._stateMachineMgr.setHorizontal(horizontal);
        if (isRun) {
            this._moveState = MoveType.RUN;
        } else {
            this._moveState = MoveType.WALK;
        }
    }


    /**
     * 停止移动
     * @param deltaTime 
     */
    public stopMove (): void {
        this._stateMachineMgr.setVertical(0);
        this._stateMachineMgr.setHorizontal(0);
        this._isMove = false;
        this._moveState = MoveType.IDLE;

    }
    public startRotate (offsetX: number, offsetY: number): void {
        //设置左右旋转
        let rotateY = this.node.eulerAngles.y - offsetX * this._rotateFactor;
        this.node.eulerAngles = new Vec3(0, rotateY, 0);
        //设置上下旋转

        this._cameraMgr.setVertical(offsetY * this._rotateFactor);

        this._thoraxAngle += offsetY * this._rotateFactor;
        if (this._thoraxAngle > 35) this._thoraxAngle = 35;
        if (this._thoraxAngle < -35) this._thoraxAngle = -35;
    }
    public startJump (): void {
        this._tempVec0.x = 0;
        this._tempVec0.y = 3;
        this._tempVec0.z = 0;
        let isJump: boolean = this._characterController.jump(this._tempVec0);
        if (isJump) {
            let weight: number = 0;
            if (this._moveState === MoveType.WALK) {
                weight = 0.5;
            } else if (this._moveState === MoveType.RUN) {
                weight = 1.0;
            }
            this._stateMachineMgr.jump(weight);
            this._isJump = true;
            this.unschedule(this.endJumpSchedule);
            this.scheduleOnce(this.endJumpSchedule, 0.3);
            AudioManager.instance.playerMove("idle");
        }
    }
    private endJumpSchedule (): void {
        this._isJump = false;
        this._characterController.setColliderTranfrom(0);
    }
    public endRotate (): void {

    }



    public startOpenFire (): boolean {
        this._isShooting = true;
        if (this._isBeAttack) return false;
        this._stateMachineMgr.setAttackWeight(1);
        return true;
    }
    /**
     * 开火
     */
    public openFire (): boolean {
        this.unschedule(this.stopAttackScheuld);
        this.scheduleOnce(this.stopAttackScheuld, 0.7);
        this._rifleM4Node.attackState();
        this._stateMachineMgr.attack(true);
        this._rifleM4Node.openFireEffect();
        return true;
    }
    private stopAttackScheuld (): void {
        this.unschedule(this.stopAttackScheuld);
        this._stateMachineMgr.setAttackWeight(0);
        this._stateMachineMgr.attack(false);
        this._isShooting = false;

    }





    public fillBullet (state: boolean): void {
        if (state) {
            let time: number = 0;
            if (this._isShooting) {
                this.stopAttackScheuld();
                time = 0.1;
            }
            this._isFillBullet = true;
            this.scheduleOnce(() => {
                this._stateMachineMgr.fillBullet(true);
                AudioManager.instance.gunOperation("m4-fill-bullet");
            }, time);
        } else {
            this._isFillBullet = false;
            this._stateMachineMgr.fillBullet(false);

        }
    }
    public beAttack (): boolean {
        if (this._isDeath) return true;
        if (this._isShooting && !this._isBeAttack) {
            //被动停止攻击
            this._stateMachineMgr.attack(false);
        }


        this._lifeResidue--;
        GameUIData.PLAYER_RESIDUE_LIFE = this._lifeResidue;
        this.unschedule(this.beAttackSchedule);
        AudioManager.instance.playSound(ResAudio.AUDIO_PLAYER_BE_ATTACK);
        if (this._lifeResidue <= 0) {
            this._isBeAttack = false;
            this.playerDeath();
            return true;
        }

        this._isBeAttack = true;
        this._stateMachineMgr.beAttack(true);
        this.scheduleOnce(this.beAttackSchedule, 0.5);
        return false;
    }
    public beAttackSchedule (): void {
        this._isBeAttack = false;
        this._stateMachineMgr.beAttack(false);
    }

    update (deltaTime: number) {
        this.refreshPlayerState();
        this.refreshPlayerPosition(deltaTime);
        this.refreshColliderTranfrom();
        this._stateMachineMgr.update(deltaTime);
        this._cameraMgr.update(deltaTime);
    }

    lateUpdate (deltaTime: number): void {
        this.refreshThoraxNodeAngle();
    }
    /**
     * 刷新玩家的状态
     * 站立  行走  跑
     */
    private refreshPlayerState (): void {
        if (this._moveState === MoveType.IDLE) {
            this.idle();
        } else if (this._moveState === MoveType.WALK) {
            this.walk();
        } else if (this._moveState === MoveType.RUN) {
            this.run();
        }
    }
    private idle (): void {
        this._speed = PLAYERSPEED.IDLE;

        if (this._isJump) {

        } else if (this._isShooting) {
            this._stateMachineMgr.idle();
            AudioManager.instance.playerMove("idle");
        } else if (this._isFillBullet) {
            this._rifleM4Node.idleState();
            this._stateMachineMgr.idle();
            AudioManager.instance.playerMove("idle");
        } else {
            this._rifleM4Node.idleState();
            this._stateMachineMgr.idle();
            AudioManager.instance.playerMove("idle");
        }

    }
    private walk (): void {
        this._speed = PLAYERSPEED.WALK;

        if (this._isJump) {

        } else if (this._isShooting) {
            this._stateMachineMgr.walk();
            AudioManager.instance.playerMove("walk");
        } else if (this._isFillBullet) {
            this._rifleM4Node.walkState();
            this._stateMachineMgr.walk();
            AudioManager.instance.playerMove("walk");
        } else {
            this._rifleM4Node.walkState();
            this._stateMachineMgr.walk();
            AudioManager.instance.playerMove("walk");
        }



    }
    private run (): void {
        if (this._isJump) {

        } else if (this._isShooting) {
            this._speed = PLAYERSPEED.WALK;
            this._stateMachineMgr.walk();
            AudioManager.instance.playerMove("walk");
        } else if (this._isFillBullet) {
            this._speed = PLAYERSPEED.WALK;
            this._rifleM4Node.walkState();
            this._stateMachineMgr.walk();
            AudioManager.instance.playerMove("walk");
        } else {
            this._speed = PLAYERSPEED.RUN;
            this._rifleM4Node.runState();
            this._stateMachineMgr.run();
            AudioManager.instance.playerMove("run");
        }
    }

    private refreshThoraxNodeAngle (): void {
        if (this._isDeath) return;
        if (this._isFillBullet) return;
        if (!this._isShooting) return;
        if (this._isBeAttack) return;
        //后边会将这个偏移值分别分布到两个骨骼上边
        this._thoraxNodeEuler = this.thoraxNode.eulerAngles;
        this._thoraxNodeEuler.z += this._thoraxAngle;
        this.thoraxNode.eulerAngles = this._thoraxNodeEuler;
    }

    public refreshPlayerPosition (dt: number): void {
        if (this._isBeAttack) {
            //被攻击状态下往后移动
            let moveAngle: number = this.node.eulerAngles.y + 180;
            let selfRadians = misc.degreesToRadians(moveAngle);
            let frameSpeed: number = PLAYERSPEED.WALK;
            let x: number = frameSpeed / 0.016 * dt * Math.sin(selfRadians);
            let z: number = frameSpeed / 0.016 * dt * Math.cos(selfRadians);

            this._tempVec0.x = x;
            this._tempVec0.y = 0;
            this._tempVec0.z = z;
            this._characterController.move(this._tempVec0);

            // this._tempVec1 = this.position;
            // EventManager.emit(GameEvent.PLAYER_POSITION_CHANGE, this._tempVec1.x,this._tempVec1.y,this._tempVec1.z);
            return;
        }
        if (this._isMove === false) {
            this._tempVec0.x = 0;
            this._tempVec0.y = 0;
            this._tempVec0.z = 0;
            this._characterController.move(this._tempVec0);
        } else {
            let moveAngle: number = this.node.eulerAngles.y + this._moveAngle;
            let selfRadians = misc.degreesToRadians(moveAngle);
            let frameSpeed: number = this._speed;
            let x: number = frameSpeed / 0.016 * dt * Math.sin(selfRadians);
            let z: number = frameSpeed / 0.016 * dt * Math.cos(selfRadians);

            this._tempVec0.x = x;
            this._tempVec0.y = 0;
            this._tempVec0.z = z;
            this._characterController.move(this._tempVec0);

            // this._tempVec1 = this.position;
            // EventManager.emit(GameEvent.PLAYER_POSITION_CHANGE, this._tempVec1.x,this._tempVec1.y,this._tempVec1.z);
        }
    }
    /**
     * 刷新玩家身体上的最高点和最低点
     */
    private refreshColliderTranfrom (): void {
        if (!this._characterController) return;
        if (!this._isJump) return;
        let maxWorldY: number = this.nodeHeadSkel.getWorldPosition().y;
        this._characterController.maxY = maxWorldY - this.node.getWorldPosition().y;
        let minWorldY: number = (this.nodeFootLSkel.getWorldPosition().y + this.nodeFootRSkel.getWorldPosition().y) / 2;
        this._characterController.minY = minWorldY - this.node.getWorldPosition().y;
        this._characterController.setColliderTranfrom(1);
    }
    /**
     *  获取枪口的世界坐标位置
     */
    public getMuzzleWorldPos():Vec3{
       return this._rifleM4Node.getMuzzleWorldPos();
    }

    private playerDeath (): void {
        this._isDeath = true;
        this._isBeAttack = false;
        this._isMove = false;
        this._stateMachineMgr.death();
        this._cameraMgr.death();
        EventManager.emit(GameEvent.PLAYER_DEATH);
    }

    public clean(): void { 
        AudioManager.instance.playerMove("idle");
        this.node.destroy();
    }


}