
import { _decorator, Component, Node, Line, MeshRenderer, utils, gfx, Button, CCBoolean, CCString, Mesh, Quat, Vec3 } from 'cc';
import { MeshDebugDataType, NavMeshConfig, NavMeshDebugData, NavMeshMgr } from './NavMesh';
const { ccclass, property, executeInEditMode, } = _decorator;



@ccclass('NavMeshEditor')
@executeInEditMode
export class NavMeshEditor extends Component {
    @property
    _path: string = "resources/scene/";
    @property({ type: CCString, tooltip: "保存路径", displayName: "保存数据:  db//assest//" })
    public set path (val) {
        this._path = val;
    }
    public get path () {
        return this._path;
    }

    @property
    _saveData: boolean = null!;
    @property({ type: CCBoolean, tooltip: "保存navmesh 数据", displayName: "保存数据" })
    public set saveData (val) {
        if (val === true) {
            this.saveNavMeshData();
        }
        this._saveData = false;
    }
    public get saveData () {
        return this._saveData;
    }


    @property({ type: Node })
    Capsule: Node = null!;

    // create-asset
    private _navMeshMgr: NavMeshMgr = null!;
    private _navMeshData: Uint8Array = null!;
    onLoad () {
        this._saveData = false;
    }
    start () {
        this._navMeshMgr = new NavMeshMgr();
        this._navMeshMgr.init();
        this.setNavMeshConfig();
        this.startNavMesh();
    }

    private startNavMesh (): void {
        let children: Node[] = this.node.children;
        for (let i = 0; i < children.length; i++) {
            this._navMeshMgr.addStaticModle(children[i]);
            // children[i].active = false;
        }
        this._navMeshMgr.build();

        let navMeshData: NavMeshDebugData = this._navMeshMgr.getNavMeshDebugData(MeshDebugDataType.LINE);
        this.createDebugMesh(navMeshData.positions, navMeshData.normals);
        this._navMeshData = this._navMeshMgr.getNavMeshData();
    }
    private setNavMeshConfig (): void {
        let _config: NavMeshConfig = {
            cs: 0.06,
            ch: 0.1,
            tileSize: 20,
            borderSize: 1,
            walkableSlopeAngle: 60,
            walkableHeight: 20,
            walkableClimb: 2,
            walkableRadius: 5,
            maxEdgeLen: 10,
            maxSimplificationError: 1,
            minRegionArea: 3,
            mergeRegionArea: 8,
            maxVertsPerPoly: 6,
            detailSampleDist: 6,
            detailSampleMaxError: 0.1,
        };
        this._navMeshMgr.setConfig(_config);
    }
    private createDebugMesh (positions: number[], normals: number[]): void {
        let meshRender: MeshRenderer = this.node.getComponent(MeshRenderer)!;
        if (!meshRender) {
            meshRender = this.node.addComponent(MeshRenderer)
        }

        let mesh = utils.createMesh({
            positions: positions,
            primitiveMode: gfx.PrimitiveMode.TRIANGLE_LIST,
            normals: normals,
        });
        meshRender.mesh = mesh;
    }
    private saveNavMeshData (): void {
        let index = this.path.lastIndexOf(".")
        if (index === -1) {
            this.path += ".bin";
        } else {
            let str = this.path.substring(index + 1);
            if (str !== "bin") {
                console.warn("save data fail，  .bin file");
                return;
            }
        }
        // eslint-disable-next-line
        //@ts-ignore
        Editor.Message.send('asset-db', "create-asset", "db://assets/" + this._path, this._navMeshData)
    }

}
