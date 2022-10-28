
import { _decorator, Node, Vec3 } from 'cc';
import { NavMeshCorwd, NavMeshMgr } from '../../lib/NavMesh/NavMesh';

const { ccclass, property } = _decorator;
/**
 * 静态实体类
 * game 静态属性
 */
@ccclass('GameEntity')
export class GameEntity {
  static uuid: string = '1234567';
  /**
   * ui节点
   */
  static gameUiNode: Node = null!;
  /**
   * 3d场景节点
   */
  static gameSceneNode: Node = null!;
  /**
   * 场景摄像机
   */
  static gameSceneCamera: Node = null!;
  /**
   * 小地图摄像机
   */
  static gameSmallMapCamera: Node = null!;
  /**
   * ui摄像机
   */
  static gameUICamera: Node = null!;
  /**
   * 关卡场景
   */
  static levelScene: Node = null!;
  /**
   * 射击准心的世界坐标
   */
  static shootingAimworldPos: Vec3 = null!;

  /**
   * 游戏是否开始
   */
  static isStart: boolean = false;
  /**
  * 激活所有敌人
  */
  static enemyActive: boolean = false;

  static navMeshMrg: NavMeshMgr = null!;
  static navMeshCorwd: NavMeshCorwd = null!;

  /**
  * 地图相关数据 包括敌人，物品之类的
  */
  static mapData: any = null!;

  /**
   * 当前装备武器id
   */
  static gunId: number = 200;
  static gunBulletNum: number = 0;
  static gunMagazineResidueNum: number = 0;

  /**
   * 开枪射击次数
   */
  static shotNum:number=0;
  /**
   * 击中敌人次数
   */
  static hitNum:number=0;
  /**
   * 击中敌人头部次数
   */
  static hitHeadNum:number=0;
}
