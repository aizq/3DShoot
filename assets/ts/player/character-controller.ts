

import { _decorator, CapsuleCollider, Component, Vec3, RigidBody, ICollisionEvent, IContactEquation } from 'cc';

const { ccclass, property, type } = _decorator;

/**
 * 角色控制器
 */

@ccclass('CharacterController')
export class CharacterController extends Component {
    private _capsuleCollider: CapsuleCollider = null!;
    private _rigidBody: RigidBody = null!;

    private _canJumping: boolean = false;
    private _move: Vec3 = new Vec3();

    private _contactEquations: IContactEquation[] = [];
    private _contactEquation: IContactEquation = null!;

    private _capsuleColliderRaduis: number = 0;
    private _capsuleColliderHeight: number = 0;
    private _capsuleColliderCenter: Vec3 = new Vec3();

    private _maxY: number = 0;
    public set maxY (val: number) {
        this._maxY = val;
    }
    private _minY: number = 0;
    public set minY (val: number) {
        this._minY = val;
    }

    private _tempVec: Vec3 = new Vec3();
    onLoad () {
        this._capsuleCollider = this.node.getComponent(CapsuleCollider)!;
        if (this._capsuleCollider) {
            this._capsuleCollider.on("onCollisionEnter", this.onCollision, this);
            this._capsuleColliderRaduis = this._capsuleCollider.radius;
        } else {
            console.warn("未绑定胶囊体碰撞盒组件");
        }
        this._rigidBody = this.node.getComponent(RigidBody)!;
        if (!this._rigidBody) {
            console.warn("未绑定刚体组件");
        }
    }

    /**
     * @param move 世界坐标系下的移动
     */
    public move (move: Vec3): void {
        this._move.x = move.x;
        this._move.y = move.y;
        this._move.z = move.z;
    }
    public jump (jump: Vec3): boolean {
        console.log("跳跃：", this._canJumping);
        if (this._canJumping) return false;
        this._canJumping = true;
        this._rigidBody!.applyImpulse(jump);
        return true;
    }
    /**
     * 碰撞检测
     * @param event 
     */
    public onCollision (event: ICollisionEvent): void {
        //所有的碰撞点信息
        this._contactEquations = event.contacts;
        for (let i = 0; i < this._contactEquations.length; i++) {
            this._contactEquation = this._contactEquations[i];
            //检测当前节点的碰撞点
            if (this._contactEquation.isBodyA) {
                this._contactEquation.getLocalPointOnA(this._tempVec);
                if (this._tempVec.y <= this._capsuleColliderRaduis / 2) {
                    this._canJumping = false;
                }
            } else {
                this._contactEquation.getLocalPointOnB(this._tempVec);
                if (this._tempVec.y <= this._capsuleColliderRaduis / 2) {
                    this._canJumping = false;
                }
            }

        }
    }
    // public setMaxAndMinY (): void {

    // }
    update (): void {
        if (!this._rigidBody) return;
        this._rigidBody.getLinearVelocity(this._tempVec);
        this._tempVec.x = this._move.x;
        this._tempVec.z = this._move.z;
        // this._tempVec.y = -4;
        // console.log(Math.floor(this._tempVec.y*100000)/100000);
        this._rigidBody.setLinearVelocity(this._tempVec);
    }
    /**
     * 刷新玩家跳跃时候的碰撞胶囊体大小
     */
    public setColliderTranfrom (state: number): void {
        if (state === 0) {
            //默认状态   胶囊体形状固定

        } else if (state === 1) {
            //跳跃状态  胶囊体的形状随着玩家的动作变化
        }
    }


}