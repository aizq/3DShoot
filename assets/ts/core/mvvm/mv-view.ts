import { CCString, Component, log, _decorator } from 'cc';
import { MV } from './mv-manager';
const { ccclass, property } = _decorator;

/**
 * watchPath 的基础，只提供绑定功能 和 对应的数据更新函数
 */
@ccclass
export default class MVView extends Component {
    /**
     * 监听的属性
     */
    @property({})
    public watchProp: string = "";

    private _mv = MV;
    onLoad () {

    }
    onEnable () {
        if (this.watchProp !== "") {
            this._mv.bindPath(this.watchProp, this.onValueChaged, this);
        }
    }
    onDisable () {

    }
    start () {

    }
    /**
     * 当绑定的数据发生变化时
     */
    public onValueChaged (newVal: MAny, oldVal: MAny): void {

    }
}