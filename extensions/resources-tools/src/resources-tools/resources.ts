'use strict';

interface Asset {
    displayName: string;
    file: string;
    imported: boolean;
    importer: string;
    invalid: boolean;
    isDirectory: boolean;
    library: {
        [extname: string]: string;
    };
    name: string;
    url: string;
    uuid: string;
    visible: boolean;
    subAssets: {
        [id: string]: Asset;
    };
}

interface Meta {
    files: string[];
    imported: boolean;
    importer: string;
    subMetas: {
        [id: string]: Meta;
    };
    userData: {
        [key: string]: any;
    };
    uuid: string;
    ver: string;
}
type Selector<$> = { $: Record<keyof $, any | null> } & { dispatch (str: string): void, assetList: Asset[], metaList: Meta[] };
import { outputJsonSync, readJsonSync, existsSync } from 'fs-extra';
import { join } from 'path';
export const $ = {
    // 'test': '.test',
    "selectLoadMode": ".select-load-mode",
};

export const template = `
<div style="width:100%,height:20px"/>
<ui-section class="config" header="资源预加载配置">
    <ui-prop>
        <ui-label slot="label">资源预加载时机：</ui-label>
        <ui-select slot="content" value="1" class="select-load-mode">
            <option value="0">None</option>
            <option value="1">Start</option>
            <option value="2">Game</option>
        </ui-select>
    </ui-prop>
</ui-section>
`;

type PanelThis = Selector<typeof $>;

export function update (this: PanelThis, assetList: Asset[], metaList: Meta[]) {
    this.assetList = assetList;
    this.metaList = metaList;
    let loadMode: number = metaList[0].userData.loadMode || "";
    if (assetList.length > 0) {
        let path: string = assetList[0].url;
        if (path.indexOf("db://assets/resources/") !== -1) {
            if (path !== "db://assets/resources/resources.json") {
                this.$.selectLoadMode.disabled = false;
                updateResourcesData(metaList[0], loadMode);
            } else {
                this.$.selectLoadMode.disabled = true;
            }
        } else {
            this.$.selectLoadMode.disabled = true;
        }
    } else {
        this.$.selectLoadMode.disabled = true;
    }
    this.$.selectLoadMode.value = loadMode;
};
function updateResourcesData (fileData: Meta, loadMode: number) {
    let uuid: string = "";
    if (fileData.importer === "image") {
        //需要获取是sprite还是texture的实际uuid
        uuid = fileData.userData.redirect || "";
    } else {
        uuid = fileData.uuid;
    }
    if (uuid.length <= 0) return;
    //检测文件是否存在  不存在的话创建一个
    let path: string = Editor.Project.path + "/assets/resources/resources.json";
    let data: any = null!;
    if (existsSync(path)) {
        //存在指定文件，读取
        data = readJsonSync(path);
    } else {
        data = {};
    }
    if (data[uuid]) {
        data[uuid]["type"] = Number(loadMode);
    } else {
        let prop: any = {};
        prop["type"] = Number(loadMode);
        data[uuid] = prop;
    }
    outputJsonSync(path, data);
    console.log("更新resources配置文件完成！")
    Editor.Message.request('asset-db', 'refresh-asset', path);
};

export function ready (this: PanelThis) {
    this.$.selectLoadMode.addEventListener("change", () => {
        //值发生了变化
        this.metaList.forEach((meta: any) => {
            // 修改对应的 meta 里的数据
            meta.userData.loadMode = this.$.selectLoadMode.value;
        });
        // 修改后手动发送事件通知，资源面板是修改资源的 meta 文件，不是修改 dump 数据，所以发送的事件和组件属性修改不一样
        this.dispatch('change');
    });
};

export function close (his: PanelThis,) {
    // TODO something
};