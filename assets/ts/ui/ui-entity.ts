import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;


export enum PanelName {
    /**
     * 提示弹窗
     */
    TIPS = "tips-panel",
    /**
     * 游戏介绍弹窗
     */
    INTRODUCE = "introduce-panel",
    /**
     * 背包
     */
    BACKPACK = "back-pack-panel",
    /**
     * 引导
     */
    GUIDE = "guide-panel",
    /**
     * 进入遮罩弹窗
     */
    MASK = "mask-panel",
}
export const GameUIData = {

    /**
     * 游戏状态
     * 0：加载  1：开始游戏   2:游戏结束  3：游戏退出
     */
    GAME_STATE: 0,
    /**
     * 有戏通过状态
     * 0:失败  1：成功
     */
    Game_PASS_STATE: 0,
    /**
     * 加载进度
     */
    LOADING_PROGRESS: 0,
    LOADING_TIPS: "",
    /**
     * 射击准心状态
     * 0 不显示  1 默认   2开火  3 击中丧尸
     */
    SHOOTING_ANIM_STATE: 0,

    /**
     * 武器类型
     * 0 不显示  1：手枪  2：步枪
     */
    WEAPON_TYPE: 0,
    /**
     * 弹容量
     */
    WEAPON_ALL_NUM: 0,
    /**
     * 弹夹剩余数量
     */
    WEAPON_MAGAZINE_RESIDUE_SIZE: 0,

    /**
     * 玩家生命值
     */
    PLAYER_LIFE: 0,
    PLAYER_RESIDUE_LIFE: 0,
    /**
     * 玩家被攻击  0：默认  1：被攻击
     */
    PLAYER_BE_ATTACK: 0,
    /**
     * 玩家死亡
     * 0 默认  1：倒计时1秒  2：倒计时2秒   3：倒计时3秒   5：出现
     */
    PLAYER_EXIT_STATE: 0,

    /**
     * 敌人总数量
     */
    ENEMY_ALL_NUM: 0,
    ENEMY_RESIDUE_NUM: 0,

    GOODS_NEARLY_PICKUP_INDEX: -1,
    /**
     * 附近物品1
     */
    GOODS_NEARLY_ONE_INDEX: -1,
    GOODS_NEARLY_ONE_ID: -1,
    GOODS_NEARLY_ONE_X: -1,
    GOODS_NEARLY_ONE_Y: -1,
    /**
     * 附近物品2
     */
    GOODS_NEARLY_TWO_INDEX: -1,
    GOODS_NEARLY_TWO_ID: -1,
    GOODS_NEARLY_TWO_X: -1,
    GOODS_NEARLY_TWO_Y: -1,
    /**
    * 附近物品3
    */
    GOODS_NEARLY_THREEN_INDEX: -1,
    GOODS_NEARLY_THREEN_ID: -1,
    GOODS_NEARLY_THREEN_X: -1,
    GOODS_NEARLY_THREEN_Y: -1,
    /**
    * 附近物品4
    */
    GOODS_NEARLY_FOUR_INDEX: -1,
    GOODS_NEARLY_FOUR_ID: -1,
    GOODS_NEARLY_FOUR_X: -1,
    GOODS_NEARLY_FOUR_Y: -1,
    /**
    * 附近物品5
    */
    GOODS_NEARLY_FIVE_INDEX: -1,
    GOODS_NEARLY_FIVE_ID: -1,
    GOODS_NEARLY_FIVE_X: -1,
    GOODS_NEARLY_FIVE_Y: -1,
    /**
    * 附近物品6
    */
    GOODS_NEARLY_SIX_INDEX: -1,
    GOODS_NEARLY_SIX_ID: -1,
    GOODS_NEARLY_SIX_X: -1,
    GOODS_NEARLY_SIX_Y: -1,

    /**
     * 对局时间
     */
    GAME_TIME: 0,
    /**
     * 命中率
     */
    GAME_HIT_RATIO: 0,
    /**
     * 暴击率
     */
    GAME_HIT_HEAD_RATIO: 0,

    /**
     * 敌人死亡后在界面上的标记点
     */
    ENEMY_DEATH_SIGN: "",

};

export const MainUIData = {
    
    /**
     * 主界面玩家的x位置
     */
     MAIN_PLAYER_X: 0,
}
