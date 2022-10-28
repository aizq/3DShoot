export default class GunObj {
    public id: number = 0;
    public key: string = "";
    public type: number = 0;
    public name: string = "";
    public bulletNum: number = 0;
    public bulletId: number = 0;
    public fireAudio: string = "";
    public fillBulletAudio: string = "";
    public fillBulletTime: number = 0;
    public equipTime: number = 0;
    public removeTime: number = 0;
    public fireInterval: number = 0.0;
    public icon: string = "";
    public img: string = "";
    public harm: number = 0;
}
export const GunData: MAny = { "100": { "id": 100, "key": "pistol_0", "type": 0, "name": "格洛克", "bulletNum": 17, "bulletId": 1000, "fireAudio": "glock", "fillBulletAudio": "pistol", "fillBulletTime": 3000, "equipTime": 700, "removeTime": 700, "fireInterval": 0.4, "icon": "ic_pistol_0", "img": "img_pistol_0", "harm": 1 }, "200": { "id": 200, "key": "rifle_m4", "type": 3, "name": "M4", "bulletNum": 30, "bulletId": 1001, "fireAudio": "glock", "fillBulletAudio": "rifle", "fillBulletTime": 2730, "equipTime": 877, "removeTime": 877, "fireInterval": 0.15, "icon": "ic_rifle_0", "img": "img_rifle_0", "harm": 1 }, "": { "id": 0, "key": "", "type": 0, "name": "", "bulletNum": 0, "bulletId": 0, "fireAudio": "", "fillBulletAudio": "", "fillBulletTime": 0, "equipTime": 0, "removeTime": 0, "fireInterval": 0, "icon": "", "img": "ss", "harm": 0 } }