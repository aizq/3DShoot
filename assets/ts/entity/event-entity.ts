/**
 * 事件定义
 */
export enum GameEvent {
    /**
     * 开始移动
     */
    PLAYER_START_MOVE = "player-start-move",
    PLAYER_END_MOVE = "player-end-move",
    PLAYER_START_ROTATE = "player-start-rotate",
    PLAYER_END_ROTATE = "player-end-rotate",
    PLAYER_JUMP = "player-jump",
    /**
     * 开始射击
     */
    SHOOTING_START = 'shooting-start',
    SHOOTING_END = 'shooting-end',

    /**
     * 玩家被攻击
     */
    PLAYER_BE_ATTACK = "player-be-attack",
    /**
     * 玩家死亡
     */
    PLAYER_DEATH = "player-death",
    /**
     * 玩家位置改变事件
     */
    PLAYER_POSITION_CHANGE = "player-position-change",
    /**
     * 捡起物品
     */
    GOODS_PICK_UP = "goods-pick-up",

    // /**
    //  * 
    //  */
    // INIT_GAME = "init-game",
    // /**
    //  * 开始游戏
    //  */
    // START_GAME = 'start-game',
    // /**
    //  * 击中敌人
    //  */
    // HIT_ENEMY = "hit-enemy",
    // /**
    //  * 添加敌人
    //  */
    // ENEMY_ADD = "enemy-add",
    /**
     * 敌人死亡
     */
    ENEMY_DIE = 'enemy-die',
    /**
     * 敌人死亡 移除屏幕
     */
    ENEMY_DIE_REMOVE = "enemy-die-remove",
    /**
     * 填充子弹
     */
    FILL_BULLETS = "fill-bullets",

    // /**
    //  * 敌人转向
    //  */
    // ENEMY_TURN_TO = 'enemy-turn-to',
    // /**
    //  * 敌人状态发生变化  状态和位置
    //  */
    // ENEMY_STATUS_CHANGE = "enemy-status-change",
    // /**
    //  * 可爆炸物品爆炸
    //  */
    // EXPLOSIVE_EXPLOSIONS = 'explosive-explosions',


    // /**
    //  * 背包功能展示
    //  */
    // SHOW_BACKPACK_UI = "show-backpack-ui",
    // /**
    //  * 背包功能隐藏
    //  */
    // HIDE_BACKPACK_UI = "hide-backpack-ui",
    // /**
    // * 刷新背包数据
    // */
    // REFRESH_BACKPACK = 'refresh-backpack',
    // /**
    //  *捡起地面物品放到背包 
    //  */
    // PICK_UP_GOODS = "pick-up-goods",
    // /**
    //  * 使用物品
    //  */
    // USE_GOODS = "use-goods",
}