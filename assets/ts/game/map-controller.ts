import { _decorator, Node, Vec3, instantiate, Prefab, resources, gfx, MeshRenderer, utils, Collider, Animation, Quat, misc, SceneAsset, Material, Vec4, DirectionalLight, Color, ParticleSystem, tween, primitives, Mesh } from "cc";
import { MeshDebugDataType, NavMeshConfig, NavMeshDebugData, NavMeshMgr } from "../../lib/NavMesh/NavMesh";
import { EColliderType } from "../collider/collider-constants";
import { ColliderNode } from "../collider/collider-node";
import AudioManager from "../core/audio-manager";
import { CCMeshRenderer } from "../core/component/cc-mesh-renderer";
import EventManager from "../core/event-manager";
import { ResLoad } from "../core/res-load";
import { ResAudio, ResEnemy, ResKey } from "../entity/res-constant";
import { PlayerMgr } from "../player/player-mgr";


import { GameEntity } from "./game-entity";
export enum DoorState {
    DEFAULT = -1,
    CLOSE = 0,
    OPEN = 1,
}
export enum MapScanType {
    /**
     * 局部的
     */
    PART = 0,
    /**
     * 整体的
     */
    INTERGRAL = 1,
}
export enum DoorAnim {
    CLOSE = "close",
    OPEN = "open",
}
export interface DoorObstacles {
    node: Node;
    state: number;  // 0- 关闭  1-打开
    obstacles: MAny[];
}
/**
 * 地图管理类
 * 进行统一的地图管理
 */
export class MapController {
    private _node: Node = null!;

    private _sceneNode: Node = null!;
    /**
    *  当前场景中的平行光
    */
    private _light: Node = null!;
    private _builds: Node = null!
    private _colliders: Node = null!
    private _controllers: Node = null!
    /**
     * 场景中所有的材质存放在_meshRenderers 中
     */
    private _meshRenderers: CCMeshRenderer[] = [];

    /**
     * 当前关卡的导航网格配置
     */
    public _navMeshConfig: NavMeshConfig = null!;

    /**
     * 门
     */
    private _doors: MAny = {};
    /**
     * 玩家当前可操作的门
     */
    private _closestDoor: DoorObstacles = null!;


    /**
     * navmesh 刷新时间
     * 非需要实时刷新，每次变动是刷新
     */
    public _navMeshUpdateTime: number = 0;
    constructor (node: Node, navMeshConfig: NavMeshConfig) {
        this._node = node;
        this._navMeshConfig = navMeshConfig;
    }
    /**
     * 初始化场景地图
     * @param call 
     */
    //
    public init (levelName: string, progressCallBack: MFunction, completeCallBack: MFunction): void {
        resources.load("scene/" + levelName, Prefab,
            (finished: number, total: number, item: MAny) => {
                if (progressCallBack) progressCallBack((finished / total) * 100);
            },
            (err, prefab) => {
                //加载完成
                if (err) {
                    console.log("加载level scene 异常");
                    return;
                }
                this._sceneNode = instantiate(prefab);
                this._node.addChild(this._sceneNode);
                this.initMap();
                this.initNavMesh(levelName, completeCallBack);
            });
    }
    private initMap (): void {
        this._light = this._sceneNode.getChildByName("Main Light")!;
        this._builds = this._sceneNode.getChildByName("builds")!;
        this._colliders = this._sceneNode.getChildByName("colliders")!;
        this._controllers = this._sceneNode.getChildByName("controllers")!;
        this.initMeshRenderer();

    }
    /**
     * 获取场景中所有的mesh render渲染组件
     */
    public initMeshRenderer (): void {
        let getMeshRenderer = (node: Node) => {
            let children = node.children;
            for (let i = 0; i < children.length; i++) {
                if (!children[i].active) continue;
                let meshRender: CCMeshRenderer = children[i].getComponent(CCMeshRenderer)!;
                if (meshRender && meshRender.enabled) {
                    this._meshRenderers.push(meshRender);
                }
                getMeshRenderer(children[i]);
            }
        };
        getMeshRenderer(this._builds);
    }
    //
    public initNavMesh (levelName: string, completeCallBack: MFunction): void {
        GameEntity.navMeshMrg = new NavMeshMgr();
        GameEntity.navMeshMrg.init();
        this.setNavMeshConfig();
        // this.startNavMesh();
        // GameEntity.navMeshCorwd = GameEntity.navMeshMrg.initCrowd(20, 1);
        // this.showNavMeshDebug();
        // if (completeCallBack) completeCallBack();
        GameEntity.navMeshMrg.loadNavMeshData("scene/" + levelName + "-nav-mesh", (data: Uint8Array) => {
            if (!data) {
                if (completeCallBack) completeCallBack();
                return;
            }
            GameEntity.navMeshMrg.buildFromNavMeshData(data);
            GameEntity.navMeshCorwd = GameEntity.navMeshMrg.initCrowd(50, 1);
            // this.showNavMeshDebug();
            this.initColliderGroupAndMask();
            this.initControllerNode();
            if (completeCallBack) completeCallBack();
        });
    }
    /**
     * 设置主平行光属性  
     */
    public setLight (color: Color, illuminance: number, shadowEnabled: boolean = false): void {
        let light: DirectionalLight = this._light.getComponent(DirectionalLight)!;
        light.color = color;
        light.illuminance = illuminance;
        light.shadowEnabled = shadowEnabled;
    }

    private startNavMesh (): void {
        let node = this._sceneNode.getChildByName("nav-mesh");
        if (!node) return;
        let children: readonly Node[] = node.children;
        for (let i = 0; i < children.length; i++) {
            GameEntity.navMeshMrg.addStaticModle(children[i]);
            children[i].active = false;
        }
        GameEntity.navMeshMrg.build();
    }
    private setNavMeshConfig (): void {
        if (this._navMeshConfig) {
            GameEntity.navMeshMrg.setConfig(this._navMeshConfig);
            return;
        }
        let _config: NavMeshConfig = {
            cs: 0.06,
            ch: 0.1,
            tileSize: 20,
            borderSize: 0.5,
            walkableSlopeAngle: 60,
            walkableHeight: 20,
            walkableClimb: 2,
            walkableRadius: 0.5,
            maxEdgeLen: 10,
            maxSimplificationError: 1,
            minRegionArea: 3,
            mergeRegionArea: 8,
            maxVertsPerPoly: 6,
            detailSampleDist: 6,
            detailSampleMaxError: 0.1,
        };
        GameEntity.navMeshMrg.setConfig(_config);
    }
    private showNavMeshDebug (): void {
        let navMeshData: NavMeshDebugData = GameEntity.navMeshMrg.getNavMeshDebugData(MeshDebugDataType.LINE);
        this.createDebugMesh(navMeshData.positions, navMeshData.normals);
    }
    private createDebugMesh (positions: number[], normals: number[]): void {
        let meshRender: MeshRenderer = this._node.getComponent(MeshRenderer)!;
        if (!meshRender) {
            meshRender = this._node.addComponent(MeshRenderer)
        }
        let mesh = utils.createMesh({
            positions: positions,
            primitiveMode: gfx.PrimitiveMode.TRIANGLE_LIST,
            normals: normals,
        });
        meshRender.mesh = mesh;
    }

    /**
     * 初始化场景中所有碰撞组件的分组和掩码
     */
    private initColliderGroupAndMask (): void {
        this.setColliderGroupAndMask(this._builds, EColliderType.STATIC)
        this.setColliderGroupAndMask(this._controllers, EColliderType.STATIC)
        this.setColliderGroupAndMask(this._colliders, EColliderType.OBSTACLE)
    }
    private setColliderGroupAndMask (node: Node, type: number) {
        let collider: Collider = node.getComponent(Collider)!;
        if (collider) {
            let comp: ColliderNode = node.addComponent(ColliderNode);
            comp.type = type;
            comp.target = null!;
        }
        let child: readonly Node[] = node.children;
        for (let i = 0; i < child.length; i++) {
            this.setColliderGroupAndMask(child[i], type)
        }
    }
    /**
     * 初始化场景中可控制的节点
     */
    private initControllerNode (): void {
        if (this._controllers) {
            //门
            let door: Node = this._controllers.getChildByName("door")!;
            if (door) {
                let doors: readonly Node[] = door.children;
                for (let i = 0; i < doors.length; i++) {
                    let data: DoorObstacles = {
                        //默认都是关闭状态
                        node: doors[i],
                        state: DoorState.DEFAULT,  // 0- 关闭  1-打开
                        obstacles: [],
                    }
                    this._doors[i] = data;
                    this._closestDoor = this._doors[i];
                    // this.doorOperateClose(true);
                }
            }
        }
    }
    /**
     * 检测可操作的door-门
     */
    public checkControllerDoor (player: PlayerMgr): MAny {
        this._closestDoor = null!;
        let doorNode: Node = null!;
        let dis: number = 0;
        for (let key in this._doors) {
            this._closestDoor = this._doors[key];
            doorNode = this._closestDoor.node;
            dis = Vec3.distance(doorNode.worldPosition, player.node.position);
            if (dis < 3.0) {
                return this._closestDoor;
            }
        }
        this._closestDoor = null!;
        return null;
    }
    public doorOperateOpen (): Vec3 {
        if (!this._closestDoor) return null!;
        let state: number = this._closestDoor.state;
        if (state === DoorState.OPEN) return null!;
        this._closestDoor.state = DoorState.OPEN;
        let obstacles: MAny = this._closestDoor.obstacles;
        for (let i = 0; i < obstacles.length; i++) {
            GameEntity.navMeshMrg.removeObstacle(obstacles[i]);
        }
        this._closestDoor.obstacles = [];
        this._navMeshUpdateTime = 0.5;
        this.playerDoorOperateAnim(this._closestDoor.node, DoorAnim.OPEN, false);
        return this._closestDoor.node.position;
    }
    public doorOperateClose (isInit: boolean = false): void {
        if (!this._closestDoor) return;
        let state: number = this._closestDoor.state;
        if (state === DoorState.CLOSE) return;
        this._closestDoor.state = DoorState.CLOSE;
        this._closestDoor.obstacles = this.addNavMeshDoorObstacle(this._closestDoor.node);
        this._navMeshUpdateTime = 0.5;
        this.playerDoorOperateAnim(this._closestDoor.node, DoorAnim.CLOSE, isInit);
    }
    private playerDoorOperateAnim (node: Node, name: string, isInit: boolean): void {
        if (!node) return;
        let anim: Animation = node.getComponent(Animation)!;
        if (!anim) return;
        if (!isInit) AudioManager.instance.playSound(ResAudio.AUDIO_DOOR_OPERATE);
        anim.play(name);
    }
    /**
     * 添加门对应的障碍物
     */
    private addNavMeshDoorObstacle (node: Node): MAny[] {
        let obstacleNode = node.getChildByName("obstacles");
        if (!obstacleNode) return null!;
        let obstacleChild: readonly Node[] = obstacleNode.children;
        let tempObstacleNode: Node = null!;
        let obstacles: MAny[] = [];
        for (let i = 0; i < obstacleChild.length; i++) {
            tempObstacleNode = obstacleChild[i];
            let pos: Vec3 = tempObstacleNode.worldPosition;
            let scale: Vec3 = tempObstacleNode.worldScale;
            let rotate: Quat = tempObstacleNode.worldRotation;
            let enlur: Vec3 = new Vec3(0, 0, 0);

            Quat.toEuler(enlur, rotate);
            let obstacle: MAny = GameEntity.navMeshMrg.addBoxObstacle(pos, scale, 0);
            obstacles.push(obstacle);
        }
        return obstacles;
    }
    private createDebugBoxObstacle (position: Vec3, size: Vec3, enlurAngle: Vec3): void {
        let cube: Node = instantiate(ResLoad.instance.getPrefab("cube"));
        this._node.addChild(cube);
        cube.position = position;
        cube.scale = size;
        cube.eulerAngles = enlurAngle;
    }
    /**
     * 初始化场景中的射击目标靶子
     */
    public initShootTargets (vec: Vec3): void {
        let node: Node = instantiate(ResLoad.instance.getPrefab(ResEnemy.ENEMY_SHOOT_TARGETS));
        this._node.addChild(node);
        node.position = vec;
    }

    public update (dt: number) {

        if (GameEntity.navMeshMrg) GameEntity.navMeshMrg.update(dt);

        this.refreshMeshLod(dt);
        // this._reliefMap.update(dt);
    }

    /**
     * 刷新mesh 的lod功能
     */
    private refreshMeshLod (dt: number): void {
        let meshRender: CCMeshRenderer = null!;
        for (let i = 0; i < this._meshRenderers.length; i++) {
            meshRender = this._meshRenderers[i];
            meshRender.cameraWorldPosition = GameEntity.gameSceneCamera.worldPosition;
        }
    }

    public cleanAll (): void {
        this._meshRenderers = null!;
        this._doors = null!;
        this._sceneNode.destroy();
        GameEntity.navMeshCorwd.destroy();
        GameEntity.navMeshCorwd = null!;
        GameEntity.navMeshMrg = null!;
    }
}