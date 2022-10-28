import { _decorator, Component, Node, gfx, Mat4, Mesh, MeshRenderer, Vec3, math, Terrain, TerrainBlock, utils } from 'cc';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('terrain_to_obj')
@executeInEditMode
export class terrain_to_obj extends Component {
    @property({ type: Terrain })
    terrain: Terrain = null!;
    private _positions: number[] = [];
    private _indices: number[] = [];
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
    start () {
        this.init();
    }
    private init (): void {
        let vectors: Vec3[] = [];
        let matrix: math.Mat4 = this.terrain.node.getWorldMatrix();
        let blocks: TerrainBlock[] = this.terrain.getBlocks();
        for (let i = 0; i < blocks.length; i++) {
            console.log(i);
            let _vectors: Vec3[] = this.getTerrainMeshData(this.terrain, blocks[i], matrix);
            vectors = vectors.concat(_vectors);
        }
        this.mergeVector(vectors);
    }
    private getTerrainMeshData (terrain: Terrain, block: TerrainBlock, worldMatrix: math.Mat4): Vec3[] {
        let vectors: Vec3[] = [];
        let index: number[] = block.getIndex();
        let TERRAIN_BLOCK_VERTEX_COMPLEXITY: number = 33;  //地形顶点复杂成都
        let TERRAIN_BLOCK_TILE_COMPLEXITY: number = 32;  //地形块瓦复杂性
        //网格化地形
        for (let j = 1; j < TERRAIN_BLOCK_VERTEX_COMPLEXITY; ++j) {
            for (let i = 1; i < TERRAIN_BLOCK_VERTEX_COMPLEXITY; ++i) {
                //左上角
                let x = index[0] * TERRAIN_BLOCK_TILE_COMPLEXITY + (i - 1);
                let y = index[1] * TERRAIN_BLOCK_TILE_COMPLEXITY + (j - 1);
                let one = new Vec3(1, 1, 1);
                Vec3.transformMat4(one, terrain.getPosition(x, y), worldMatrix);
                //左下角
                x = index[0] * TERRAIN_BLOCK_TILE_COMPLEXITY + (i - 1);
                y = index[1] * TERRAIN_BLOCK_TILE_COMPLEXITY + (j);
                let two = new Vec3(1, 1, 1);
                Vec3.transformMat4(two, terrain.getPosition(x, y), worldMatrix);
                //右上角
                x = index[0] * TERRAIN_BLOCK_TILE_COMPLEXITY + (i);
                y = index[1] * TERRAIN_BLOCK_TILE_COMPLEXITY + (j - 1);
                let three = new Vec3(1, 1, 1);
                Vec3.transformMat4(three, terrain.getPosition(x, y), worldMatrix);
                //右下角
                x = index[0] * TERRAIN_BLOCK_TILE_COMPLEXITY + (i);
                y = index[1] * TERRAIN_BLOCK_TILE_COMPLEXITY + (j);
                let four = new Vec3(1, 1, 1);
                Vec3.transformMat4(four, terrain.getPosition(x, y), worldMatrix);
                //第一个三角形
                vectors.push(one);
                vectors.push(two);
                vectors.push(four);
                //第二个三角形
                vectors.push(one);
                vectors.push(four);
                vectors.push(three);

            }
        }
        return vectors;
    }
    private mergeVector (vectors: Vec3[]): void {
        for (let i = 0; i < vectors.length; i += 3) {
            let one: Vec3 = vectors[i];
            let tow: Vec3 = vectors[i + 1];
            let three: Vec3 = vectors[i + 2];
            let arrPos = [one, tow, three];
            for (let j = 0; j < arrPos.length; j++) {
                this._positions.push(Math.floor(arrPos[j].x * 1000) / 1000);
                this._positions.push(Math.floor(arrPos[j].y * 1000) / 1000);
                this._positions.push(Math.floor(arrPos[j].z * 1000) / 1000);
            }
            this._indices.push(i + 0);
            this._indices.push(i + 1);
            this._indices.push(i + 2);
        }
        console.log(this._indices);
        this.createDebugMesh(this._positions, this._indices);
    }

    private createDebugMesh (positions: number[], indices: number[]): void {
        let meshRender: MeshRenderer = this.node.getComponent(MeshRenderer)!;
        if (!meshRender) {
            meshRender = this.node.addComponent(MeshRenderer)
        }
        let mesh = utils.createMesh({
            positions: positions,
            // indices: indices,
        });
        meshRender.mesh = mesh;
        this.buildObjData(mesh);
    }
    public buildObjData (mesh: Mesh): void {
        console.log("创建数据");
        this._objData = "";
        let positions = mesh.readAttribute(0, gfx.AttributeName.ATTR_POSITION)!;
        console.log("positions", positions);
        let mat4: Mat4 = this.node.worldMatrix;
        for (let i = 0; i < positions.length; i += 3) {
            let vec: Vec3 = new Vec3(positions[i], positions[i + 1], positions[i + 2]);
            Vec3.transformMat4(vec, vec, mat4);
            this._v += "v " + vec.x + " " + vec.y + " " + vec.z + "\n";
        }
        let normals = mesh.readAttribute(0, gfx.AttributeName.ATTR_NORMAL)!;
        console.log("normals", normals);
        if (normals) {
            for (let i = 0; i < normals.length; i += 3) {
                this._vn += "vn " + normals[i] + " " + normals[i + 1] + " " + normals[i + 2] + "\n";
            }
        }

        let uvs = mesh.readAttribute(0, gfx.AttributeName.ATTR_TEX_COORD)!;
        console.log("uvs", uvs);
        if (uvs) {
            for (let i = 0; i < uvs.length; i += 2) {
                this._vt += "vt " + uvs[i] + " " + (1.0 - uvs[i + 1]) + "\n";
            }
        }
        let indices = mesh.readIndices(0)!;
        console.log("indices", indices);
        if (indices) {
            //三个点一个面
            for (let i = 0; i < indices.length; i += 3) {
                this._f += "f " + (indices[i] + 1) + "/" + (indices[i] + 1) + "/" + (indices[i] + 1) + " " + (indices[i + 1] + 1) + "/" + (indices[i + 1] + 1) + "/" + (indices[i + 1] + 1) + " " + (indices[i + 2] + 1) + "/" + (indices[i + 2] + 1) + "/" + (indices[i + 2] + 1) + "\n";
            }
        } else {
            let index: number = 0;
            for (let i = 0; i < positions.length; i += 9) {
                index = Math.floor(i / 3);
                this._f += "f " + (index + 1) + " " + (index + 2) + " " + (index + 3) + "\n";
            }
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

