import { _decorator } from "cc";
import EventManager from "../../core/event-manager";
import { GoodsBase } from "./goods-base";
import { EGasTankProProperty } from "./goods-constants";
const { ccclass, property, type } = _decorator;
/**
 * 煤气罐
 */

@ccclass('GoodsGasTank')
export class GoodsGasTank extends GoodsBase {

    /**
     * 生命值
     */
    private _life: number = 0;
    /**
     * 伤害
     */
    private _harm: number = 0;
    /**
     * 爆炸范围 半径
     */
    private _blastAngle: number = 0;


    init (index: number = 0): void {
        this.goodsId = EGasTankProProperty.ID;
        this._harm = EGasTankProProperty.HARM;
        this._life = EGasTankProProperty.LIFE;
        this.num = 1;
        this._blastAngle = EGasTankProProperty.BLAST_ANGLE;
        super.init(index);
    }

    public beAttack (harm: number = 1): void {
        if (this._life <= 0) return;
        this._life -= harm;
        if (this._life <= 0) {
            this.scheduleOnce(() => {
                //移除
                // EventManager.emit(GameEvent.EXPLOSIVE_EXPLOSIONS, [this.goodsId, this.goodsIndex, this._harm, this._blastAngle, this.position.x, this.position.y, this.position.z]);
            }, 0.2);
        }
    }

    public goodsThrow (): void {

    }
    public goodsLift (): void {

    }
}