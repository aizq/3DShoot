import { _decorator, Component, Node, Vec3, Material, SkinnedMeshRenderer } from 'cc';

import { GameEntity } from '../game/game-entity';
const { ccclass, property } = _decorator;
enum ScanState {
    OPEN = 0,
    CLOSE = 1,
}

@ccclass('EnemyModle')
export class EnemyModle extends Component {
    @property(Node)
    lod0: Node = null!;
    @property(Node)
    lod1: Node = null!;
    @property(Node)
    lod2: Node = null!;

    private _deathEffectDt: number = 0;
    private _refreshDeathEffect = false;
    private _curLod: number = -1;
    private _curLodNode: Node = null!;
    private _meshRenderer: SkinnedMeshRenderer = null!;
    //
    private _deathVanishCall: MFunction = null!;

    private _scanState: number = ScanState.CLOSE;
    start () {
        this.setLodMode(0);
        this._deathEffectDt = -0.1;
        this._refreshDeathEffect = false;
        this.setMaterialDieProperty();
    }
    update (deltaTime: number) {
        this.refreshDeatEffect(deltaTime);
        this.refreshModleLod();
    }
    private refreshModleLod (): void {
        if (this._refreshDeathEffect) return;
        if (this._scanState === ScanState.OPEN) return;
        let dis: number = Vec3.distance(GameEntity.gameSceneCamera.getWorldPosition(), this.node.getWorldPosition())
        if (dis < 5) {
            this.setLodMode(0);
        } else if (dis < 8) {
            this.setLodMode(1);
        } else {
            this.setLodMode(2);
        }
    }
    private setLodMode (lod: number): void {
        if (lod === this._curLod) return;
        if (this._scanState === ScanState.OPEN) return
        if (this._curLodNode) this._curLodNode.active = false;
        if (lod === 0) {
            this.lod0.active = true;
            this._curLodNode = this.lod0;
            this._curLod = 0;
        } else if (lod === 1) {
            this.lod1.active = true;
            this._curLodNode = this.lod1;
            this._curLod = 1;
        } else if (lod === 2) {
            this.lod2.active = true;
            this._curLodNode = this.lod2;
            this._curLod = 2;
        }
        this._meshRenderer = this._curLodNode.getComponent(SkinnedMeshRenderer)!;
        let materials: (Material | null)[] = this._meshRenderer.materials!;
        for (let i = 0; i < materials.length; i++) {
            let material: Material = materials[i]!;
            // material.setProperty("noiseAlpha", this._deathEffectDt);
            material.passes[0].setUniform(material.passes[0].getHandle("noiseAlpha"), this._deathEffectDt);
            // if (this._scanState === ScanState.OPEN) {
            //     // material.setProperty("perspectivityState", 1.0);
            //     material.passes[0].setUniform(material.passes[0].getHandle("perspectivityState"), 1.0);
            // } else if (this._scanState === ScanState.CLOSE) {
            //     // material.setProperty("perspectivityState", 0.0);
            //     material.passes[0].setUniform(material.passes[0].getHandle("perspectivityState"), 0.0);
            // }
        }
    }
    /**
     * 死亡消失
     */
    //
    public deathVanish (complete: MFunction): void {
        this._deathVanishCall = complete;
        this._deathEffectDt = 0;
        this._refreshDeathEffect = true;
    }


    private refreshDeatEffect (dt: number): void {
        if (!this._refreshDeathEffect) return;
        this._deathEffectDt += dt / 2;
        this.setMaterialDieProperty();
        if (this._deathEffectDt > 1.0) {
            this._refreshDeathEffect = false;
            this._deathEffectDt = -0.1;
            if (this._deathVanishCall) this._deathVanishCall();
        }
    }
    private setMaterialDieProperty (): void {
        // let time = Date.now();
        let materials: (Material | null)[] = this._meshRenderer.materials;
        for (let i = 0; i < materials.length; i++) {
            let material: Material = materials[i]!;
            // material.setProperty("noiseAlpha", this._deathEffectDt);
            material.passes[0].setUniform(material.passes[0].getHandle("noiseAlpha"), this._deathEffectDt);
        }
        // console.log("设置消耗：", Date.now()-time);
    }
    public openScanPerspective (): void {
        // if (this._scanState === ScanState.OPEN) return;
        // this._scanState = ScanState.OPEN;
        // let materials: (Material | null)[] = this._meshRenderer.materials;
        // for (let i = 0; i < materials.length; i++) {
        //     let material: Material = materials[i]!;
        //     // material.setProperty("perspectivityState", 1.0);
        //     material.passes[0].setUniform(material.passes[0].getHandle("perspectivityState"), 1.0);
        // }
    }
    public closeScanPerspective (): void {
        // if (this._scanState === ScanState.CLOSE) return;
        // this._scanState = ScanState.CLOSE;
        // let materials: (Material | null)[] = this._meshRenderer.materials;
        // for (let i = 0; i < materials.length; i++) {
        //     let material: Material = materials[i]!;
        //     // material.setProperty("perspectivityState", 0.0);
        //     material.passes[0].setUniform(material.passes[0].getHandle("perspectivityState"), 0.0);
        // }
    }
}

