
/**
 * 对象属性监听
 * 值属性转为访问属性
 * 监听set和get
 */
export default class ObjPropWatch {
    // 
    private _call: MFunction = null!;
    /**
     * @param obj  对象
     * @param callback  回调
     */
    // 
    constructor (obj: MAny, callback: MFunction) {
        if (Object.prototype.toString.call(obj) !== "[object Object]") { //&& Object.prototype.toString.call(obj) !== "[object Array]"
            console.log('请传入一个对象或数组');
            return;
        }
        this._call = callback;
        //转访问属性，添加观察者
        Object.keys(obj).forEach((key) => {
            let value: MAny = obj[key];
            let self = this;
            Object.defineProperty(obj, key, {
                get: function () {
                    return value;
                },
                set: function (newVal) {
                    let oldVa: MAny = value;
                    value = newVal;
                    self._call(newVal, oldVa, key);
                }
            })
        });

    }
}