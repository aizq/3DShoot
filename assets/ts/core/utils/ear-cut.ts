/**
 * 耳切法
 */

class Aim {
    // vertex index in coordinates array
    public i: number;

    // vertex coordinates
    public x: number;
    public y: number;

    // previous and next vertex nodes in a polygon ring
    public prev: Aim | null = null;
    public next: Aim | null = null;

    // z-order curve value
    // public z = null;
    public z = 0;

    // previous and next nodes in z-order
    public prevZ: Aim | null = null;
    public nextZ: Aim | null = null;

    // indicates whether this is a steiner point
    public steiner = false;

    constructor (i: number, x: number, y: number) {
        this.i = i;
        this.x = x;
        this.y = y;
    }
}

export class Earcut {
    /*
    * positions: 多边形顶点
    * holeIndices： 岛洞顶点
    * 
    */
    public static polygonEarcut (datas: number[], holeIndices: number[] | null, dim: number): number[] {
        dim = dim || 3;

        const hasHoles = holeIndices ? holeIndices.length : 0;
        const outerLen = hasHoles ? holeIndices![0] * dim : datas.length;
        let outerNode = this.linkedList(datas, 0, outerLen, dim, true);
        const triangles: number[] = [];

        if (!outerNode) {
            return triangles;
        }

        let minX = 0;
        let minY = 0;
        let maxX = 0;
        let maxY = 0;
        let x = 0;
        let y = 0;
        let size = 0;

        if (hasHoles) {
            outerNode = this.eliminateHoles(datas, holeIndices!, outerNode, dim)!;
        }

        // if the shape is not too simple, we'll use z-order curve hash later; calculate polygon bbox
        if (datas.length > 80 * dim) {
            minX = maxX = datas[0];
            minY = maxY = datas[1];

            for (let i = dim; i < outerLen; i += dim) {
                x = datas[i];
                y = datas[i + 1];
                if (x < minX) { minX = x; }
                if (y < minY) { minY = y; }
                if (x > maxX) { maxX = x; }
                if (y > maxY) { maxY = y; }
            }

            // minX, minY and size are later used to transform coords into integers for z-order calculation
            size = Math.max(maxX - minX, maxY - minY);
        }

        this.earcutLinked(outerNode, triangles, dim, minX, minY, size);

        return triangles;
    }
    /*
    * create a circular doubly linked list from polygon points in the specified winding order
    * 按照指定的绕线顺序从多边形点创建一个圆形双链表
    * clockwise 是否是顺时针方向
    */
    private static linkedList (datas: number[], start: number, end: number, dim: number, clockwise: boolean): Aim | null {
        let i = 0;
        let last: Aim | null = null;

        if (clockwise === (this.signedArea(datas, start, end, dim) > 0)) {
            for (i = start; i < end; i += dim) {
                last = this.insertNode(i, datas[i], datas[i + 1], last);
            }
        } else {
            for (i = end - dim; i >= start; i -= dim) {
                last = this.insertNode(i, datas[i], datas[i + 1], last);
            }
        }

        if (last && this.equals(last, last.next!)) {
            this.removeNode(last);
            last = last.next;
        }

        return last;
    }
    /**
     * link every hole into the outer loop, producing a single-ring polygon without holes
     * 将每个孔连接到外环，产生一个没有孔的单环多边形  
     * @param datas 
     * @param holeIndices 
     * @param outerNode 
     * @param dim 
     * @returns 
     */
    private static eliminateHoles (datas: number[], holeIndices: number[], outerNode: Aim | null, dim: number): Aim | null {
        const queue: Aim[] = [];
        let i = 0;
        let len = 0;
        let start = 0;
        let end = 0;
        let list: Aim | null = null;

        for (i = 0, len = holeIndices.length; i < len; i++) {
            start = holeIndices[i] * dim;
            end = i < len - 1 ? holeIndices[i + 1] * dim : datas.length;
            list = this.linkedList(datas, start, end, dim, false);
            if (!list) {
                continue;
            }
            if (list === list.next) {
                list.steiner = true;
            }

            queue.push(this.getLeftmost(list));
        }

        queue.sort(this.compareX);

        if (!outerNode) {
            return outerNode;
        }

        // process holes from left to right
        for (i = 0; i < queue.length; i++) {
            this.eliminateHole(queue[i], outerNode);
            outerNode = this.filterPoints(outerNode, outerNode!.next);
        }

        return outerNode;
    }
    /**
     * find a bridge between vertices that connects hole with an outer ring and and link it
     * 找到连接孔和外环的顶点之间的桥，并连接它  
     * @param hole 
     * @param outerNode 
     */
    private static eliminateHole (hole: Aim, outerNode: Aim | null) {
        outerNode = this.findHoleBridge(hole, outerNode!);
        if (outerNode) {
            const b = this.splitPolygon(outerNode, hole);
            this.filterPoints(b, b.next);
        }
    }

    /**
     * David Eberly's algorithm for finding a bridge between hole and outer polygon
     * David Eberly的寻找孔和外多边形之间桥梁的算法  
     * @param hole 
     * @param outerNode 
     * @returns 
     */
    private static findHoleBridge (hole: Aim, outerNode: Aim): Aim | null {
        let p = outerNode;
        const hx = hole.x;
        const hy = hole.y;
        let qx = -Infinity;
        let m: Aim | null = null;

        // find a segment intersected by a ray from the hole's leftmost point to the left;
        // segment's endpoint with lesser x will be potential connection point
        do {
            if (hy <= p.y && hy >= p.next!.y) {
                const x = p.x + (hy - p.y) * (p.next!.x - p.x) / (p.next!.y - p.y);
                if (x <= hx && x > qx) {
                    qx = x;
                    if (x === hx) {
                        if (hy === p.y) { return p; }
                        if (hy === p.next!.y) { return p.next; }
                    }
                    m = p.x < p.next!.x ? p : p.next!;
                }
            }
            p = p.next!;
        } while (p !== outerNode);

        if (!m) {
            return null;
        }

        if (hx === qx) {
            return m.prev;
        } // hole touches outer segment; pick lower endpoint

        // look for points inside the triangle of hole point, segment intersection and endpoint;
        // if there are no points found, we have a valid connection;
        // otherwise choose the point of the minimum angle with the ray as connection point

        const stop = m;
        const mx = m.x;
        const my = m.y;
        let tanMin = Infinity;
        let tan;

        p = m.next!;

        while (p !== stop) {
            if (hx >= p.x && p.x >= mx
                && this.pointInTriangle(hy < my ? hx : qx, hy, mx, my, hy < my ? qx : hx, hy, p.x, p.y)) {
                tan = Math.abs(hy - p.y) / (hx - p.x); // tangential

                if ((tan < tanMin || (tan === tanMin && p.x > m.x)) && this.locallyInside(p, hole)) {
                    m = p;
                    tanMin = tan;
                }
            }

            p = p.next!;
        }

        return m;
    }

    private static compareX (a: Aim, b: Aim) {
        return a.x - b.x;
    }
    /**
     * find the leftmost node of a polygon ring
     * 求多边形环的最左结点
     * @param start 
     * @returns 
     */
    private static getLeftmost (start: Aim): Aim {
        let p = start;
        let leftmost = start;
        do {
            if (p.x < leftmost.x) {
                leftmost = p;
            }

            p = p.next!;
        } while (p !== start);

        return leftmost;
    }

    /*
    * 多边形有向面积计算（多边形面积的2倍）
    * 结果：
    */
    private static signedArea (datas: number[], start: number, end: number, dim: number) {
        let sum = 0;
        for (let i = start, j = end - dim; i < end; i += dim) {
            sum += (datas[j] - datas[i]) * (datas[i + 1] + datas[j + 1]);
            j = i;
        }
        return sum;
        // let p = [
        //     new Vec3(-1, 0, -1),
        //     new Vec3(1, 0, -1),
        //     new Vec3(1, 0, 1),
        //     new Vec3(-1, 0, 1),
        // ];
        // let sum = 0;
        // for (let i = 0; i < 4; i++) {
        //     let next: number = (i + 1) === 4 ? 0 : i + 1;
        //     // var dx = p[next].x - p[i].x;
        //     // var dz = p[next].z + p[i].z;
        //     // sum += (dx * dz);
        //     sum += p[i].x * p[next].z - p[next].x * p[i].z;
        // }
        // console.log(sum);
    }
    /*
    * create a node and optionally link it with previous one (in a circular doubly linked list)
    * 创建一个节点，并可选地将其与前一个节点链接(在一个循环双链表中)
    */
    private static insertNode (i: number, x: number, y: number, last: Aim | null): Aim {
        const p = new Aim(i, x, y);

        if (!last) {
            p.prev = p;
            p.next = p;
        } else {
            p.next = last.next;
            p.prev = last;
            last.next!.prev = p;
            last.next = p;
        }

        return p;
    }

    /*
    * check if two segments intersect
    * 检测两条线段是否相等
    */
    private static equals (p1: Aim, p2: Aim): boolean {
        return p1.x === p2.x && p1.y === p2.y;
    }
    /*
    * 移除一个节点
    */
    private static removeNode (p: Aim) {
        p.next!.prev = p.prev;
        p.prev!.next = p.next;

        if (p.prevZ) {
            p.prevZ.nextZ = p.nextZ;
        }

        if (p.nextZ) {
            p.nextZ.prevZ = p.prevZ;
        }
    }
    /*
    * main ear slicing loop which triangulates a polygon (given as a linked list)
    * 主耳切片循环，三角形化一个多边形(作为一个链表给出)
    */
    private static earcutLinked (ear: Aim | null, triangles: number[], dim: number, minX: number, minY: number, size: number, pass = 0) {
        if (!ear) {
            return;
        }

        // interlink polygon nodes in z-order
        if (!pass && size) {
            this.indexCurve(ear, minX, minY, size);
        }

        let stop: Aim | null = ear;
        let prev: Aim | null = null;
        let next: Aim | null = null;

        // iterate through ears, slicing them one by one
        while (ear!.prev !== ear!.next) {
            prev = ear!.prev!;
            next = ear!.next!;

            if (size ? this.isEarHashed(ear!, minX, minY, size) : this.isEar(ear!)) {
                // cut off the triangle
                triangles.push(prev.i / dim);
                triangles.push(ear!.i / dim);
                triangles.push(next.i / dim);

                this.removeNode(ear!);

                // skipping the next vertices leads to less sliver triangles
                ear = next.next;
                stop = next.next;

                continue;
            }

            ear = next;

            // if we looped through the whole remaining polygon and can't find any more ears
            if (ear === stop) {
                // try filtering points and slicing again
                if (!pass) {
                    this.earcutLinked(this.filterPoints(ear), triangles, dim, minX, minY, size, 1);

                    // if this didn't work, try curing all small self-intersections locally
                } else if (pass === 1) {
                    ear = this.cureLocalIntersections(ear, triangles, dim);
                    this.earcutLinked(ear, triangles, dim, minX, minY, size, 2);

                    // as a last resort, try splitting the remaining polygon into two
                } else if (pass === 2) {
                    this.splitEarcut(ear, triangles, dim, minX, minY, size);
                }

                break;
            }
        }
    }
    /*
    * interlink polygon nodes in z-order
    * 按z轴顺序连接多边形节点
    */
    private static indexCurve (start: Aim, minX: number, minY: number, size: number): void {
        let p = start;
        do {
            if (p.z === null) {
                p.z = this.zOrder(p.x, p.y, minX, minY, size);
            }

            p.prevZ = p.prev;
            p.nextZ = p.next;
            p = p.next!;
        } while (p !== start);

        p.prevZ!.nextZ = null;
        p.prevZ = null;

        this.sortLinked(p);
    }
    /*
    * z-order of a point given coords and size of the data bounding box
    * 给定坐标和数据包围框大小的点的z轴顺序
    */
    private static zOrder (x: number, y: number, minX: number, minY: number, size: number): number {
        // coords are transformed into non-negative 15-bit integer range
        x = 32767 * (x - minX) / size;
        y = 32767 * (y - minY) / size;

        x = (x | (x << 8)) & 0x00FF00FF;
        x = (x | (x << 4)) & 0x0F0F0F0F;
        x = (x | (x << 2)) & 0x33333333;
        x = (x | (x << 1)) & 0x55555555;

        y = (y | (y << 8)) & 0x00FF00FF;
        y = (y | (y << 4)) & 0x0F0F0F0F;
        y = (y | (y << 2)) & 0x33333333;
        y = (y | (y << 1)) & 0x55555555;

        return x | (y << 1);
    }
    /*
    * Simon Tatham's linked list merge sort algorithm
    * http://www.chiark.greenend.org.uk/~sgtatham/algorithms/listsort.html
    * Simon Tatham的链表归并排序算法
    */
    private static sortLinked (list: Aim | null): Aim | null {
        let i = 0;
        let p: Aim | null = null;
        let q: Aim | null = null;
        let e: Aim | null = null;
        let tail: Aim | null = null;
        let numMerges = 0;
        let pSize = 0;
        let qSize = 0;
        let inSize = 1;

        do {
            p = list;
            list = null;
            tail = null;
            numMerges = 0;

            while (p) {
                numMerges++;
                q = p;
                pSize = 0;
                for (i = 0; i < inSize; i++) {
                    pSize++;
                    q = q.nextZ;
                    if (!q) { break; }
                }

                qSize = inSize;

                while (pSize > 0 || (qSize > 0 && q)) {
                    if (pSize === 0) {
                        e = q;
                        q = q!.nextZ;
                        qSize--;
                    } else if (qSize === 0 || !q) {
                        e = p;
                        p = p!.nextZ;
                        pSize--;
                    } else if (p!.z <= q.z) {
                        e = p;
                        p = p!.nextZ;
                        pSize--;
                    } else {
                        e = q;
                        q = q.nextZ;
                        qSize--;
                    }

                    if (tail) { tail.nextZ = e; } else { list = e; }

                    e!.prevZ = tail;
                    tail = e;
                }

                p = q;
            }

            tail!.nextZ = null;
            inSize *= 2;
        } while (numMerges > 1);

        return list;
    }
    /*
    * 是否是耳朵散列
    */
    private static isEarHashed (ear: Aim, minX: number, minY: number, size: number): boolean {
        const a = ear.prev!;
        const b = ear;
        const c = ear.next!;

        if (this.area(a, b, c) >= 0) { return false; } // reflex, can't be an ear

        // triangle bbox; min & max are calculated like this for speed
        const minTX = a.x < b.x ? (a.x < c.x ? a.x : c.x) : (b.x < c.x ? b.x : c.x);
        const minTY = a.y < b.y ? (a.y < c.y ? a.y : c.y) : (b.y < c.y ? b.y : c.y);
        const maxTX = a.x > b.x ? (a.x > c.x ? a.x : c.x) : (b.x > c.x ? b.x : c.x);
        const maxTY = a.y > b.y ? (a.y > c.y ? a.y : c.y) : (b.y > c.y ? b.y : c.y);

        // z-order range for the current triangle bbox;
        const minZ = this.zOrder(minTX, minTY, minX, minY, size);
        const maxZ = this.zOrder(maxTX, maxTY, minX, minY, size);

        // first look for points inside the triangle in increasing z-order
        let p = ear.nextZ;

        while (p && p.z <= maxZ) {
            if (p !== ear.prev && p !== ear.next
                && this.pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y)
                && this.area(p.prev!, p, p.next!) >= 0) { return false; }
            p = p.nextZ;
        }

        // then look for points in decreasing z-order
        p = ear.prevZ;

        while (p && p.z >= minZ) {
            if (p !== ear.prev && p !== ear.next
                && this.pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y)
                && this.area(p.prev!, p, p.next!) >= 0) {
                return false;
            }

            p = p.prevZ;
        }

        return true;
    }
    /*
    * 是否是耳朵
    */
    private static isEar (ear: Aim): boolean {
        const a = ear.prev!;
        const b = ear;
        const c = ear.next!;

        if (this.area(a, b, c) >= 0) { return false; } // reflex, can't be an ear

        // now make sure we don't have other points inside the potential ear
        let p = ear.next!.next!;

        while (p !== ear.prev) {
            if (this.pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y)
                && this.area(p.prev!, p, p.next!) >= 0) { return false; }
            p = p.next!;
        }

        return true;
    }
    /*
    * 计算面积
    */
    private static area (p: Aim, q: Aim, r: Aim): number {
        return (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
    }

    /*
    * heck if a point lies within a convex triangle
    * 检测一个点是否在凸多边形内
    */
    private static pointInTriangle (ax: number, ay: number, bx: number, by: number, cx: number, cy: number, px: number, py: number): boolean {
        return (cx - px) * (ay - py) - (ax - px) * (cy - py) >= 0
            && (ax - px) * (by - py) - (bx - px) * (ay - py) >= 0
            && (bx - px) * (cy - py) - (cx - px) * (by - py) >= 0;
    }
    /*
    * eliminate colinear or duplicate points
    * 消除共线或重复点
    */
    private static filterPoints (start: Aim | null, end: Aim | null = null): Aim | null {
        if (!start) {
            return start;
        }

        if (!end) {
            end = start;
        }

        let p = start;
        let again = false;
        do {
            again = false;

            if (!p.steiner && (this.equals(p, p.next!) || this.area(p.prev!, p, p.next!) === 0)) {
                this.removeNode(p);
                p = end = p.prev!;
                if (p === p.next) {
                    return null;
                }
                again = true;
            } else {
                p = p.next!;
            }
        } while (again || p !== end);

        return end;
    }
    /*
    * go through all polygon nodes and cure small local self-intersections
    * 遍历所有多边形节点，并对局部自交点进行处理
    */
    private static cureLocalIntersections (start: Aim, triangles: number[], dim: number): Aim {
        let p = start;
        do {
            const a = p.prev!;
            const b = p.next!.next!;

            if (!this.equals(a, b) && this.intersects(a, p, p.next!, b) && this.locallyInside(a, b) && this.locallyInside(b, a)) {
                triangles.push(a.i / dim);
                triangles.push(p.i / dim);
                triangles.push(b.i / dim);

                // remove two nodes involved
                this.removeNode(p);
                this.removeNode(p.next!);

                p = start = b;
            }
            p = p.next!;
        } while (p !== start);

        return p;
    }
    /*
    * try splitting polygon into two and triangulate them independently
    * 试着将多边形分裂成两个，并独立地对它们进行三角剖分
    */
    private static splitEarcut (start: Aim | null, triangles: number[], dim: number, minX: number, minY: number, size: number): void {
        // look for a valid diagonal that divides the polygon into two
        let a = start!;
        do {
            let b = a.next!.next;
            while (b !== a.prev) {
                if (a.i !== b!.i && this.isValidDiagonal(a, b!)) {
                    // split the polygon in two by the diagonal
                    let c = this.splitPolygon(a, b!);

                    // filter colinear points around the cuts
                    a = this.filterPoints(a, a.next)!;
                    c = this.filterPoints(c, c.next)!;

                    // run earcut on each half
                    this.earcutLinked(a, triangles, dim, minX, minY, size);
                    this.earcutLinked(c, triangles, dim, minX, minY, size);
                    return;
                }
                b = b!.next;
            }
            a = a.next!;
        } while (a !== start);
    }
    /*
    * check if a diagonal between two polygon nodes is valid (lies in polygon interior)
    * 检查两个多边形节点之间的对角线是否有效(位于多边形内部)
    */
    private static isValidDiagonal (a: Aim, b: Aim): boolean {
        return a.next!.i !== b.i && a.prev!.i !== b.i && !this.intersectsPolygon(a, b)
            && this.locallyInside(a, b) && this.locallyInside(b, a) && this.middleInside(a, b);
    }

    /**
    * link two polygon vertices with a bridge; if the vertices belong to the same ring, it splits polygon into two;
    * if one belongs to the outer ring and another to a hole, it merges it into a single ring
    * 用桥连接两个多边形顶点; 如果顶点属于同一个环，它将多边形分割为两个;
    * 如果一个属于外环，另一个属于一个洞，它将其合并为一个单独的环
    */
    private static splitPolygon (a: Aim, b: Aim): Aim {
        const a2 = new Aim(a.i, a.x, a.y);
        const b2 = new Aim(b.i, b.x, b.y);
        const an = a.next!;
        const bp = b.prev!;

        a.next = b;
        b.prev = a;

        a2.next = an;
        an.prev = a2;

        b2.next = a2;
        a2.prev = b2;

        bp.next = b2;
        b2.prev = bp;

        return b2;
    }
    /*
    * check if two segments intersect
    * 检查两段是否相交
    */
    private static intersects (p1: Aim, q1: Aim, p2: Aim, q2: Aim): boolean {
        if ((this.equals(p1, q1) && this.equals(p2, q2))
            || (this.equals(p1, q2) && this.equals(p2, q1))) {
            return true;
        }

        return this.area(p1, q1, p2) > 0 !== this.area(p1, q1, q2) > 0
            && this.area(p2, q2, p1) > 0 !== this.area(p2, q2, q1) > 0;
    }
    /*
    * check if a polygon diagonal is locally inside the polygon
    * 检查一个多边形的对角线是否在该多边形的局部内  
    */
    private static locallyInside (a: Aim, b: Aim): boolean {
        return this.area(a.prev!, a, a.next!) < 0
            ? this.area(a, b, a.next!) >= 0 && this.area(a, a.prev!, b) >= 0
            : this.area(a, b, a.prev!) < 0 || this.area(a, a.next!, b) < 0;
    }
    /*
    *  check if a polygon diagonal intersects any polygon segments
    *  检查一个多边形的对角线是否与任何多边形段相交  
    */
    private static intersectsPolygon (a: Aim, b: Aim): boolean {
        let p = a;
        do {
            if (p.i !== a.i && p.next!.i !== a.i && p.i !== b.i && p.next!.i !== b.i
                && this.intersects(p, p.next!, a, b)) { return true; }
            p = p.next!;
        } while (p !== a);

        return false;
    }
    /**
    * check if the middle point of a polygon diagonal is inside the polygon
    * 检查多边形对角线的中点是否在多边形内部  
    */
    private static middleInside (a: Aim, b: Aim): boolean {
        let p = a;
        let inside = false;
        const px = (a.x + b.x) / 2;
        const py = (a.y + b.y) / 2;
        do {
            if (((p.y > py) !== (p.next!.y > py)) && (px < (p.next!.x - p.x) * (py - p.y) / (p.next!.y - p.y) + p.x)) {
                inside = !inside;
            }
            p = p.next!;
        } while (p !== a);

        return inside;
    }



}