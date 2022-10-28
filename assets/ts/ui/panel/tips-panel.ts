import { _decorator, Component, Node, Animation, Label } from 'cc';
import AudioManager from '../../core/audio-manager';
import { ResAudio, ResKey } from '../../entity/res-constant';
import { BasePanel } from '../../core/ui/base-panel';
const { ccclass, property } = _decorator;
enum TipsPanelState {
    SHOW = "tips-panel-show",
    HIDE = "tips-panel-hide",
}

@ccclass('TipsPanel')
export class TipsPanel extends BasePanel {
    @property({ type: Label })
    label: Label = null!;
    @property({ type: Animation })
    anim: Animation = null!;

    public show (msg: string, time: number): void {
        super.show();
        AudioManager.instance.playOneShotAudio(ResAudio.AUDIO_TIPS_SHOW);
        this.label.string = msg;
        this.anim.play(TipsPanelState.SHOW);
        if (Number(time) > 0) {  //不是null  不等于0
            this.scheduleOnce(this.customHideSchedule, time)
        }
    }
    private customHideSchedule (): void {
        this.onBtnHidePanelClick();
    }
    /**
     * 按钮绑定隐藏界面的事件，仅能在按钮回调中使用。
     */
    public onBtnHidePanelClick () {
        this.manager?.hidePanel(this.node.name, false);
    }
    public hide (coerciveness: boolean = false): void {
        if (coerciveness) {
            super.hide();
        } else {
            this.anim.play(TipsPanelState.HIDE);
            this.scheduleOnce(() => {
                super.hide();
            }, 0.1)
        }
    }
}


