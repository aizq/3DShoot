
import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;


@ccclass('CatmullRomCurve')
export class CatmullRomCurve {
    public type: string = "chordal";
    private first: Vec3 = new Vec3(0, 0, 0);
    private last: Vec3 = new Vec3(0, 0, 0);
    private tmp: Vec3 = new Vec3(0, 0, 0);
    private px = new CubicPoly();
    private py = new CubicPoly();
    private pz = new CubicPoly();
    private points: Vec3[] = [];
    public tension: number = 0.5;
    constructor (points: Vec3[]) {
        this.points = points || [];
    }
    public getPoint (t: number): Vec3 {
        let points = this.points,
            point, intPoint, weight, l;
        l = points.length;
        if (l < 2) console.log('duh, you need at least 2 points');
        point = (l - 1) * t;
        intPoint = Math.floor(point);
        weight = point - intPoint;
        if (weight == 0 && intPoint == l - 1) {
            intPoint = l - 2;
            weight = 1;
        }
        let p0: Vec3 = new Vec3(0, 0, 0);
        let p1 = new Vec3(0, 0, 0);
        let p2 = new Vec3(0, 0, 0);
        let p3 = new Vec3(0, 0, 0);
        if (intPoint == 0) {
            // this.first = points[0];
            // this.first.subtract(points[1]).add(points[0]);
            // first.subVectors().add(points[0]);
            p0 = this.subVectors(points[0], points[1]).add(points[0]);

        } else {
            p0 = points[intPoint - 1];
        }
        p1 = points[intPoint];
        p2 = points[intPoint + 1];
        if (intPoint + 2 < l) {
            p3 = points[intPoint + 2]
        } else {
            p3 = this.subVectors(points[l - 1], points[l - 2]).add(points[l - 2]);

        }
        if (this.type === 'centripetal' || this.type === 'chordal') {
            // init Centripetal / Chordal Catmull-Rom
            let pow = this.type === 'chordal' ? 0.5 : 0.25;
            let dt0 = Math.pow(this.distanceToSquared(p0, p1), pow);
            let dt1 = Math.pow(this.distanceToSquared(p1, p2), pow);
            let dt2 = Math.pow(this.distanceToSquared(p2, p3), pow);
            // safety check for repeated points
            if (dt1 < 1e-4) dt1 = 1.0;
            if (dt0 < 1e-4) dt0 = dt1;
            if (dt2 < 1e-4) dt2 = dt1;

            this.px.initNonuniformCatmullRom(p0.x, p1.x, p2.x, p3.x, dt0, dt1, dt2);
            this.py.initNonuniformCatmullRom(p0.y, p1.y, p2.y, p3.y, dt0, dt1, dt2);
            this.pz.initNonuniformCatmullRom(p0.z, p1.z, p2.z, p3.z, dt0, dt1, dt2);

        } else if (this.type === 'catmullrom') {

            let tension = this.tension;
            this.px.initCatmullRom(p0.x, p1.x, p2.x, p3.x, tension);
            this.py.initCatmullRom(p0.y, p1.y, p2.y, p3.y, tension);
            this.pz.initCatmullRom(p0.z, p1.z, p2.z, p3.z, tension);

        }
        let v = new Vec3(this.px.calc(weight), this.py.calc(weight), this.pz.calc(weight));
        return v;
    }
    private subVectors (a: any, b: any) {
        let v = new Vec3(0, 0, 0);
        v.x = a.x - b.x;
        v.y = a.y - b.y;
        v.z = a.z - b.z;
        return v;
    }
    private distanceToSquared (v: any, w: any) {
        let dx = v.x - w.x;
        let dy = v.y - w.y;
        let dz = v.z - w.z;

        return dx * dx + dy * dy + dz * dz;
    }

}

class CubicPoly {
    /*
         * Compute coefficients for a cubic polynomial
         *   p(s) = c0 + c1*s + c2*s^2 + c3*s^3
         * such that
         *   p(0) = x0, p(1) = x1
         *  and
         *   p'(0) = t0, p'(1) = t1.
         */
    init = function (x0, x1, t0, t1) {
        this.c0 = x0;
        this.c1 = t0;
        this.c2 = - 3 * x0 + 3 * x1 - 2 * t0 - t1;
        this.c3 = 2 * x0 - 2 * x1 + t0 + t1;
    };
    initNonuniformCatmullRom = function (x0, x1, x2, x3, dt0, dt1, dt2) {
        // compute tangents when parameterized in [t1,t2]
        let t1 = (x1 - x0) / dt0 - (x2 - x0) / (dt0 + dt1) + (x2 - x1) / dt1;
        let t2 = (x2 - x1) / dt1 - (x3 - x1) / (dt1 + dt2) + (x3 - x2) / dt2;

        // rescale tangents for parametrization in [0,1]
        t1 *= dt1;
        t2 *= dt1;
        // initCubicPoly
        this.init(x1, x2, t1, t2);
    };
    // standard Catmull-Rom spline: interpolate between x1 and x2 with previous/following points x1/x4
    initCatmullRom = function (x0, x1, x2, x3, tension) {
        this.init(x1, x2, tension * (x2 - x0), tension * (x3 - x1));

    };
    calc = function (t) {
        let t2 = t * t;
        let t3 = t2 * t;
        return this.c0 + this.c1 * t + this.c2 * t2 + this.c3 * t3;

    };
}
