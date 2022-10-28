import { _decorator, Component, Node } from 'cc';
import { UISystem } from './ui-system';
const { ccclass, property } = _decorator;
export enum PanelState {
    SHOW = 0,
    HIDE = 1,
}

@ccclass('BasePanel')
export class BasePanel extends Component {
    private _state: number = PanelState.HIDE;
    private _manager: UISystem = null!;
    public get manager () {
        return this._manager;
    }
    public set manager (val) {
        this._manager = val;
    }

    get state () {
        return this._state;
    }

    show (...param: MAny): void {
        this._state = PanelState.SHOW;
        this.node.active = true;
    }
    /**
     * 按钮绑定隐藏界面的事件，仅能在按钮回调中使用。
     */
    public onBtnHidePanelClick () {
        this.manager?.hidePanel(this.node.name, false);
    }
    hide (...param: MAny): void {
        this._state = PanelState.HIDE;
        this.node.active = false;
        // this.unscheduleAllCallbacks();
    }
}


