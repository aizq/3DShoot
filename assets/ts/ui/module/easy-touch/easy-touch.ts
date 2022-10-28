import { _decorator, Component, Node, Size, Sprite, SpriteFrame, CCFloat, UITransform, EventTouch, Vec2, Vec3, EventKeyboard, input, Input, KeyCode } from 'cc';
import { GameEntity } from '../../../game/game-entity';
const { ccclass, property, executeInEditMode } = _decorator;
enum MoveDirection {
    FRONT = 0,
    BACK = 1,
    LEFT = 2,
    RIGHT = 3,
    FRONT_LETF = 4,
    FRONT_RIGHT = 5,
    BACK_LETF = 6,
    BACK_RIGHT = 7,
    DEFAULT = -1,
}
/**
 * 遥感控制器
 */
@ccclass('EasyTouch')
// @executeInEditMode
export class EasyTouch extends Component {
    /**
     * 遥感区域的大小
     */
    @property
    _size: Size = new Size(400, 400);
    @property({ type: Size, displayOrder: 0, tooltip: "虚拟遥感的尺寸范围" })
    get size() {
        return this._size;
    }
    set size(val) {
        this._size = val;
        this.initUI();
    }
    /**
     * 虚拟遥感盘设置属性
     */
    @property
    _panelSize = new Size(400, 400);
    @property({ type: Size, displayOrder: 0, tooltip: "虚拟盘 寸尺", displayName: "size", group: { name: 'panel', id: '1', displayOrder: 1 } })
    get panelSize() {
        return this._panelSize;
    }
    set panelSize(val) {
        this._panelSize = val;
        this.initUI();

    }
    @property
    _panelSpriteFrame = null!;
    @property({ type: SpriteFrame, displayOrder: 1, tooltip: "虚拟盘 图片样式", displayName: "sprite-frame", group: { name: 'panel', id: '1', displayOrder: 1 } })
    get panelSpriteFrame() {
        return this._panelSpriteFrame;
    }
    set panelSpriteFrame(val) {
        this._panelSpriteFrame = val;
        this.initUI();
    }
    /**
     * 虚拟遥感 中心按钮属性
     */
    @property
    _pointSize = new Size(60, 60);
    @property({ type: Size, displayOrder: 0, tooltip: "虚拟按钮 寸尺", displayName: "size", group: { name: 'point', id: '2', displayOrder: 2 } })
    get pointSize() {
        return this._pointSize;
    }
    set pointSize(val) {
        this._pointSize = val;
        this.initUI();
    }
    @property
    _pointSpriteFrame = null!;
    @property({ type: SpriteFrame, displayOrder: 1, tooltip: "虚拟按钮 图片样式", displayName: "sprite-frame", group: { name: 'point', id: '2', displayOrder: 2 } })
    get pointSpriteFrame() {
        return this._pointSpriteFrame;
    }
    set pointSpriteFrame(val) {
        this._pointSpriteFrame = val;
        this.initUI();
    }

    /**
     * 基于中心点的滑动半径
     */
    @property
    _slideRadius: number = 200;
    @property({ type: CCFloat, displayOrder: 3, tooltip: "point距离panel中心的滑动范围，默认为panel 宽度的1/2", })
    get slideRadius() {
        return this._slideRadius;
    }
    set slideRadius(val) {
        this._slideRadius = val;
    }

    private _nodePanel: Node = null!;
    private _nodePoint: Node = null!;
    private _nodeUI: UITransform = null!;

    /**
     * 用来处理双指触摸
     */
    private _touchId: number = null!;
    /**
     * 角度
     */
    private _angle: number = 0;
    private _rad: number = 0;
    /**
     * 距离
     */
    private _distance: number = 0;

    private _overstep: boolean = false;
    // 
    private _slideCall: MFunction = null!;
    // 
    private _slideEndCall: MFunction = null!;
    // 
    private _spaceCall: MFunction = null!;



    private _tempTouchUiPos: Vec2 = new Vec2(0, 0);
    private _tempTouchSPos: Vec3 = new Vec3(0, 0, 0);
    private _tempTouchMPos: Vec3 = new Vec3(0, 0, 0);
    private _tempTouchPos: Vec3 = new Vec3(0, 0, 0);


    onLoad() {
        this.initUI();
        this.initEvent();
    }
    private initUI(): void {
        this._nodePanel = this.node.getChildByName("panel")!;
        this._nodePoint = this.node.getChildByName("point")!;
        //设置尺寸
        this._nodeUI = this.node.getComponent(UITransform)!;
        this._nodeUI.contentSize = this._size;
        let panelUI: UITransform = this._nodePanel.getComponent(UITransform)!;
        panelUI.contentSize = this._panelSize;
        let pointUI: UITransform = this._nodePoint.getComponent(UITransform)!;
        pointUI.contentSize = this._pointSize;

        // 设置材质
        let spritePanel: Sprite = this._nodePanel.getComponent(Sprite)!;
        spritePanel.spriteFrame = this._panelSpriteFrame;
        let spritePoint: Sprite = this._nodePoint.getComponent(Sprite)!;
        spritePoint.spriteFrame = this._pointSpriteFrame;

        this.slideRadius = this._panelSize.width / 2;
    }
    private initEvent(): void {
        // this.initKeyDownEvent();
        this.node.on(Node.EventType.TOUCH_START, this.touchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.touchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.touchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.touchEnd, this);
    }

    private touchStart(event: EventTouch): void {
        if (this._touchId) return;
        this._touchId = event.getID()!;
        this._tempTouchUiPos = event.getUILocation();
        this._tempTouchSPos.x = this._tempTouchUiPos.x;
        this._tempTouchSPos.y = this._tempTouchUiPos.y;
        this._tempTouchSPos.z = 0;
        this._tempTouchSPos = this._nodeUI.convertToNodeSpaceAR(this._tempTouchSPos);
        this._nodePanel.position = this._tempTouchSPos;
        this._nodePoint.position = this._tempTouchSPos;
    }
    private touchMove(event: EventTouch): void {
        if (this._touchId !== event.getID()) return;
        this._tempTouchUiPos = event.getUILocation();
        this._tempTouchMPos.x = this._tempTouchUiPos.x;
        this._tempTouchMPos.y = this._tempTouchUiPos.y;
        this._tempTouchMPos.z = 0;
        this._tempTouchMPos = this._nodeUI.convertToNodeSpaceAR(this._tempTouchMPos);

        this._tempTouchMPos.x -= this._nodePanel.position.x;
        this._tempTouchMPos.y -= this._nodePanel.position.y;

        this.updatePointMove();
    }
    private updatePointMove(): void {
        this._rad = this.getRad(new Vec3(0, 0, 0), this._tempTouchMPos);
        this._angle = this.radToAngle(this._rad);
        this._distance = Vec3.distance(new Vec3(0, 0, 0), this._tempTouchMPos);
        if (this._distance > this._slideRadius) {
            let x = this._slideRadius * Math.cos(this._rad);
            let y = this._slideRadius * Math.sin(this._rad);
            this._tempTouchPos.x = this._nodePanel.position.x + x;
            this._tempTouchPos.y = this._nodePanel.position.y + y;
            this._tempTouchPos.z = 0;
            this._overstep = true;
        } else {
            this._tempTouchPos.x = this._nodePanel.position.x + this._tempTouchMPos.x;
            this._tempTouchPos.y = this._nodePanel.position.y + this._tempTouchMPos.y;
            this._tempTouchPos.z = 0;
            this._overstep = false;
        }
        this._nodePoint.position = this._tempTouchPos;

        this.setSlideDirection(this._angle, this._distance);
    }
    private setSlideDirection(angle: number, dis: number): void {
        angle = angle - 90 >= 0 ? angle - 90 : 360 + (angle - 90);
        let run: boolean = false;
        if (angle <= 60 || angle >= 300) {
            if (dis > 150) {
                run = true;
            }
        }
        if (this._slideCall) this._slideCall(angle, run);

    }
    private touchEnd(event: EventTouch): void {
        if (this._touchId !== event.getID()) return;
        this._touchId = null!;
        this.resetUi();

    }
    private resetUi(): void {
        this._tempTouchMPos.x = 0;
        this._tempTouchMPos.y = 0;
        this._tempTouchMPos.z = 0;
        this._nodePanel.position = this._tempTouchMPos;
        this._nodePoint.position = this._tempTouchMPos;
        if (this._slideEndCall) this._slideEndCall();
    }




    private radToAngle(rad: number) {
        let angle = rad * 180 / Math.PI;
        return angle;
    }
    private angleToRad(angle: number) {
        return angle * Math.PI / 180;
    }
    private getRad(point1: Vec3, point2: Vec3): number {
        //对边比临边
        return Math.atan2((point2.y - point1.y), (point2.x - point1.x));
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
    // 
    public setSpaceEventListener(call: MFunction): void {
        this._spaceCall = call;
    }


    start() {

    }

    update(deltaTime: number) {

    }
    public remove(): void {
        this.node.off(Node.EventType.TOUCH_START, this.touchStart, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.touchMove, this);
        this.node.off(Node.EventType.TOUCH_END, this.touchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.touchEnd, this);
    }
}

