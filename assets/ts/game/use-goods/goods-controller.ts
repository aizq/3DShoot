import { _decorator, Node, Vec3, } from "cc";
import MapLevel0Obj, { MapLevel0Data } from "../../config/TMapLevel0";
import PoolManager from "../../core/pool-manager";
import { ResGoods, ResKey } from "../../entity/res-constant";
import { PlayerMgr } from "../../player/player-mgr";
import { GoodsBase } from "./goods-base";
import { EGoodsId } from "./goods-constants";
import { GameEntity } from "../game-entity";

/**
 * 物品管理
 */
export class GoodsController {
    private _node: Node = null!;
    /**
    * 物品集合
    */
    private _goodsMap: Map<number, GoodsBase> = new Map();
    public get goodsMap() {
        return this._goodsMap;
    }
    public set goodsMap(val) {
        this._goodsMap = val;
    }
    private _goodsIndex: number = 0;


    private _tempVec0: Vec3 = new Vec3(0, 0, 0);
    private _tempVec1: Vec3 = new Vec3(0, 0, 0);
    constructor(node: Node) {
        this._node = node;
    }
    public initGoods(): void {
        if (!GameEntity.mapData) return;
        let goodsBase: GoodsBase = null!;
        for (let key in GameEntity.mapData) {
            let data: MapLevel0Obj = GameEntity.mapData[key];
            if (data.type === 1) {
                let pos: Vec3 = new Vec3();
                let position: string[] = data.position.split(",");
                pos.x = Number(position[0]);
                pos.y = Number(position[1]);
                pos.z = Number(position[2]);
                // if (data.kind_id === EGoodsId.GAS_TANK) {
                //     goodsBase = this.addGasTank();
                //     goodsBase.goodsPutDown(pos);
                // } else if (data.kind_id === EGoodsId.BULLET_9mm) {
                //     goodsBase = this.addNineMMBullet();
                //     goodsBase.goodsPutDown(pos);
                // } else if (data.kind_id === EGoodsId.BULLET_762mm) {
                //     goodsBase = this.addSSTMMBullet();
                //     goodsBase.goodsPutDown(pos);
                // }
                goodsBase = this.addFFSBullet();
                goodsBase.goodsPutDown(pos, false);

            }
        }
    }
    /**
     * 创建煤气罐
     */
    public addGasTank(): GoodsBase {
        let node: Node = PoolManager.instance.getNode(ResGoods.GAS_TANK);
        let goodsBase: GoodsBase = node.getComponent(GoodsBase)!;
        this._node.addChild(node);
        goodsBase.init(this._goodsIndex);
        this._goodsMap.set(this._goodsIndex, goodsBase);
        this._goodsIndex++;
        return goodsBase;

    }
    /**
     * 创建9mm子弹
     */
    public addNineMMBullet(): GoodsBase {
        let node: Node = PoolManager.instance.getNode(ResGoods.BULLET_NICE_MM);
        let goodsBase: GoodsBase = node.getComponent(GoodsBase)!;
        this._node.addChild(node);
        goodsBase.init(this._goodsIndex);
        this._goodsMap.set(this._goodsIndex, goodsBase);
        this._goodsIndex++;
        return goodsBase;
    }
    /**
    * 创建7.62子弹
    */
    public addSSTMMBullet(): GoodsBase {
        let node: Node = PoolManager.instance.getNode(ResGoods.BULLET_SST_MM);
        let goodsBase: GoodsBase = node.getComponent(GoodsBase)!;
        this._node.addChild(node);
        goodsBase.init(this._goodsIndex);
        this._goodsMap.set(this._goodsIndex, goodsBase);
        this._goodsIndex++;
        return goodsBase;
    }
    /**
     * 创建5.56子弹
     */
    public addFFSBullet(): GoodsBase {
        let node: Node = PoolManager.instance.getNode(ResGoods.BULLET_FFS_MM);
        let goodsBase: GoodsBase = node.getComponent(GoodsBase)!;
        this._node.addChild(node);
        goodsBase.init(this._goodsIndex);
        this._goodsMap.set(this._goodsIndex, goodsBase);
        this._goodsIndex++;
        return goodsBase;
    }

    // /**
    // * 检测范围性攻击伤害
    // */
    // public checkRangeAttackHarm(pos: Vec3, radius: number, harm: number): void {
    //     // 对可爆炸物品的伤寒
    //     for (let goods of this._goodsMap.values()) {
    //         let dis: number = Vec3.distance(pos, goods.position);
    //         if (dis <= radius) {
    //             goods.beAttack(dis < radius / 2 ? harm : harm / 2);
    //         }
    //     }
    // }
    /**
     * 移除
     */
    public removeGoods(goodsIndex: number): void {
        let goodsComp: GoodsBase = this._goodsMap.get(goodsIndex)!;
        goodsComp.removeGoods();
        this._goodsMap.delete(goodsIndex);
    }

    public goodsPickUp(index: number): GoodsBase {
        if (this._goodsMap.has(index)) {
            let goodsBase: GoodsBase = this._goodsMap.get(index)!;
            this.removeGoods(index);
            return goodsBase;
        }
        return null!;
    }

    public getGoods(key: number): GoodsBase {
        return this._goodsMap.get(key)!;
    }
    /**
     * 敌人死亡
     * 掉落物品
     */
    public goodsDropOut(goodId: number, center: Vec3): void {
       let endPos = new Vec3(center.x + (Math.random() * 0.5 * 2 - 0.5), center.y, center.z + (Math.random() * 0.5 * 2 - 0.5));
        let goodsBase: GoodsBase = this.addFFSBullet();;
        goodsBase.dropOut(center, endPos);
    }
    public cleanAll(): void {
        for (let goodsComp of this._goodsMap.values()) {
            goodsComp.removeGoods();
        }
        this._goodsMap.clear();
        this._goodsIndex = 0;
    }
}