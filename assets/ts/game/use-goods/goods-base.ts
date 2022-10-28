import { Component, geometry, instantiate, Vec3, _decorator, Node } from "cc";
import PoolManager from "../../core/pool-manager";
import { ResLoad } from "../../core/res-load";
import { SplineMrg } from "../../core/utils/spline/spline-mrg";
import { GlobalEntity } from "../../entity/global-entity";
import { GameEntity } from "../game-entity";
const { ccclass, property, type } = _decorator;
/**
 * 物品基础类
 */

@ccclass('GoodsBase')
export class GoodsBase extends Component {
    /**
     * 物品id
     */
    private _goodsId: number = 0;
    public set goodsId (val: number) {
        this._goodsId = val;
    }
    public get goodsId () {
        return this._goodsId;
    }
    /**
     * 物品索引
     * 局内唯一标识
     */
    private _goodsIndex: number = 0;
    public set goodsIndex (val: number) {
        this._goodsIndex = val;
    }
    public get goodsIndex () {
        return this._goodsIndex;
    }
    private _num: number = 0;
    public get num () {
        return this._num;
    }
    public set num (val) {
        this._num = val;
    }

    private _distance: number = 0;
    public set distance(val: number) { 
        this._distance=val;
    }
    public get distance() { 
        return this._distance;
    }

   
    /**
     * 当前物品的坐标
     */
    private _position: Vec3 = null!;
    public get position (): Vec3 {
        return this._position;
    }
    public set position (val: Vec3) {
        this._position = val;
        this.setGoodsPosition();
    }
    /**
     * 是否是掉落过程
     */
    private _isDropOut: boolean = false;
    //掉落曲线点
    private _dropOutPoints: Vec3[] = [];
    private _dropOutIndex: number = 0;
    private _dropOutSpeed: number = 1;
    private _dropOutScale: number = 1;
    private _dropOutNextPos: Vec3 = null!;
    private _tempRay: geometry.Ray = new geometry.Ray();
    private _tempFlagVec: Vec3 = new Vec3(0, 0, 0);

    /**
     * 初始化
     * @param index  物品索引
     */
    public init (index: number): void {
        this._goodsIndex = index;
    }
    private setGoodsPosition (): void {
        this._position = GameEntity.navMeshMrg.getClosestPoint(this._position);
        this.node.position = this._position;
    }

    /**
     *  物品可能存在的操作接口
     */

    /**
     * 从地面捡起
     */
    public goodsPickUp (): void {
        //移除节点 
        this.removeGoods();
    }
    /**
     * 放回到地面
     * @param wPos  世界坐标系下的坐标
     * @param redress 是否纠正坐标
     */
    public goodsPutDown(pos: Vec3, redress: boolean = true): void {
        if (redress) {
            this.position = pos;
        } else { 
            this._position = pos;
            this.node.position = this._position;
        }
        this.node.scale = new Vec3(1, 1, 1);
    }
    /**
    * 扔掉--对应动作
    */
    public goodsThrow (): void { }
    /**
     * 举起--对应动作
     */
    public goodsLift (): void { }
    /**
     * 物品被攻击（只有部分物品可被攻击）
     */
    public beAttack (harm: number): void { }
    /**
     * 掉落-目前是只有从丧尸死亡时才会掉落
     */
    public dropOut (start: Vec3, end: Vec3): void {
        this._position = start;
        this.node.position = start;
        this.node.scale = new Vec3(0, 0, 0);
        end = GameEntity.navMeshMrg.getClosestPoint(end);
        let offsetY: number = Math.floor(Math.random() * 3) + 7;
        let middle: Vec3 = new Vec3((end.x + start.x) / 2, (end.y + start.y) / 2 + offsetY / 10, (end.z + start.z) / 2);
        this._dropOutPoints = SplineMrg.catmullRomCurve([start, middle, end], 20);
        this._dropOutIndex = 1;
        this._dropOutSpeed = 3;
        this._dropOutScale = 0;
        this._dropOutNextPos = this._dropOutPoints[this._dropOutIndex];
        this._isDropOut = true;
    }
    /**
     * 移除物品
     */
    public removeGoods (): void {
        this.node.removeFromParent();
        PoolManager.instance.putNode(this.node);
    }

    update (deltaTime: number) {
        this.refreshDropOutPos(deltaTime);
    }
    private refreshDropOutPos (dt: number): void {
        if (!this._isDropOut) return;
        let dis: number = Vec3.distance(this.node.position, this._dropOutNextPos);
        if (dis < this._dropOutSpeed * dt) {
            this.node.position = this._dropOutNextPos;
            this._dropOutIndex++;
            if (this._dropOutIndex >= this._dropOutPoints.length) {
                this._isDropOut = false;
            } else {
                this._dropOutNextPos = this._dropOutPoints[this._dropOutIndex];
            }
        } else {
            geometry.Ray.fromPoints(this._tempRay, this.node.position, this._dropOutNextPos);
            this._tempRay.computeHit(this._tempFlagVec, this._dropOutSpeed * dt);
            this.node.position = this._tempFlagVec;
            this._dropOutScale += dt * 7;
            if (this._dropOutScale > 1.0) this._dropOutScale = 1.0;
            this.node.scale = new Vec3(this._dropOutScale, this._dropOutScale, this._dropOutScale);
            this._position = this._tempFlagVec;
        }
    }


}