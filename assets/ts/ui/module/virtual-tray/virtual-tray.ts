import { _decorator, Component, Node, Size, SpriteFrame, UITransform, Sprite, EventTouch, Vec2, Vec3, CCFloat, GraphicsComponent, Graphics, Color, CCInteger, misc } from 'cc';
import { EDITOR } from 'cc/env';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('VirtualTray')
@executeInEditMode
export class VirtualTray extends Component {


    @property
    _enterSize: Size = new Size(60, 60);
    @property({ type: Size, displayOrder: 0, tooltip: "托盘 触发按钮 大小", displayName: "size", })
    get size () {
        return this._enterSize;
    }
    set size (val) {
        this._enterSize = val;
        this.initUI();
    }

    @property
    _enterSpriteFrame = null;
    @property({ type: SpriteFrame, displayOrder: 1, tooltip: "托盘 触发按钮 图片样式", displayName: "sprite-frame" })
    get enterSpriteFrame () {
        return this._enterSpriteFrame;
    }
    set enterSpriteFrame (val) {
        this._enterSpriteFrame = val;
        this.initUI();
    }

    @property
    _panelSize = new Size(400, 400);
    @property({ type: Size, displayOrder: 0, tooltip: "触发后的托盘 大小", displayName: "size", group: { name: 'panel', id: '1', displayOrder: 1 } })
    get panelSize () {
        return this._panelSize;
    }
    set panelSize (val) {
        this._panelSize = val;
        this.initUI();
    }
    @property
    _panelSpriteFrame = null;
    @property({ type: SpriteFrame, displayOrder: 1, tooltip: "触发后的托盘 图片样式", displayName: "sprite-frame", group: { name: 'panel', id: '1', displayOrder: 1 } })
    get panelSpriteFrame () {
        return this._panelSpriteFrame;
    }
    set panelSpriteFrame (val) {
        this._panelSpriteFrame = val;
        this.initUI();
    }



    @property
    _minRadius: number = 20;
    @property({ type: CCFloat, displayOrder: 2, tooltip: "基于 触发按钮最小的距离", })
    get minRadius () {
        return this._minRadius;
    }
    set minRadius (val) {
        this._minRadius = val;
    }
    @property
    _maxRadius: number = 100;
    @property({ type: CCFloat, displayOrder: 3, tooltip: "基于 触发按钮最大的距离", })
    get maxRadius () {
        return this._maxRadius;
    }
    set maxRadius (val) {
        this._maxRadius = val;
    }

    @property
    _num: number = 4;
    @property({ type: CCFloat, displayOrder: 5, tooltip: "整个托盘 分为几等份", })
    get num () {
        return this._num;
    }
    set num (val) {
        this._num = val;
    }


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
    /**
     * 当前选中的是第几份
     */
    private _selectIndex: number = -1;

    /**
     * 绘制节点
     */
    private _nodeGraphics: Node = null!;
    private _graphics: Graphics = null!;
    /**
     * 回调
     */
    // 
    private _openCall: MFunction = null!;
    // 
    private _selectCall: MFunction = null!;
    /**
     * 上锁数组
     */
    private _lockArr: number[] = [];


    private _nodePanel: Node = null!;
    private _nodeCenter: Node = null!;
    private _nodeCenterUI: UITransform = null!;

    private _tempTouchUiPos: Vec2 = new Vec2(0, 0);
    private _tempTouchMPos: Vec3 = new Vec3(0, 0, 0);
    private _tempRadMin: number = 0;
    private _tempRadMax: number = 0;

    private _offset: number = Math.PI / 180 * 9;

    private _goodsIds: number[] = [];
    set goodsIds (val) {
        this._goodsIds = val;
    }
    get goodsIds () {
        return this._goodsIds;
    }

    onLoad () {
        this.initUI();
        this.initEvent();

    }
    private initUI (): void {
        this._nodePanel = this.node.getChildByName("panel")!;
        this._nodeCenter = this.node.getChildByName("center")!;
        this._nodeGraphics = this.node.getChildByName("graphics")!;
        this._graphics = this._nodeGraphics.getComponent(Graphics)!;

        //设置尺寸
        let nodeUI: UITransform = this.node.getComponent(UITransform)!;
        nodeUI.contentSize = this._enterSize;
        let panelUI: UITransform = this._nodePanel.getComponent(UITransform)!;
        panelUI.contentSize = this._panelSize;
        this._nodeCenterUI = this._nodeCenter.getComponent(UITransform)!;
        this._nodeCenterUI.contentSize = this._enterSize;

        // 设置材质
        let spritePanel: Sprite = this._nodePanel.getComponent(Sprite)!;
        spritePanel.spriteFrame = this._panelSpriteFrame;
        let spritePoint: Sprite = this._nodeCenter.getComponent(Sprite)!;
        spritePoint.spriteFrame = this._enterSpriteFrame;


        this._minRadius = this._enterSize.width / 2;
        this._maxRadius = this._panelSize.width / 2;

        if (EDITOR) {
            this._nodePanel.active = true;
        } else {
            this._nodePanel.active = false;
        }
    }
    private initEvent (): void {
        this.node.on(Node.EventType.TOUCH_START, this.touchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.touchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.touchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.touchEnd, this);
    }
    start () {
    }
    private touchStart (event: EventTouch): void {
        if (this._touchId) return;
        this._touchId = event.getID()!;
        this._nodePanel.active = true;
        this._selectIndex = -1;
        if (this._openCall) this._openCall(this._goodsIds);
    }
    private touchMove (event: EventTouch): void {
        if (this._touchId !== event.getID()) return;
        this._tempTouchUiPos = event.getUILocation();
        this._tempTouchMPos.x = this._tempTouchUiPos.x;
        this._tempTouchMPos.y = this._tempTouchUiPos.y;
        this._tempTouchMPos.z = 0;
        this._tempTouchMPos = this._nodeCenterUI.convertToNodeSpaceAR(this._tempTouchMPos);
        this._selectIndex = -1;
        this.updateSlideSelect();
    }
    private updateSlideSelect (): void {
        this._rad = this.getRad(new Vec3(0, 0, 0), this._tempTouchMPos);
        this._angle = this.radToAngle(this._rad);

        this._angle = this._angle < 0 ? 360 + this._angle : this._angle;
        this._distance = Vec3.distance(this._nodeCenter.position, this._tempTouchMPos);
        console.log();
        if (this._distance < this._minRadius) {
            return;
        }

        this._selectIndex = Math.floor(this._angle / (360 / this._num));
        this.graphicsSelectState();

    }
    private graphicsSelectState (): void {
        if (!this._graphics) return;
        this._graphics.clear();
        //绘制线
        this._graphics.lineWidth = 5;
        this._graphics.moveTo(this._minRadius * Math.cos(this._rad), this._minRadius * Math.sin(this._rad));
        this._graphics.lineTo(this._tempTouchMPos.x, this._tempTouchMPos.y);
        this._graphics.stroke();
        //绘制点
        this._graphics.circle(this._tempTouchMPos.x, this._tempTouchMPos.y, 5);

        //绘制扇形
        // - 先画弧形
        this._tempRadMin = this._selectIndex * Math.PI * 2 / this.num;
        this._tempRadMax = (this._selectIndex + 1) * Math.PI * 2 / this.num;
        this._graphics.fillColor = new Color(255, 255, 255, 50);
        for (let i = 0; i < this._lockArr.length; i++) {
            if (this._selectIndex === this._lockArr[i]) {
                this._graphics.fillColor = new Color(255, 0, 0, 50);
                break;
            }
        }
        this._graphics.arc(0, 0, this._maxRadius, this._tempRadMin, this._tempRadMax, true);
        this._graphics.fill();
        //在画三角形
        this._graphics.moveTo(this._maxRadius * Math.cos(this._tempRadMax), this._maxRadius * Math.sin(this._tempRadMax));
        this._graphics.lineTo(this._maxRadius * Math.cos(this._tempRadMin), this._maxRadius * Math.sin(this._tempRadMin));
        for (let rad: number = this._tempRadMin; rad < this._tempRadMax; rad += this._offset) {
            this._graphics.lineTo(this._minRadius * Math.cos(rad), this._minRadius * Math.sin(rad));
        }
        this._graphics.moveTo(this._minRadius * Math.cos(this._tempRadMax), this._minRadius * Math.sin(this._tempRadMax));
        this._graphics.fill();
    }


    private touchEnd (event: EventTouch): void {
        if (this._touchId !== event.getID()) return;
        this._touchId = null!;
        this._nodePanel.active = false;
        this._graphics.clear();
        for (let i = 0; i < this._lockArr.length; i++) {
            if (this._selectIndex === this._lockArr[i]) {
                console.log("锁住了，不可使用");
                return;
            }
        }
        if (this._selectCall) this._selectCall(this._selectIndex);

    }
    // 
    public setSelectEventListener (call: MFunction): void {
        this._selectCall = call;
    }
    // 
    public setOpenEventListener (call: MFunction): void {
        this._openCall = call;
    }
    /**
     * 将某个分块进行上锁  选中显示红色
     * @param index 
     */
    public virtualGoodsTrayKLock (index: number): void {
        for (let i = 0; i < this._lockArr.length; i++) {
            if (index === this._lockArr[i]) return;
        }
        this._lockArr.push(index);
    }
    /**
     * 将某个已上锁分块进行解锁  选中恢复白色
     * @param index 
     */
    public virtualGoodsTrayKUnLock (index: number): void {
        for (let i = 0; i < this._lockArr.length; i++) {
            if (index === this._lockArr[i]) {
                this._lockArr.splice(i, 1);
                i--;
                continue;
            }
        }
    }


    private angleToRad (angle: number) {
        return angle * Math.PI / 180;
    }
    private radToAngle (rad: number) {
        let angle = rad * 180 / Math.PI;
        return angle;
    }
    private getRad (point1: Vec3, point2: Vec3): number {
        //对边比临边
        return Math.atan2((point2.y - point1.y), (point2.x - point1.x));
    }


    update (deltaTime: number) {

    }
}

