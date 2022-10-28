
import { _decorator, Component, Node, MeshRenderer, gfx, Vec3, math, Mesh, Terrain, TerrainBlock, Vec2, geometry, resources, BufferAsset } from 'cc';
const { ccclass, property } = _decorator;
//eslint-disable-next-line
//@ts-ignore  
import Recast from "./recast.js"

@ccclass('NavMeshMgr')
export class NavMeshMgr {
    /* eslint-disable */
    private _recast: any = null;
    public get recast () {
        return this._recast;
    }
    private _navMesh: any = null;
    public get navMesh () {
        return this._navMesh;
    }
    private _tempVec: any;
    private _tempVec1: any;
    private _tempVec2: any;
    /* eslint-enable */

    private _config: NavMeshConfig = null!;
    private _positions: number[] = [];
    private _indices: number[] = [];
    private _timeStep: number = 1 / 60;



    /**
     * 构造函数 初始化recast
     * Recast 异步函数
     * @param cb 
     */
    constructor () {

    }


    public init (): void {
        this._recast = new Recast();
        this._navMesh = new this._recast.NavMesh();


        this._tempVec = new this._recast.Vec3();
        this._tempVec1 = new this._recast.Vec3();
        this._tempVec2 = new this._recast.Vec3();
        this.setDefaultConfig();

    }

    /**
     * 设置网创建导航网格所需参数
     * @param _config 
     */
    public setConfig (_config: NavMeshConfig): void {
        this._config = _config;
    }

    private setDefaultConfig (): void {
        this._config = {
            tileSize: 10,
            borderSize: 1,
            cs: 0.2,
            ch: 0.2,
            walkableSlopeAngle: 90,
            walkableHeight: 1.0,
            walkableClimb: 1,
            walkableRadius: 1,
            maxEdgeLen: 12.,
            maxSimplificationError: 1.3,
            minRegionArea: 8,
            mergeRegionArea: 20,
            maxVertsPerPoly: 6,
            detailSampleDist: 6,
            detailSampleMaxError: 1,
        };
    }
    /**
     * 添加静态的模型
     */
    public addStaticModle (node: Node): void {
        if (!node || !node.getComponent(MeshRenderer)) return;
        let render: MeshRenderer = node.getComponent(MeshRenderer)!;
        if (!render || !render.mesh) return;
        let matrix: math.Mat4 = node.getWorldMatrix();
        this.updateBaseDatas(render.mesh, matrix);
    }
    /**
     * 添加cocos的地形 
     * @param terrain 地形组件
     */
    public addTerrain (terrain: Terrain): void {
        let vectors: Vec3[] = [];
        let matrix: math.Mat4 = terrain.node.getWorldMatrix();
        let blocks: TerrainBlock[] = terrain.getBlocks();
        for (let i = 0; i < blocks.length; i++) {
            let _vectors: Vec3[] = this.getTerrainMeshData(terrain, blocks[i], matrix);
            vectors = vectors.concat(_vectors);
        }

        // return this.getNavMeshDebugLineData(vectors);
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


    /**
     * 更新基础数据
     * positions  顶点
     * indices     顶点索引
     * @param mesh 
     * @param worldMatrix 
     */
    private updateBaseDatas (mesh: Mesh, worldMatrix: math.Mat4): void {
        let meshPosition = mesh.readAttribute(0, gfx.AttributeName.ATTR_POSITION)!;
        //网格顶点坐标
        let positions: number[] = [];
        for (let i = 0; i < meshPosition.length; i++) {
            positions.push(meshPosition[i]);
        }
        //网格顶点索引数据
        let indices = []!;
        mesh.copyIndices(0, indices);
        //将有顶点索引的数据转化为无顶点索引的数据
        let pos: number[] = [];
        if (indices.length > 0) {
            for (let i = 0; i < indices.length; i++) {
                let idx: number = indices[i] * 3;
                pos.push(positions[idx]);
                pos.push(positions[idx + 1]);
                pos.push(positions[idx + 2]);
            }
        } else {
            pos = positions;
        }

        //将pos 中的数据转化为三角形世界坐标点
        let vectors: Vec3[] = [];
        let vector: Vec3 = new Vec3(1.0, 1.0, 1.0);
        for (let i = 0; i < pos.length; i += 3) {
            vector = new Vec3(pos[i], pos[i + 1], pos[i + 2]);
            Vec3.transformMat4(vector, vector, worldMatrix);
            vectors.push(vector);
        }
        this.mergeVector(vectors);
    }
    private mergeVector (vectors: Vec3[]): void {
        //三个点一个三角形
        //每三个点进行一次检测
        //检测三点的顺时针与逆时针  此处需要传入顺时针点  
        let offset = this._positions.length / 3;
        for (let i = 0; i < vectors.length; i += 3) {
            let one: Vec3 = vectors[i];
            let tow: Vec3 = vectors[i + 1];
            let three: Vec3 = vectors[i + 2];
            let arrPos = [one, tow, three];
            //貌似不用检测
            // let value = Vec3.subtract(new Vec3(), arrPos[0], arrPos[1]).cross(Vec3.subtract(new Vec3(), arrPos[2], arrPos[1]));
            // //y 大于0 顺时针
            // //y 小于0 逆时针
            // if (value.y < 0) {
            //     console.log("逆时针");
            //     arrPos = arrPos.reverse();
            // }
            for (let j = 0; j < arrPos.length; j++) {
                this._positions.push(arrPos[j].x);
                this._positions.push(arrPos[j].y);
                this._positions.push(arrPos[j].z);
            }
            let indices = [offset, offset + 1, offset + 2];
            this._indices.push(...indices);
            offset = this._positions.length / 3;
        }
    }
    /**
     * 清除所有网格数据
     */
    public clean (): void {
        this._positions = [];
        this._indices = [];
    }
    /**
     * 构建导航网格
     */
    public build (): void {
        this._navMesh = new this._recast.NavMesh();

        let rc = new this._recast.rcConfig();
        rc.cs = this._config.cs;
        rc.ch = this._config.ch;
        rc.borderSize = this._config.borderSize;
        rc.tileSize = this._config.tileSize;
        rc.walkableSlopeAngle = this._config.walkableSlopeAngle;
        rc.walkableHeight = this._config.walkableHeight;
        rc.walkableClimb = this._config.walkableClimb;
        rc.walkableRadius = this._config.walkableRadius;
        rc.maxEdgeLen = this._config.maxEdgeLen;
        rc.maxSimplificationError = this._config.maxSimplificationError;
        rc.minRegionArea = this._config.minRegionArea;
        rc.mergeRegionArea = this._config.mergeRegionArea;
        rc.maxVertsPerPoly = this._config.maxVertsPerPoly;
        rc.detailSampleDist = this._config.detailSampleDist;
        rc.detailSampleMaxError = this._config.detailSampleMaxError;

        this._navMesh.build(this._positions, this._positions.length / 3, this._indices, this._indices.length, rc);
    }
    /**
     * 获取导航网格数据
     * @param type  面和线 两种方式
     * @returns 
     */
    public getNavMeshDebugData (type: MeshDebugDataType = MeshDebugDataType.SURFACE): NavMeshDebugData {
        let debugNavMesh = this._navMesh.getDebugNavMesh();
        let triangleCount = debugNavMesh.getTriangleCount();
        let _indices = [];
        let _positions = [];
        let tri: number;
        let pt: number;
        for (tri = 0; tri < triangleCount * 3; tri++) {
            _indices.push(tri);
        }
        for (tri = 0; tri < triangleCount; tri++) {
            for (pt = 0; pt < 3; pt++) {
                let point = debugNavMesh.getTriangle(tri).getPoint(pt);
                _positions.push(point.x, point.y, point.z);
            }
        }
        //进行数据转换  转换为cocos可以使用的网格数据
        let vectors: Vec3[] = [];
        for (let i = 0; i < _indices.length; i++) {
            let index = _indices[i] * 3;
            let vector: Vec3 = new Vec3(_positions[index], _positions[index + 1], _positions[index + 2]);
            vectors.push(vector);
        }
        if (type == MeshDebugDataType.SURFACE) {
            return this.getNavMeshDebugSurfaceData(vectors);
        } else {
            return this.getNavMeshDebugLineData(vectors);
        }
    }
    /**
     * 获取导航网格数据--面的网格数据
     * @param vectors 
     * @returns 
     */
    private getNavMeshDebugSurfaceData (vectors: Vec3[]): NavMeshDebugData {
        let positions = [];
        let normals = [];
        for (let i = 0; i < vectors.length; i += 3) {
            let one: Vec3 = vectors[i];
            let tow: Vec3 = vectors[i + 1];
            let three: Vec3 = vectors[i + 2];
            let arrPos = [one, tow, three];
            let value = Vec3.subtract(new Vec3(), arrPos[0], arrPos[1]).cross(Vec3.subtract(new Vec3(), arrPos[2], arrPos[1]));
            //y 大于0 顺时针
            //y 小于0 逆时针
            if (value.y > 0) {
                arrPos = arrPos.reverse();
            }
            for (let j = 0; j < arrPos.length; j++) {
                positions.push(arrPos[j].x);
                positions.push(arrPos[j].y);
                positions.push(arrPos[j].z);

                normals.push(0);
                normals.push(1);
                normals.push(0);
            }
        }
        return { positions: positions, normals: normals }
    }
    /**
     * 获取导航网格数据--线的网格数据
     * @param vectors 
     * @returns 
     */
    private getNavMeshDebugLineData (vectors: Vec3[], lineWidth: number = 0.02): NavMeshDebugData {
        let positions = [];
        let normals = [];
        //将所有的点连城线
        for (let i = 0; i < vectors.length; i += 3) {
            let one: Vec3 = vectors[i];
            let tow: Vec3 = vectors[i + 1];
            let three: Vec3 = vectors[i + 2];
            let datas = [one, tow, three];
            let value = Vec3.subtract(new Vec3(), datas[0], datas[1]).cross(Vec3.subtract(new Vec3(), datas[2], datas[1]));
            //y 大于0 顺时针
            //y 小于0 逆时针
            if (value.y > 0) {
                datas = datas.reverse();
            }
            //每三个顶点是一个三角形 
            let halfWidth = lineWidth / 2;
            let angle = math.toRadian(90);

            for (let idx = 0; idx < datas.length; idx++) {

                let leftPos = datas[idx].clone();
                let rigthPos = datas[idx + 1 >= datas.length ? 0 : idx + 1].clone();


                let tempRay = new geometry.Ray();
                geometry.Ray.fromPoints(tempRay, leftPos, rigthPos);
                let flagPos = new Vec3();
                tempRay.computeHit(flagPos, halfWidth);
                let leftBottomVec = Vec3.rotateY(new Vec3(), flagPos, leftPos, -angle);
                let leftTopVec = Vec3.rotateY(new Vec3(), flagPos, leftPos, angle);
                geometry.Ray.fromPoints(tempRay, rigthPos, leftPos);
                tempRay.computeHit(flagPos, halfWidth);
                let rightBottomVec = Vec3.rotateY(new Vec3(), flagPos, rigthPos, angle);
                let rightTopVec = Vec3.rotateY(new Vec3(), flagPos, rigthPos, -angle);

                let arrPos = [leftBottomVec, rightBottomVec, leftTopVec];
                let value = Vec3.subtract(new Vec3(), arrPos[0], arrPos[1]).cross(Vec3.subtract(new Vec3(), arrPos[2], arrPos[1]));
                if (value.y > 0) {
                    arrPos = arrPos.reverse();
                }
                for (let j = 0; j < arrPos.length; j++) {
                    positions.push(arrPos[j].x);
                    positions.push(arrPos[j].y);
                    positions.push(arrPos[j].z);

                    normals.push(0);
                    normals.push(1);
                    normals.push(0);
                }

                arrPos = [];
                arrPos = [rightBottomVec, rightTopVec, leftTopVec];
                value = Vec3.subtract(new Vec3(), arrPos[0], arrPos[1]).cross(Vec3.subtract(new Vec3(), arrPos[2], arrPos[1]));
                if (value.y > 0) {
                    arrPos = arrPos.reverse();
                }
                for (let j = 0; j < arrPos.length; j++) {
                    positions.push(arrPos[j].x);
                    positions.push(arrPos[j].y);
                    positions.push(arrPos[j].z);

                    normals.push(0);
                    normals.push(1);
                    normals.push(0);
                }
            }
        }
        return { positions: positions, normals: normals }
    }

    /**
     * 获取navmesh 数据
     */
    public getNavMeshData (): Uint8Array {
        // console.log(this._recast.HEAPU8.buffer)
        let data = this._navMesh.getNavmeshData();
        // console.log(data)
        let arr = new Uint8Array(this._recast.HEAPU8.buffer, data.dataPointer, data.size);
        let ret = new Uint8Array(data.size);
        ret.set(arr);
        this._navMesh.freeNavmeshData(data);
        // console.log(ret)
        return ret;
    }
    public loadNavMeshData (path: string, cb: MFunction): void {
        resources.load(path, (err, data: BufferAsset) => {
            if (err) {
                console.log("err :", err);
                if (cb) cb(null);
                return;
            }

            let buffer = data.buffer();
            let foobar = new Uint8Array(buffer);
            if (cb) cb(foobar);
        });
    }
    /**
     * 通过已有的数据创建navmesh
     * @param data 
     */
    public buildFromNavMeshData (data: Uint8Array): void {
        let nDataBytes = data.length * data.BYTES_PER_ELEMENT;
        let dataPtr = this._recast._malloc(nDataBytes);

        let dataHeap = new Uint8Array(this._recast.HEAPU8.buffer, dataPtr, nDataBytes);
        dataHeap.set(data);

        let buf = new this._recast.NavmeshData();
        buf.dataPointer = dataHeap.byteOffset;
        buf.size = data.length;
        // this._navMesh = new this._recast.NavMesh();
        this._navMesh.buildFromNavmeshData(buf);

        // Free memory
        this._recast._free(dataHeap.byteOffset);
    }
    /**
     * 获取亮点之间的路径
     * @param start 
     * @param end 
     */
    public findPath (start: Vec3, end: Vec3): Vec3[] {
        let _start: Vec3 = this.getClosestPoint(start);
        this._tempVec1.x = _start.x;
        this._tempVec1.y = _start.y;
        this._tempVec1.z = _start.z;
        let _end: Vec3 = this.getClosestPoint(end);
        this._tempVec2.x = _end.x;
        this._tempVec2.y = _end.y;
        this._tempVec2.z = _end.z;

        let navPath = this._navMesh.computePath(this._tempVec1, this._tempVec2);

        let pointCount = navPath.getPointCount();
        let positions: Vec3[] = [];
        for (let i = 0; i < pointCount; i++) {
            let p = navPath.getPoint(i);
            positions.push(new Vec3(p.x, p.y, p.z));
        }
        return positions;
    }
    public getClosestPoint (pos: Vec3): Vec3 {
        this._tempVec.x = pos.x;
        this._tempVec.y = pos.y;
        this._tempVec.z = pos.z;
        let ret = this._navMesh.getClosestPoint(this._tempVec);
        return new Vec3(ret.x, ret.y, ret.z);
    }
    /**
     * 创建人群代理
     */
    public initCrowd (maxAgents: number, maxAgentRadius: number): NavMeshCorwd {
        return new NavMeshCorwd(this, maxAgents, maxAgentRadius);
    }
    /**
     *  Set the time step of the navigation tick update.
     * @param newTimeStep  s
     */
    setTimeStep (newTimeStep: number = 1 / 60): void {
        this._timeStep = newTimeStep;
    }
    getTimeStep (): number {
        return this._timeStep;
    }
    /**
     * 添加圆柱形障碍物
     * @param position  位置
     * @param radius  半径
     * @param height  高
     * @returns 
     */
    public addCylinderObstacle (position: Vec3, radius: number, height: number): IObstacle {
        this._tempVec1.x = position.x;
        this._tempVec1.y = position.y;
        this._tempVec1.z = position.z;
        return this._navMesh.addCylinderObstacle(this._tempVec1, radius, height);
    }
    /**
     * 添加立方体障碍物
     * @param position  位置
     * @param size  尺寸
     * @param angle  盒子方向在Y轴上的弧度角
     * @returns 
     */
    addBoxObstacle (position: Vec3, extent: Vec3, angle: number): IObstacle {
        this._tempVec1.x = position.x;
        this._tempVec1.y = position.y;
        this._tempVec1.z = position.z;
        this._tempVec2.x = extent.x;
        this._tempVec2.y = extent.y;
        this._tempVec2.z = extent.z;
        return this._navMesh.addBoxObstacle(this._tempVec1, this._tempVec2, angle);
    }
    /**
     * 移除障碍物
     * @param obstacle 
     */
    public removeObstacle (obstacle: IObstacle): void {
        console.log("移除障碍物：", obstacle);
        this._navMesh.removeObstacle(obstacle);
    }
    public update (deltaTime: number) {
        if (this._navMesh) {
            this._navMesh.update(deltaTime);
        }
    }

}
export interface IObstacle {
}
export class NavMeshCorwd {
    private _navMeshMgr: NavMeshMgr = null!;
    /* eslint-disable */
    private _recastCrowd: any = {};
    private _agents: number[] = [];
    private _tempVec: any;
    /* eslint-enable */
    constructor (navMeshMagr: NavMeshMgr, maxAgents: number, maxAgentRadius: number,) {
        this._navMeshMgr = navMeshMagr;
        this._tempVec = new navMeshMagr.recast.Vec3();
        this._recastCrowd = new this._navMeshMgr.recast.Crowd(maxAgents, maxAgentRadius, this._navMeshMgr.navMesh.getNavMesh());
    }
    public addAgent (pos: Vec3, parameters: AgentConfig): number {
        let config = new this._navMeshMgr.recast.dtCrowdAgentParams();
        config.radius = parameters.radius;
        config.height = parameters.height;
        config.maxAcceleration = parameters.maxAcceleration;
        config.maxSpeed = parameters.maxSpeed;
        config.collisionQueryRange = parameters.collisionQueryRange;
        config.pathOptimizationRange = parameters.pathOptimizationRange;
        config.separationWeight = parameters.separationWeight;
        config.updateFlags = 0;
        config.obstacleAvoidanceType = 3;  //障碍类型
        config.queryFilterType = 0;
        config.userData = 0;

        let agentIndex: number = this._recastCrowd.addAgent(new this._navMeshMgr.recast.Vec3(pos.x, pos.y, pos.z), config);
        this._agents.push(agentIndex);
        return agentIndex;
    }
    /**
     * 更新代理参数
     * @param index 
     * @param parameters 
     */
    public updateAgentConfig (index: number, parameters: AgentConfig): void {
        let agentParams = this._recastCrowd.getAgentParameters(index);

        if (parameters.radius !== undefined) {
            agentParams.radius = parameters.radius;
        }
        if (parameters.height !== undefined) {
            agentParams.height = parameters.height;
        }
        if (parameters.maxAcceleration !== undefined) {
            agentParams.maxAcceleration = parameters.maxAcceleration;
        }
        if (parameters.maxSpeed !== undefined) {
            agentParams.maxSpeed = parameters.maxSpeed;
        }
        if (parameters.collisionQueryRange !== undefined) {
            agentParams.collisionQueryRange = parameters.collisionQueryRange;
        }
        if (parameters.pathOptimizationRange !== undefined) {
            agentParams.pathOptimizationRange = parameters.pathOptimizationRange;
        }
        if (parameters.separationWeight !== undefined) {
            agentParams.separationWeight = parameters.separationWeight;
        }
        this._recastCrowd.setAgentParameters(index, agentParams);
    }
    public getAgentPosition (index: number): Vec3 {
        let agentPos = this._recastCrowd.getAgentPosition(index);
        return new Vec3(agentPos.x, agentPos.y, agentPos.z);
    }
    public getAgentNextTargetPath (index: number): Vec3 {
        let agentPos = this._recastCrowd.getAgentNextTargetPath(index);
        return new Vec3(agentPos.x, agentPos.y, agentPos.z);
    }
    public getAgentVelocity (index: number): Vec3 {
        let agentVel = this._recastCrowd.getAgentVelocity(index);
        return new Vec3(agentVel.x, agentVel.y, agentVel.z);
    }
    /**
     * 指定代理移动到目标位置
     * @param index 
     * @param destination 
     */

    public agentMoveTarget (index: number, target: Vec3): void {
        this._tempVec.x = target.x;
        this._tempVec.y = target.y;
        this._tempVec.z = target.z;
        this._recastCrowd.agentGoto(index, this._tempVec);
    }
    /**
    * 指定代理传送到目标位置
    */
    public agentTeleport (index: number, target: Vec3): void {
        this._recastCrowd.agentTeleport(index, new this._navMeshMgr.recast.Vec3(target.x, target.y, target.z));
    }
    /**
     *移除指定代理
     * @param index 
     */
    public removeAgent (index: number): void {
        this._recastCrowd.removeAgent(index);
    }
    public getAgents (): number[] {
        return this._agents;
    }
    public update (deltaTime: number): void {
        this._recastCrowd.update(deltaTime);
    }
    public destroy (): void {
        this._recastCrowd.destroy();
    }
}
export enum MeshDebugDataType {
    SURFACE = 0,
    LINE = 1,
}
export interface NavMeshDebugData {
    positions: number[];
    normals: number[];
}

export interface NavMeshConfig {
    /**
     * 瓦片大小，用于进行动态障碍物检测
     */
    tileSize: number;
    /**
     * 高度场周围不可导航边框的大小。
     */
    borderSize: number;
    /**
     * xz平面单元格大小
     */
    cs: number;
    /**
     * y轴单元格大小
     */
    ch: number;
    /**
     * 可以步行的最大坡度。[限制：0 <= 值 < 90] [单位：度]
     */
    walkableSlopeAngle: number;
    /**
     * 到达天花板最小可行走的距离
     */
    walkableHeight: number;
    /**
     * 可以通过的最大岩架高度  
     */
    walkableClimb: number;
    /**
     * 距离障碍物的距离（半径）
     */
    walkableRadius: number;
    /**
     * 沿网格边界的轮廓边的最大允许长度
     */
    maxEdgeLen: number;
    /**
     * 简化轮廓的边界边缘应偏离原始原始轮廓的最大距离。
     */
    maxSimplificationError: number;
    /**
     * 允许形成孤岛区域的最小单元 面积
     */
    minRegionArea: number;
    /**
     * 如果可能，跨度计数小于此值的任何区域都将与更大的区域合并
     */
    mergeRegionArea: number;
    /**
     * 过程中生成的多边形所允许的最大顶点数  
     */
    maxVertsPerPoly: number;
    /**
     * 设置生成细节网格时使用的采样距离（仅适用于高度详细信息。）
     */
    detailSampleDist: number;
    /**
     * 细节网格表面应偏离高度场数据的最大距离。（仅适用于高度详细信息。）
     */
    detailSampleMaxError: number;
}
export interface AgentConfig {
    /**
     * 半径
     */
    radius?: number;

    /**
     * 高度
     */
    height?: number;

    /**
     * 最大允许加速度
     */
    maxAcceleration?: number;

    /**
     *最大允许速度
     */
    maxSpeed?: number;

    /**
     *定义碰撞元素在考虑转向行为之前的距离. [Limits: > 0]
     * 代理和代理之间的距离
     */
    collisionQueryRange?: number;

    /**
     * 路径可见性优化范围. [Limit: > 0]
     */
    pathOptimizationRange?: number;

    /**
     * *代理管理器在避免与代理发生冲突时应该采取何种激进措施. [Limit: >= 0]
     */
    separationWeight?: number;

    /**
     当agent进入以目标点为半径的虚拟圈时，观察者将被通知
     *默认为代理半径
     */
    reachRadius?: number;
}