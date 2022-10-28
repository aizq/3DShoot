import { error, _decorator } from 'cc';
const { ccclass } = _decorator;

/**
 * 全局自定义事件管理
 */
class OneToMultiListener {
    handlers: MAny = {};
    supportEvent: MAny = {};
    on(eventName: string, handler: MFunction, target: MAny) {
        let objHandler = { handler: handler, target: target };
        let handlerList = this.handlers[eventName];
        if (!handlerList) {
            handlerList = [];
            this.handlers[eventName] = handlerList;
        }

        for (let i = 0; i < handlerList.length; i++) {
            if (!handlerList[i]) {
                handlerList[i] = objHandler;
                return i;
            }
        }

        handlerList.push(objHandler);

        return handlerList.length;
    }
    off(eventName: string, handler: MFunction, target: MAny) {
        let handlerList = this.handlers[eventName];

        if (!handlerList) {
            return;
        }

        for (let i = 0; i < handlerList.length; i++) {
            let oldObj = handlerList[i];
            if (oldObj.handler === handler && (!target || target === oldObj.target)) {
                handlerList.splice(i, 1);
                break;
            }
        }
    }

    dispatchEvent(eventName: string/**/, ...args: MAny) {

        let handlerList = this.handlers[eventName];
        if (!handlerList) {
            return;
        }
        let cloneList = handlerList.slice(); //避免回调的时候会出现把函数从handlerList中移除
        for (let i = 0; i < cloneList.length; i++) {
            let objHandler = cloneList[i];
            if (objHandler.handler) {
                objHandler.handler.apply(objHandler.target, args);
            }
        }
    }

    setSupportEventList(arrSupportEvent: string[]) {
        if (!(arrSupportEvent instanceof Array)) {
            error("supportEvent was not array");
            return false;
        }

        this.supportEvent = {};
        for (let i in arrSupportEvent) {
            let eventName = arrSupportEvent[i];
            this.supportEvent[eventName] = i;
        }


        return true;
    }

}

export default class EventManager {

    static _eventListener = new OneToMultiListener();
    public static on(eventName: string, func: MFunction, target: MAny): void {
        this._eventListener.on(eventName, func, target);
    }
    /**
     * 关闭事件
     */
    // 
    public static off(eventName: string, handler: MFunction, target: MAny) {
        this._eventListener.off(eventName, handler, target);
    }
    /**
     * 发送事件
     * @param eventName 
     * @param args 
     */
    public static emit(eventName: string, ...args: MAny): void {
        this._eventListener.dispatchEvent(eventName, ...args);
    }
}
