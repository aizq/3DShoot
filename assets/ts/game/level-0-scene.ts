
import { _decorator, Component, Node, Prefab, instantiate, Vec3, MeshRenderer, utils, gfx, Animation, resources, TextureCube, director, Scene, Color } from 'cc';

import { MapLevel0Data } from '../config/TMapLevel0';
import { GameBase } from './game-base';
import { GameEntity } from './game-entity';

const { ccclass, property, type } = _decorator;

/**
 * Predefined variables
 * Name = GameMistyTownletMgr
 * DateTime = Mon Nov 29 2021 15:07:45 GMT+0800 (中国标准时间)
 * Author = carlosyzy
 * 迷雾小镇场景控制
 *
 */

@ccclass('Level0Scene')
export class Level0Scene extends GameBase {
    
    onLoad () {
        //初始化数据
        GameEntity.isStart = false;
    }

    /**
   * 初始化
   */
    public initGame (): void {

        this.levelName = "level-0";
        this.navMeshConfig = {
            cs: 0.06,
            ch: 0.1,
            tileSize: 20,
            borderSize: 1,
            walkableSlopeAngle: 60,
            walkableHeight: 20,
            walkableClimb: 2,
            walkableRadius: 5,
            maxEdgeLen: 10,
            maxSimplificationError: 1,
            minRegionArea: 3,
            mergeRegionArea: 8,
            maxVertsPerPoly: 6,
            detailSampleDist: 6,
            detailSampleMaxError: 0.1,
        };
        

        GameEntity.mapData = MapLevel0Data;
        this.playerPosition = new Vec3(-2.451, 0.01, 14.075);
        this.playerEuler = new Vec3(0, 103, 0);

        super.initGame();
    }



    // public plotGuideCameraAnim (isShow: boolean): void {
    //     let anim: Animation = this.nodeCamera.getComponent(Animation)!;
    //     if (isShow) {
    //         if (anim) {
    //             anim.play(ResAnim.LEVEL_0_PLOT_CAMERA);
    //         }
    //     } else {
    //         if (anim) {
    //             anim.stop();
    //         }
    //     }
    // }
    // /**
    //  * 是否存在丧尸
    //  * @param isEnemy 
    //  */
    // public showStartGameTips (): void {
    //     if (this._isPlotGuide) {
    //         //新手引导后的提示
    //         GuideManager.instance.showGuide(GuideType.TIPS, GuideConfig.plot_start, this.ui.node, () => {
    //             GameEntity.enemyActive = true;
    //         }, this);
    //     } else {
    //         //进入游戏后的提示
    //         if (this._enemyNum <= 0) {
    //             GuideManager.instance.showGuide(GuideType.TIPS, GuideConfig.login_game, this.ui.node, () => {
    //                 GameEntity.enemyActive = true;
    //             }, this);
    //         } else {
    //             GuideManager.instance.showGuide(GuideType.TIPS, GuideConfig.login_invade, this.ui.node, () => {
    //                 GameEntity.enemyActive = true;
    //             }, this);
    //         }
    //     }

    // }

    // setPlayerOpenFire (data: OpenFireObj): void {

    // }
    // setEquipGuns (data: EquipGunObj): void {

    // }

    update (dt: number) {
        super.update(dt);
        if (GameEntity.navMeshCorwd) GameEntity.navMeshCorwd.update(dt);
    }
   
}
