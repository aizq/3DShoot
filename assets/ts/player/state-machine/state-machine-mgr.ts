import { _decorator, Component, Node, animation } from 'cc';
import { PlayerMgr } from '../player-mgr';
const { ccclass, property } = _decorator;
export enum MoveAnimState {
    DEFAULT = -1,
    IDLE = 0,
    WALK = 1,
    RUN = 2,
    JUMP = 3,
}
export enum MoveDirection {
    FRONT = 0,
    BACK = 1,
    LEFT = 2,
    RIGHT = 3,
    FRONT_LETF = 4,
    FRONT_RIGHT = 5,
    BACK_LETF = 6,
    BACK_RIGHT = 7,
    IDLE = -1,
}


@ccclass('StateMachineMgr')
export class StateMachineMgr {
    private _playerMgr: PlayerMgr = null!;
    private _animationController: animation.AnimationController = null!;

    private _isAttack: number = 0;
    private _isBeAttack: boolean = false;
    private _isFillBullet: boolean = false;

    private _moveState: number = MoveAnimState.DEFAULT;


    private _vertical: number = 0;
    private _horizontal: number = 0;
    private _targetVertical: number = 0;
    private _targetHorizontal: number = 0;
    private _startAttackWeight: number = 0;
    private _targetAttackWeight: number = 0;

    constructor (playerMgr: PlayerMgr, animationController: animation.AnimationController) {
        this._playerMgr = playerMgr;
        this._animationController = animationController;
    }

    public setVertical (val?: number): void {
        if (val !== null) this._targetVertical = val!;
    }
    public setHorizontal (val?: number): void {
        if (val !== null) this._targetHorizontal = val!;
    }

    public idle (): void {
        this._idle();
    }
    public walk (): void {
        this._walk();
    }
    public run (): void {
        this._run();
    }
    public jump (weight:number): void {
        this._jump(weight);
    }
    public attack (start: boolean): void {
        this._attack(start);
    }
    /**
    * 玩家被攻击
    */
    public beAttack (start: boolean): void {
        this._beAttack(start);
    }
    public death (): void {
        this._death();
    }
    public fillBullet (start: boolean): void {
        this._fillBullet(start);
    }
    public getAnimState (): number {
        return this._moveState;
    }
    /**
     * 设置攻击状态权重
     */
    public setAttackWeight (weight: number): void {
        this._startAttackWeight = Number(this._animationController.getValue("isAttack"));
        this._targetAttackWeight = weight;

    }


    public update (deltaTime: number): void {
        this._move(deltaTime);
        this._refreshAttackWeight(deltaTime);
    }



    private _idle (): void {
        if (this._moveState === MoveAnimState.IDLE) return;
        console.log("=============>idle");
        this._animationController.setValue("idle", true);
        this._animationController.setValue("isAttack", this._startAttackWeight);

        this._moveState = MoveAnimState.IDLE;
        this._vertical = 0;
        this._horizontal = 0;
    }
    private _walk (): void {
        if (this._moveState === MoveAnimState.WALK) return;
        console.log("=============>walk");
        this._animationController.setValue("walk", true);
        this._animationController.setValue("isAttack", this._startAttackWeight);
        this._moveState = MoveAnimState.WALK;
    }
    private _run (): void {
        if (this._moveState === MoveAnimState.RUN) return;
        console.log("=============>run");
        this._moveState = MoveAnimState.RUN;
        this._animationController.setValue("run", true);
        this._animationController.setValue("isAttack", this._startAttackWeight);

    }
    private _jump (weight:number): void {
        if (this._moveState === MoveAnimState.JUMP) return;
        console.log("=============>jump",weight);
        this._moveState = MoveAnimState.JUMP;
        this._animationController.setValue("jump", true);
        this._animationController.setValue("jump-weight", weight);
        
    }

    private _move (deltaTime: number): void {
        if (this._moveState !== MoveAnimState.WALK && this._moveState !== MoveAnimState.RUN) return;

        let vertical: number = this._targetVertical;
        let verticalOffset: number = Math.sign(vertical - this._vertical);

        this._vertical = this._vertical + verticalOffset * 0.1;
        if (Math.abs(this._targetVertical - this._vertical) < 0.1) {
            this._vertical = vertical;
        }
        this._vertical = Math.floor(this._vertical * 100) / 100;

        if (this._isBeAttack) {
            this._animationController.setValue("vertical", -1);
            this._animationController.setValue("horizontal", 0);
            return;
        }



        if (this._isAttack === 1 || this._isFillBullet) {
            this._animationController.setValue("vertical", 0);
        } else {
            this._animationController.setValue("vertical", this._vertical);
        }


        this._horizontal = this._targetHorizontal;
        if (this._isAttack === 1 || this._isFillBullet) {
            this._animationController.setValue("horizontal", 0);
        } else {
            this._animationController.setValue("horizontal", this._horizontal);
        }
    }
    /**
     * 刷新攻击持枪的权重
     * @param deltaTime 
     * @returns 
     */
    private _refreshAttackWeight (deltaTime: number): void {
        if (this._startAttackWeight === this._targetAttackWeight) return;
        if (this._targetAttackWeight === 0) {
            this._startAttackWeight -= deltaTime * 10.0;
            if (this._startAttackWeight < 0) {
                this._startAttackWeight = 0;
            }
        } else {
            this._startAttackWeight += deltaTime * 10.0;
            if (this._startAttackWeight > 1) {
                this._startAttackWeight = 1;
            }
        }
        this._animationController.setValue("isAttack", this._startAttackWeight);
    }



    private _attack (start: boolean): void {
        console.log("=============>attack:", start);
        if (start) {
            this._isAttack = 1;
            this._animationController.setValue("attack", true);
        } else {
            this._isAttack = 0;
            this._animationController.setValue("attack-exit", true);
        }
    }
    /**
     * 被攻击
     * start :true 开始  false：结束
     */
    private _beAttack (start: boolean): void {
        console.log("=============>btAttack:", start);
        if (start) {
            this._isBeAttack = true;
        } else {
            this._isBeAttack = false;
        }
    }
    private _death (): void {
        this._animationController.setValue("death", true);
    }

    private _fillBullet (start: boolean): void {
        console.log("=============>fillBullet:", start);
        if (start) {
            //开始填弹
            this._isFillBullet = true;
            this._animationController.setValue("fillBullet", true);
        } else {
            this._isFillBullet = false;
            this._animationController.setValue("fillBullet-exit", true);

        }
    }

}


