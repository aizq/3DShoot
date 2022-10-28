
import { _decorator, Component, Node, Prefab, instantiate, Vec3, MeshRenderer, utils, gfx } from 'cc';
import { MeshDebugDataType, NavMeshConfig, NavMeshDebugData, NavMeshMgr } from '../../lib/NavMesh/NavMesh';
import { MapConfigData } from '../config/TMapConfig';
import { MapLevel0Data } from '../config/TMapLevel0';
import { GameBase } from './game-base';
import { EquipGunObj, GameEvent, OpenFireObj } from './game-constants';
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
        GameEntity.isStart = false;
    }
    /**
   * 初始化
   */
    public initGame (): void {

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
        // GameEntity.mapConfig = MapConfigData["level_" + this.level];
        // GameEntity.mapData = null!;
        this.playerPosition = new Vec3(0, 0, 0);
        this.playerEuler = new Vec3(0, 0, 0);

        super.initGame();
    }

    setPlayerOpenFire (data: OpenFireObj): void {

    }
    setEquipGuns (data: EquipGunObj): void {

    }

    update (dt: number) {
        super.update(dt);
        if (GameEntity.navMeshCorwd) GameEntity.navMeshCorwd.update(dt);
    }

}
