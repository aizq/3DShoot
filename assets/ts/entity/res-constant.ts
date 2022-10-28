
/**
 * 特效资源
 */
export enum ResEffect {
  /**
   * 下雪
   */
  EF_SNOW = "snow-effect",
  /**
    * 动效--击中环境
    */
  EF_HIT_BUILD = "hit-build-effect",
  /**
  * 动效-- 开火
  */
  EF_OPEN_FIRE = "open-fire-effect",
  /**
  * 动效--击中敌人
  */
  EF_HIT_ENEMY = "hit-enemy-effect",
  /**
  * 动效-- 玩家被攻击受伤
  */
  EF_PLAYER_HARM = "player-harm",
  /**
   * 击杀特效
   */
  EF_KILL_TIPS = "kill-tips-effect",
  /**
  * 手雷爆炸效果
  */
  EF_GRENADES_BLAST = "grenades-blast-effect",
  /**
  * 煤气罐爆炸效果
  */
  EF_GAS_TANK_BLAST = "gas-tank-blast-effect",
  /**
   * 开火弹道
   */
   EF_FIRE_BALLISTIC="fire-ballistic-effect",
}
/**
 * 音效资源
 */
export enum ResAudio {
  /**
     * 背景音乐0
     */
  AUDIO_BG_0 = "bg-0",
  /**
    * 背景音乐1
    */
  AUDIO_BG_1 = "bg-1",
  /**
  * 音效-- 装备武器
  */
  AUDIO_EQUIP_GUN = "equip-gun",
  /**
  * 音效-- 没有子弹
  */
  AUDIO_NO_BULLRT = "no-bullet",
  /**
  * 音效-- 玩家跑动
  */
  AUDIO_PLAYER_RUN = "player-run",
  /**
  * 音效-- 玩家走动
  */
  AUDIO_PLAYER_WALK = "player-walk",
  //子弹蹦出的声音
  /**
  * 音效-- 射击 子弹蹦出
  */
  AUDIO_BULLET = "bullet",
  //子弹击中
  /**
  * 音效-- 射击 子弹射中
  */
  AUDIO_BULLET_HIT = "bullet-hit",
  //手雷
  /**
  * 音效--  手雷 拉栓 打开
  */
  AUDIO_GRENADES_OPEN = "grenade-open",
  /**
  * 音效--  手雷 扔出 碰撞
  */
  AUDIO_GRENADES_COLLIDER = "grenade-collider",
  /**
  * 音效--  手雷 扔出 碰撞
  */
  AUDIO_GRENADES_BLAST = "grenade-blast",
  /**
   * 煤气罐爆炸声
   */
  AUDIO_GAS_TANK_BLAST = "gas-tank-blast",
  //扔的音效
  /**
   * 音效--  投掷物 扔出
   */
  AUDIO_THROW = "throw",
  /**
   * 扫描音效
   */
  AUDIO_SCAN = "scan",
  /**
   * 丧尸嘶吼的生意
   */
  AUDIO_ZOMBIE_SCREAM = "zombie_scream",
  /**
   * 门 关闭/打开音效
   */
  AUDIO_DOOR_OPERATE = "door_operate",
  /**
   * 提示弹窗展示音效
   */
  AUDIO_TIPS_SHOW = "tips-show",
  /**
   * 游戏开始音效
   */
  AUDIO_START_GAME = "start-game",
  /**
   * 加载音效
   */
  AUDIO_LOADING = "loading",
  /**
   * 键盘输入声音
   */
  KEY_INPUT = "keyboard-input",
  /**
   * 射击
   */
  AUDIO_SHOT = "shot",
  /**
   * 玩家被攻击
   */
  AUDIO_PLAYER_BE_ATTACK = "be-attack",
  /**
   * 击杀提示
   */
  AUDIO_KILL_TIPS = "kill-tips",
  /**
   * button
   */
  AUDIO_BUTTON = "button-0",
}
/**
 * 敌人资源
 */
export enum ResEnemy {
  /**
    * 光头
    */
  ENEMY_ZOMBIE_BALD = "zombie_bald",
  /**
   * 鬼子
   */
  ENEMY_ZOMBIE_DECVILS = "zombie_devils",
  /**
   * 基地的目标靶场
   */
  ENEMY_SHOOT_TARGETS = "shoot_targets",
}
/**
 * 物品
 */
export enum ResGoods {
  /**
   * 投掷物--  手雷
   */
  NAMMUNITION_GRENADES = "grenades",

  /**
   * 煤气罐
   */
  GAS_TANK = "gas-tank",

  /**
   * 9mm 子弹
   */
  BULLET_NICE_MM = "bullet-9mm",
  /**
  * 762mm 子弹
  */
  BULLET_SST_MM = "bullet-762mm",
  /**
   * 556 子弹
   */
  BULLET_FFS_MM = "bullet-556mm",
}

export enum ResKey {
  /**
   * 游戏局内操作ui
   */
  GAME_UI = "game-ui",
  /**
   * 人物
   */
  PLAYER = "player_0",
  /**
   * 扫描机器人
   */
  SCAN_ROBOT = "scan_robot",

}
export enum ResUI {
  /**
   * 游戏局内操作ui
   */
  GAME_UI = "game-ui",
  /**
   * 玩家操作界面
   */
  GAME_UI_OPERATE = "game-ui-operate",
  /**
   * 虚拟摇杆
   */
  GAME_EASY_TOUCH = "game-easy-touch",
  /**
   * 对战界面
   */
  GAME_UI_BATTLE = "game-ui-battle",
  /**
  * 物品标识
  */
  GAME_UI_GOODS_SIGN = "game-ui-goods-sign",
  /**
  * 敌人死亡标识
  */
  GAME_UI_ENEMY_DEATH_SIGN = "game-ui-enemy-death-sign",

  /**
   * 敌人相关
   */
  GAME_UI_ENEMY = "game-ui-enemy",
  GAME_UI_GOODS = "game-ui-goods",
  /**
   * 玩家相关界面
   */
   GAME_UI_PLAYER="game-ui-player",


  /**
   * 历史战绩界面
   */
  MAIN_UI_HISTORY_PANEL = "main-ui-history-panel",
}

export enum ResAnim {

}
export enum ResGun {
  /**
   * 手枪
   */
  GUN_PISTOL = "pistol_0",
  /**
   * m4 步枪
   */
  GUN_RIFLE_M4 = "rifle_m4",
}