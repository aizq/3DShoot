
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 僵尸种类
 */
export enum EnemyType {
    /**
     * 光头丧尸
     */
    ZPMBIE_BALD = 0,
    /**
     * 鬼子-胸前插🗡
     */
    ZPMBIE_DEVILS = 1,
}
/**
 * 敌人动作
 */
export enum EnemyAnimName {
    /**
     * 站立
     */
    IDLE = "idle",
    /**
     * 走
     */
    WALK = "walk",
    /**
     * 跑
     */
    RUN = "run",
    /**
     * 攻击
     */
    ATTACK = "attack",
    /**
     * 怒吼
     */
    SCREAM = "scream",
    /**
     * 死亡
     */
    DEATH = "death",
}
/**
 * 敌人状态
 */
export enum EnemyState {
    /**
     * 激活
     */
    ENABLE = 0,
    /**
     * 巡视
     */
    WALK = 1,
    /**
     * 追踪
     */
    RUN = 2,
    /**
     * 结束
     */
    DISENABLE = 3,
}
/**
 * 移动状态
 */
export enum EnemyMoveType {
    /**
     * 不动
     */
    IDLE = 0,
    /**
     * 巡视
     */
    WALK = 1,
    /**
     * 追踪
     */
    RUN = 2,
    /**
     * 攻击
     */
    ATTACK = 3,
    /**
     * 
     */
    SCREAM = 4,
}
