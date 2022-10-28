import { _decorator, Component, Node, Sprite, tween, Vec2, Material, game, ScrollView, Prefab, instantiate, Label } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('MainUIHistoryListItem')
export class MainUIHistoryListItem extends Component {
    @property({ type: Label })
    timeLabel: Label = null!;
    @property({ type: Label })
    hitRatioLabel: Label = null!;
    @property({ type: Label })
    hitHeadRatioLabel: Label = null!;
    @property({ type: Label })
    durationLabel: Label = null!;
    @property({ type: Label })
    gradeLabel: Label = null!;
    @property({ type: Node })
    successNode: Node = null!;
    @property({ type: Node })
    failNode: Node = null!;

    public init(key: string, data: MAny): void {
        this.initTime(Number(key));
        this.initDuration(data["d"]);
        this.initHitRate(data["s"]);
        this.initHitHeadRate(data["h"]);
        this.initGameGrade();
        this.initGameState(data["j"]);
    }

    private initTime(time: number): void {
        let date: Date = new Date(time);
        let now: Date = new Date();
        let nowDay: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        let nowDayTime: number = nowDay.getTime();
        let timeStr: string = "";
        if (time >= nowDayTime) {
            timeStr = "今天";
        } else if (time >= nowDayTime - 24 * 60 * 60 * 1000) {
            timeStr = "昨天";
        } else if (time >= nowDayTime - 2 * 24 * 60 * 60 * 1000) {
            timeStr = "前天";
        } else {
            let month: number = date.getMonth() + 1;
            timeStr = month < 10 ? "0" + month : "" + month;
            timeStr += "-" + (date.getDate() < 10 ? "0" + date.getDate() : "" + date.getDate());
        }
        timeStr += "  " + (date.getHours() < 10 ? "0" + date.getHours() : "" + date.getHours());
        timeStr += ":" + (date.getMinutes() < 10 ? "0" + date.getMinutes() : "" + date.getMinutes());
        this.timeLabel.string = timeStr;
    }
    /**
     * 刷新游戏的持续时间
     * @param duration 
     */
    private initDuration(duration: number): void {
        if (duration <= 0) {
            this.durationLabel.string = "-";
        } else {
            let minute: number = Math.floor(duration / 1000 / 60);
            let second: number = Math.floor((duration - minute * 1000 * 60)/1000);
            this.durationLabel.string = (minute < 10 ? "0" + minute : "" + minute) + ":" + (second < 10 ? "0" + second : "" + second);
        }
    }
    /**
     * 刷新命中率
     */
    private initHitRate(rate: number): void {
        this.hitRatioLabel.string = rate + "%";
    }
    /**
     * 刷新暴击率
     */
    private initHitHeadRate(rate: number): void {
        this.hitHeadRatioLabel.string = rate + "%";
    }
    /**
     * 得分
     */
    private initGameGrade(): void {
        this.gradeLabel.string = "待定" ;
    }
    /**
     * 刷新游戏通关状态
     */
    private initGameState(state:number): void{
        if (state === 1) {
            this.successNode.active = true;
            this.failNode.active = false;
        } else { 
            this.successNode.active = false;
            this.failNode.active = true;
        }
    }

}
