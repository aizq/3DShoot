import { error, EventKeyboard, EventMouse, input, Input, KeyCode, _decorator } from 'cc';
const { ccclass } = _decorator;

/**
 * 键盘输入事件管理
 */
export class KeyInputManager {
    private _vertical: number = 0;
    private _horizontal: number = 0;
    private _isShift: boolean = false;


    // 
    private _slideCall: MFunction = null!;
    // 
    private _slideEndCall: MFunction = null!;
    
    private _spaceCall:MFunction=null!;

    constructor() {
        this.initEvent();
    }
    private initEvent(): void {
        input.on(Input.EventType.KEY_DOWN, this.inputMouseDown, this);
        input.on(Input.EventType.KEY_UP, this.inpotMouseUp, this);
    }
    private inputMouseDown(event: EventKeyboard): void {
        console.log("按下====");
        switch (event.keyCode) {
            case KeyCode.KEY_W:
                this._vertical = 1 << 0;
                break;
            case KeyCode.KEY_S:
                this._vertical = 1 << 1;
                break;
            case KeyCode.KEY_A:
                this._horizontal = 1 << 2;
                break;
            case KeyCode.KEY_D:
                this._horizontal = 1 << 3;
                break;
            case KeyCode.SHIFT_LEFT:
                this._isShift = true;
                break;
            case KeyCode.SPACE:
                if(this._spaceCall) this._spaceCall();
                break;
            default:
                break;
        }
        this.refreshDriectionState();
    }
    private inpotMouseUp(event: EventKeyboard): void {
        console.log("抬起====");
        switch (event.keyCode) {
            case KeyCode.KEY_W:
                this._vertical = 0;
                break;
            case KeyCode.KEY_S:
                this._vertical = 0;
                break;
            case KeyCode.KEY_A:
                this._horizontal = 0;
                break;
            case KeyCode.KEY_D:
                this._horizontal = 0;
                break;
            case KeyCode.SHIFT_LEFT:
                this._isShift = false;
                break;

            default:
                break;
        }
        this.refreshDriectionState();
    }
    private refreshDriectionState(): void {
        let angle: number = 0;

        angle = this._vertical + this._horizontal;
        if (angle === 0) {
            if (this._slideCall) this._slideEndCall();
            return;
        }
        switch (angle) {
            case 1 << 0:
                angle = 0;
                break;
            case 1 << 1:
                angle = 180;
                break;
            case 1 << 2:
                angle = 90;
                break;
            case 1 << 3:
                angle = 270;
                break;
            case (1 << 0) + (1 << 2):
                angle = 45;
                break;
            case (1 << 0) + (1 << 3):
                angle = 315;
                break;
            case (1 << 1) + (1 << 2):
                angle = 135;
                break;
            case (1 << 1) + (1 << 3):
                angle = 225;
                break;
        }
        let run: boolean = false;
        if (angle <= 60 || angle >= 300) {
            if (this._isShift) {
                run = true;
            }
        }
        if (this._slideCall) this._slideCall(angle, run);
    }
    /**
     * 鼠标右键按下
     */
    private mouseRightDown(): void {

    }
    /**
     * 鼠标右键
     */
    private mouseRightUp(): void {

    }

    /**
    * 设置虚拟按键滑动
    * @param call   返回参数 angle distance,和_overstep
    */
    // 
    public setSlideEventListener(call: MFunction): void {
        this._slideCall = call;
    }
    // 
    public setSlideEndEventListener(call: MFunction): void {
        this._slideEndCall = call;
    }
    public setSpaceEventListener(call: Function): void {
        this._spaceCall = call;
    }

    public destroy(): void {
        this._slideCall = null!;
        this._slideEndCall = null!;
        this._spaceCall=null!;
        input.off(Input.EventType.KEY_DOWN, this.inputMouseDown, this);
        input.off(Input.EventType.KEY_UP, this.inpotMouseUp, this);
    }
}