import { _decorator, Component, Node, MeshRenderer, Mesh, Vec2, Vec3, utils, find, director, instantiate } from 'cc';
import { EDITOR } from 'cc/env';
import { GameEntity } from '../../game/game-entity';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('CCMeshRenderer')
@executeInEditMode
export class CCMeshRenderer extends MeshRenderer {
    /**
     * 扩展lod mesh
     */
    @property({ type: Mesh, tooltip: "lod 配置 根据摄像机的距离(5,8,other)" })
    lodMeshs: Mesh[] = [];
    private _lodIndex: number = -1;

    public setLodMeshs(val: Mesh[]): void {
        this.lodMeshs = val;
    }

    /**
     * 模型包围盒四个顶点坐标
     */
    private _box: Vec3[] = [];
    // nodes: Node[] = [];

    private _cameraWorldPosition: Vec3 = new Vec3();
    public set cameraWorldPosition(val: Vec3) {
        this._cameraWorldPosition = val;
        this.refreshLod();
    }
    onLoad() {
        super.onLoad();
        let mesh: MeshRenderer = this.node.getComponent(MeshRenderer)!;
        let minPos: Vec3 = mesh.mesh!.struct.minPosition!.clone();
        let maxPos: Vec3 = mesh.mesh!.struct.maxPosition!.clone();
        Vec3.transformMat4(minPos, minPos, this.node.worldMatrix);
        Vec3.transformMat4(maxPos, maxPos, this.node.worldMatrix);

        this._box.push(new Vec3(minPos.x, (minPos.y + maxPos.y) / 2, minPos.z));
        this._box.push(new Vec3(maxPos.x, (minPos.y + maxPos.y) / 2, minPos.z));
        this._box.push(new Vec3(minPos.x, (minPos.y + maxPos.y) / 2, maxPos.z));
        this._box.push(new Vec3(maxPos.x, (minPos.y + maxPos.y) / 2, maxPos.z));

        // for (let i = 0; i < this._box.length; i++) {
        //     let cube = find("Cube", director.getScene()!);
        //     let node = instantiate(cube)!;
        //     cube?.parent?.addChild(node)
        //     node.position =  this._box[i];
        // }



        // let node1 = instantiate(cube)!;
        // cube?.parent?.addChild(node1)
        // node1.position = maxPos;
        // GameEntity._box.push(minPos);
        // GameEntity._box.push(map);
        if (EDITOR) {
            if (this.lodMeshs.length > 0) mesh = this.lodMeshs[this._lodIndex];
        }
    }

    start() {

    }
    update() {
        // if (EDITOR) { 
        //     this._cameraWorldPosition = director.getScene()?.getChildByName("Main Camera")?.position!;
        //     // console.log(this._cameraWorldPosition);
        //     this.refreshLod();
        // }
    }
    public refreshLod(): void {
        let dis: number = Vec3.distance(this.node.worldPosition, this._cameraWorldPosition);
        for (let i = 0; i < this._box.length; i++) {
            let tempDis: number = Vec3.distance(this._box[i], this._cameraWorldPosition);
            if (tempDis < dis) {
                dis = tempDis;
            }
        }
        //7  15   22  30   37
        if (dis < 7) {
            if (this._lodIndex === 0) return;
            this._lodIndex = 0;
            if (this.lodMeshs.length > this._lodIndex) this.mesh = this.lodMeshs[this._lodIndex];
        } else if (dis < 15) {
            if (this._lodIndex === 1) return;
            this._lodIndex = 1;
            if (this.lodMeshs.length > this._lodIndex) this.mesh = this.lodMeshs[this._lodIndex];
        } else if (dis < 22) {
            if (this._lodIndex === 2) return;
            this._lodIndex = 2;
            if (this.lodMeshs.length > this._lodIndex) this.mesh = this.lodMeshs[this._lodIndex];
        } else if (dis < 30) {
            if (this._lodIndex === 3) return;
            this._lodIndex = 3;
            if (this.lodMeshs.length > this._lodIndex) this.mesh = this.lodMeshs[this._lodIndex];
        } else if (dis < 37) {
            if (this._lodIndex === 4) return;
            this._lodIndex = 4;
            if (this.lodMeshs.length > this._lodIndex) this.mesh = this.lodMeshs[this._lodIndex];
        }
    }
}

