import { _decorator, Component, Node, Vec3, tween } from 'cc';
import { EffectBase } from './effect-base';
const { ccclass, property } = _decorator;
/**
 * 开火弹道效果
 */
@ccclass('EffectFireBallistic')
export class EffectFireBallistic extends EffectBase {
    public startPos: Vec3 = new Vec3();
    public endPos: Vec3 = new Vec3();

    private _tween: MAny = null!;
    public show(time: number) {
        super.show(time);
        if (this._tween) this._tween.stop();
        this.node.position = this.startPos;
        this._tween = tween(this.node)
            .to(0.1, { position: this.endPos })
            .start();
    }
}

