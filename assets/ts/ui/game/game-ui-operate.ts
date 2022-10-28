import { UIOpacity, resources, Prefab, instantiate, Vec3, Node, EventTouch, UITransform } from "cc";
import EventManager from "../../core/event-manager";
import { KeyInputManager } from "../../core/key-input-manager";
import { ResLoad } from "../../core/res-load";
import { GameEvent } from "../../entity/event-entity";
import { ResUI } from "../../entity/res-constant";
import { GameEntity } from "../../game/game-entity";
import { EasyTouch } from "../module/easy-touch/easy-touch";

/**
 * 游戏中玩家的操作
 * 以玩家的移动为主  跳跃等
 */
export class GameUIOperate {
    private _root: Node = null!
    private _node: Node = null!;
    /**
     * 虚拟摇杆控制
     */
    private _gameEasyTouch: GameEasyTouch = null!;
    private _nodeJump: Node = null!;


    constructor (root: Node) {
        this._root = root;
        this._gameEasyTouch = new GameEasyTouch();
        ResLoad.instance.preloadPrefab(ResUI.GAME_UI_OPERATE);

    }

    public show (): void {
        ResLoad.instance.loadPrefab(ResUI.GAME_UI_OPERATE, (isSuccess: boolean) => {
            if (!isSuccess) {
                console.warn("加载预制体失败：", ResUI.GAME_UI_OPERATE);
                return;
            }
            this._node = instantiate(ResLoad.instance.getPrefab(ResUI.GAME_UI_OPERATE));
            this._root.addChild(this._node);
            this.init();
        });
    }

    private init (): void {
        this._node.setSiblingIndex(0);
        this.initOperateUI();
        this.initEvent();
    }

    private initOperateUI (): void {
        this._gameEasyTouch.show(this._node);
        this._nodeJump = this._node.getChildByName("btnJump")!;
    }
    private initEvent (): void {
        this._nodeJump.on(Node.EventType.TOUCH_START, this.nodeJumpTouchListener, this);
    }

    private nodeJumpTouchListener (): void {
        EventManager.emit(GameEvent.PLAYER_JUMP);
    }

    public update (deltaTime: number): void {
        this._gameEasyTouch.update(deltaTime);
    }

    public destroy () {



        this._gameEasyTouch.destroy();
    }
}


/**
 * 虚拟摇杆控制鱼洞
 */
class GameEasyTouch {
    private _root: Node = null!
    /**
     * 按键监听管理
     */
    private _keyInputMgr: KeyInputManager = null!;

    //虚拟遥感
    private _node: Node = null!;
    private _easyTouch: EasyTouch = null!;

    /**
     * 透明度变化
     */
    private _opacity: number = 0;
    private _uiOpacity: UIOpacity = null!;
    private _isTouch: boolean = false;
    constructor () {
        this._keyInputMgr = new KeyInputManager();
        ResLoad.instance.preloadPrefab(ResUI.GAME_EASY_TOUCH);
    }
    public show (node: Node): void {
        this._root = node;
        ResLoad.instance.loadPrefab(ResUI.GAME_EASY_TOUCH, (isSuccess: boolean) => {
            if (!isSuccess) {
                console.warn("加载预制体失败：", ResUI.GAME_EASY_TOUCH);
                return;
            }
            this._node = instantiate(ResLoad.instance.getPrefab(ResUI.GAME_EASY_TOUCH));
            this._root.addChild(this._node);
            this.initEasyTouchUI();
        });
    }
    private initEasyTouchUI (): void {
        //虚拟遥感
        this._uiOpacity = this._node.getComponent(UIOpacity)!;
        this._easyTouch = this._node.getComponent(EasyTouch)!;
        this.initEvent();
    }

    private initEvent (): void {
        //虚拟摇杆
        this._easyTouch.setSlideEventListener(this.easyTouchSlide.bind(this));
        this._easyTouch.setSlideEndEventListener(this.easyTouchSlideEnd.bind(this));
        //按键
        this._keyInputMgr.setSlideEventListener(this.easyTouchSlide.bind(this));
        this._keyInputMgr.setSlideEndEventListener(this.easyTouchSlideEnd.bind(this));
        this._keyInputMgr.setSpaceEventListener(this.nodeJumpTouchListener.bind(this));
    }


    public update (dt: number) {
        if (this._isTouch) return;
        if (this._opacity < 90) return;
        this._opacity -= 1;
        if (this._uiOpacity) this._uiOpacity.opacity = this._opacity;

    }
    /**
     * 遥感
     */
    private easyTouchSlide (angle: number, isRun: boolean = false): void {
        EventManager.emit(GameEvent.PLAYER_START_MOVE, angle, isRun);
        if (!this._isTouch) {
            this._opacity = 250;
            if (this._uiOpacity) this._uiOpacity.opacity = this._opacity;
        }
        this._isTouch = true;
    }
    private easyTouchSlideEnd (): void {
        EventManager.emit(GameEvent.PLAYER_END_MOVE);
        this._isTouch = false;
    }
    private nodeJumpTouchListener (): void {
        EventManager.emit(GameEvent.PLAYER_JUMP);
    }


    public destroy (): void {
        this._easyTouch.remove();
        this._keyInputMgr.destroy();
    }
}
