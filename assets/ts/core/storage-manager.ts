import { sys } from "cc";
export enum StorageKey {
    /**
     * 历史记录
     */
    HIATORY = "h",
}


/**
 * 本地数据存储
 */
export class StorageManager {
    private static _instance: StorageManager = null!;

    public static get instance () {
        if (!this._instance) {
            this._instance = new StorageManager();
        }
        return this._instance;
    }

    private _userData: MAny = {};
    constructor () {
        let userData: string = sys.localStorage.getItem("miracleUserData")!;
        if (userData) {
            this._userData = JSON.parse(userData);
        } else {
            this._userData = {};
        }
    }
    /**
     * 新增历史记录
     * @returns 
     */
    public addHistory (): number {
        let history: any = this.getObject(StorageKey.HIATORY);
        let id: number = Date.now();
        let data: any = {};
        data["d"] = 0;     //对局时间
        data["h"] = 0;     //爆头率
        data["s"] = 0;     //击中率
        data["j"] = 0;     // 通过结果 0:失败  1:成功
        history[id] = data;
        return id;
    }
    /**
     * 更新历史记录
     * @param hit   设计命中率
     * @param headShot  击中头部概率
     * @param grade   得分
     * @param state   通过结果 0:失败  1:成功
     */
    public updateHistory (id: number, hit: number, hitHead: number, time: number, state: number): void {
        let history: any = this.getObject(StorageKey.HIATORY);
        history[id]["h"] = hitHead;
        history[id]["s"] = hit;
        history[id]["d"] = time;
        history[id]["j"] = state;     // 通过结果 0:失败  1:成功
    }
    public getHistory (): any {
        return this.getObject(StorageKey.HIATORY);
    }






    public setNumber (key: string, num: number): void {
        this._userData[key] = num;
    }
    public getNumber (key: string): number {
        if (!Object.prototype.hasOwnProperty.call(this._userData, key)) {
            this._userData[key] = 0;
        }
        return this._userData[key];
    }
    public setString (key: string, str: string): void {
        this._userData[key] = str;
    }
    public getString (key: string): string {
        if (!Object.prototype.hasOwnProperty.call(this._userData, key)) {
            this._userData[key] = "";
        }
        return this._userData[key];
    }

    public setBoolean (key: string, val: boolean): void {
        this._userData[key] = val === true ? 1 : 0;
    }
    public getBoolean (key: string): boolean {
        if (!Object.prototype.hasOwnProperty.call(this._userData, key)) {
            this._userData[key] = 0;
        }
        return this._userData[key] === 0 ? false : true;
    }

    public setObject (key: string, val: MAny): void {
        this._userData[key] = val;
    }
    public getObject (key: string): MAny {
        if (!Object.prototype.hasOwnProperty.call(this._userData, key)) {
            this._userData[key] = {};
        }
        return this._userData[key];
    }

    public setArray (key: string, val: any[]): void {
        this._userData[key] = val;
    }
    public getArray (key: string): any[] {
        if (!Object.prototype.hasOwnProperty.call(this._userData, key)) {
            this._userData[key] = [];
        }
        return this._userData[key];
    }
    /**
     * 添加数据到指定的数值中
     * @param key 
     * @param val 
     */
    public addArray (key: string, val: any): void {
        if (!Object.prototype.hasOwnProperty.call(this._userData, key)) {
            this._userData[key] = [];
        }
        this._userData[key].push(val);
    }

    public saveData (): void {
        sys.localStorage.setItem("miracleUserData", JSON.stringify(this._userData));
    }

}