import { _decorator, Component, Node, Sprite, tween, Vec2, Material, game, ScrollView, Prefab, instantiate } from 'cc';
import AudioManager from '../../core/audio-manager';
import { StorageManager } from '../../core/storage-manager';
import { BasePanel } from '../../core/ui/base-panel';
import { ResAudio } from '../../entity/res-constant';
import { MainUIData } from '../ui-entity';
import { MainUIHistoryListItem } from './main-ui-history-list-item';

const { ccclass, property } = _decorator;

@ccclass('MainUIHistoryPanel')
export class MainUIHistoryPanel extends BasePanel {
    @property({ type: ScrollView })
    historyList: ScrollView = null!;
    @property({ type: Prefab })
    historyItem: Prefab = null!;


    show() {
        super.show();
        MainUIData.MAIN_PLAYER_X = 100;
        this.initHistoryList();
    }
    /**
     * 初始化历史列表
     */
    private initHistoryList (): void {
        this.historyList.content?.destroyAllChildren();
        let historyData: MAny = StorageManager.instance.getHistory();
        let keys: string[] = Object.keys(historyData);
        //从大到小排序
        for (let i = 0; i < keys.length - 1; i++) {
            for (let j = 0; j < keys.length - i - 1; j++) {
                if (Number(keys[j + 1]) > Number(keys[j])) {
                    let temp: string = keys[j + 1];
                    keys[j + 1] = keys[j];
                    keys[j] = temp;
                }
            }
        }
        for (let i = 0; i < keys.length; i++) {
            let data: MAny = historyData[keys[i]];
            let node: Node = instantiate(this.historyItem);
            this.historyList.content?.addChild(node);
            let comp: MainUIHistoryListItem = node.getComponent(MainUIHistoryListItem)!;
            comp.init(keys[i], data);
        }
    }

    btnBackEvent(): void { 
        AudioManager.instance.playOneShotAudio(ResAudio.AUDIO_BUTTON);
        this.onBtnHidePanelClick();
        MainUIData.MAIN_PLAYER_X = 0;
    }
    update (): void {

    }
}
