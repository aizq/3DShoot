
import { _decorator, Component, Node, Mesh, MeshRenderer, Mat4, gfx, Vec3 } from 'cc';
import { CCMeshRenderer } from '../component/cc-mesh-renderer';
const { ccclass, property, executeInEditMode } = _decorator;



@ccclass('MergerAllNeshToObj')
@executeInEditMode
export class MergerAllNeshToObj extends Component {
    private _objData: string = "";
    @property
    private _downLoad: boolean = false;
    @property({ tooltip: "下载当前屏数据", displayName: "下载数据：" })
    set downLoad(val) {
        this._downLoad = val;
        this.init();
        this.downLoadPathConfig();
        this._downLoad = false;
    }
    get downLoad() {
        return this._downLoad;
    }
    onLoad() {
        this.init();
    }
    private init(): void {
        this._objData = "";
        let mesh = new Mesh();
        this.batchMesh(this.node, mesh);
        this.buildObjData(this.node, mesh);
    }

    public batchMesh(node: Node, mesh: Mesh): void {
        let models: CCMeshRenderer[] = [];
        let getMeshRenderers = (node: Node) => {
            let meshRender: CCMeshRenderer = node.getComponent(CCMeshRenderer)!;
            if (!node.active) return;
            if (meshRender) {
                models.push(meshRender);
            }
            let child = node.children;
            console.log(node.name,child.length)
            for (let i = 0; i < child.length; i++) {
                getMeshRenderers(child[i]);
            }
        };
        getMeshRenderers(node);
        if (models.length < 2) {
            // mesh = models[0].mesh!;
            let lodMesh = models[0].lodMeshs;
            mesh = lodMesh[lodMesh.length >= 2 ? 1 : 0];
            return;
        }
        const worldMat = new Mat4();
        const rootWorldMatInv = new Mat4();
        node.getWorldMatrix(rootWorldMatInv);
        Mat4.invert(rootWorldMatInv, rootWorldMatInv);
        for (let i = 0; i < models.length; i++) {
            const comp = models[i];
            comp.node.getWorldMatrix(worldMat);
            Mat4.multiply(worldMat, rootWorldMatInv, worldMat);

            let lodMesh = models[i].lodMeshs;
            if (lodMesh.length >= 1) {
                if (lodMesh.length >= 2) {
                    mesh.merge(lodMesh[1], worldMat);
                } else {
                    mesh.merge(lodMesh[0], worldMat);
                }
            } else { 
                mesh.merge(models[i].mesh!, worldMat);
            }
           
        }
    }
    public buildObjData(node: Node, mesh: Mesh) {
        let objData = "";
        let a_position = mesh.readAttribute(0, gfx.AttributeName.ATTR_POSITION)!;
        let mat4 = node.worldMatrix;
        let _v = "";
        for (let i = 0; i < a_position.length; i += 3) {
            let vec = new Vec3(a_position[i], a_position[i + 1], a_position[i + 2]);
            Vec3.transformMat4(vec, vec, mat4);
            _v += "v " + vec.x + " " + vec.y + " " + vec.z + "\n";
        }
        let _vn = "";
        let normals = mesh.readAttribute(0, gfx.AttributeName.ATTR_NORMAL)!;
        if (normals) {
            for (let i = 0; i < normals.length; i += 3) {
                _vn += "vn " + normals[i] + " " + normals[i + 1] + " " + normals[i + 2] + "\n";
            }
        }
        let _vt = "";
        let uvs = mesh.readAttribute(0, gfx.AttributeName.ATTR_TEX_COORD)!;
        if (uvs) {
            for (let i = 0; i < uvs.length; i += 2) {
                _vt += "vt " + uvs[i] + " " + (1.0 - uvs[i + 1]) + "\n";
            }
        }
        let _f = "";
        let indices = mesh.readIndices(0);
        if (indices) {
            for (let i = 0; i < indices.length; i += 3) {
                _f += "f " + (indices[i] + 1) + "/" + (indices[i] + 1) + "/" + (indices[i] + 1) + " " + (indices[i + 1] + 1) + "/" + (indices[i + 1] + 1) + "/" + (indices[i + 1] + 1) + " " + (indices[i + 2] + 1) + "/" + (indices[i + 2] + 1) + "/" + (indices[i + 2] + 1) + "\n";
            }
        } else {
            let index = 0;
            for (let i = 0; i < a_position.length; i += 9) {
                index = Math.floor(i / 3);
                _f += "f " + (index + 1) + " " + (index + 2) + " " + (index + 3) + "\n";
            }
        }
        objData += "# 搬砖小菜鸟\n";
        objData += "o " + node.name + "\n";
        objData += _v;
        objData += _vt;
        objData += _vn;
        objData += "usemtl None\n";
        objData += "s off\n";
        objData += _f;
        this._objData = objData;
        // await Editor.Message.send('asset-db', "create-asset", "db://assets/" + node.name + ".obj", objData);
        // await this.hideMesh();
        // await Editor.Message.request('scene', 'soft-reload');
    }
    private downLoadPathConfig(): void {
        // eslint-disable-next-line
        //@ts-ignore
        Editor.Message.send('asset-db', "create-asset", "db://assets/" + this.node.name + ".obj", this._objData);
    }
}