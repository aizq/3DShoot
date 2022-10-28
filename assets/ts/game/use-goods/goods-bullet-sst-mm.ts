import { _decorator, Component, Node } from 'cc';
import { GoodsBase } from './goods-base';
import { EGasTankProProperty, EGoodsId } from './goods-constants';
const { ccclass, property } = _decorator;
/**
 * 7.62 子弹
 * seven six  two
 */
@ccclass('GoodsBulletSSTMM')
export class GoodsBulletSSTMM extends GoodsBase {
    init (index: number): void {
        this.goodsId = EGoodsId.BULLET_762mm;
        this.num = 30;
        super.init(index);
    }
}

