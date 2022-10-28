
import { _decorator, Component, Node, Mesh, MeshRenderer, Mat4, gfx } from 'cc';
const { ccclass, property, executeInEditMode } = _decorator;



@ccclass('MeshBatchToObj')
// @executeInEditMode
export class MeshBatchToObj extends Component {
    @property
    private _downLoad: boolean = false;
    @property({ tooltip: "下载当前屏数据", displayName: "下载数据：" })
    set downLoad (val) {
        this._downLoad = val;
        this.init();
        this.downLoadPathConfig();
        this._downLoad = false;
    }
    get downLoad () {
        return this._downLoad;
    }
    private _meshData: Mesh = null!;
    private _v = "";
    private _vt = "";
    private _vn = "";
    private _f = "";
    private _objData: string = "";
    onLoad () {
        this.init();
    }
    private init (): void {
        this._meshData = this.batchStaticModel();
        this.buildObjData(this._meshData);
    }
    public buildObjData (mesh: Mesh): void {
        this._objData = "";
        let positions = mesh.readAttribute(0, gfx.AttributeName.ATTR_POSITION)!;
        for (let i = 0; i < positions.length; i += 3) {
            this._v += "v " + positions[i] + " " + positions[i + 1] + " " + positions[i + 2] + "\n";
        }
        let normals = mesh.readAttribute(0, gfx.AttributeName.ATTR_NORMAL)!;
        for (let i = 0; i < normals.length; i += 3) {
            this._vn += "vn " + normals[i] + " " + normals[i + 1] + " " + normals[i + 2] + "\n";
        }
        let uvs = mesh.readAttribute(0, gfx.AttributeName.ATTR_TEX_COORD)!;
        for (let i = 0; i < uvs.length; i += 2) {
            this._vt += "vt " + uvs[i] + " " + (1.0 - uvs[i + 1]) + "\n";
        }
        let indices = mesh.readIndices(0)!;
        //三个点一个面
        for (let i = 0; i < indices.length; i += 3) {
            this._f += "f " + (indices[i] + 1) + "/" + (indices[i] + 1) + "/" + (indices[i] + 1) + " " + (indices[i + 1] + 1) + "/" + (indices[i + 1] + 1) + "/" + (indices[i + 1] + 1) + " " + (indices[i + 2] + 1) + "/" + (indices[i + 2] + 1) + "/" + (indices[i + 2] + 1) + "\n";
        }
        this._objData += "# 搬砖小菜鸟\n";
        this._objData += "o " + this.node.name + "\n";
        this._objData += this._v;
        this._objData += this._vt;
        this._objData += this._vn;
        this._objData += "usemtl None\n";
        this._objData += "s off\n";
        this._objData += this._f;

    }

    private batchStaticModel (): Mesh {
        const models = this.node.getComponentsInChildren(MeshRenderer);
        if (models.length < 2) {
            console.warn('the number of static models to batch is less than 2,it needn\'t batch.');
            return models[0].mesh!;
        }
        for (let i = 1; i < models.length; i++) {
            if (!models[0].mesh!.validateMergingMesh(models[i].mesh!)) {
                console.warn(`the meshes of ${models[0].node.name} and ${models[i].node.name} can't be merged`);
                continue;
            }
            if (!this.checkMaterialisSame(models[0], models[i])) {
                console.warn(`the materials of ${models[0].node.name} and ${models[i].node.name} can't be merged`);
                continue;
            }
        }
        const batchedMesh = new Mesh();
        const worldMat = new Mat4();
        const rootWorldMatInv = new Mat4();
        this.node.getWorldMatrix(rootWorldMatInv);
        Mat4.invert(rootWorldMatInv, rootWorldMatInv);
        for (let i = 0; i < models.length; i++) {
            const comp = models[i];
            comp.node.getWorldMatrix(worldMat);
            Mat4.multiply(worldMat, rootWorldMatInv, worldMat);
            batchedMesh.merge(models[i].mesh!, worldMat);
            comp.enabled = false;
        }
        return batchedMesh;
    }
    private checkMaterialisSame (comp1: MeshRenderer, comp2: MeshRenderer): boolean {
        const matNum = comp1.sharedMaterials.length;
        if (matNum !== comp2.sharedMaterials.length) {
            return false;
        }
        for (let i = 0; i < matNum; i++) {
            if (comp1.getRenderMaterial(i) !== comp2.getRenderMaterial(i)) {
                return false;
            }
        }
        return true;
    }
    private downLoadPathConfig (): void {
        // eslint-disable-next-line
        //@ts-ignore
        Editor.Message.send('asset-db', "create-asset", "db://assets/" + this.node.name + ".obj", this._objData);
    }
}
