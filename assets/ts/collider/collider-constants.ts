import { Enum } from "cc";

/**
 * 游戏局内物理组件的碰撞检测分组和掩码
 */
export enum EColliderGroup {
    //默认是1 都检查  0001=1
    DEFAULT = 1 << 0,
    /**
     * 所有的静态物体（障碍物，地面，建筑物等）   0010=2
     */
    STATIC = 1 << 1,
    /**
     * 玩家控制胶囊体  0100 =4
     */
    PLAYER_CHARACTRE_CONTROLLER = 1 << 2,
    /**
     * 敌人身上的碰撞盒 1000 =8
     */
    ENEMY = 1 << 3,
    /**
     * 敌人武器 10000  ==16
     */
    ENEMY_WEAPON = 1 << 4,
    /**
    * 投掷物
    */
    NAMMUNITION = 1 << 2,
    /**
     * 障碍物  ☞产生碰撞
     */
    OBSTACLE = 1 << 5,
    /**
     * 敌人包围盒  
     */
    ENEMY_BOX = 1 << 6,

}
export enum EColliderMask {
    /**
     * 场景mask
     */
    STATIC = EColliderGroup.PLAYER_CHARACTRE_CONTROLLER,
    /**
     * 玩家控制器 mask  检测与所有静态物体的碰撞 
     */
    PLAYER_CHARACTRE_CONTROLLER = EColliderGroup.STATIC + EColliderGroup.ENEMY_WEAPON+ + EColliderGroup.ENEMY_BOX,
    /**
     * 攻击射线检测 检测敌人与static 
     */
    ATTACK_RAY = EColliderGroup.STATIC + EColliderGroup.ENEMY,
    /**
     * 敌人身体不予所有发生检测
     */
    ENEMY = 0,
    /**
     * 敌人武器 与玩家控制器碰撞
     */
    ENEMY_WEAPON = EColliderGroup.PLAYER_CHARACTRE_CONTROLLER,
    /**
     * 投掷物
     */
    NAMMUNITION = EColliderGroup.STATIC,
    /**
     * 视线-射线
     */
    SIGHT_RAY = EColliderGroup.STATIC,

    /**
     * 摄像机
     */
    CAMERA = EColliderGroup.STATIC,

    /**
     * 敌人包围盒   与玩家发生碰撞
     */
    ENEMY_BOX = EColliderGroup.PLAYER_CHARACTRE_CONTROLLER,

}
/**
 * 可以受到玩家攻击的collider的类型
 */
export enum EColliderType {
    /**
     * 静态建筑物
     */
    STATIC = 0,
    /**
     * 敌人
     */
    ENEMY = 1,
    /**
     * 物品
     */
    GOODS = 2,
    /**
    * 障碍物  ☞产生碰撞
    */
    OBSTACLE = 3,
    /**
     * 敌人包围盒子
     */
    ENEMY_BOX = 4,
}
Enum(EColliderType)