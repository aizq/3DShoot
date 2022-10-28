
import { _decorator, Component, Node, assetManager, AssetManager, Prefab, SpriteFrame, resources, JsonAsset, AudioClip, Material } from 'cc';
const { ccclass, property } = _decorator;
interface ResourcesData {
    /**
     * 资源名称
     */
    name: string;
    /**
     * 资源路径
     */
    path: string,
    /**
     * 资源类型
     */
    type: string,
    /**
     * uuid
     */
    uuid: string,
}
export enum ResuorcesPreloadMode {
    NONE = 0,
    START = 1,
    GAME = 2,
}
/**
 * 资源加载类
 */
@ccclass('ResLoad')
export class ResLoad {
    private _resourcesList: Map<string, ResourcesData> = new Map();
    private _resourcesPreloadConfig: any = null!;


    private static _instatce: ResLoad = null!;
    static get instance () {
        if (this._instatce === null) {
            this._instatce = new ResLoad();
        }
        return this._instatce;
    }
    private _resModel: ResModel = null!;


    private constructor () {
        this._resModel = new ResModel();
    }
    /**
     * 初始化resources 下的资源列表
     */
    public async initResouecesList (): Promise<void> {
        resources.config.paths.forEach((files: any[]) => {
            files.forEach((file: any) => {
                if (file.ctor === Prefab || file.ctor === SpriteFrame || file.ctor === AudioClip || file.ctor === Material || file.ctor === JsonAsset) {
                    let path: string = file.path;
                    let uuid: string = file.uuid;
                    let aliasArr: string[] = path.split('/');
                    let name: string = aliasArr[aliasArr.length - 1];
                    let repload: boolean = false;
                    let env: string = "";
                    let type: string = "";
                    if (file.ctor === Prefab) {
                        type = "Prefab";
                    } else if (file.ctor === JsonAsset) {
                        type = "JsonAsset";
                    } else if (file.ctor === Material) {
                        type = "Material";
                    } else if (file.ctor === SpriteFrame) {
                        type = "SpriteFrame";
                    } else if (file.ctor === AudioClip) {
                        type = "AudioClip";
                    }
                    let len: number = -1;
                    if (file.ctor !== SpriteFrame) {
                        if (aliasArr.length > 1) len = aliasArr.length - 2;
                    } else {
                        name = aliasArr[aliasArr.length - 2];
                    }
                    if (this._resourcesList.has(name)) {
                        console.warn(name + ":" + this._resourcesList.get(name)?.path + "  与资源  " + path + " 命名重复，请进行处理");
                    }
                    this._resourcesList.set(name, { name: name, path: path, type: type, uuid: uuid })
                }
            });
        });
        await new Promise((resolve, reject) => {
            // resolve(0); //异步处理 
            resources.load("resources", JsonAsset, (err, jsonAsset) => {
                if (err) {
                    console.log("load  jsonAsset  fail: resources",);
                    resolve(0);
                    return;
                }
                this._resourcesPreloadConfig = jsonAsset.json;
                resolve(1);
            });
        });

    }
    public preloadResources (env: number, progressCallBack: MFunction, completeCallBack: MFunction): void {
        if (!this._resourcesPreloadConfig) {
            completeCallBack();
            return;
        }
        let loadAllRes: string[] = [];
        console.log(this._resourcesPreloadConfig);
        this._resourcesList.forEach((data: ResourcesData, name: string) => {
            console.log(name, data.uuid, this._resourcesPreloadConfig[data.uuid]);
            if (this._resourcesPreloadConfig[data.uuid] &&
                this._resourcesPreloadConfig[data.uuid]["type"] &&
                this._resourcesPreloadConfig[data.uuid]["type"] === env
            ) {
                loadAllRes.push(name);
            }
        });
        this.loadResAny(loadAllRes, progressCallBack, completeCallBack);
    }
    /**
     * 加载bundle资源
     * @param bundleName  bundle名称
     * @param callBack    回掉
     */
    loadBundle (bundleName: string, callBack: MFunction): void {
        assetManager.loadBundle(bundleName, (err, bundle) => {
            if (err) {
                callBack();
                return;
            }
            console.log("load  bundle success:", bundleName);
            this._resModel.setBundle(bundleName, bundle);
            callBack();
        });
    }
    /**
     * 加载资源
     * @param resDatas  加载资源数组   Object：key-资源键  type-类型（prefab，spriteFrame）  path:路径   bundle-所在bundle
     * @param progressCallBack 
     */
    public loadResAny (res: string[], progressCallBack: MFunction, completeCallBack: MFunction): void {
        let _allRef: number = res.length;
        let _ref: number = 0;
        let loadComplete = (status: number) => {
            _ref++;
            progressCallBack(_ref / _allRef);
            if (_ref >= _allRef) {
                completeCallBack();
            }
        }
        let data: ResourcesData = null!;
        for (let i = 0, length = res.length; i < length; i++) {
            data = this._resourcesList.get(res[i])!;
            if (data.type === "Prefab") {
                this.loadPrefab(res[i], loadComplete);
            } else if (data.type === "SpriteFrame") {
                this.loadSpriteFrame(res[i], loadComplete);
            } else if (data.type === "JsonAsset") {
                this.loadJsonAsset(res[i], loadComplete);
            } else if (data.type === "AudioClip") {
                this.loadAudioClip(res[i], loadComplete);
            } else if (data.type === "Material") {
                this.loadMaterial(res[i], loadComplete);
            }
        }
    }
    public preloadPrefab (name: string): void {
        if (!this._resModel.getPrefab(name)) {
            let data: ResourcesData = this._resourcesList.get(name)!;
            resources.load(data.path, Prefab);
        }
    }
    /**
     * 加载预制体
     * @param res        资源
     * @param complete   完成回掉
     */
    // 
    public loadPrefab (name: string, complete: MFunction) {
        if (this._resModel.getPrefab(name)) {
            complete();
            return;
        } else {
            let data: ResourcesData = this._resourcesList.get(name)!;
            // console.log(name, data);
            resources.load(data.path, Prefab, (err, prefab) => {
                if (err) {
                    complete(false);
                    console.log("load  prefab  fail:", name);
                    return;
                }
                console.log("load  prefab  success:", name);
                this._resModel.setPrefab(name, prefab);
                complete(true);
            });
        }
    }
    /**
     * 加载的图片
     * @param res 
     * @param complete 
     */
    // 
    public loadSpriteFrame (name: string, complete: MFunction) {
        if (this._resModel.getSpriteFrame(name)) {
            complete();
            return;
        } else {
            let data: ResourcesData = this._resourcesList.get(name)!;
            resources.load(data.path + "/spriteFrame", SpriteFrame, (err, spriteFrame) => {
                if (err) {
                    complete(0);
                    console.log("load  spriteFrame  fail:", name);
                    return;
                }
                console.log("load  spriteFrame  success:", name);
                this._resModel.setSpriteFrame(name, spriteFrame);
                complete(1);
            });
        }
    }
    /**
     * 加载json
     * @param res 
     * @param complete 
     */
    // 
    public loadJsonAsset (name: string, complete: MFunction) {
        if (this._resModel.getJsonAsset(name)) {
            complete(1);
            return;
        } else {
            let data: ResourcesData = this._resourcesList.get(name)!;
            resources.load(data.path, JsonAsset, (err, jsonAsset) => {
                if (err) {
                    complete(0);
                    console.log("load  jsonAsset  fail:", name);
                    return;
                }
                console.log("load  jsonAsset  success:", name);
                this._resModel.setJsonAsset(name, jsonAsset);
                complete(1);
            });
        }
    }
    /**
     * 加载audioClip
     * @param res 
     * @param complete 
     */
    // 
    public loadAudioClip (name: string, complete: MFunction): void {
        if (this._resModel.getAudioClip(name)) {
            complete(1);
            return;
        } else {
            let data: ResourcesData = this._resourcesList.get(name)!;
            resources.load(data.path, AudioClip, (err, audioClip) => {
                if (err) {
                    complete(0);
                    console.log("load  audioClip  fail:", name);
                    return;
                }
                console.log("load  audioClip  success:", name);
                this._resModel.setAudioClip(name, audioClip);
                complete(1);
            });
        }
    }
    /**
     * 加载材质
     */
    // 
    public loadMaterial (name: string, complete: MFunction): void {
        if (this._resModel.getMaterial(name)) {
            complete(1);
            return;
        } else {
            let data: ResourcesData = this._resourcesList.get(name)!;
            resources.load(data.path, Material, (err, material) => {
                if (err) {
                    complete(0);
                    console.log("load  material  fail:", name);
                    return;
                }
                console.log("load  material  success:", name);
                this._resModel.setMaterial(name, material);
                complete(1);
            });
        }
    }
    /**
     * 获取预制体
     */
    public getPrefab (name: string): Prefab {
        return this._resModel.getPrefab(name);
    }
    /**
     * 获取图片
     */
    public getSpriteFrame (name: string): SpriteFrame {
        return this._resModel.getSpriteFrame(name);
    }
    /**
     * 获取json
     */
    public getJsonAsset (name: string): JsonAsset {
        return this._resModel.getJsonAsset(name);
    }
    /**
     * 获取音效片段
     */
    public getAudioClip (name: string): AudioClip {
        return this._resModel.getAudioClip(name);
    }
    /**
     * 获取材质
     */
    public getMaterial (name: string): Material {
        return this._resModel.getMaterial(name);
    }

}

class ResModel {
    /**
     * bundle 字典
     */
    private _bundleDict: Map<string, AssetManager.Bundle> = new Map();
    /**
     * prefab 字典
     */
    private _prefabDict: Map<string, Prefab> = new Map();
    /**
     * 图片 字典
     */
    private _spriteFrameDict: Map<string, SpriteFrame> = new Map();
    /**
     * json 字典
     */
    private _jsonAssetDict: Map<string, JsonAsset> = new Map();
    /**
     * 音效 字典
     */
    private _audioClipDict: Map<string, AudioClip> = new Map();
    /**
     * 音效 字典
     */
    private _materialDict: Map<string, Material> = new Map();
    constructor () {

    }
    /**
     * 存储bundle
     * @param name 
     * @param bundle 
     */
    setBundle (name: string, bundle: AssetManager.Bundle): void {
        this._bundleDict.set(name, bundle);
    }
    /**
     * 获取bundle
     */
    getBundle (name: string): AssetManager.Bundle {
        return this._bundleDict.get(name)!;
    }
    /**
     * 存储prefab
     */
    setPrefab (name: string, prefab: Prefab): void {
        this._prefabDict.set(name, prefab);
    }
    /**
     * 获取prefab
     */
    getPrefab (name: string): Prefab {
        return this._prefabDict.get(name)!;
    }
    /**
     * 存储spriteFrameDict
     */
    setSpriteFrame (name: string, spriteFrame: SpriteFrame): void {
        this._spriteFrameDict.set(name, spriteFrame);
    }
    /**
     * 获取spriteFrameDict
     */
    getSpriteFrame (name: string): SpriteFrame {
        return this._spriteFrameDict.get(name)!;
    }
    /**
     * 存储jsonAsset
     */
    setJsonAsset (name: string, jsonAsset: JsonAsset): void {
        this._jsonAssetDict.set(name, jsonAsset);
    }
    /**
     * 获取jsonAsset
     */
    getJsonAsset (name: string): JsonAsset {
        return this._jsonAssetDict.get(name)!;
    }
    /**
     * 获取音效片段
     * @param name 
     * @returns 
     */
    getAudioClip (name: string): AudioClip {
        return this._audioClipDict.get(name)!;
    }
    setAudioClip (name: string, audioClip: AudioClip): void {
        this._audioClipDict.set(name, audioClip);
    }
    /**
     * 获取材质
     */
    getMaterial (name: string): Material {
        return this._materialDict.get(name)!;
    }
    setMaterial (name: string, material: Material): void {
        this._materialDict.set(name, material);
    }
}