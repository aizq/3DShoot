import { _decorator, Component, Node, Vec3 } from 'cc';
import { CatmullRomCurve } from './catmull-rom-curve';
import SplineCurve from './spline-curve';
const { ccclass, property } = _decorator;
/**
 * 曲线管理器
 */
@ccclass('SplineMrg')
export class SplineMrg {
    static curve(positions: Vec3[], num: number): Vec3[] {
        let _positions: Vec3[] = [];
        let splineCurve = new SplineCurve(positions);
        for (let i = 0; i < num; i++) {
            let point: Vec3 = splineCurve.getPoint(i / num);
            point.x = Math.floor(point.x * 1000) / 1000;
            point.y = Math.floor(point.y * 1000) / 1000;
            point.z = Math.floor(point.z * 1000) / 1000;
            _positions.push(point);
        }
        return _positions;
    }

    static catmullRomCurve(positions: Vec3[], num: number): Vec3[] {
        let _positions: Vec3[] = [];
        let curve = new CatmullRomCurve(positions);
        curve.type = 'chordal'; //centripetal  chordal  catmullrom
        curve.tension = 0;  //catmullrom模式下的张力值
        for (let i = 0; i < num; i++) {
            let point: Vec3 = curve.getPoint(i / num);
            //左边小数点后保留三位小数
            point.x = Math.floor(point.x * 1000) / 1000;
            point.y = Math.floor(point.y * 1000) / 1000;
            point.z = Math.floor(point.z * 1000) / 1000;
            _positions.push(point);
        }
        return _positions;
    }
}

