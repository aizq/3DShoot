
import { _decorator, Component, Node, Label, UITransform, Size, director, Vec3, resources, JsonAsset, Material, Prefab, SpriteFrame, AudioClip, game } from 'cc';
import AudioManager from '../core/audio-manager';
import { ResLoad } from '../core/res-load';
import { ResEffect, ResEnemy, ResGoods, ResGun } from '../entity/res-constant';


const { ccclass, property, type } = _decorator;
@ccclass('LoadingUI')
export class LoadingUI extends Component {

    @type(Node)
    nodeProgressBar: Node = null!;
    @type(Label)
    msgLabel: Label = null!;

    async start() {
        AudioManager.instance.init();
        await ResLoad.instance.initResouecesList();
        this.preloadRes();
    }
    /**
     * 
     */
    preloadRes() {
        console.log("开始加载");
        let loadProgress = (progress: number) => {
            console.log("正在加载游戏中用到的资源...：", progress*100);
            this.refreshLoadingUI(progress*100, "正在加载游戏中用到的资源...：");
            if (progress >= 1) {
                this.refreshLoadingUI(progress*100, "场景初始化过程，请等待...");
            }
        };
        let loadComplete = () => {
            this.enterGame();
        };
        ResLoad.instance.preloadResources(1, loadProgress, loadComplete);
    }
    refreshLoadingUI(progress: number, msg: string): void {
        progress = progress > 100 ? 100 : progress;
        let width: number = 860 * (progress / 100);
        let label: string = msg + Math.floor(progress) + "%";
        this.msgLabel.string = label;
        this.nodeProgressBar.getComponent(UITransform)?.setContentSize(new Size(width, 10));
    }
    enterGame() {
        // if (PrefManager.instance.isMatch === false) {
        //     //进入到新能这是界面
        //     director.preloadScene("performance",
        //         (completedCount: number, totalCount: number, item: any) => {
        //             let progress: number = Math.floor(completedCount / totalCount * 100)
        //             this.refreshLoadingUI(progress, "正在进入游戏...");
        //         },
        //         () => {
        //             director.loadScene('performance');
        //         });
        // } else {
        // game.frameRate = PrefManager.instance.gameFrameRate();
        //设置完毕 直接进入
        let scene: string = "main";
        director.preloadScene(scene,
            (completedCount: number, totalCount: number) => {
                let progress: number = Math.floor(completedCount / totalCount * 100)
                this.refreshLoadingUI(progress, "正在进入游戏...");
            },
            () => {
                director.loadScene(scene);
            });
        // }
    }
}