
import { _decorator, Component, Node, Vec3, EventTouch, UITransform, sp, Label, Sprite, tween, ProgressBar, } from 'cc';
import EventManager from '../../core/event-manager';

import { GameEntity } from '../../game/game-entity';
import { GameUIData, PanelName } from '../ui-entity';
import { UISystem } from '../../core/ui/ui-system';
import { GameEvent } from '../../entity/event-entity';

import { MV } from '../../core/mvvm/mv-manager';
import { GameUIGoods } from './game-ui-goods';

import { GameUILoading } from './game-ui-loading';
import { GameUIEnemy } from './game-ui-enemy';
import { GameUIOperate } from './game-ui-operate';
import { GameUIBattle } from './game-ui-battle';
import { GameUIPlayer } from './game-ui-player';
import { GameUIEnd } from './game-ui-end';



const { ccclass, property, type } = _decorator;
/**
 * game ui显示类
 */
@ccclass('GameUI')
export class GameUI extends Component {
    @type(Node)
    gameRoot: Node = null!;
    @type(Node)
    dialogRoot: Node = null!;
    @type(Node)
    loadingRoot: Node = null!;


    /**VM管理 */
    public MV = MV;
    /**
     * 加载组件
     */
    private _gameUILoading: GameUILoading = null!;
    /**
     * 玩家控制界面管理
     */
    private _gameUIOperate: GameUIOperate = null!;
    /**
     * 对战相关界面管理
     */
    private _gameUIBattle: GameUIBattle = null!;
    /**
     * 敌人相关展示界面管理
     */
    private _gameUIEnemy: GameUIEnemy = null!;
    /**
     * 物品标记展示
     */
    private _gameUIGoods: GameUIGoods = null!;
    /**
     * 玩家相关
     */
    private _gameUIPlayer: GameUIPlayer = null!;

    /**
     * 死亡界面
     */
    private _gameUIEnd: GameUIEnd = null!;


    //节点触摸id
    private _nodeTouchID: number = null!;
    //每次触摸屏幕的坐标位置
    private _nodeTouchStartP: Vec3 = null!;
    onLoad () {
        this.init();
    }
    start () {

    }
    /**
     * 初始化
     * @param pos 
     */
    public init (): void {
        this._gameUILoading = new GameUILoading(this.loadingRoot);
        this._gameUIOperate = new GameUIOperate(this.gameRoot);
        this._gameUIBattle = new GameUIBattle(this.gameRoot);
        this._gameUIPlayer = new GameUIPlayer(this.gameRoot);
        this._gameUIEnemy = new GameUIEnemy(this.gameRoot);
        this._gameUIGoods = new GameUIGoods(this.gameRoot);
        this._gameUIEnd = new GameUIEnd(this.gameRoot);
        this.initEvent();
    }

    public initEvent () {
        this.node.on(Node.EventType.TOUCH_START, this.nodeTouchStartEventListener, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.nodeTouchMoveEventListener, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.nodeTouchEndEventListener, this);
        this.node.on(Node.EventType.TOUCH_END, this.nodeTouchEndEventListener, this);
        this.MV.bindPath("GameUIData.GAME_STATE", this.refreshGameState, this,);
        this.refreshGameState(GameUIData.GAME_STATE);

    }
    private refreshGameState (val: number): void {
        if (val === 0) {
            this._gameUILoading.show();
        } else if (val === 1) {
            this.startGame();
        } else if (val === 3) {
            this.gameEnd();
        }
    }

    private startGame (): void {
        this._gameUILoading.hide();
        this._gameUIOperate.show();
        this._gameUIBattle.show();
        this._gameUIPlayer.show();
        this._gameUIEnemy.show();
        this._gameUIGoods.show();
        this._gameUIEnd.show();

    }

    //操作界面的触摸事件
    private nodeTouchStartEventListener (event: EventTouch) {
        if (this._nodeTouchID !== null) return;
        this._nodeTouchID = event.getID()!;
        let worldP = event.getUILocation();
        this._nodeTouchStartP = this.touchToUINodePos(new Vec3(worldP.x, worldP.y, 0), this.node);
    }
    private nodeTouchMoveEventListener (event: EventTouch) {
        if (this._nodeTouchID !== event.getID()) return;
        //获取当前触摸点 和上一个触摸点进行比较  
        let worldP = event.getUILocation();
        let nodeP: Vec3 = this.touchToUINodePos(new Vec3(worldP.x, worldP.y, 0), this.node);
        let offsetX = nodeP.x - this._nodeTouchStartP.x;
        let offsetY = nodeP.y - this._nodeTouchStartP.y;
        EventManager.emit(GameEvent.PLAYER_START_ROTATE, offsetX, offsetY);
        this._nodeTouchStartP = nodeP;

    }
    private nodeTouchEndEventListener (event: EventTouch) {
        if (!GameEntity.isStart) return;
        if (this._nodeTouchID !== event.getID()) return;
        this._nodeTouchID = null!;
        EventManager.emit(GameEvent.PLAYER_END_ROTATE);
    }
    /**
    * 将触摸点坐标转化到ui 节点下
    */
    private touchToUINodePos (pos: Vec3, node: Node): Vec3 {
        let uITransform: UITransform = node.getComponent(UITransform)!;
        let p: Vec3 = uITransform.convertToNodeSpaceAR(pos)!;
        return p;
    }




    update (dt: number) {
        this._gameUIOperate.update(dt);
        this._gameUIBattle.update(dt);
        this._gameUIEnemy.update(dt);
        this._gameUIGoods.update(dt);
        this._gameUIPlayer.update(dt);
    }

    public showTips (msg: string, time: number = 0.4): void {
        UISystem.instance.showPanel(PanelName.TIPS, this.node, [msg, time]);
    }
    public gameEnd (): void {
        UISystem.instance.hideAll();
        this.node.off(Node.EventType.TOUCH_START, this.nodeTouchStartEventListener, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.nodeTouchMoveEventListener, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.nodeTouchEndEventListener, this);
        this.node.off(Node.EventType.TOUCH_END, this.nodeTouchEndEventListener, this);

        this._gameUILoading.destroy();
        this._gameUIOperate.destroy();
        this._gameUIBattle.destroy();
        this._gameUIEnemy.destroy();
        this._gameUIGoods.destroy();
        this._gameUIPlayer.destroy();
        this._gameUIEnd.destroy();

        this.MV.unbindPath("GameUIData.GAME_STATE", this.refreshGameState, this);


        this.node.destroy();
    }

    onDestroy () {
        console.log("2d ui销毁");
    }

}