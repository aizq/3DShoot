import { AudioClip, AudioSource, director, game, Node } from "cc";
import { ResAudio } from "../entity/res-constant";
import { ResLoad } from "./res-load";
interface AudioData {
    source: AudioSource;
    isMusic: boolean;
}
interface AudioDataMap {
    [name: string]: AudioData;
}
/**
 * 音效播放控制类
 * 包括：ui触控反馈音效
 *    : 局内子弹开会音效
 */
export default class AudioManager {
    private _presistRootNode: Node = null!;
    private _audioSources: AudioSource[] = [];
    private static _instance: AudioManager;
    static get instance () {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new AudioManager();
        return this._instance;
    }
    musicVolume: number = 0.8;
    soundVolume: number = 1;
    preHeatingVolume: number = 0.05;
    arrSound: AudioData[] = [];
    audios: AudioDataMap = {};
    init () {
        if (this._presistRootNode) return; //避免切换场景初始化报错
        this._presistRootNode = new Node('audio');
        director.getScene()!.addChild(this._presistRootNode);
        director.addPersistRootNode(this._presistRootNode)

        // this.musicVolume = this.getAudioSetting(true) ? 0.8 : 0;
        // this.soundVolume = this.getAudioSetting(false) ? 1 : 0;
    }
    /**
     * 背景音乐
     */
    private _bgAudio: AudioSource = null!;
    public playBgAudio (name: string): void {
        if (!this._presistRootNode) return;
        if (!this._bgAudio) {
            this._bgAudio = this._presistRootNode.addComponent(AudioSource);
            this._bgAudio.playOnAwake = false;
        }
        this._bgAudio.stop();
        let clip: AudioClip = ResLoad.instance.getAudioClip(name);
        this._bgAudio.volume = this.soundVolume;
        this._bgAudio.loop = true;
        this._bgAudio.clip = clip;
        this._bgAudio.play();
    }
    public stopBgAudio (): void {
        if (this._bgAudio) {
            this._bgAudio.stop();
        }
    }
    /**
     * 
     * 玩家移动AudioSource
     */
    private _playerMoveAudioS: AudioSource = null!;
    private _nowMoveState: string = "";
    public playerMove (state: string): void {
        if (!this._presistRootNode) return;
        if (!this._playerMoveAudioS) {
            this._playerMoveAudioS = this._presistRootNode.addComponent(AudioSource);
            this._playerMoveAudioS.playOnAwake = false;
        }
        if (state === this._nowMoveState) return;
        this._nowMoveState = state;
        let clip: AudioClip | null = null;
        if (state === "idle") {
            clip = null;
        } else if (state === "walk") {
            clip = ResLoad.instance.getAudioClip(ResAudio.AUDIO_PLAYER_WALK);
        } else if (state === "run") {
            clip = ResLoad.instance.getAudioClip(ResAudio.AUDIO_PLAYER_RUN);
        }
        if (!clip) {
            this._playerMoveAudioS.stop();
            return;
        };
        this._playerMoveAudioS.stop();
        this._playerMoveAudioS.clip = clip;
        this._playerMoveAudioS.loop = true;
        this._playerMoveAudioS.volume = this.soundVolume;
        this._playerMoveAudioS.play();
    }


    /**
     * 武器操作 AudioSource
     */
    private _gunOperationAudio: AudioSource = null!;
    public gunOperation (name: string, isPreheating: boolean = false): void {
        if (!this._presistRootNode) return;
        if (!this._gunOperationAudio) {
            this._gunOperationAudio = this._presistRootNode.addComponent(AudioSource);
            this._gunOperationAudio.playOnAwake = false;
        }
        // this._gunOperationAudio["_lock"] = true;
        let clip: AudioClip = ResLoad.instance.getAudioClip(name);
        this._gunOperationAudio.stop();
        this._gunOperationAudio.clip = clip;
        this._gunOperationAudio.loop = false;
        if (isPreheating) {
            this._gunOperationAudio.volume = this.preHeatingVolume;
        } else {
            this._gunOperationAudio.volume = this.soundVolume;
        }
        this._gunOperationAudio.play();
    }
    public stopPlayerAudio (): void {
        if (this._playerMoveAudioS) this._playerMoveAudioS.stop();
        if (this._gunOperationAudio) this._gunOperationAudio.stop();
    }


    private _loopAudio: AudioSource = null!;
    public playLoopAudio (name: string): void {
        if (!this._presistRootNode) return;
        if (!this._loopAudio) {
            this._loopAudio = this._presistRootNode.addComponent(AudioSource);
            this._loopAudio.playOnAwake = false;
            // this._loopAudio["_lock"] = true;
        }
        this._loopAudio.stop();
        let clip: AudioClip = ResLoad.instance.getAudioClip(name);
        this._loopAudio.volume = this.soundVolume;
        this._loopAudio.loop = true;
        this._loopAudio.clip = clip;
        this._loopAudio.play();
    }
    public stopLoopAudio (): void {
        if (this._loopAudio) {
            this._loopAudio.stop();
        }
    }



    /**
     * 一次播放音效
     */
    private _bulletAudio: AudioSource = null!;
    public playOneShotAudio (name: string, isPreheating: boolean = false): void {
        if (!this._presistRootNode) return;
        if (!this._bulletAudio) {
            this._bulletAudio = this._presistRootNode.addComponent(AudioSource);
            this._bulletAudio.playOnAwake = false;
        }
        // this._bulletAudio["_lock"] = true;

        let clip: AudioClip = ResLoad.instance.getAudioClip(name);
        if (isPreheating) {
            this._bulletAudio.volume = this.preHeatingVolume;
        } else {
            this._bulletAudio.volume = this.soundVolume;
        }
        this._bulletAudio.playOneShot(clip);

    }
    /**
     * 播放音效
     */
    public playSound (name: string, isPreheating: boolean = false) {

        if (!this._presistRootNode) return;
        if (!this.soundVolume) {
            return;
        }
        let clip: AudioClip = ResLoad.instance.getAudioClip(name);
        let source = this.getAudioSource(clip);
        let tmp: AudioData = {
            source,
            isMusic: false,
        };
        this.arrSound.push(tmp);
        if (isPreheating) {
            source.volume = this.preHeatingVolume;
        } else {
            source.volume = this.soundVolume;
        }
        source.loop = false;
        source['isPlaying'] = true;
        source['playerTime'] = Date.now();
        source.play();
        source.node.once(AudioSource.EventType.ENDED, () => {
            source['isPlaying'] = false;
        });
    }
    private getAudioSource (clip: AudioClip) {
        /**eslint-disable */
        let result: AudioSource | any;
        let index: number = 0;
        let maxTime: number = 0;
        let time: number = Date.now();
        for (let i = 0; i < this._audioSources.length; ++i) {
            let audioSource: AudioSource | any = this._audioSources[i];
            if (!audioSource['isPlaying']) {
                result = audioSource;
                break;
            }
            if (time - audioSource['playerTime'] > maxTime) {
                index = i;
                maxTime = time - audioSource['playerTime'];
            }
        }
        if (!result) {
            if (this._audioSources.length >= 5) {
                result = this._audioSources[index];
                result.stop();
            } else {
                result = this._presistRootNode.addComponent(AudioSource);
                result.playOnAwake = false;
                this._audioSources.push(result);
            }
        }
        /**eslint-enable */
        result.node.off(AudioSource.EventType.ENDED);
        result.clip = clip;
        result.currentTime = 0;
        return result;
    }


    getAudioSetting (isMusic: boolean) {
        let state;
        if (isMusic) {
            // state = StorageManager.instance.getGlobalData('music');
        } else {
            // state = StorageManager.instance.getGlobalData('sound');
        }
        return !state || state === 'true' ? true : false;
    }
}