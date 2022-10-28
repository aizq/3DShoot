import { _decorator, Component, Node, resources, Prefab, instantiate, Label, Color } from 'cc';
import { MV } from '../../core/mvvm/mv-manager';
import { GameUIData } from '../ui-entity';
const { ccclass, property } = _decorator;

@ccclass('GameWeapon')
export class GameWeapon {
    /**VM管理 */
    public MV = MV;
    private _root: Node = null!
    private _node: Node = null!;
    private _allLabel: Label = null!;
    private _equipLabel: Label = null!;
    constructor(root: Node) {
        this._root = root;
        this.init();
    }

    private init(): void {
        resources.load("prefabs/ui/game/game-weapon", Prefab,);

    }

    public show(): void {
        resources.load("prefabs/ui/game/game-weapon", Prefab, (err, prefab) => {
            if (err) {
                console.log(err);
                return;
            }
            this._node = instantiate(prefab);
            this._root.addChild(this._node);
            this.initUI();
        });
    }
    private initUI(): void {
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
