import { _decorator, Component, Node, Scene, Prefab, instantiate } from 'cc';
import { ResLoad } from '../res-load';
import { BasePanel, PanelState } from "./base-panel";

/**
 * ui管理系统
 * 管理所有的界面，弹窗，提示的显示逻辑与顺序
 */
export class UISystem {
    private _panelPool: Map<string, Node> = new Map();
    private _panelActiveState: Map<string, boolean> = new Map();
    private static _instance: UISystem = null!;
    static get instance (): UISystem {
        if (!this._instance) {
            this._instance = new UISystem();
        }
        return this._instance;
    }

    /**
    * 展示
    * @param name 
    * @param parent 
    * @param param 
    */
    public showPanel (name: string, parent: Node, ...param: any): void {
        this._panelActiveState.set(name, true)
        if (this._panelPool.has(name)) {
            this.show(name, parent, param);
        } else {
            this.initPanel(name, parent, param)
        }
    }
    /**
     * 取消
     * @param isCoerciveness  是否强制隐藏，
     */
    public hidePanel(name: string, ...param: any): void {
        if (this._panelPool.has(name)) {
            this._panelActiveState.set(name, false);
            let panel: Node = this._panelPool.get(name)!;
            let basePanel: BasePanel = panel.getComponent(BasePanel)!;
            if (!basePanel) {
                console.log("当前panel 为找见对应的 BasePanel 组件");
            }
            if (basePanel.state === PanelState.SHOW) {
                //当前panel未消失状态
                basePanel.hide(param);
                panel.removeFromParent();
            }
        }
    }
    public hideAll (): void {
        this._panelPool.forEach((panel: Node, name: string) => {
            this._panelActiveState.set(name, false)
            let basePanel: BasePanel = panel.getComponent(BasePanel)!;
            if (!basePanel) {
                console.log("当前panel 为找见对应的 BasePanel 组件");
            }
            if (basePanel.state === PanelState.SHOW) {
                //当前panel未消失状态
                basePanel.hide();
                panel.removeFromParent();
            }
        });
    }
    private initPanel (name: string, parent: Node, ...param: any): void {
        ResLoad.instance.loadPrefab(name, () => {
            let prefab: Prefab = ResLoad.instance.getPrefab(name);
            if (prefab) {
                let node: Node = instantiate(prefab);
                this._panelPool.set(name, node);
                this.show(name, parent, param);
            }
        });
    }
    private show (name: string, parent: Node, ...param: any): void {
        let acitve: boolean = this._panelActiveState.get(name)!;
        if (!acitve) return;
        let panel: Node = this._panelPool.get(name)!;
        let basePanel: BasePanel = panel.getComponent(BasePanel)!;
        if (!basePanel) {
            console.log("当前panel 为找见对应的 BasePanel 组件");
        }
        if (basePanel.state === PanelState.SHOW) {
            //当前panel未消失状态
            basePanel.hide();
            panel.removeFromParent();
        }
        //添加
        basePanel.manager = this;
        parent.addChild(panel);
        panel.setSiblingIndex(600);
        basePanel.show(param);
    }

}