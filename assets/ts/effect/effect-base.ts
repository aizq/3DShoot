
import { _decorator, Component, Node, ParticleSystem, Animation, ParticleSystem2D } from 'cc';
import PoolManager from '../core/pool-manager';
const { ccclass, property } = _decorator;



@ccclass('EffectBase')
export class EffectBase extends Component {
    @property({ type: ParticleSystem })
    particles: ParticleSystem[] = [];
    @property({ type: Animation })
    animations: Animation[] = [];
    @property({ type: ParticleSystem2D })
    particles2d: ParticleSystem2D[] = [];
    show (time: number = 0.5) {
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].play();
        }
        for (let i = 0; i < this.particles2d.length; i++) {
            this.particles2d[i].resetSystem();
        }
        for (let i = 0; i < this.animations.length; i++) {
            this.animations[i].play();
        }
        this.scheduleOnce(() => {
            this.recycle();
        }, time)
    }

    recycle (): void {
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].stop();
        }
        for (let i = 0; i < this.animations.length; i++) {
            this.animations[i].stop();
        }
        this.node.removeFromParent();
        PoolManager.instance.putNode(this.node);
    }



}
