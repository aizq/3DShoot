'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.close = exports.ready = exports.update = exports.template = exports.$ = void 0;
const fs_extra_1 = require("fs-extra");
exports.$ = {
    // 'test': '.test',
    "selectLoadMode": ".select-load-mode",
};
exports.template = `
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
function update(assetList, metaList) {
    this.assetList = assetList;
    this.metaList = metaList;
    let loadMode = metaList[0].userData.loadMode || "";
    if (assetList.length > 0) {
        let path = assetList[0].url;
        if (path.indexOf("db://assets/resources/") !== -1) {
            if (path !== "db://assets/resources/resources.json") {
                this.$.selectLoadMode.disabled = false;
                updateResourcesData(metaList[0], loadMode);
            }
            else {
                this.$.selectLoadMode.disabled = true;
            }
        }
        else {
            this.$.selectLoadMode.disabled = true;
        }
    }
    else {
        this.$.selectLoadMode.disabled = true;
    }
    this.$.selectLoadMode.value = loadMode;
}
exports.update = update;
;
function updateResourcesData(fileData, loadMode) {
    let uuid = "";
    if (fileData.importer === "image") {
        //需要获取是sprite还是texture的实际uuid
        uuid = fileData.userData.redirect || "";
    }
    else {
        uuid = fileData.uuid;
    }
    if (uuid.length <= 0)
        return;
    //检测文件是否存在  不存在的话创建一个
    let path = Editor.Project.path + "/assets/resources/resources.json";
    let data = null;
    if ((0, fs_extra_1.existsSync)(path)) {
        //存在指定文件，读取
        data = (0, fs_extra_1.readJsonSync)(path);
    }
    else {
        data = {};
    }
    if (data[uuid]) {
        data[uuid]["type"] = Number(loadMode);
    }
    else {
        let prop = {};
        prop["type"] = Number(loadMode);
        data[uuid] = prop;
    }
    (0, fs_extra_1.outputJsonSync)(path, data);
    console.log("更新resources配置文件完成！");
    Editor.Message.request('asset-db', 'refresh-asset', path);
}
;
function ready() {
    this.$.selectLoadMode.addEventListener("change", () => {
        //值发生了变化
        this.metaList.forEach((meta) => {
            // 修改对应的 meta 里的数据
            meta.userData.loadMode = this.$.selectLoadMode.value;
        });
        // 修改后手动发送事件通知，资源面板是修改资源的 meta 文件，不是修改 dump 数据，所以发送的事件和组件属性修改不一样
        this.dispatch('change');
    });
}
exports.ready = ready;
;
function close(his) {
    // TODO something
}
exports.close = close;
;
