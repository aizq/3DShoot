import { _decorator, Component, Node, Label } from 'cc';
import AudioManager from '../../../core/audio-manager';
import EventManager from '../../../core/event-manager';
import { GlobalEntity } from '../../../entity/global-entity';
import { ResAudio } from '../../../entity/res-constant';
import { BasePanel } from '../../../core/ui/base-panel';
const { ccclass, property } = _decorator;

export enum GuideType {
    PLOT = 0,
    TIPS = 1,
}

@ccclass('GuidePanel')
export class GuidePanel extends BasePanel {
    @property({ type: Node })
    plotNode: Node = null!;
    @property({ type: Node })
    tipsNode: Node = null!;


    private _labelMsg: Label = null!;
    private _nodeNext: Node = null!;
    private _nodeExit: Node = null!;

    private _type: number = 0;
    private _guideConfig: MAny[] = null!;
    /**
     * 引导完成回调
     */
    //
    private _completeCall: MFunction = null!;
    private _target: MAny = null!;

    private _guideIndex: number = 0;
    private _guideMsg: string = "";
    private _guideCharDt: number = 0;
    private _guideCharIndex: number = 0;
    private _isRefreshChar: boolean = false;
    onEnable () {
        console.log("引导显示激活耗时：", Date.now() - GlobalEntity.debugTime);
    }
    // 
    public show (type: number, config: MAny[], complete: MFunction, target: MAny) {
        console.log("引导调用耗时：", Date.now() - GlobalEntity.debugTime);
        super.show();
        this._type = type;
        this._guideConfig = config;
        this._completeCall = complete;
        this._target = target;
        this.initUI();

        // EventManager.on("guide-complete", this._completeCall, this._target);
        this._guideIndex = -1;
        this._guideCharDt = 0;
        this._isRefreshChar = false;
        this.nextGuide();
    }
    private initUI (): void {
        this.plotNode.active = false;
        this.tipsNode.active = false;
        let node: Node = null!;
        if (this._type === GuideType.PLOT) {
            node = this.plotNode;
        } else if (this._type === GuideType.TIPS) {
            node = this.tipsNode;
        }
        node.active = true;
        let nodeMsg: Node = node.getChildByName("msg")!;
        this._labelMsg = nodeMsg.getComponent(Label)!;
        this._nodeNext = node.getChildByName("btnNext")!;
        this._nodeExit = node.getChildByName("btnExit")!;
    }


    /**
     * 显示下一条提示
     */
    public nextGuide (): void {
        AudioManager.instance.playLoopAudio(ResAudio.KEY_INPUT);
        this._guideIndex++;
        this._guideMsg = this._guideConfig[this._guideIndex]["msg"];
        this._guideCharIndex = 0;
        this._isRefreshChar = true;
        this._nodeNext.active = false;
        this._nodeExit.active = false;
        this.refreshGuideChar();
    }
    public exitGuide (): void {
        this.onBtnHidePanelClick();
        if (this._completeCall) this._completeCall.apply(this._target);
    }
    update (deltaTime: number) {
        if (!this._isRefreshChar) return;
        this._guideCharDt += deltaTime;
        if (this._guideCharDt >= 0.1) {
            this._guideCharDt = 0;
            this._guideCharIndex++
            this.refreshGuideChar();
        }
    }
    private refreshGuideChar (): void {
        if (this._guideCharIndex >= this._guideMsg.length) {
            this.refreshGuideCharComplete();
        } else {
            this._labelMsg.string = this._guideMsg.substring(0, this._guideCharIndex);
        }
    }
    /**
     * 当前字符串显示完毕
     */
    private refreshGuideCharComplete (): void {
        AudioManager.instance.stopLoopAudio();
        this._isRefreshChar = false;
        if (this._guideIndex + 1 >= this._guideConfig.length) {
            this._nodeExit.active = true;
        } else {
            this._nodeNext.active = true;
        }
    }
}

