
import { _decorator, Component, Node, Mesh, gfx, Mat4, MeshRenderer, Vec3 } from 'cc';
const { ccclass, property, executeInEditMode } = _decorator;


@ccclass('MeshToObj')
@executeInEditMode
export class MeshToObj extends Component {

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
    private _v = "";
    private _vt = "";
    private _vn = "";
    private _f = "";
    private _objData: string = "";
    onLoad () {
        this.init();
    }
    private init (): void {
        let models = this.node.getComponent(MeshRenderer);
        if (!models) return;
        this.buildObjData(models.mesh!);
    }
    public buildObjData (mesh: Mesh): void {
        this._objData = "";
        let positions = mesh.readAttribute(0, gfx.AttributeName.ATTR_POSITION)!;
        let mat4: Mat4 = this.node.worldMatrix;
        for (let i = 0; i < positions.length; i += 3) {

            let vec: Vec3 = new Vec3(positions[i], positions[i + 1], positions[i + 2]);
            Vec3.transformMat4(vec, vec, mat4);
            // vec=V*mat4;
            // this._v += "v " + positions[i] + " " + positions[i + 1] + " " + positions[i + 2] + "\n";
            this._v += "v " + vec.x + " " + vec.y + " " + vec.z + "\n";
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

    private downLoadPathConfig (): void {
        // eslint-disable-next-line
        //@ts-ignore
        Editor.Message.send('asset-db', "create-asset", "db://assets/" + this.node.name + ".obj", this._objData);
    }
}
