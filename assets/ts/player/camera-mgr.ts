import { _decorator, Node, Vec3, misc, math, geometry, PhysicsSystem, PhysicsRayResult, tween, Vec2 } from 'cc';
import { EColliderMask } from '../collider/collider-constants';
const { ccclass, property } = _decorator;
/**
 * 摄像机管理类
 */
@ccclass('CameraMgr')
export class CameraMgr {
    private _player: Node = null!;

    private _camera: Node = null!;
    public set camera (val: Node) {
        this._camera = val;
    }

    private _distance: number = 1.0;
    private _offset: number = 0.8;
    private _height: number = 1.7;

    private _vertical: number = 4.0;
    private _horizontal: number = 0;
    private _eulerAngles: Vec3 = new Vec3();


    private _operateNode: Node = null!;
    private _mountNode: Node = null!;

    private _lerp: number = 0.7;
    private _isDeath: boolean = false;
    private _tempVec0: Vec3 = new Vec3();
    private _tempVec1: Vec3 = new Vec3();
    private _tempVec2: Vec3 = new Vec3();
    private _tempNumber0: number = 0;
    private _tempNumber1: number = 0;
    private _tempOpenFireRay: geometry.Ray = new geometry.Ray();

    constructor (player: Node) {
        this._player = player;
        this.initOperateNode();
    }
    /**
     * 通过节点绑定操作摄像机
     */
    private initOperateNode (): void {
        this._operateNode = new Node();
        let selfRadians: number = misc.degreesToRadians(this._player.eulerAngles.y + 225);
        let vec: Vec3 = new Vec3();
        vec.x = this._player.position.x + this._offset * Math.sin(selfRadians);
        vec.z = this._player.position.z + this._offset * Math.cos(selfRadians);
        vec.y = this._player.position.y + this._height;
        this._operateNode.parent = this._player;
        this._operateNode.worldPosition = vec;


        this._mountNode = new Node();
        selfRadians = misc.degreesToRadians(this._player.eulerAngles.y + 180 + 5);
        vec.x = vec.x + this._distance * Math.sin(selfRadians);
        vec.z = vec.z + this._distance * Math.cos(selfRadians);

        this._mountNode.parent = this._operateNode;
        this._mountNode.worldPosition = vec;

        this.setVertical(0);
    }

    // public setView(): void {

    // }

    public setVertical (val: number): void {
        this._vertical += -val;
        if (this._vertical > 35) this._vertical = 35;
        if (this._vertical < -35) this._vertical = -35;
        this._eulerAngles.x = this._vertical;
        this._lerp = 0.9;
        this._operateNode.eulerAngles = this._eulerAngles;
    }

    public setHorizontal (val: number): void {
        // if (val === 999) {
        //     //标识松手
        // } else {

        // }
    }

    public death (): void {
        this._isDeath = true;
        let vec: Vec3 = new Vec3();
        tween(new Vec2(this._vertical, 1))
            .to(2.0, new Vec2(60, 5), {
                onUpdate: (target: any) => {
                    this._eulerAngles.x = target.x;
                    this._operateNode.eulerAngles = this._eulerAngles;
                    this._operateNode.scale = new Vec3(target.y, target.y, target.y);

                }
            })
            .start();


    }


    public update (deltaTime: number) {
        this.refreshCamerTransform(deltaTime);
    }

    private refreshCamerTransform (deltaTime: number): void {
        if (!this._player) return;
        if (!this._camera) return;
        this.refreshCamerPosition(deltaTime);

    }
    private refreshCamerPosition (deltaTime: number): void {
        //通过玩家到摄像机的射线  检测是否存在障碍物
        this._tempVec0.x = this._player.worldPosition.x;
        this._tempVec0.y = this._player.worldPosition.y + this._height;
        this._tempVec0.z = this._player.worldPosition.z;

        this._tempNumber0 = Vec3.distance(this._tempVec0, this._mountNode.worldPosition);  //实际的距离
        this._tempNumber1=this._tempNumber0;
        geometry.Ray.fromPoints(this._tempOpenFireRay, this._tempVec0, this._mountNode.worldPosition);


        this._tempVec1 = this._mountNode.worldPosition;
        //检测距离范围内是否有障碍物
        let physicsRayResult: boolean = PhysicsSystem.instance.raycastClosest(this._tempOpenFireRay, EColliderMask.CAMERA, this._tempNumber0);
        if (physicsRayResult && !this._isDeath) {
            let result: PhysicsRayResult = PhysicsSystem.instance.raycastClosestResult;
            if (result.distance <= this._tempNumber0) {
                //有碰撞盒 碰撞点未摄像机点
                this._tempNumber1 = result.distance;
                // this._tempVec1 = result.hitPoint;
                this._tempOpenFireRay.computeHit(this._tempVec1,this._tempNumber1-0.05)
            } 
        } 
        // this._camera.worldPosition = this._tempVec1;
        // this._tempVec0 = this._mountNode.worldPosition;
        // Vec3.lerp(this._tempVec1, this._camera.worldPosition, this._tempVec1, deltaTime * 10);
        this._camera.worldPosition = this._tempVec1;
        // 刷新摄像机的朝向
        this._tempNumber1 = this._offset * (this._tempNumber1 / this._tempNumber0);
        let selfRadians: number = misc.degreesToRadians(this._player.eulerAngles.y + 225);
        this._tempVec2.x = this._player.position.x + this._tempNumber1 * Math.sin(selfRadians);
        this._tempVec2.z = this._player.position.z + this._tempNumber1 * Math.cos(selfRadians);
        this._tempVec2.y = this._player.position.y + this._height;
        this._camera.lookAt(this._tempVec2);

    }
}


