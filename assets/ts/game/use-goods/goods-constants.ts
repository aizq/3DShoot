
export enum EGoodsId {
    NO = 0,
    /**
     * 手雷
     */
    GRENADES = 1004,
    /**
     * 煤气罐
     */
    GAS_TANK = 1003,
    /**
     * 九毫米子弹
     */
    BULLET_9mm = 1000,
    /**
     * 7.62子弹
     */
    BULLET_762mm = 1001,
    /**
     * 5.56子弹
     */
    BULLET_556mm = 1002,
}


/**
 * 煤气罐属性
 */
export enum EGasTankProProperty {
    ID = EGoodsId.GAS_TANK,
    /**
     * 生命值
     */
    LIFE = 3,
    /**
     * 伤害
     */
    HARM = 3,
    /**
     * 爆炸范围 半径
     */
    BLAST_ANGLE = 3,
}