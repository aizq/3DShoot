import { _decorator, Component, Node, Collider } from 'cc';
import { EColliderGroup, EColliderMask, EColliderType } from './collider-constants';
const { ccclass, property } = _decorator;

@ccclass('ColliderNode')
export class ColliderNode extends Component {
    @property
    _type: number = EColliderType.STATIC;
    @property({ type: EColliderType })
    get type () {
        return this._type;
    }
    set type (val) {
        this._type = val;
    }

    @property
    _target: Node | null = null;
    @property({ type: Node })
    get target () {
        return this._target;
    }
    set target (val) {
        this._target = val;
    }

    private _collider: Collider | null = null;

    onLoad () {
        this._collider = this.node.getComponent(Collider);
        if (!this._collider) {
            return;
        }
        // console.log(this.node.name);
        if (this.type === EColliderType.STATIC) {
            //设置group和mask
            this._collider.setGroup(EColliderGroup.STATIC);
            this._collider.setMask(EColliderMask.STATIC);
        } else if (this.type === EColliderType.ENEMY) {
            this._collider.setGroup(EColliderGroup.ENEMY);
            this._collider.setMask(EColliderMask.ENEMY);
        } else if (this.type === EColliderType.GOODS) {
            this._collider.setGroup(EColliderGroup.STATIC);
            this._collider.setMask(EColliderMask.STATIC);
        } else if (this.type === EColliderType.OBSTACLE) { 
            this._collider.setGroup(EColliderGroup.OBSTACLE);
            this._collider.setMask(EColliderMask.STATIC);
        }else if (this.type === EColliderType.ENEMY_BOX) { 
            this._collider.setGroup(EColliderGroup.ENEMY_BOX);
            this._collider.setMask(EColliderMask.ENEMY_BOX);
        }
    }
}

