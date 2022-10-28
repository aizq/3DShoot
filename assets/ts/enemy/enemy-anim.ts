import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('EnemyAnim')
export class EnemyAnim extends Component {
    //
    private _startAttackCall: MFunction = null!;
    //
    private _endAttackCall: MFunction = null!;
    //
    public init (start: MFunction, end: MFunction): void {
        this._startAttackCall = start;
        this._endAttackCall = end;
    }
    startAttack (): void {
        if (this._startAttackCall) this._startAttackCall();
    }
    endAttack (): void {
        if (this._endAttackCall) this._endAttackCall();
    }

}

