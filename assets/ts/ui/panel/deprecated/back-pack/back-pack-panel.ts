import { _decorator, Component, Node, Prefab, instantiate, EventTouch, UITransform, Vec3, Vec2, Layout } from 'cc';
import EventManager from '../../../../core/event-manager';
import { BasePanel } from '../../../../core/ui/base-panel';


import { BackPackGoodsItem } from './back-pack-goods-item';
const { ccclass, property } = _decorator;
/**
 * 背包物品数据结构
 */
export interface BackPackGoodsObj {
    id: number,
    num: number,
    index: number,  //物品索引，只有地面上的物品会使用到这个属性
}

export class BackPackEntity {
    /**
   * 玩家当前背包
   */
    static playerBackpack: BackPackGoodsObj[] = [];
    /**
     * 当前离玩家最近的物品
     */
    static playerNearestGoods: BackPackGoodsObj[] = [];
}
export enum ItemType {
    BACKPACK = 0,
    GROUND = 1,
}



@ccclass('BackPackPanel')
export class BackPackPanel extends BasePanel {
    @property({ type: Prefab })
    goodsItem: Prefab = null!;
    @property({ type: Node })
    backPackGoods: Node = null!;
    @property({ type: Node })
    groundGoods: Node = null!;

    private _backPackGoodsContent: Node = null!;
    private _groundGoodsContent: Node = null!;

    // private _exitCall: MFunction = null!;
    // private _pickUpCall: MFunction = null!;
    // private _disCardCall: MFunction = null!;


    /**
     * 地面物品item显示列表
     */
    private _groundItems: MAny = {};
    /**
     * 背包物品item显示列表
     */
    private _backPackItems: MAny = {};
    /**
     * item 对象池 重复利用
     */
    private _itemPool: Node[] = [];



    onLoad () {
        this._backPackGoodsContent = this.backPackGoods.getChildByPath("view/content")!;
        this._groundGoodsContent = this.groundGoods.getChildByPath("view/content")!;

        this.initEvent();
    }
    start () {

    }

    private initEvent (): void {
        // EventManager.on(GameEvent.REFRESH_BACKPACK, this.refresh, this);
        // EventManager.on(GameEvent.USE_GOODS, this.backPackGoodsUse, this);
    }

    public show (): void {
        // console.log("背包显示", BackPackEntity.playerBackpack, BackPackEntity.playerNearestGoods);
        // super.show();
        // EventManager.emit(GameEvent.SHOW_BACKPACK_UI);
        // this.showGroundGoods();
        // this.showBackPackGoods();

    }
    public refresh (): void {
        this.refreshGroundGoods();
    }
    /**
    * 显示地面物品列表
    * @param groundGoods 
    */
    private showGroundGoods (): void {
        this._groundGoodsContent.destroyAllChildren();
        this._groundItems = {};
        for (let i = 0; i < BackPackEntity.playerNearestGoods.length; i++) {
            let goods: BackPackGoodsObj = BackPackEntity.playerNearestGoods[i];
            this.createGroundGoodsItem(goods);
        }
    }
    private refreshGroundGoods (): void {
        //先删除已有列表中没有的、
        for (let index in this._groundItems) {
            let isExit: boolean = false;
            for (let i = 0; i < BackPackEntity.playerNearestGoods.length; i++) {
                let goods: BackPackGoodsObj = BackPackEntity.playerNearestGoods[i];
                if (Number(index) === goods.index) {
                    isExit = true;
                    break;
                }
            }
            if (!isExit) {
                let comp: BackPackGoodsItem = this._groundItems[index];
                comp.setCallEvent(null!);
                comp.node.removeFromParent();
                this._itemPool.push(comp.node);
                delete this._groundItems[index];
            }
        }
        // 添加新增的 ，列表中没有的
        for (let i = 0; i < BackPackEntity.playerNearestGoods.length; i++) {
            let goods: BackPackGoodsObj = BackPackEntity.playerNearestGoods[i];
            let isExit: boolean = false;
            for (let index in this._groundItems) {
                if (Number(index) === goods.index) {
                    isExit = true;
                    break;
                }
            }
            if (!isExit) {
                this.createGroundGoodsItem(goods);
            }
        }
    }
    /**
     * 显示背包中 装备的物品 
     */
    private showBackPackGoods (): void {
        this._backPackGoodsContent.destroyAllChildren();
        this._backPackItems = {};
        for (let i = 0; i < BackPackEntity.playerBackpack.length; i++) {
            let goods: BackPackGoodsObj = BackPackEntity.playerBackpack[i];
            this.createBackPackGoodsItem(goods);
        }
    }
    /**
     * 
     */
    private refreshBackPackGoodsItems (): void {
        for (let index in this._backPackItems) {
            this._backPackItems[index].refresh();
        }
    }
    private backPackGoodsPickUp (goods: BackPackGoodsObj): void {
        let isExit: boolean = false;
        let _goods: BackPackGoodsObj = null!;
        for (let i = 0; i < BackPackEntity.playerBackpack.length; i++) {
            _goods = BackPackEntity.playerBackpack[i];
            if (_goods.id == goods.id) {
                isExit = true;
                BackPackEntity.playerBackpack[i].num += goods.num;
            }
        }
        if (!isExit) {
            this.createBackPackGoodsItem(goods);
            BackPackEntity.playerBackpack.push(goods);
        }
        this.refreshBackPackGoodsItems();
        // EventManager.emit(GameEvent.PICK_UP_GOODS, [goods.index]);
    }
    private backPackGoodsDiscard (goods: BackPackGoodsObj): void {

    }


    private createGroundGoodsItem (goods: BackPackGoodsObj): void {
        let item: Node = this.getGoodsItem();
        let comp: BackPackGoodsItem = item.getComponent(BackPackGoodsItem)!;
        comp.init(ItemType.GROUND, goods);
        comp.setCallEvent(this.backPackGoodsPickUp.bind(this));
        this._groundGoodsContent.addChild(item);
        this._groundItems[goods.index] = comp;
    }
    private createBackPackGoodsItem (goods: BackPackGoodsObj): void {
        let item: Node = this.getGoodsItem();
        let comp: BackPackGoodsItem = item.getComponent(BackPackGoodsItem)!;
        comp.init(ItemType.BACKPACK, goods);
        comp.setCallEvent(this.backPackGoodsDiscard.bind(this));
        this._backPackGoodsContent.addChild(item);
        this._backPackItems[goods.index] = comp;
    }

    private getGoodsItem (): Node {
        if (this._itemPool.length > 0) {
            return this._itemPool.splice(0, 1)[0];
        } else {
            return instantiate(this.goodsItem);
        }
    }
    /**
     * 使用物品
     */
    private backPackGoodsUse (goodsId: number, num: number): void {
        console.log("使用物品", goodsId, num);
        let goods: BackPackGoodsObj = null!;
        for (let i = 0; i < BackPackEntity.playerBackpack.length; i++) {
            goods = BackPackEntity.playerBackpack[i];
            if (goods.id === goodsId) {
                if (goods.num > num) {
                    BackPackEntity.playerBackpack[i].num -= num;
                    break;
                } else {
                    BackPackEntity.playerBackpack.splice(i, 1);
                    break;
                }
            }
        }
        console.log(BackPackEntity.playerBackpack);

    }
    public hide () {
        // EventManager.emit(GameEvent.HIDE_BACKPACK_UI);
        super.hide();
    }

    public onDestroy () {
        // EventManager.off(GameEvent.REFRESH_BACKPACK, this.refresh, this);
        // EventManager.off(GameEvent.USE_GOODS, this.backPackGoodsUse, this);
    }
}
