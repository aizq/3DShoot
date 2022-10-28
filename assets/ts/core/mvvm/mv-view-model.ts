import { director } from "cc";
import ObjPropWatch from "./obj-prop-watch";
const VM_EMIT_HEAD = 'MV:';
/**
 * 进行数据绑定
 * 以及数据改变事件触发（通知view）
 */
export class MVViewModel {
    private _tag: string = "";
    constructor (data: MAny, tag: string) {
        this._tag = tag;
        new ObjPropWatch(data, this.dataWatchBack.bind(this));
    }
    /**
     * 数据改变回调
     */
    private dataWatchBack (newVal: MAny, old: MAny, path: string): void {
        let name: string = VM_EMIT_HEAD + this._tag + "." + path;
        director.emit(name, newVal, old, [this._tag].concat(path));
    }
}