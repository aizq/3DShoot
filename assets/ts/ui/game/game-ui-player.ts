import { _decorator, Component, Node, instantiate, Prefab, resources, Sprite, tween, UIOpacity } from 'cc';
import { MV } from '../../core/mvvm/mv-manager';
import { ResLoad } from '../../core/res-load';
import { ResUI } from '../../entity/res-constant';
import { GameUIData } from '../ui-entity';
const { ccclass, property } = _decorator;

export class GameUIPlayer { 
    private _root: Node = null!
    private _node: Node = null!;

    private _gameUIPlayerLife:GameUIPlayerLife=null!;

    constructor(root: Node) {
        this._root = root;
        ResLoad.instance.preloadPrefab(ResUI.GAME_UI_PLAYER);
    }

    public show(): void {
        ResLoad.instance.loadPrefab(ResUI.GAME_UI_PLAYER, (isSuccess: boolean) => {
            if (!isSuccess) {
                console.warn("加载预制体失败：", ResUI.GAME_UI_PLAYER);
                return;
            }
            this._node = instantiate(ResLoad.instance.getPrefab(ResUI.GAME_UI_PLAYER));
            this._root.addChild(this._node);
            this.init();
        });
    }
    private init(): void {
        this._node.setSiblingIndex(100);
        this._gameUIPlayerLife=new GameUIPlayerLife(this._node);

        this.initEvent();
       
    }

    private initEvent(): void {

    }

    public update(deltaTime: number): void {
        if (this._gameUIPlayerLife) this._gameUIPlayerLife.update(deltaTime);
    }

    public destroy() {
        this._gameUIPlayerLife.destroy();

        this._node.destroy();
        this._node = null!;
    }
}
/**
 * 玩家ui对战 血条
 */
 class GameUIPlayerLife {
    private _root: Node = null!
    /**VM管理 */
    public MV = MV;
    private _node: Node = null!;
    //生命条显示
    private _playerLifeBar: Sprite = null!;
    private _playerLifeUIOpacity: UIOpacity = null!;
    private _playerLifeOpacity: number = 0;
    private _playerLifeTween: any = null;

    constructor(root: Node) {
        this._root = root;
        this._node=this._root.getChildByName("playerLife")!;
        this.showPlayerLifeUI();
        this.initEvent();
    }
    private initEvent(): void {
        this.MV.bindPath("GameUIData.PLAYER_RESIDUE_LIFE", this.refreshPlayerLifeProgress, this);
        this.refreshPlayerLifeProgress(GameUIData.PLAYER_RESIDUE_LIFE);

    }
    private showPlayerLifeUI(): void {
        let playerLifeNode1 = this._node.getChildByName("ic_lifeBar_bar0")!;
        this._playerLifeBar = playerLifeNode1.getComponent(Sprite)!;
        this._playerLifeUIOpacity = this._node.getComponent(UIOpacity)!;
        this.refreshPlayerLifeProgress(GameUIData.PLAYER_RESIDUE_LIFE);
    }

    public update(dt: number) {
        this.refreshLifeUIOpacity();
    }
    private refreshPlayerLifeProgress(val: number): void {

        if (this._playerLifeTween) this._playerLifeTween.stop();
        this._playerLifeTween = tween(this._playerLifeBar)
            .to(0.1, { fillRange: val / GameUIData.PLAYER_LIFE })
            .start();
        this._playerLifeOpacity = 255;
        this._playerLifeUIOpacity.opacity = this._playerLifeOpacity;

    }
    private refreshLifeUIOpacity(): void {
        if (!this._playerLifeUIOpacity) return;
        if (this._playerLifeOpacity < 80) return;
        this._playerLifeOpacity -= 1;
        this._playerLifeUIOpacity.opacity = this._playerLifeOpacity;
    }

    public destroy(): void {
        this.MV.unbindPath("GameUIData.PLAYER_RESIDUE_LIFE", this.refreshPlayerLifeProgress, this);
        GameUIData.PLAYER_RESIDUE_LIFE = 0;
        this._node = null!;
        this._playerLifeBar = null!;
        this._playerLifeUIOpacity = null!;
        this._playerLifeOpacity = 0;
        this._playerLifeTween = null!;
    }
}
/**
 * 玩家被攻击
 */

 class GameUIPlayerBeAttack {
    private _root: Node = null!
    /**VM管理 */
    public MV = MV;

    private _node: Node = null!;
    private _state: number = 0;
   

    private _redMask: Node = null!;
    private _opacity: number = 0;
    private _redMaskOpacity: UIOpacity = null!;

    
    constructor (root: Node) {
        this._root = root;
        this._node=this._root.getChildByName("beAttack")!;
        this._redMask = this._node.getChildByName("redMask")!;
        this._redMaskOpacity = this._redMask.getComponent(UIOpacity)!;
        this.initEvent();
    }
    
    private initEvent (): void {
        this.MV.bindPath("GameUIData.PLAYER_BE_ATTACK", this.refreshPlayerBeAttack, this);
        this.refreshPlayerBeAttack(GameUIData.PLAYER_BE_ATTACK);
    }
    private refreshPlayerBeAttack (val: number): void {
        if (this._state !== 1) return;
        this._opacity = 110;
        if (this._redMaskOpacity) this._redMaskOpacity.opacity = this._opacity;
    }

    public update (dt: number) {
        if (this._opacity < 0) return;
        this._opacity -= 1;
        if (this._redMaskOpacity) this._redMaskOpacity.opacity = this._opacity;
       
    }
    public destroy (): void {
        this.MV.unbindPath("GameUIData.PLAYER_BE_ATTACK", this.refreshPlayerBeAttack, this);
        GameUIData.PLAYER_BE_ATTACK = 0;
    }
}



