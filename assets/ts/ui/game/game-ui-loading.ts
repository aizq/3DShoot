import { _decorator, Component, Node, ProgressBar, Label } from 'cc';
import { MV } from '../../core/mvvm/mv-manager';
import { GameUIData } from '../ui-entity';
const { ccclass, property } = _decorator;

@ccclass('GameUILoading')
export class GameUILoading {
    private _root: Node = null!
    /**VM管理 */
    public MV = MV;


    private _progressBar: ProgressBar = null!;
    private _label: Label = null!;

    private _tipsStr: string = "";
    constructor (root: Node) {
        this._root = root;
        this._root.active = false;
    }

    public show (): void {
        this.init();
    }
    private init (): void {
        this.initUI();
        this.initEvent();
    }
    private initUI (): void {
        this._root.active = true;
        let progressNode: Node = this._root.getChildByName("progressBar")!;
        this._progressBar = progressNode.getComponent(ProgressBar)!;
        let labelNode: Node = this._root.getChildByName("label")!;
        this._label = labelNode.getComponent(Label)!;
        this._progressBar.progress = 0;
        this._label.string = "";
    }
    private initEvent (): void {
        this.MV.bindPath("GameUIData.LOADING_PROGRESS", this.refreshLoadingProgress, this);
        this.refreshLoadingProgress(GameUIData.LOADING_PROGRESS);
        this.MV.bindPath("GameUIData.LOADING_TIPS", this.refreshLoadingTips, this);
        this.refreshLoadingTips(GameUIData.LOADING_TIPS);
    }
    private refreshLoadingProgress (val: number): void {
        this._progressBar.progress = val / 100;
        this._label.string = this._tipsStr + val + "%";
    }
    private refreshLoadingTips (val: string): void {
        this._tipsStr = val;
    }
    public hide (): void {
        this._root.active = false;
    }

    public destroy (): void {
        this.MV.unbindPath("GameUIData.LOADING_PROGRESS", this.refreshLoadingProgress, this);
        this.MV.unbindPath("GameUIData.LOADING_TIPS", this.refreshLoadingTips, this);
        GameUIData.LOADING_PROGRESS = 0;
    }

}

