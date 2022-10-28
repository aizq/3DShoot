import { _decorator, Component, Node } from 'cc';
import { GoodsBase } from './goods-base';
import { EGasTankProProperty, EGoodsId } from './goods-constants';
const { ccclass, property } = _decorator;
/**
 * 5.56子弹
 * seven six  two
 */
@ccclass('GoodsBulletFFSMM')
export class GoodsBulletFFSMM extends GoodsBase {
    init (index: number): void {
        this.goodsId = EGoodsId.BULLET_556mm;
        this.num = 30;
        super.init(index);
    }
}

