import { _decorator, Component, Node, resources, Prefab, instantiate, Animation, Color, UIOpacity, tween, Label, Vec2, Vec3 } from 'cc';
import { MV } from '../../core/mvvm/mv-manager';
import { GameUIData } from '../ui-entity';
const { ccclass, property } = _decorator;


/**
 * 玩家被攻击效果
 */
@ccclass('GameUIEnd')
export class GameUIEnd {
    private _root: Node = null!
    /**VM管理 */
    public MV = MV;

    private _node: Node = null!;
    private _state: number = 0;

    private _bgMask: Node = null!;
    private _titleSuccess: Node = null!;
    private _titleFail: Node = null!;
    private _exitTime: Node = null!;
    private _gameDate: Node = null!;



    constructor(root: Node) {
        this._root = root;
        resources.load("prefabs/ui/game/game-ui-end", Prefab,);
    }
    public show(): void {
        resources.load("prefabs/ui/game/game-ui-end", Prefab, (err, prefab) => {
            if (err) {
                console.log(err);
                return;
            }
            this._node = instantiate(prefab);
            this._node.position = new Vec3(0, 0, 0);
            this.init();
        });
    }
    private init(): void {
        this.initUI();
        this.initEvent();
    }
    private initUI(): void {
        this._bgMask = this._node.getChildByName("bgMask")!;
        this._titleSuccess = this._node.getChildByName("titleSuccess")!;
        this._titleFail = this._node.getChildByName("titleFail")!;
        this._exitTime = this._node.getChildByName("exitTime")!;
        this._gameDate = this._node.getChildByName("data")!;
        this._bgMask.active = false;
        this._titleSuccess.active = false;
        this._titleFail.active = false;
        this._exitTime.active = false;
        this._gameDate.active = false;
    }
    private initEvent(): void {
        this.MV.bindPath("GameUIData.PLAYER_EXIT_STATE", this.refreshGameEndUI, this);
        this.refreshGameEndUI(GameUIData.PLAYER_EXIT_STATE);
        this.MV.bindPath("GameUIData.GAME_TIME", this.refreshGameTimeLabel, this);
        this.refreshGameTimeLabel(GameUIData.GAME_TIME);
        this.MV.bindPath("GameUIData.GAME_HIT_RATIO", this.refreshGameHitRatioLabel, this);
        this.refreshGameHitRatioLabel(GameUIData.GAME_HIT_RATIO);
        this.MV.bindPath("GameUIData.GAME_HIT_HEAD_RATIO", this.refreshGameHitHeadRatioLabel, this);
        this.refreshGameHitHeadRatioLabel(GameUIData.GAME_HIT_HEAD_RATIO);
    }

    private refreshGameEndState(val: number): void {
        if (val === 0) {
            this._titleFail.active = true;
        } else if (val === 1) {
            this._titleSuccess.active = true;
        }
    }
    private refreshGameEndUI(val: number): void {
        console.log("刷新死亡状态", val);
        this._state = val;
        switch (this._state) {
            case 7:
                this.showBgMask();
                break;
            case 5:
                this.showGameData();
                break;
            case 4:
                break;
            case 3:
                this.refreshCountDown(3);
                break;
            case 2:
                this.refreshCountDown(2);
                break;
            case 1:
                this.refreshCountDown(1);
                break;
            case 0:
                this.hide();
                break;
        }
    }
    private showBgMask(): void {
        this._root.addChild(this._node);
        this._node.active = true;
        this._bgMask.active = true;
        let uiOpacity: UIOpacity = this._bgMask.getComponent(UIOpacity)!;
        uiOpacity.opacity = 0;
        tween(uiOpacity)
            .to(1.5, { opacity: 190 })
            .start();
    }
    private showGameData(): void {
        this._gameDate.active = true;
        this.refreshGameEndState(GameUIData.Game_PASS_STATE);
        //入场动作
        let anim: Animation = this._gameDate.getComponent(Animation)!;
        anim.play();
    }

    /**
     * 刷新倒计时显示
     * @param time 
     */
    private refreshCountDown(time: number): void {
        this._exitTime.active = true;
        let label: Label = this._exitTime.getComponent(Label)!;
        label.string = "游戏即将退出：" + time + "s";
    }
    private refreshGameTimeLabel(val: number): void {
        let timeNode: Node = this._gameDate.getChildByPath("time/time")!;
        let time: Label = timeNode.getComponent(Label)!;
        time.string = val + "";
    }
    private refreshGameHitRatioLabel(val: number): void {
        let hitNode: Node = this._gameDate.getChildByPath("hit/hit")!;
        let hit: Label = hitNode.getComponent(Label)!;
        hit.string = val + "%";
    }
    private refreshGameHitHeadRatioLabel(val: number): void {
        let hitHeadNode: Node = this._gameDate.getChildByPath("hitHead/hitHead")!;
        let hitHead: Label = hitHeadNode.getComponent(Label)!;
        hitHead.string = val + "%";
    }

    private hide(): void {
        console.log("隐藏");
        this._node.active = false;
    }

    public destroy(): void {
        this.MV.unbindPath("GameUIData.PLAYER_EXIT_STATE", this.refreshGameEndUI, this);
        this.MV.unbindPath("GameUIData.GAME_TIME", this.refreshGameTimeLabel, this);
        this.MV.unbindPath("GameUIData.GAME_HIT_RATIO", this.refreshGameHitRatioLabel, this);
        this.MV.unbindPath("GameUIData.GAME_HIT_HEAD_RATIO", this.refreshGameHitHeadRatioLabel, this);
        GameUIData.PLAYER_EXIT_STATE = 0;
        GameUIData.GAME_TIME = 0;
        GameUIData.GAME_HIT_RATIO = 0;
        GameUIData.GAME_HIT_HEAD_RATIO = 0;
    }
}


