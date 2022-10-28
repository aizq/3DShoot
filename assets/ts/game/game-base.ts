import { _decorator, Vec3, Node, instantiate, Prefab, geometry, Camera, SpriteFrame, tween, Component, find, director, PhysicsSystem, PhysicsRayResult, Collider } from "cc";
import { NavMeshConfig } from "../../lib/NavMesh/NavMesh";
import { EColliderMask, EColliderType } from "../collider/collider-constants";
import { ColliderNode } from "../collider/collider-node";
import AudioManager from "../core/audio-manager";
import { GunData } from "../config/TGun";
import EventManager from "../core/event-manager";
import { ResLoad } from "../core/res-load";
import { EnemyBase } from "../enemy/enemy-base";
import { ResAudio, ResEffect, ResKey } from "../entity/res-constant";
import { PlayerMgr } from "../player/player-mgr";
import { GoodsBase } from "./use-goods/goods-base";


import { EffectController } from "../effect/effect-controller";
import { EnemyController } from "../enemy/enemy-controller";
import { GameEntity } from "./game-entity";
import { GoodsController } from "./use-goods/goods-controller";
import { MapController } from "./map-controller";

import { GameUIData } from "../ui/ui-entity";
import { GameEvent } from "../entity/event-entity";
import { MV } from "../core/mvvm/mv-manager";
import { EGoodsId } from "./use-goods/goods-constants";
import { StorageKey, StorageManager } from "../core/storage-manager";
import { MathTool } from "../core/utils/math-tool";


const { ccclass, property, type } = _decorator;
/**
 * 游戏局内 抽象类
 * 基础功能的实现
 */
export abstract class GameBase extends Component {
    @type(Node)
    public nodeCamera: Node = null!;
    private _camera: Camera = null!;
    // private _cameraForward: Node = null!
    @type(Node)
    public nodeUICamera: Node = null!;
    @type(Node)
    public uiRoot: Node = null!;
    private _uiNode: Node = null!;

    /**
     * 当前关卡的导航网格配置
     */
    private _navMeshConfig: NavMeshConfig = null!;
    public set navMeshConfig(val: NavMeshConfig) {
        this._navMeshConfig = val;
    }

    private _levelName: string = "";
    public set levelName(val: string) {
        this._levelName = val;
    }
    /**
    * 玩家
    */
    private _playerMrg: PlayerMgr = null!;
    private _playerPosition: Vec3 = new Vec3(0, 0, 0);
    public set playerPosition(val: Vec3) {
        this._playerPosition = val;
    }
    private _playerEuler: Vec3 = new Vec3(0, 0, 0,);
    public set playerEuler(val: Vec3) {
        this._playerEuler = val;
    }


    private _effectController: EffectController = null!;
    public get effectController() {
        return this._effectController;
    }
    private _goodsController: GoodsController = null!;
    private _enemyController: EnemyController = null!;
    public get enemyController() {
        return this._enemyController;
    }
    private _mapController: MapController = null!;
    public get mapController() {
        return this._mapController;
    }

    /**
     * 开火计时
     */
    private _isOpenFire: boolean = false;
    private _openFireStart: number = 0;
    private _openFireDeltaTime: number = 0;
    //两次点击开过间隔
    private _openFireIntervalDt: number = 0;
    private _isFillBullets: boolean = false;
    /**
     * 当前对局id 
     * 用来存储历史记录
     */
    private _playGameId: number = 0;


    /**
     * 临时变量
     */
    private _tempRay: geometry.Ray = new geometry.Ray();
    //开火弹道纠正射线
    private _tempRayFireBallistic: geometry.Ray = new geometry.Ray();
    private _tempVec0: Vec3 = new Vec3(0, 0, 0);
    private _tempVec1: Vec3 = new Vec3(0, 0, 0);
    private _tempDirVec: Vec3 = new Vec3(0, 0, 0);
    private _tempForwardVec: Vec3 = new Vec3(0, 0, 0);

    private _textBaseCube: Node = null!;
    start() {
        this.initGame();
    }
    /**
     * 初始化
     */
    public initGame(): void {
        AudioManager.instance.playBgAudio(ResAudio.AUDIO_BG_1);
        MV.add(GameUIData, "GameUIData");
        this._camera = this.nodeCamera.getComponent(Camera)!;
        GameEntity.gameUICamera = this.nodeUICamera;
        GameEntity.gameSceneCamera = this.nodeCamera;
        GameEntity.gameSceneNode = this.node;
        GameEntity.gameSceneNode.destroyAllChildren();
        GameEntity.isStart = false;
        GameEntity.enemyActive = false;
        this._effectController = new EffectController(this.node);
        this._goodsController = new GoodsController(this.node);
        this._enemyController = new EnemyController(this.node);
        this._mapController = new MapController(this.node, this.navMeshConfig);

        this.initUI();
        this.loadRes();
        this.initEvent();

    }
    /**
    * 初始化ui布局
    */
    private initUI(): void {
        GameUIData.GAME_STATE = 0;
        let uiPrefab: Prefab = ResLoad.instance.getPrefab(ResKey.GAME_UI)!;

        this._uiNode = instantiate(uiPrefab);
        console.log(this.uiRoot, this._uiNode)
        this.uiRoot.addChild(this._uiNode);
    }
    /**
     * 加载资源
     */
    private loadRes(): void {
        ResLoad.instance.preloadResources(2, this.loadResProgress.bind(this), this.loadResSuccess.bind(this));
    }
    private loadResProgress(progress: number): void {
        console.log(progress);
        GameUIData.LOADING_TIPS = "正在加载游戏资源..";
        GameUIData.LOADING_PROGRESS = Math.floor(progress * 100);
    }
    private loadResSuccess(): void {
        this.preHeating();
        this.initGameScene();
    }
    public initEvent(): void {
        EventManager.on(GameEvent.PLAYER_START_MOVE, this.playerStartMove, this);
        EventManager.on(GameEvent.PLAYER_END_MOVE, this.playerStopMove, this);
        EventManager.on(GameEvent.PLAYER_START_ROTATE, this.playerStarRotate, this);
        EventManager.on(GameEvent.PLAYER_END_ROTATE, this.playerStopRotate, this);
        EventManager.on(GameEvent.SHOOTING_START, this.playerStartFire, this);
        EventManager.on(GameEvent.SHOOTING_END, this.playerStopFire, this);
        EventManager.on(GameEvent.PLAYER_BE_ATTACK, this.playerBeAttack, this);
        EventManager.on(GameEvent.PLAYER_JUMP, this.playerJump, this);

        EventManager.on(GameEvent.PLAYER_POSITION_CHANGE, this.playerPositionChange, this);
        EventManager.on(GameEvent.PLAYER_DEATH, this.playerDeath, this);
        EventManager.on(GameEvent.GOODS_PICK_UP, this.goodsPickUp, this);

        EventManager.on(GameEvent.ENEMY_DIE, this.enemyDie, this);
        EventManager.on(GameEvent.ENEMY_DIE_REMOVE, this.enemyDieRemove, this);
        EventManager.on(GameEvent.FILL_BULLETS, this.fillBullets, this);
    }

    private preHeating() {
        //预热音频
        AudioManager.instance.gunOperation(ResAudio.AUDIO_SHOT, true);
        AudioManager.instance.gunOperation(ResAudio.AUDIO_NO_BULLRT, true);
        AudioManager.instance.playOneShotAudio(ResAudio.AUDIO_BULLET, true);
        AudioManager.instance.gunOperation(ResAudio.AUDIO_EQUIP_GUN, true);
        AudioManager.instance.playSound(ResAudio.AUDIO_GAS_TANK_BLAST, true);
        //预热开火特效
        this.effectController.preHeating();
    }
    private initGameScene(): void {
        this._mapController.init(this._levelName, this.initGameSceneProgress.bind(this), this.initGameSceneSuccess.bind(this))
    }
    private initGameSceneProgress(progress: number): void {
        GameUIData.LOADING_TIPS = "正在初始化游戏场景...";
        GameUIData.LOADING_PROGRESS = Math.floor(progress);
    }
    private initGameSceneSuccess(): void {
        this.enterGame();
    }

    public enterGame(): void {
        AudioManager.instance.playBgAudio(ResAudio.AUDIO_BG_0);
        this._enemyController.initEnemy(true);
        this.startGame();

        // this._textBaseCube = instantiate(ResLoad.instance.getPrefab("cube")!);
        // this.node.addChild(this._textBaseCube)
    }

    /**
     * 游戏开始
     */
    public startGame(): void {
        GameEntity.isStart = true;
        this._goodsController.initGoods();
        this.initPlayer();
        this._enemyController.setTargetPlayer(this._playerMrg);
        GameEntity.enemyActive = true;

        GameEntity.shotNum = 0;
        GameEntity.hitNum = 0;
        GameEntity.hitHeadNum = 0;
        //当前对局记录产生
        this._playGameId = StorageManager.instance.addHistory();


        GameUIData.WEAPON_ALL_NUM = GameEntity.gunBulletNum;
        GameEntity.gunMagazineResidueNum = GunData[GameEntity.gunId].bulletNum;
        GameUIData.WEAPON_MAGAZINE_RESIDUE_SIZE = GameEntity.gunMagazineResidueNum;
        GameUIData.SHOOTING_ANIM_STATE = 1;
        GameUIData.GAME_STATE = 1;

        GameUIData.ENEMY_ALL_NUM = this._enemyController.getEnemyNum();
        GameUIData.ENEMY_RESIDUE_NUM = this._enemyController.getEnemyNum();
    }
    public initPlayer(): void {
        let playerPrefab: Prefab = ResLoad.instance.getPrefab(ResKey.PLAYER)!;
        let playerNode: Node = instantiate(playerPrefab);

        GameEntity.gameSceneNode.addChild(playerNode);
        this._playerMrg = playerNode.getComponent(PlayerMgr)!;
        this._playerMrg.camera = GameEntity.gameSceneCamera;
        playerNode.position = this._playerPosition;
        playerNode.eulerAngles = this._playerEuler;
        this._playerMrg.init();
    }
    update(dt: number) {
        if (!GameEntity.isStart) return;
        this.openFireUpdate(dt);
        this.refreshGoodsState(dt);
        // this.refreshEnemyDeathState(dt);


        this._mapController.update(dt);
        this._enemyController.update(dt);

       
    }
    /**
     * 玩家移动方向
     * @param pos 相对遥感中心的位置
     */
    public playerStartMove(angle: number, isRun: boolean): void {
        if (!GameEntity.isStart) return;
        // console.log("开始移动===》",angle,isRun);
        this._playerMrg.startMove(angle, isRun)
    }
    public playerStopMove() {
        if (!GameEntity.isStart) return;
        // console.log("停止移动===》");
        this._playerMrg.stopMove();
    }
    public playerJump(): void {
        if (!GameEntity.isStart) return;
        this._playerMrg.startJump();
    }

    /**
     * 滑动屏幕进行旋转
     * @param x  x偏移量
     * @param y  y偏移量
     */
    public playerStarRotate(x: number, y: number) {
        if (!GameEntity.isStart) return;
        this._playerMrg.startRotate(x, y);

    }
    public playerStopRotate() {
        if (!GameEntity.isStart) return;
        this._playerMrg.endRotate();
    }

    /**
     * 玩家开火逻辑
     */
    public playerStartFire() {
        if (!GameEntity.isStart) return;
        if (new Date().getTime() - this._openFireIntervalDt < 0.1) {
            console.log("两次点击开火间隔小于当前武器的指定数值");
            return;
        }
        // if (this._openFireDt < 0.1) {
        //     return;
        // }
        if (GameEntity.gunMagazineResidueNum <= 0) {
            //子弹不足
            return;
        };
        this._isOpenFire = true;
        this._openFireStart = 0;
        this._openFireDeltaTime = 0;
    }
    public playerStopFire() {
        if (this._openFireStart > 0 && this._openFireStart < 0.1) {
            this.openFire();
        }
        GameUIData.SHOOTING_ANIM_STATE = 1;
        this._isOpenFire = false;
        this._openFireIntervalDt = Date.now();
    }
    private openFireUpdate(dt: number): void {
        if (!GameEntity.isStart) return;
        if (!this._isOpenFire) return;
        if (this._isFillBullets) return;
        if (this._openFireStart < 0.1) {
            //1s的抬手开始准备时间
            let canStart: boolean = this._playerMrg.startOpenFire();
            if (canStart) {
                this._openFireStart += dt;
                this._openFireDeltaTime = 0.1;
            }
        }
        if (this._openFireStart >= 0.1) {
            //开始进行射击
            this._openFireDeltaTime += dt;
            if (this._openFireDeltaTime >= 0.1) {
                //开火
                this._openFireDeltaTime = 0;
                this.openFire();
            }
        }
    }
    private openFire(): void {
        if (GameEntity.gunMagazineResidueNum <= 0) return;

        GameEntity.shotNum++;
        this._playerMrg.openFire();
        //杨宗元 暂时取消每帧播放音效
        AudioManager.instance.gunOperation(ResAudio.AUDIO_SHOT);
        AudioManager.instance.playOneShotAudio(ResAudio.AUDIO_BULLET);
        this.getOpenFireRay(this._tempRay);

        let isHitEnemy: boolean = this.attackRayCheck(GameEntity.gunId, this._tempRay);
        if (isHitEnemy) {
            GameUIData.SHOOTING_ANIM_STATE = 3;
        } else {
            GameUIData.SHOOTING_ANIM_STATE = 2;
        }

        //子弹数量减少
        GameEntity.gunMagazineResidueNum--;
        GameUIData.WEAPON_MAGAZINE_RESIDUE_SIZE = GameEntity.gunMagazineResidueNum;
        if (GameEntity.gunMagazineResidueNum <= 0) {
            this.playerStopFire();
            //自动填充子弹
            this.fillBullets();
        }
    }
    /**
     * 获取开火射线
     */
    private getOpenFireRay(ray: geometry.Ray): void {
        //创建射线
        this._tempVec0.x = 0;
        this._tempVec0.y = 0;
        this._tempVec0.z = 0;
        //从摄像机往屏幕中心点发出一个射线
        GameEntity.gameUICamera.getComponent(Camera)?.worldToScreen(GameEntity.shootingAimworldPos, this._tempVec0)
        GameEntity.gameSceneCamera.getComponent(Camera)?.screenPointToRay(this._tempVec0.x, this._tempVec0.y, ray);
        // //进行射线调整
        // //起点
        // this._tempVec0 = this._playerMrg.getMuzzleWorldPos();
        // //终点
        // ray.computeHit(this._tempVec1, 1000);
        // 


    }
    /**
     * 攻击射线检测
     * @param outRay 
     */
    private attackRayCheck(gunId: number, outRay: geometry.Ray): boolean {
        outRay.computeHit(this._tempVec1, 5)
        this._tempVec0 = this._playerMrg.getMuzzleWorldPos();
        geometry.Ray.fromPoints(this._tempRayFireBallistic, this._tempVec0, this._tempVec1);
        this._tempRayFireBallistic.computeHit(this._tempVec0, -3);


        this._effectController.addfireBallistic(this._tempVec0, this._tempVec1);
        let physicsRayResult: boolean = PhysicsSystem.instance.raycastClosest(outRay, EColliderMask.ATTACK_RAY);
        if (physicsRayResult) {
            let result: PhysicsRayResult = PhysicsSystem.instance.raycastClosestResult;
            let collider: Collider = result.collider
            let node: Node = collider.node;
            let colliderNode: ColliderNode = node.getComponent(ColliderNode)!;
            if (colliderNode) {
                let targetNode: Node = colliderNode.target!
                if (colliderNode.type === EColliderType.STATIC) {
                    this.hitStaticBuild(result.hitPoint, result.hitNormal);
                    return false;
                } else if (colliderNode.type === EColliderType.ENEMY) {
                    this.hitEnemy(gunId, node.name, targetNode, result.hitPoint, result.hitNormal);
                    return true;
                } else if (colliderNode.type === EColliderType.GOODS) {
                    this.hitGoodsCanBlast(targetNode, result.hitPoint, result.hitNormal);
                    return false;
                }
            }
            return false;
        }
        return false;
    }
    /**
     * 击中了静态的建筑物
     */
    private hitStaticBuild(wPos: Vec3, wNormal: Vec3): void {
        this._effectController.hitBuildEffect(wPos, wNormal);
    }
    /**
     * 击中了敌人
     * @param part  击中的部位
     * @param targetNode  丧尸的root节点
     * @param wPos     击中的世界坐标
     * @param wNormal   击中的法线
     */
    private hitEnemy(gunId: number, part: string, targetNode: Node, wPos: Vec3, wNormal: Vec3): void {
        if (!targetNode) return;
        let enemy: EnemyBase = targetNode.getComponent(EnemyBase)!;
        let harm: number = GunData[gunId].harm;
        //身体部位不同，产生的伤害值是不一样的，头部双倍暴击

        let isActive: boolean = enemy.getActive()
        if (!isActive) return;

        GameEntity.hitNum++;
        if (part === "head") {
            GameEntity.hitHeadNum++;
            harm *= 2.0;
        }
        enemy.enemyBeAttack(harm, ResAudio.AUDIO_ZOMBIE_SCREAM);
        if (enemy.hitEffect === ResEffect.EF_HIT_ENEMY) {
            this._effectController.hitEnemyEffect(wPos, wNormal);
        } else if (enemy.hitEffect === ResEffect.EF_HIT_BUILD) {
            //标靶
            this._effectController.hitBuildEffectToBody(targetNode, wPos, wNormal);
        }
    }
    /**
     * 击中了可爆炸物品
     */
    private hitGoodsCanBlast(targetNode: Node, wPos: Vec3, wNormal: Vec3): void {
        this._effectController.hitBuildEffect(wPos, wNormal);
        if (!targetNode) return;
        let goodsComp: GoodsBase = targetNode.getComponent(GoodsBase)!;
        goodsComp.beAttack(1);
    }
    public fillBullets(): void {
        if (this._isFillBullets) return;
        if (GameEntity.gunBulletNum <= 0) {
            console.log("没有子弹了");
            return;
        }
        if (GameEntity.gunMagazineResidueNum >= GunData[GameEntity.gunId].bulletNum) {
            console.log("没有子弹了");
            return;
        }

        GameUIData.SHOOTING_ANIM_STATE = 1;
        this._openFireStart = 0;
        this._openFireDeltaTime = 0;
        this._isFillBullets = true;


        let neenBullet: number = GunData[GameEntity.gunId].bulletNum - GameEntity.gunMagazineResidueNum;
        if (GameEntity.gunBulletNum >= neenBullet) {
            GameEntity.gunMagazineResidueNum = GunData[GameEntity.gunId].bulletNum
            GameEntity.gunBulletNum -= neenBullet;
        } else {
            GameEntity.gunMagazineResidueNum = GameEntity.gunBulletNum;
            GameEntity.gunBulletNum = 0;
        }
        this.scheduleOnce(this.fillBulletsSchedule, 3.0);
        this._playerMrg.fillBullet(true);
    }
    private fillBulletsSchedule(): void {
        GameUIData.WEAPON_ALL_NUM = GameEntity.gunBulletNum;
        GameUIData.WEAPON_MAGAZINE_RESIDUE_SIZE = GameEntity.gunMagazineResidueNum;
        this._isFillBullets = false;
        this._playerMrg.fillBullet(false);
    }
    /**
     * 玩家位置发生了变化
     * @param x 
     * @param y 
     * @param z 
     */
    private playerPositionChange(x: number, y: number, z: number): void {
        //检测与是否有可捡起弹药
    }
    /**
     * 检测可拾取的物品
     */
    private refreshGoodsState(dt: number): void {
        let keys: number[] = [];
        this._goodsController.goodsMap.forEach((goods: GoodsBase, goodsIndex: number) => {
            keys.push(goodsIndex);
            let isInView: boolean = MathTool.IsInView(this.nodeCamera, goods.node.getWorldPosition());
            if (isInView) {
                this._tempVec0.x = goods.position.x;
                this._tempVec0.z = goods.position.z;
                this._tempVec0.y = this._playerMrg.position.y;
                goods.distance = Vec3.distance(this._tempVec0, this._playerMrg.position);
            } else {
                goods.distance = 999;
            }


        });
        //从小到大排序
        for (let i = 0; i < keys.length - 1; i++) {
            for (let j = 0; j < keys.length - i - 1; j++) {
                if (this._goodsController.getGoods(keys[j]).distance > this._goodsController.getGoods(keys[j + 1]).distance) {
                    let tem = keys[j];
                    keys[j] = keys[j + 1];
                    keys[j + 1] = tem;
                }
            }
        }
        GameUIData.GOODS_NEARLY_PICKUP_INDEX = -1;
        let goods: GoodsBase = null!;
        for (let i = 0; i < keys.length; i++) {
            goods = this._goodsController.getGoods(keys[i]);
            if (goods.distance < 15) {
                this._camera.convertToUINode(goods.node.getWorldPosition(), this.uiRoot, this._tempVec0);
                this.refreshGoodsNearlyState(i, goods.goodsIndex, goods.goodsId, this._tempVec0.x, this._tempVec0.y);
                if (goods.distance < 1.5) {
                    GameUIData.GOODS_NEARLY_PICKUP_INDEX = goods.goodsIndex;
                }
            } else {
                this.refreshGoodsNearlyState(i, -1, -1, 0, 0);
            }
        }
        if (keys.length < 5) {
            for (let i = keys.length; i < 6; i++) {
                this.refreshGoodsNearlyState(i, -1, -1, 0, 0);
            }
        }
    }
    private refreshGoodsNearlyState(index: number, goodsIndex: number, goodsId: number, x: number, y: number): void {
        switch (index) {
            case 0:
                GameUIData.GOODS_NEARLY_ONE_ID = goodsId;
                GameUIData.GOODS_NEARLY_ONE_X = x;
                GameUIData.GOODS_NEARLY_ONE_Y = y;
                GameUIData.GOODS_NEARLY_ONE_INDEX = goodsIndex;
                break;
            case 1:
                GameUIData.GOODS_NEARLY_TWO_ID = goodsId;
                GameUIData.GOODS_NEARLY_TWO_X = x;
                GameUIData.GOODS_NEARLY_TWO_Y = y;
                GameUIData.GOODS_NEARLY_TWO_INDEX = goodsIndex;
                break;
            case 2:
                GameUIData.GOODS_NEARLY_THREEN_ID = goodsId;
                GameUIData.GOODS_NEARLY_THREEN_X = x;
                GameUIData.GOODS_NEARLY_THREEN_Y = y;
                GameUIData.GOODS_NEARLY_THREEN_INDEX = goodsIndex;
                break;
            case 3:
                GameUIData.GOODS_NEARLY_FOUR_ID = goodsId;
                GameUIData.GOODS_NEARLY_FOUR_X = x;
                GameUIData.GOODS_NEARLY_FOUR_Y = y;
                GameUIData.GOODS_NEARLY_FOUR_INDEX = goodsIndex;
                break;
            case 4:
                GameUIData.GOODS_NEARLY_FIVE_ID = goodsId;
                GameUIData.GOODS_NEARLY_FIVE_X = x;
                GameUIData.GOODS_NEARLY_FIVE_Y = y;
                GameUIData.GOODS_NEARLY_FIVE_INDEX = goodsIndex;
                break;
            case 5:
                GameUIData.GOODS_NEARLY_SIX_ID = goodsId;
                GameUIData.GOODS_NEARLY_SIX_X = x;
                GameUIData.GOODS_NEARLY_SIX_Y = y;
                GameUIData.GOODS_NEARLY_SIX_INDEX = goodsIndex;
                break;
        }
    }

    private goodsPickUp(goodsIndex: number): void {
        let goodsBase: GoodsBase = this._goodsController.goodsPickUp(goodsIndex)!;
        console.log("捡起：", goodsBase);
        if (goodsBase) {
            if (goodsBase.goodsId == EGoodsId.BULLET_556mm) {
                GameEntity.gunBulletNum += goodsBase.num;
                GameUIData.WEAPON_ALL_NUM = GameEntity.gunBulletNum;
            }
        }
    }
    /**
     * 敌人死亡
     * 
     */
    private enemyDie(index: number, x: number, y: number, z: number): void {
        // GameUIData.ENEMY_RESIDUE_NUM--;
        //掉落物品
        this._goodsController.goodsDropOut(1002, new Vec3(x, y, z));
        // this._effectController.killTipsEffect(this._uiNode, 1.5);
        AudioManager.instance.playSound(ResAudio.AUDIO_KILL_TIPS);

        this._tempVec0 = this._enemyController.getEnemyPostion(index);
        GameUIData.ENEMY_DEATH_SIGN = this._tempVec0.x + "," + this._tempVec0.y + "," + this._tempVec0.z;

    }
    /**
     * 移除死亡后的敌人
     */
    public enemyDieRemove(index: number): void {
        //移除当前敌人 从敌人集合中
        this._enemyController.removeEnemy(index);
        GameUIData.ENEMY_RESIDUE_NUM = this._enemyController.getEnemyNum();
        if (GameUIData.ENEMY_RESIDUE_NUM <= 0) {
            this.gamePass();
        }
    }

    /**
     * 玩家被攻击
     */
    private playerBeAttack(): void {
        if (GameEntity.isStart === false) return;
        let isDeath: boolean = this._playerMrg.beAttack();
        if (isDeath) return;
        GameUIData.PLAYER_BE_ATTACK = 1;
    }
    /**
     * 游戏失败  玩家死亡
     */
    public playerDeath(): void {
        this.gameSettlement(0);
    }
    /**
     * 游戏成功通过
     */
    public gamePass(): void {
        this.gameSettlement(1);
    }
    /**
     * 游戏结算
     */
    private gameSettlement(passState: number): void {

        let hitRatio: number = (GameEntity.hitNum === 0 || GameEntity.shotNum === 0) ? 0 : Math.floor(GameEntity.hitNum / GameEntity.shotNum * 100);
        let hitHeadRatio: number = (GameEntity.hitHeadNum === 0 || GameEntity.hitNum === 0) ? 0 : Math.floor(GameEntity.hitHeadNum / GameEntity.hitNum * 100);
        let time: number = Date.now() - this._playGameId;

        GameUIData.GAME_TIME = time;
        GameUIData.GAME_HIT_RATIO = hitRatio;
        GameUIData.GAME_HIT_HEAD_RATIO = hitHeadRatio;
        console.log(GameEntity.hitNum, GameEntity.shotNum, GameEntity.hitHeadNum, this._playGameId, hitRatio, hitHeadRatio, time, passState);
        StorageManager.instance.updateHistory(this._playGameId, hitRatio, hitHeadRatio, time, passState);
        StorageManager.instance.saveData();
        console.log("结算数据：", GameEntity.hitNum, GameEntity.hitHeadNum, time);
        GameUIData.Game_PASS_STATE = passState;
        GameEntity.isStart = false;
        this._enemyController.cleanAllEnemyTargetPlayer();
        GameUIData.PLAYER_EXIT_STATE = 7;
        this.schedule(this.gameSettlementSchedule, 1.0)
    }
    private gameSettlementSchedule(): void {
        GameUIData.PLAYER_EXIT_STATE--;
        if (GameUIData.PLAYER_EXIT_STATE <= 0) {
            this.unschedule(this.gameSettlementSchedule);
            this.gameEnd();
            return;
        }
    }


    public gameEnd(): void {

        GameUIData.GAME_STATE = 3;

        EventManager.off(GameEvent.PLAYER_START_MOVE, this.playerStartMove, this);
        EventManager.off(GameEvent.PLAYER_END_MOVE, this.playerStopMove, this);
        EventManager.off(GameEvent.PLAYER_START_ROTATE, this.playerStarRotate, this);
        EventManager.off(GameEvent.PLAYER_END_ROTATE, this.playerStopRotate, this);
        EventManager.off(GameEvent.SHOOTING_START, this.playerStartFire, this);
        EventManager.off(GameEvent.SHOOTING_END, this.playerStopFire, this);
        EventManager.off(GameEvent.PLAYER_BE_ATTACK, this.playerBeAttack, this);
        EventManager.off(GameEvent.PLAYER_JUMP, this.playerJump, this);


        EventManager.off(GameEvent.PLAYER_POSITION_CHANGE, this.playerPositionChange, this);
        EventManager.off(GameEvent.PLAYER_DEATH, this.playerDeath, this);
        EventManager.off(GameEvent.GOODS_PICK_UP, this.goodsPickUp, this);

        EventManager.off(GameEvent.ENEMY_DIE, this.enemyDie, this);
        EventManager.off(GameEvent.ENEMY_DIE_REMOVE, this.enemyDieRemove, this);
        EventManager.off(GameEvent.FILL_BULLETS, this.fillBullets, this);

        //删除敌人
        this._enemyController.cleanAllEnemy();
        this._enemyController = null!;

        //物品
        this._goodsController.cleanAll();
        this._goodsController = null!;

        this._effectController.cleanAll();
        this._effectController = null!;

        //地图数据

        this._mapController.cleanAll();
        this._mapController = null!;

        this._playerMrg.clean();
        this._playerMrg = null!;

        GameEntity.isStart = false;
        GameEntity.gameUiNode = null!;
        GameEntity.gameSceneNode = null!;


        MV.remove("GameUIData");
        GameUIData.GAME_STATE = 0;
        this.node.destroy();
        director.loadScene("main");
    }


    onDisable(): void {

    }
    onDestroy() {
        console.log("3d 场景销毁");
    }


}
