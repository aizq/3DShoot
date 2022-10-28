import { director } from "cc";
import { MVViewModel } from "./mv-view-model";
const VM_EMIT_HEAD = 'MV:';
/**
* mvvm 管理类
*/
class MVManager {
    private _mvs: Map<string, MVViewModel> = new Map<string, MVViewModel>();
    public add (data: MAny, tag: string): void {
        let vm: MVViewModel = new MVViewModel(data, tag);
        let has = this._mvs.get(tag);
        if (has) {
            console.error('already set VM tag:' + tag);
            return;
        }
        this._mvs.set(tag, vm);
    }
    /**
     * 移除
     * @param tag 
     */
    remove (tag: string) {
        this._mvs.delete(tag);
    }
    /**
     * 绑定
     */
    // 
    bindPath (path: string, callBack: MFunction, target: MAny): void {
        path = path.trim();
        // eslint-disable-next-line
        //@ts-ignore
        director.on(VM_EMIT_HEAD + path, callBack, target);
    }
    /**
     * 解绑
     */
    // 
    unbindPath (path: string, callBack: MFunction, target: MAny): void {
        path = path.trim();
        // eslint-disable-next-line
        //@ts-ignore
        director.off(VM_EMIT_HEAD + path, callBack, target);
    }
}
export let MV = new MVManager();