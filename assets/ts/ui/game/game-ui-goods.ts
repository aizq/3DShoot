import { _decorator, Component, Node, instantiate, Prefab, resources, Vec3 } from 'cc';
import EventManager from '../../core/event-manager';
import { MV } from '../../core/mvvm/mv-manager';
import { ResLoad } from '../../core/res-load';
import { GameEvent } from '../../entity/event-entity';
import { ResKey, ResUI } from '../../entity/res-constant';
import { GameUIData } from '../ui-entity';
const { ccclass, property } = _decorator;

@ccclass('GameUIGoods')
export class GameUIGoods {
    private _root: Node = null!
    /**VM管理 */
    public MV = MV;

    private _node: Node = null!;
    private _nodePickUp: Node = null!;
    private _state: number = 0;

    private _oneIdentifier: Node = null!;
    private _twoIdentifier: Node = null!;
    private _threeIdentifier: Node = null!;
    private _fourIdentifier: Node = null!;
    private _fiveIdentifier: Node = null!;
    private _sixIdentifier: Node = null!;
    private _tempVec1: Vec3 = new Vec3(0, 0, 0);
    private _tempVec2: Vec3 = new Vec3(0, 0, 0);
    private _tempVec3: Vec3 = new Vec3(0, 0, 0);
    private _tempVec4: Vec3 = new Vec3(0, 0, 0);
    private _tempVec5: Vec3 = new Vec3(0, 0, 0);
    private _tempVec6: Vec3 = new Vec3(0, 0, 0);

    constructor (root: Node) {
        this._root = root;
        ResLoad.instance.preloadPrefab(ResUI.GAME_UI_GOODS);
    }
    public show (): void {
        ResLoad.instance.loadPrefab(ResUI.GAME_UI_GOODS, (isSuccess: boolean) => {
            if (!isSuccess) {
                console.warn("加载预制体失败：", ResUI.GAME_UI_GOODS);
                return;
            }
            this._node = instantiate(ResLoad.instance.getPrefab(ResUI.GAME_UI_GOODS));
            this._root.addChild(this._node);
            this.init();
        });
    }
    private init (): void {
        this._node.setSiblingIndex(200);
        this._nodePickUp = this._node.getChildByName("pickup")!;
        this.initEvent();
    }
    private initEvent (): void {
        this.MV.bindPath("GameUIData.GOODS_NEARLY_ONE_INDEX", this.refreshGoodsOneState, this);
        this.refreshGoodsOneState(GameUIData.GOODS_NEARLY_ONE_INDEX);
        this.MV.bindPath("GameUIData.GOODS_NEARLY_TWO_INDEX", this.refreshGoodsTwoState, this);
        this.refreshGoodsTwoState(GameUIData.GOODS_NEARLY_TWO_INDEX);
        this.MV.bindPath("GameUIData.GOODS_NEARLY_THREEN_INDEX", this.refreshGoodsThreeState, this);
        this.refreshGoodsThreeState(GameUIData.GOODS_NEARLY_THREEN_INDEX);
        this.MV.bindPath("GameUIData.GOODS_NEARLY_FOUR_INDEX", this.refreshGoodsFourState, this);
        this.refreshGoodsFourState(GameUIData.GOODS_NEARLY_FOUR_INDEX);
        this.MV.bindPath("GameUIData.GOODS_NEARLY_FIVE_INDEX", this.refreshGoodsFiveState, this);
        this.refreshGoodsFiveState(GameUIData.GOODS_NEARLY_FIVE_INDEX);
        this.MV.bindPath("GameUIData.GOODS_NEARLY_SIX_INDEX", this.refreshGoodsSixState, this);
        this.refreshGoodsSixState(GameUIData.GOODS_NEARLY_SIX_INDEX);


        this.MV.bindPath("GameUIData.GOODS_NEARLY_PICKUP_INDEX", this.refreshPickUpState, this);
        this.refreshPickUpState(GameUIData.GOODS_NEARLY_PICKUP_INDEX);


        this._nodePickUp.on(Node.EventType.TOUCH_END, this.goodsPickUp, this);
    }
    private refreshGoodsOneState (val: number): void {
        if (!this._oneIdentifier) {
            this._oneIdentifier = instantiate(ResLoad.instance.getPrefab(ResUI.GAME_UI_GOODS_SIGN));
            this._node.addChild(this._oneIdentifier);
            this._oneIdentifier.active = false;
        }
        if (val === -1) {
            this._oneIdentifier.active = false;
        } else {
            this._oneIdentifier.active = true;
            this._tempVec1.x = GameUIData.GOODS_NEARLY_ONE_X;
            this._tempVec1.y = GameUIData.GOODS_NEARLY_ONE_Y;
            this._tempVec1.z = 0;
            this._oneIdentifier.position = this._tempVec1;
        }

    }
    private refreshGoodsTwoState (val: number): void {
        if (!this._twoIdentifier) {
            this._twoIdentifier = instantiate(ResLoad.instance.getPrefab(ResUI.GAME_UI_GOODS_SIGN));
            this._node.addChild(this._twoIdentifier);
            this._twoIdentifier.active = false;
        }
        if (val === -1) {
            this._twoIdentifier.active = false;
        } else {
            this._twoIdentifier.active = true;
            this._tempVec2.x = GameUIData.GOODS_NEARLY_TWO_X;
            this._tempVec2.y = GameUIData.GOODS_NEARLY_TWO_Y;
            this._tempVec2.z = 0;
            this._twoIdentifier.position = this._tempVec2;
        }
    }
    private refreshGoodsThreeState (val: number): void {
        if (!this._threeIdentifier) {
            this._threeIdentifier = instantiate(ResLoad.instance.getPrefab(ResUI.GAME_UI_GOODS_SIGN));
            this._node.addChild(this._threeIdentifier);
            this._threeIdentifier.active = false;
        }
        if (val === -1) {
            this._threeIdentifier.active = false;
        } else {
            this._threeIdentifier.active = true;
            this._tempVec3.x = GameUIData.GOODS_NEARLY_THREEN_X;
            this._tempVec3.y = GameUIData.GOODS_NEARLY_THREEN_Y;
            this._tempVec3.z = 0;
            this._threeIdentifier.position = this._tempVec3;
        }
    }
    private refreshGoodsFourState (val: number): void {
        if (!this._fourIdentifier) {
            this._fourIdentifier = instantiate(ResLoad.instance.getPrefab(ResUI.GAME_UI_GOODS_SIGN));
            this._node.addChild(this._fourIdentifier);
            this._fourIdentifier.active = false;
        }
        if (val === -1) {
            this._fourIdentifier.active = false;
        } else {
            this._fourIdentifier.active = true;
            this._tempVec4.x = GameUIData.GOODS_NEARLY_FOUR_X;
            this._tempVec4.y = GameUIData.GOODS_NEARLY_FOUR_Y;
            this._tempVec4.z = 0;
            this._fourIdentifier.position = this._tempVec4;
        }
    }
    private refreshGoodsFiveState (val: number): void {
        if (!this._fiveIdentifier) {
            this._fiveIdentifier = instantiate(ResLoad.instance.getPrefab(ResUI.GAME_UI_GOODS_SIGN));
            this._node.addChild(this._fiveIdentifier);
            this._fiveIdentifier.active = false;
        }
        if (val === -1) {
            this._fiveIdentifier.active = false;
        } else {
            this._fiveIdentifier.active = true;
            this._tempVec5.x = GameUIData.GOODS_NEARLY_FIVE_X;
            this._tempVec5.y = GameUIData.GOODS_NEARLY_FIVE_Y;
            this._tempVec5.z = 0;
            this._fiveIdentifier.position = this._tempVec5;
        }
    }
    private refreshGoodsSixState (val: number): void {
        if (!this._sixIdentifier) {
            this._sixIdentifier = instantiate(ResLoad.instance.getPrefab(ResUI.GAME_UI_GOODS_SIGN));
            this._node.addChild(this._sixIdentifier);
            this._sixIdentifier.active = false;
        }
        if (val === -1) {
            this._sixIdentifier.active = false;
        } else {
            this._sixIdentifier.active = true;
            this._tempVec6.x = GameUIData.GOODS_NEARLY_SIX_X;
            this._tempVec6.y = GameUIData.GOODS_NEARLY_SIX_Y;
            this._tempVec6.z = 0;
            this._sixIdentifier.position = this._tempVec6;
        }
    }

    private refreshPickUpState (val: number): void {
        this._state = val;
        if (val === -1) {
            this._nodePickUp.active = false;
        } else {
            this._nodePickUp.active = true;
        }
    }
    private goodsPickUp (): void {
        console.log("点击了拾取按钮");
        EventManager.emit(GameEvent.GOODS_PICK_UP, this._state);
        this._nodePickUp.active = false;
    }
    public update (dt: number) { }
    public destroy (): void {
        this._nodePickUp.off(Node.EventType.TOUCH_START, this.goodsPickUp, this);
        this.MV.unbindPath("GameUIData.GOODS_NEARLY_ONE_INDEX", this.refreshGoodsOneState, this);
        this.MV.unbindPath("GameUIData.GOODS_NEARLY_TWO_INDEX", this.refreshGoodsTwoState, this);
        this.MV.unbindPath("GameUIData.GOODS_NEARLY_THREEN_INDEX", this.refreshGoodsThreeState, this);
        this.MV.unbindPath("GameUIData.GOODS_NEARLY_FOUR_INDEX", this.refreshGoodsFourState, this);
        this.MV.unbindPath("GameUIData.GOODS_NEARLY_FIVE_INDEX", this.refreshGoodsFiveState, this);
        this.MV.unbindPath("GameUIData.GOODS_NEARLY_SIX_INDEX", this.refreshGoodsSixState, this);
        this.MV.unbindPath("GameUIData.GOODS_NEARLY_PICKUP_INDEX", this.refreshPickUpState, this);
        GameUIData.GOODS_NEARLY_ONE_INDEX = -1;
        GameUIData.GOODS_NEARLY_TWO_INDEX = -1;
        GameUIData.GOODS_NEARLY_THREEN_INDEX = -1;
        GameUIData.GOODS_NEARLY_FOUR_INDEX = -1;
        GameUIData.GOODS_NEARLY_FIVE_INDEX = -1;
        GameUIData.GOODS_NEARLY_SIX_INDEX = -1;
        GameUIData.GOODS_NEARLY_PICKUP_INDEX = -1;
    }
}

