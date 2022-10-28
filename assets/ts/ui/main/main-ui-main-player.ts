import { _decorator, Component, Node, Vec3, EventTouch, Vec2, tween } from 'cc';
import { MV } from '../../core/mvvm/mv-manager';
import { GameUIData, MainUIData } from '../ui-entity';
const { ccclass, property } = _decorator;

@ccclass('MainUIPlayer')
export class MainUIPlayer extends Component {
    @property({ type: Node })
    playerSprite: Node = null!;
    @property({ type: Node })
    playerRoot: Node = null!;

    /**VM管理 */
    public MV = MV;
    /**
     * 用来处理双指触摸
     */
    private _touchId: number = null!;
    private _playerAngle: number = 0;

    private _playerSpritePos: Vec3 = new Vec3();
    private _tempTouchUiPos: Vec2 = new Vec2(0, 0);
    private _playerEulerAngle: Vec3 = new Vec3(0, 0);
    private _tween: any = null!;

    onLoad() {
        this._playerSpritePos = this.playerSprite.position;

    }
    start() {

    }

    onEnable(): void {
        this.MV.bindPath("MainUIData.MAIN_PLAYER_X", this.refreshPlayerSpriteX, this);
        this.refreshPlayerSpriteX(MainUIData.MAIN_PLAYER_X);

        this.initEvent();
    }
    private initEvent(): void {
        this.node.on(Node.EventType.TOUCH_START, this.touchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.touchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.touchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.touchEnd, this);
    }
    private touchStart(event: EventTouch): void {
        if (this._touchId) return;
        this._touchId = event.getID()!;
        this._tempTouchUiPos = event.getUILocation();
        if (this._tween) this._tween.stop();
    }
    private touchMove(event: EventTouch): void {
        if (this._touchId !== event.getID()) return;
        this._playerAngle += (event.getUILocation().x - this._tempTouchUiPos.x) * 0.5;
        this._tempTouchUiPos = event.getUILocation();
        this._playerEulerAngle.y = this._playerAngle;
        this.playerRoot.eulerAngles = this._playerEulerAngle;
    }


    private touchEnd(event: EventTouch): void {
        if (this._touchId !== event.getID()) return;
        this._touchId = null!;
        this._tween = tween(new Vec2(this._playerAngle, 0))
            .to(0.1 / 90 * Math.abs(this._playerAngle), new Vec2(0, 0), {
                onUpdate: (target: any) => {
                    this._playerAngle = target.x;
                    this._playerEulerAngle.y = this._playerAngle;
                    this.playerRoot.eulerAngles = this._playerEulerAngle;
                }
            })
            .start();

    }
    private refreshPlayerSpriteX(val: number): void {
        this._playerSpritePos.x = val;
        this.playerSprite.position = this._playerSpritePos;
    }
    update(deltaTime: number) {
        this.resetPlayerAngle();
    }
    private resetPlayerAngle(): void {

    }

    remove(): void {
        this.node.off(Node.EventType.TOUCH_START, this.touchStart, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.touchMove, this);
        this.node.off(Node.EventType.TOUCH_END, this.touchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.touchEnd, this);

        this.MV.unbindPath("GameUIData.MAIN_PLAYER_X", this.refreshPlayerSpriteX, this);
        MainUIData.MAIN_PLAYER_X = 0;


    }
}

