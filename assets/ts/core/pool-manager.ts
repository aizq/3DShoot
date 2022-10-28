
import { _decorator, Component, Node, Prefab, NodePool, instantiate } from 'cc';
import { ResLoad } from './res-load';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = PoolManager
 * DateTime = Mon Nov 29 2021 13:33:02 GMT+0800 (中国标准时间)
 * Author = carlosyzy
 * 对象池管理
 *
 */

@ccclass("PoolManager")
export default class PoolManager {

    static _instance: PoolManager;

    static get instance () {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new PoolManager();
        return this._instance;
    }

    private _dictPool: Map<string, NodePool> = new Map();

    /**
     * 预生成对象池
     * @param prefabList    需要预生成对象池的预制体或节点
     * @param nodeNum       对象池节点数量,默认是1
     * @param isUI  2d ui预制体
     * @method prePool
     */
    prePool(name: string, num: number) {
        let prefab: Prefab = ResLoad.instance.getPrefab(name);
        let pool: NodePool = null!;
        let j = 0;
        if (this._dictPool.has(name)) {
            pool = this._dictPool.get(name)!;
            j = pool.size();
        } else {
            pool = new NodePool();
            this._dictPool.set(name, pool);
            j = 0;
        }
        for (; j < num; j++) {
            const node = instantiate(prefab);
            pool.put(node);
        }
    }

    /**
     * 根据预设从对象池中获取对应节点
     */
    getNode (name: string) {
        let node = null;
        if (this._dictPool.has(name)) {
            //已有对应的对象池
            let pool: NodePool = this._dictPool.get(name)!;
            if (pool.size() > 0) {
                node = pool.get();
            } else {
                let prefab: Prefab = ResLoad.instance.getPrefab(name);
                node = instantiate(prefab);
            }
        } else {
            //没有对应对象池，创建他！
            let pool = new NodePool();
            this._dictPool.set(name, pool);
            let prefab: Prefab = ResLoad.instance.getPrefab(name);
            node = instantiate(prefab);
        }
        return node as Node;
    }

    /**
     * 将对应节点放回对象池中
     */
    putNode (node: Node) {
        let name = node.name;
        let pool: NodePool = null!;
        if (this._dictPool.get(name)) {
            //已有对应的对象池
            pool = this._dictPool.get(name)!;
        } else {
            //没有对应对象池，创建他！
            pool = new NodePool();
            this._dictPool.set(name, pool);
        }

        pool.put(node);
    }

    /**
     * 根据名称，清除对应对象池
     */
    clearPool (name: string) {
        if (this._dictPool.get(name)) {
            let pool: NodePool = this._dictPool.get(name)!;
            pool.clear();
        }
    }

    /**
     * 清除全部对象池
     * @method clearAllPool
     */
    clearAllPool () {
        this._dictPool.forEach((value, key) => {
            let pool: NodePool = this._dictPool.get(key)!;
            pool.clear();
        });
        this._dictPool.clear();
    }

}
