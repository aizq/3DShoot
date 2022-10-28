/**
 * 2021.3.27
 * 常用Math方法封装
 */

import { _decorator, Component, Node, Vec3, Mat4, Quat, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MathTool')
export class MathTool {
    /**
     * 获取两点直接的夹角弧度
     */
    static getRad (point1: Vec3, point2: Vec3): number {
        //对边比临边
        return Math.atan2((point2.y - point1.y), (point2.x - point1.x));
    }
    /**
     * 获取两点直接的距离
     */
    static getDis (point1: Vec3, point2: Vec3): number {
        let x = point2.x - point1.x;
        let y = point2.y - point1.y;
        let z = point2.z - point1.z;
        //计算斜边长度
        let dis = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
        return dis;
    }
    static getDisVec2 (point1: Vec2, point2: Vec2): number {
        let x = point2.x - point1.x;
        let y = point2.y - point1.y;
        //计算斜边长度
        let dis = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        return dis;
    }
    /**
     * 将弧度转化为角度
     */
    static radToAngle (rad: number) {
        let angle = rad * 180 / Math.PI;
        return angle;
    }
    /**
     * 获取节点相对世界坐标系下的欧拉角度
     */
    static getWorldEulerAngles (node: Node): Vec3 {
        let mat: Mat4 = node.getWorldRS();
        let quat: Quat = new Quat();
        mat.getRotation(quat);
        let eulerAngle: Vec3 = new Vec3(0, 0, 0);
        quat.getEulerAngles(eulerAngle);
        return eulerAngle;
    }

    /**
    * 判断一个坐标是否在摄像机范围内
    * @param worldPos 
    * @returns 
    */
    private static _tempVecInView: Vec3 = new Vec3();
    private static _tempDirVecInView: Vec3 = new Vec3();
    private static _tempForwardInView: Vec3 = new Vec3();
    public static IsInView (cameraNode: Node, worldPos: Vec3): boolean {
        this._tempVecInView = cameraNode.getWorldPosition();
        this._tempDirVecInView = worldPos.clone().subtract(this._tempVecInView)
        this._tempForwardInView = cameraNode.forward;
        let dot = Vec3.dot(this._tempForwardInView, this._tempDirVecInView);
        // let viewportRect = view.getViewportRect();
        // let viewPos: Vec3 = this._camera?.worldToScreen(worldPos)!;
        // console.log(dot > 0, (viewPos.x <= viewportRect.width), (viewPos.x >= 0), (viewPos.y <= viewportRect.height), (viewPos.y >= 0));
        // if (dot > 0 && (viewPos.x <= viewportRect.width) && (viewPos.x >= 0) && (viewPos.y <= viewportRect.height) && (viewPos.y >= 0)) {
        //     // 判断物体是否在视窗内
        //     return true;
        // }
        if (dot > 0) {
            return true;
        }
        return false;
    }

}
