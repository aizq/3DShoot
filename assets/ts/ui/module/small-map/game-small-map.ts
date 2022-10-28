import { _decorator, Component, Node, Mask, Graphics, Material, Sprite, CCInteger, CCFloat, Vec2, Vec3, Size, UITransform, Prefab, instantiate } from 'cc';
import EventManager from '../../../core/event-manager';
const { ccclass, property, executeInEditMode } = _decorator;
interface SmallMapEnemy {
    node: Node,
    status: number,
}
@ccclass('GameSmallMap')
@executeInEditMode
export class GameSmallMap extends Component {
    @property({ type: Prefab })
    prefabEnemyPoint: Prefab = null!;

    @property({ type: Node })
    nodeMap: Node = null!;
    @property({ type: Node })
    nodePlayer: Node = null!;
    @property({ type: CCFloat })
    radius: number = 100;

    private _enemyMap: Map<string, SmallMapEnemy> = new Map();
    private _scale: number = 1;
    private _spriteMap: Sprite = null!;
    private _materialMap: Material = null!;
    private _center: Vec2 = new Vec2(0, 0);
    private _centerUV: Vec2 = new Vec2(0, 0);
    private _radiusInUv: number = 0;
    private _size: Size = null!;

    private _malPass: MAny = null!;
    private _malHandleCenter: MAny = null!;
    private _malHandleRadius: MAny = null!;
    start () {
        // //34    113
        // // 
        // this.playerPositionChange(-50, 100, 50);
    }
    /**
     * 初始化小地图
     * @param scale 小地图和实际3d场景中的比例 
     */
    public init (scale: number): void {
        this._scale = scale;
        this._spriteMap = this.nodeMap.getComponent(Sprite)!;
        this._size = this.nodeMap.getComponent(UITransform)!.contentSize;
        this._radiusInUv = this.radius / this._size.width;
        // EventManager.on(GameEvent.PLAYER_POSITION_CHANGE, this.playerPositionChange, this);
        // EventManager.on(GameEvent.ENEMY_STATUS_CHANGE, this.enemyStatusChange, this);
        // EventManager.on(GameEvent.ENEMY_ADD, this.addEnemy, this);
        // EventManager.on(GameEvent.ENEMY_DIE_REMOVE, this.enemyDieRemove, this);
    }
    /**
     * 玩家的位置发生变化
     */
    private playerPositionChange (x: number, y: number, z: number, angle: number): void {
        let _x: number = -x * this._scale;
        let _y: number = z * this._scale;
        //刷新地图的位置-中心点是玩家的位置
        this._center.x = -_x;
        this._center.y = -_y;
        this.nodeMap.position = new Vec3(_x, _y, 0);
        this.nodePlayer.eulerAngles = new Vec3(0, 0, angle + 180);
        //计算中心uv
        this._centerUV.x = (this._size.width / 2 - _x) / this._size.width;
        this._centerUV.y = (this._size.height / 2 + _y) / this._size.height;

        this.refreshMapMaterial();
    }
    private refreshMapMaterial (): void {
        // console.log(this._centerUV);
        // console.log(this._radiusInUv);
        if (!this._materialMap) {
            this._materialMap = this._spriteMap.material!;
        }
        // this._materialMap.setProperty("center", this._centerUV);
        // this._materialMap.setProperty("radius", this._radiusInUv);
        if (!this._malPass) this._malPass = this._materialMap.passes[0];
        if (!this._malHandleCenter) this._malHandleCenter = this._malPass.getHandle("center");
        if (!this._malHandleRadius) this._malHandleRadius = this._malPass.getHandle("radius");
        this._malPass.setUniform(this._malHandleCenter, this._centerUV);
        this._malPass.setUniform(this._malHandleRadius, this._radiusInUv);
    }

    /**
     * 添加敌人标记到小地图中
     * @param index  敌人的索引
     */
    private addEnemy (index: number): void {
        let node: Node = instantiate(this.prefabEnemyPoint);
        this.nodeMap.addChild(node);
        this._enemyMap.set(index + "", { status: 0, node: node })
    }
    /**
     * 敌人的状态发生变化
     */
    private enemyStatusChange (index: number, status: number, x: number, y: number, z: number): void {
        let enemy: SmallMapEnemy = this._enemyMap.get(index + "")!;
        let _x: number = x * this._scale;
        let _y: number = -z * this._scale;

        let dis: number = Vec2.distance(new Vec2(_x, _y), new Vec2(this._center.x, this._center.y));
        if (dis > this.radius) {
            enemy.node.active = false;
            return;
        }
        enemy.node.active = true;
        enemy.node.position = new Vec3(_x, _y, 0);
        if (enemy.status !== status) {
            enemy.status = status;
        }
    }
    /**
    * 移除死亡后的敌人
    */
    public enemyDieRemove (index: number): void {
        console.log("敌人死亡。移除对应小地图");
        let enemy: SmallMapEnemy = this._enemyMap.get(index + "")!;
        enemy.node.destroy();
        this._enemyMap.delete(index + "");
    }

    update (deltaTime: number) {

    }

    public onDestroy (): void {
        // EventManager.off(GameEvent.PLAYER_POSITION_CHANGE, this.playerPositionChange, this);
        // EventManager.off(GameEvent.ENEMY_STATUS_CHANGE, this.enemyStatusChange, this);
        // EventManager.off(GameEvent.ENEMY_ADD, this.addEnemy, this);
        // EventManager.off(GameEvent.ENEMY_DIE_REMOVE, this.enemyDieRemove, this);
    }
}

