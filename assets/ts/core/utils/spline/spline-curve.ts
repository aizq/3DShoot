import { Vec3 } from "cc";
import { Curve } from "./curve";

export default class SplineCurve {
    private points: Vec3[] = [];
    constructor (points: Vec3[]) {
        this.points = (points == undefined) ? [] : points;
    }
    public getPoint (t: number): Vec3 {
        let points = this.points;
        let point = (points.length - 1) * t;

        let intPoint = Math.floor(point);
        let weight = point - intPoint;

        let point0: Vec3 = points[intPoint == 0 ? intPoint : intPoint - 1];
        let point1: Vec3 = points[intPoint];
        let point2: Vec3 = points[intPoint > points.length - 2 ? points.length - 1 : intPoint + 1];
        let point3: Vec3 = points[intPoint > points.length - 3 ? points.length - 1 : intPoint + 2];

        let vector = new Vec3(0, 0, 0);
        vector.x = Curve.interpolate(point0.x, point1.x, point2.x, point3.x, weight);
        vector.y = Curve.interpolate(point0.y, point1.y, point2.y, point3.y, weight);
        vector.z = Curve.interpolate(point0.z, point1.z, point2.z, point3.z, weight);
        return vector;
    }

}