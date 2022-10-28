import { Label, resources, Prefab, instantiate, Node, Camera, UIOpacity, Animation, Sprite, tween, Color } from "cc";
import EventManager from "../../core/event-manager";
import { MV } from "../../core/mvvm/mv-manager";
import { ResLoad } from "../../core/res-load";
import { GameEvent } from "../../entity/event-entity";
import { ResUI } from "../../entity/res-constant";
import { GameEntity } from "../../game/game-entity";
import { GameUIData } from "../ui-entity";


/**
 * 游戏对战相关ui操作
 * 对战相关操作按键  
 */
export class GameUIBattle {
    private _root: Node = null!
    private _node: Node = null!;
    /**
     * 射击按键
     */
    private _gameUIShoot: GameUIShoot = null!;
    /**
     * 武器展示
     */
    private _gameUIWeapon: GameUIWeapon = null!;
    /**
     * 填弹按钮
     */
    private _gameUIFillBullets: GameUIFillBullets = null!;


    constructor(root: Node) {
        this._root = root;
        ResLoad.instance.preloadPrefab(ResUI.GAME_UI_BATTLE);
    }

    public show(): void {
        ResLoad.instance.loadPrefab(ResUI.GAME_UI_BATTLE, (isSuccess: boolean) => {
            if (!isSuccess) {
                console.warn("加载预制体失败：", ResUI.GAME_UI_BATTLE);
                return;
            }
            this._node = instantiate(ResLoad.instance.getPrefab(ResUI.GAME_UI_BATTLE));
            this._root.addChild(this._node);
            this.init();
        });
    }
    private init(): void {
        this._node.setSiblingIndex(100);
        this._gameUIShoot = new GameUIShoot(this._node);
        this._gameUIFillBullets = new GameUIFillBullets(this._node);
        this._gameUIWeapon = new GameUIWeapon(this._node);
        this.initEvent();
    }

    private initEvent(): void {

    }

    public update(deltaTime: number): void {
        if (this._gameUIShoot) this._gameUIShoot.update(deltaTime);
        if (this._gameUIWeapon) this._gameUIWeapon.update(deltaTime);
        if (this._gameUIFillBullets) this._gameUIFillBullets.update(deltaTime);
    }

    public destroy() {
        this._gameUIShoot.destroy();
        this._gameUIFillBullets.destroy();
        this._gameUIWeapon.destroy();
        this._root.destroy();
        this._root = null!;
    }
}
/**
 * 射击按键与准心
 */
class GameUIShoot {
    /**VM管理 */
    public MV = MV;

    private _root: Node = null!;
    private _nodeRightShoot: Node = null!;
    private _nodeShootAim: Node = null!;
    private _aimPoint: Animation = null!;
    /**
     * 透明度变化
     */
    private _opacity: number = 0;
    private _rightShootUIOpacity: UIOpacity = null!;
    private _isTouch: boolean = false;
    constructor(root: Node) {
        this._root = root;
        this.init();
    }
    private init(): void {
        this.initUI();
        this.initEvent();
    }
    private initUI(): void {
        this._nodeRightShoot = this._root.getChildByName("rightShoot")!;
        this._nodeShootAim = this._root.getChildByName("shootAim")!;
        GameEntity.shootingAimworldPos = this._nodeShootAim.getWorldPosition();

        this._rightShootUIOpacity = this._nodeRightShoot.getComponent(UIOpacity)!;
        this._nodeRightShoot.on(Node.EventType.TOUCH_START, this.nodeStartFireEvent, this);
        this._nodeRightShoot.on(Node.EventType.TOUCH_CANCEL, this.nodeStopFireEvent, this);
        this._nodeRightShoot.on(Node.EventType.TOUCH_END, this.nodeStopFireEvent, this);
    }
    private initEvent(): void {

        this.MV.bindPath("GameUIData.SHOOTING_ANIM_STATE", this.refreshShootingAimState, this);
        this.refreshShootingAimState(GameUIData.SHOOTING_ANIM_STATE);
    }
    /**
    * 射击
    */
    public nodeStartFireEvent() {
        EventManager.emit(GameEvent.SHOOTING_START);
        if (!this._isTouch) {
            this._opacity = 255;
            if (this._rightShootUIOpacity) this._rightShootUIOpacity.opacity = this._opacity;
        }
        this._isTouch = true;

    }
    public nodeStopFireEvent() {
        EventManager.emit(GameEvent.SHOOTING_END);
        this._isTouch = false;
    }
    private refreshShootingAimState(val: number): void {
        if (!this._nodeShootAim) return;
        if (!this._aimPoint) {
            this._aimPoint = this._nodeShootAim.getComponent(Animation)!;
        }
        switch (val) {
            case 0:
                this._aimPoint.node.active = false;
                break;
            case 1:
                this._aimPoint.node.active = true;
                this._aimPoint.play("game-shooting-default");
                break;
            case 2:
                this._aimPoint.node.active = true;
                this._aimPoint.play("game-shooting-shoot");
                break;
            case 3:
                this._aimPoint.node.active = true;
                this._aimPoint.play("game-shooting-hit");
                break;
        }
    }
    public update(dt: number) {
        if (this._isTouch) return;
        if (this._opacity < 80) return;
        this._opacity -= 1;
        if (this._rightShootUIOpacity) this._rightShootUIOpacity.opacity = this._opacity;

    }

    public destroy(): void {
        this._root.off(Node.EventType.TOUCH_START, this.nodeStartFireEvent, this);
        this._root.off(Node.EventType.TOUCH_CANCEL, this.nodeStopFireEvent, this);
        this._root.off(Node.EventType.TOUCH_END, this.nodeStopFireEvent, this);

        this.MV.unbindPath("GameUIData.SHOOTING_ANIM_STATE", this.refreshShootingAimState, this);
        GameUIData.SHOOTING_ANIM_STATE = 0;

        this._root.destroy();
        this._root = null!;
        this._nodeRightShoot = null!;
        this._nodeShootAim = null!;
        this._aimPoint = null!;
    }
}
/**
 * 填弹
 */
class GameUIFillBullets {
    private _root: Node = null!;
    private _nodeFillBullets: Node = null!;

    constructor(root: Node) {
        this._root = root;
        this.init();
    }
    private init(): void {
        this._nodeFillBullets = this._root.getChildByName("fillBullets")!;
        this.initEvent();
    }
    private initEvent(): void {
        this._nodeFillBullets.on(Node.EventType.TOUCH_START, this.startFillBulletsEvent, this);
    }
    private startFillBulletsEvent() {
        EventManager.emit(GameEvent.FILL_BULLETS);

    }
    public update(dt: number) {
    }
    public destroy(): void {
        this._nodeFillBullets.off(Node.EventType.TOUCH_START, this.startFillBulletsEvent, this);
    }
}
class GameUIWeapon {
    /**VM管理 */
    public MV = MV;
    private _root: Node = null!
    private _node: Node = null!;
    private _allLabel: Label = null!;
    private _equipLabel: Label = null!;
    constructor(root: Node) {
        this._root = root;

        this._node = this._root.getChildByName("weapon")!;
        let allNode: Node = this._node.getChildByName("all")!;
        let equipNode: Node = this._node.getChildByName("equip")!;
        this._allLabel = allNode.getComponent(Label)!;
        this._equipLabel = equipNode.getComponent(Label)!;

        this.MV.bindPath("GameUIData.WEAPON_ALL_NUM", this.refreshAllBulletNum, this);
        this.MV.bindPath("GameUIData.WEAPON_MAGAZINE_RESIDUE_SIZE", this.refreshMagazineResidueNum, this);
        this.refreshAllBulletNum(GameUIData.WEAPON_ALL_NUM);
        this.refreshMagazineResidueNum(GameUIData.WEAPON_MAGAZINE_RESIDUE_SIZE);
    }
    /**
     * 刷新所有子弹数量
     */
    private refreshAllBulletNum(val: number): void {
        this._allLabel.string = "/" + val;
        if (val <= 10) {
            this._allLabel.color = new Color(255, 0, 0, 255);
        } else {
            this._allLabel.color = new Color(255, 255, 255, 255);
        }
    }
    /**
     * 刷新弹夹剩余字段数量
     */
    private refreshMagazineResidueNum(val: number): void {
        this._equipLabel.string = "" + val;
        if (val <= 10) {
            this._equipLabel.color = new Color(255, 0, 0, 255);
        } else {
            this._equipLabel.color = new Color(255, 255, 255, 255);
        }
    }


    public update(dt: number) {

    }
    public destroy(): void {
        this.MV.unbindPath("GameUIData.WEAPON_ALL_NUM", this.refreshAllBulletNum, this);
        this.MV.unbindPath("GameUIData.WEAPON_MAGAZINE_RESIDUE_SIZE", this.refreshMagazineResidueNum, this);
        GameUIData.WEAPON_ALL_NUM = 0;
        GameUIData.WEAPON_MAGAZINE_RESIDUE_SIZE = 0;
    }
}

