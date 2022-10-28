import { _decorator, Component, Node, Sprite, tween, Vec2, Material, game } from 'cc';
import { BasePanel } from '../../core/ui/base-panel';
const { ccclass, property } = _decorator;

@ccclass('MaskPanel')
export class MaskPanel extends BasePanel {
    @property({ type: Sprite })
    spriteMask: Sprite = null!;

    private _maskMaterial: Material = null!;
    /**
    * 引导完成回调
    */
    //
    private _completeCall: MFunction = null!;
    // 
    private _middleCall: MFunction = null!;
    private _target: MAny = null!;

    private _alpha: number = 0;
    private _offset: number = 0;
    private _isRefresh: boolean = false

    show (time: number, cbMiddle: MFunction, cbComplete: MFunction, target: MAny) {
        super.show();
        if (!this._maskMaterial) this._maskMaterial = this.spriteMask.customMaterial!;
        this._maskMaterial.setProperty("mask", 1);
        this._middleCall = cbMiddle;
        this._completeCall = cbComplete;
        this._target = target;
        this._offset = time / 2 / Number(game.frameRate);
        this._alpha = 1;
        this._isRefresh = true;
    }
    update (): void {
        if (!this._isRefresh) return;
        this._alpha -= this._offset;
        if (this._alpha <= -0.1) {
            this._offset *= -1;
            this._alpha = 0;
            if (this._middleCall) this._middleCall.apply(this._target);
            this._middleCall = null!;
        }
        this._maskMaterial.setProperty("mask", this._alpha);
        if (this._alpha >= 1.0 && this._offset < 0) {
            if (this._completeCall) this._completeCall.apply(this._target);
            this._middleCall = null!;
            this._target = null!;
            this._isRefresh = false;
            this.onBtnHidePanelClick();
        }
    }
}

