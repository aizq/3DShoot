
import { _decorator, Component, Node, director, instantiate, Sprite, Material, tween, Vec2, Vec3 } from 'cc';
import AudioManager from '../../core/audio-manager';
import { ResAudio, ResKey, ResUI, } from '../../entity/res-constant';
import { GameEntity } from '../../game/game-entity';
import { GameUIData, MainUIData, PanelName } from '../ui-entity';
import { UISystem } from '../../core/ui/ui-system';
import EventManager from '../../core/event-manager';
import { MV } from '../../core/mvvm/mv-manager';
import { MainPlayer } from './main-ui-player';
const { ccclass, property, type } = _decorator;

@ccclass('MainUI')
export class MainUI extends Component {
    @property({ type: Sprite })
    sprite3D: Sprite = null!;
    @property({ type: Node })
    dialogRoot: Node = null!;
    @property({ type: MainPlayer })
    mainPlayer: MainPlayer = null!;

    private _lock: boolean = false;
    private _material3D: Material = null!;
    private _startScene: string = "";
    onLoad() { 
        MV.add(MainUIData, "MainUIData");
    }
    start () {
        AudioManager.instance.playBgAudio(ResAudio.AUDIO_BG_0);
        this._lock = false;
        MainUIData.MAIN_PLAYER_X = 0;
    }
   
    update (deltaTime: number) {
        // [4]
    }

    public btnSettingEvent (): void {
        UISystem.instance.showPanel(PanelName.TIPS, this.node, ["功能正在开发阶段，现未开放", 0.6]);
    }
    public btnIntroduceEvent (): void {
        AudioManager.instance.playOneShotAudio(ResAudio.AUDIO_TIPS_SHOW);
        UISystem.instance.showPanel(PanelName.INTRODUCE, this.node);
    }
    public btnHistoryEvent(): void { 
        
        AudioManager.instance.playOneShotAudio(ResAudio.AUDIO_BUTTON);
        UISystem.instance.showPanel(ResUI.MAIN_UI_HISTORY_PANEL,this.dialogRoot);
    }

    public btnStartGameEvent (): void {
        if (this._lock) return;
        this._lock = true;
        AudioManager.instance.playOneShotAudio(ResAudio.AUDIO_BUTTON);
        //预加载场景
        this._startScene = "level_0";
        director.loadScene(this._startScene);
        this._lock = false;
    }
    
  

    onDisable() { 
        this.mainPlayer.remove();
        MV.remove("MainUIData");
    }
    public onDestroy() { 
    }
  
}


// public cyberpunk (): void {
//     tween(new Vec3(0, 0, 0))
//         .to(0.3, new Vec3(150, 400, 3), {
//             // eslint-disable-next-line
//             //@ts-ignore
//             onUpdate: (target: Vec3, ratio: number) => {
//                 this._material3D.setProperty("row", target.x);
//                 this._material3D.setProperty("col", target.y);
//                 this._material3D.setProperty("offset", target.z);
//             },
//         })
//         .to(0.2, new Vec3(100, 100, 0), {
//             // eslint-disable-next-line
//             //@ts-ignore
//             onUpdate: (target: Vec3, ratio: number) => {
//                 this._material3D.setProperty("row", target.x);
//                 this._material3D.setProperty("col", target.y);
//                 this._material3D.setProperty("offset", target.z);
//             },
//         })
//         .to(0.2, new Vec3(150, 400, 5), {
//             // eslint-disable-next-line
//             //@ts-ignore
//             onUpdate: (target: Vec3, ratio: number) => {
//                 this._material3D.setProperty("row", target.x);
//                 this._material3D.setProperty("col", target.y);
//                 this._material3D.setProperty("offset", target.z);
//             },
//         }).to(0.2, new Vec3(100, 100, 1), {
//             // eslint-disable-next-line
//             //@ts-ignore
//             onUpdate: (target: Vec3, ratio: number) => {
//                 this._material3D.setProperty("row", target.x);
//                 this._material3D.setProperty("col", target.y);
//                 this._material3D.setProperty("offset", target.z);
//             },
//         })
//         .to(0.2, new Vec3(100, 300, 15), {
//             // eslint-disable-next-line
//             //@ts-ignore
//             onUpdate: (target: Vec3, ratio: number) => {
//                 this._material3D.setProperty("row", target.x);
//                 this._material3D.setProperty("col", target.y);
//                 this._material3D.setProperty("offset", target.z);
//             },
//         })
//         .to(0.1, new Vec3(1000, 1, 100), {
//             // eslint-disable-next-line
//             //@ts-ignore
//             onUpdate: (target: Vec3, ratio: number) => {
//                 this._material3D.setProperty("row", target.x);
//                 this._material3D.setProperty("col", target.y);
//                 this._material3D.setProperty("offset", target.z);
//             },
//         })
//         .to(0.1, new Vec3(1000, 0, 100), {  //屏幕转黑过度
//             // eslint-disable-next-line
//             //@ts-ignore
//             onUpdate: (target: Vec3, ratio: number) => {
//                 this._material3D.setProperty("black", 1.0 - target.y);
//             },
//         })
//         .call(() => {
         
//         })
//         .start();
// }

