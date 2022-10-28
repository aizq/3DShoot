import { _decorator, Component, Node, Label, SpriteComponent, Sprite, resources, SpriteFrame, UITransform } from 'cc';
import { GoodsData } from '../../../../config/Tgoods';
import { BackPackGoodsObj } from './back-pack-panel';

const { ccclass, property } = _decorator;

@ccclass('BackPackGoodsItem')
export class BackPackGoodsItem extends Component {
    @property({ type: Sprite })
    goodsIcon: Sprite = null!;
    @property({ type: Label })
    goodsName: Label = null!;
    @property({ type: Label })
    goodsNum: Label = null!;
    @property({ type: Node })
    btnPickUp: Node = null!;
    @property({ type: Node })
    btnDiscard: Node = null!;

    private _goods: BackPackGoodsObj = null!;
    private _type: number = -1;
    // 
    private _call: MFunction = null!;
    // private _goodsId: number = 0;
    // private _num: number = 0;
    // private _index: number = 0;

    public width: number = 0;
    public height: number = 0;
    onLoad () {
        let uiTransform: UITransform = this.node.getComponent(UITransform)!;
        this.width = uiTransform.width
        this.height = uiTransform.height
    }

    public init (type: number, goods: BackPackGoodsObj): void {
        this._goods = goods;
        this._type = type;
        // this._goodsId = goods.id;
        // this._num = goods.num;
        // this._index = goods.index;
        if (this._type === 0) {
            this.btnPickUp.active = false;
            this.btnDiscard.active = true;
        } else if (this._type === 1) {
            this.btnPickUp.active = true;
            this.btnDiscard.active = false;
        }
        this.goodsName.string = GoodsData[this._goods.id].name;
        this.goodsNum.string = this._goods.num + "";
        resources.load("sprite-frame/use-goods/" + GoodsData[this._goods.id].key + "/spriteFrame", SpriteFrame, (err, spriteFame: SpriteFrame) => {
            if (err) {
                console.log(err);
                return;
            }
            this.goodsIcon.spriteFrame = spriteFame;
        });
    }
    public refresh (): void {
        this.goodsNum.string = this._goods.num + "";
    }
    // 
    public setCallEvent (call: MFunction): void {
        this._call = call;
    }
    public btnPickUpEvent (): void {
        console.log("点击事件");
        if (this._call) this._call(this._goods);
    }
    public btnDiscardUpEvent (): void {
        if (this._call) this._call(this._goods);
    }

    update (deltaTime: number) {

    }
}

