import { native } from "cc";
import { JSB } from "cc/env";

/**
 * java js 互调
 */
export class NativeManager {
    private static _instance: NativeManager = null!;
    static get instance (): NativeManager {
        if (!this._instance) {
            this._instance = new NativeManager();
        }
        return this._instance;
    }
    constructor () {
        native.bridge.onNative = (funName: string, arg0?: string | null) => {
            switch (funName) {
                case "back-upper-level":
                    this.backUpperLevel(arg0!);
                    break;
            }
        }
    }
    // javascripts  to   native     =======================
    /**
     *短震屏
     */
    public vibrateShort () {
        if (JSB) {
            native.bridge.sendToNative("vibrateShort");
        }
    }

    /**
     *长震屏
     */
    public vibrateLong () {
        if (JSB) {
            native.bridge.sendToNative("vibrateLong");
        }
    }


    // javascripts  to   native     =======================

    // native  to    javascripts    =======================
    /**
     * 放回上一级
     * @param param 
     */
    public backUpperLevel (param: string | null): void {

    }

















    // native  to    javascripts    =======================

}