import { _decorator, Component, Node, instantiate, Prefab, Animation, Vec3, Camera } from 'cc';
import PoolManager from '../../core/pool-manager';
import { MathTool } from '../../core/utils/math-tool';
import { GameEntity } from '../../game/game-entity';

const { ccclass, property } = _decorator;

@ccclass('GameUIEnemyDeathSign')
export class GameUIEnemyDeathSign extends Component {
    @property({ type: Node })
    icon: Node = null!;
    @property({ type: Animation })
    anim: Animation = null!;
    private worldPos: Vec3 = new Vec3(0, 0, 0);

    private _position: Vec3 = new Vec3(0, 0, 0);
    private _camera: Camera = null!;
    onLoad () {
        if (GameEntity.gameSceneCamera) {
            this._camera = GameEntity.gameSceneCamera.getComponent(Camera)!;
        }
    }
    public init (x: number, y: number, z: number): void {
        this.worldPos.x = x;
        this.worldPos.y = y;
        this.worldPos.z = z;
        this.scheduleOnce(this.remove, 10.0);
    }
    update (dt: number) {
        if (this.worldPos.x === 0 && this.worldPos.y === 0 && this.worldPos.z === 0) return;
        if (!this._camera) return;
        let isInView: boolean = MathTool.IsInView(GameEntity.gameSceneCamera, this.worldPos);
        if (isInView) {
            this._camera.convertToUINode(this.worldPos, this.node.parent!, this._position);
        } else {
            this._position.x = 0;
            this._position.y = 900;
            this._position.z = 0;
        }
        this.node.position = this._position
    }
    private remove (): void {
        this.node.removeFromParent();
        PoolManager.instance.putNode(this.node);
    }
}

