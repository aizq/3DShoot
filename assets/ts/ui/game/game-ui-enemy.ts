import { Label, resources, Prefab, instantiate, Node } from "cc";
import { MV } from "../../core/mvvm/mv-manager";
import PoolManager from "../../core/pool-manager";
import { ResLoad } from "../../core/res-load";
import { ResKey, ResUI } from "../../entity/res-constant";
import { GameUIData } from "../ui-entity";
import { GameUIEnemyDeathSign } from "./game-ui-enemy-death-sign";

/**
 * 敌人相关界面管理
 */
export class GameUIEnemy {
    /**VM管理 */
    public MV = MV;
    private _root: Node = null!
    private _node: Node = null!;
    private _nodeEnemyCount: Node = null!;

    private _allNumLabel: Label = null!;
    private _killNumLabel: Label = null!;

    constructor (root: Node) {
        this._root = root;
        ResLoad.instance.preloadPrefab(ResUI.GAME_UI_ENEMY);
    }
    public show (): void {
        ResLoad.instance.loadPrefab(ResUI.GAME_UI_ENEMY, (isSuccess: boolean) => {
            if (!isSuccess) {
                console.warn("加载预制体失败：", ResUI.GAME_UI_ENEMY);
                return;
            }
            this._node = instantiate(ResLoad.instance.getPrefab(ResUI.GAME_UI_ENEMY));
            this._root.addChild(this._node);
            this.init();
        });
    }
    private init (): void {
        this._node.setSiblingIndex(200);
        this.initEnemyCountUI();
        this.initEvent();
    }

    private initEvent (): void {
        this.MV.bindPath("GameUIData.ENEMY_ALL_NUM", this.refreshEnemyAllNum, this);
        this.refreshEnemyAllNum(GameUIData.ENEMY_ALL_NUM);
        this.MV.bindPath("GameUIData.ENEMY_RESIDUE_NUM", this.refreshEnemyResidueNum, this);
        this.refreshEnemyResidueNum(GameUIData.ENEMY_RESIDUE_NUM);

        this.MV.bindPath("GameUIData.ENEMY_DEATH_SIGN", this.refreshEnemyDeathSign, this);
        this.refreshEnemyDeathSign(GameUIData.ENEMY_DEATH_SIGN);
    }
    private initEnemyCountUI (): void {
        this._nodeEnemyCount = this._node.getChildByName("enemyCount")!;
        let allNode: Node = this._nodeEnemyCount.getChildByName("all")!;
        let killNode: Node = this._nodeEnemyCount.getChildByName("kill")!;
        this._allNumLabel = allNode.getComponent(Label)!;
        this._killNumLabel = killNode.getComponent(Label)!;
        this.refreshEnemyAllNum(GameUIData.ENEMY_ALL_NUM);
        this.refreshEnemyResidueNum(GameUIData.ENEMY_RESIDUE_NUM);
    }

    public update (dt: number) {

    }

    private refreshEnemyAllNum (val: number): void {
        if (this._allNumLabel) this._allNumLabel.string = val + "";
    }
    private refreshEnemyResidueNum (val: number): void {
        if (this._killNumLabel) this._killNumLabel.string = (GameUIData.ENEMY_ALL_NUM - val) + "";
    }
    private refreshEnemyDeathSign (val: string): void {
        let strs: string[] = val.split(",");
        if (strs.length === 3) {
            console.log(Number(strs[0]), Number(strs[1]), Number(strs[2]));
            let node: Node = PoolManager.instance.getNode(ResUI.GAME_UI_ENEMY_DEATH_SIGN);
            this._root.addChild(node);
            let comp: GameUIEnemyDeathSign = node.getComponent(GameUIEnemyDeathSign)!;
            comp.init(Number(strs[0]), Number(strs[1]), Number(strs[2]));
        }
    }


    public destroy (): void {
        this.MV.unbindPath("GameUIData.ENEMY_ALL_NUM", this.refreshEnemyAllNum, this);
        this.MV.unbindPath("GameUIData.ENEMY_RESIDUE_NUM", this.refreshEnemyResidueNum, this);
        GameUIData.ENEMY_ALL_NUM = 0;
        GameUIData.ENEMY_RESIDUE_NUM = 0;

        this.MV.bindPath("GameUIData.ENEMY_DEATH_SIGN", this.refreshEnemyDeathSign, this);
        GameUIData.ENEMY_DEATH_SIGN = "";
    }
}
