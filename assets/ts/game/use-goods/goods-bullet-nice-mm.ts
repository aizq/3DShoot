import { _decorator, Component, Node } from 'cc';
import { GoodsBase } from './goods-base';
import { EGasTankProProperty, EGoodsId } from './goods-constants';
const { ccclass, property } = _decorator;
/**
 * 9mm 子弹
 */
@ccclass('GoodsBulletNiceMM')
export class GoodsBulletNiceMM extends GoodsBase {
    init(index: number): void {
        this.goodsId = EGoodsId.BULLET_9mm;
        this.num =30;
        super.init(index);
    }
}

