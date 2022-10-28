
import { _decorator, Component, Node, BatchingUtility, Mesh, Mat4, MeshRenderer } from 'cc';
const { ccclass, property, executeInEditMode } = _decorator;
/**
 * 静态合批
 */

@ccclass('BatchStaticModel')
// @executeInEditMode
export class BatchStaticModel extends Component {

    onLoad () {
        console.log("合批：", this.node.name);
        this.batchStaticModel(this.node, this.node);
    }
    start () {

    }
    public batchStaticModel (staticModelRoot: Node, batchedRoot: Node): boolean {
        const models = staticModelRoot.getComponentsInChildren(MeshRenderer);
        if (models.length < 2) {
            console.error('the number of static models to batch is less than 2,it needn\'t batch.');
            return false;
        }
        for (let i = 1; i < models.length; i++) {
            if (!models[0].mesh!.validateMergingMesh(models[i].mesh!)) {
                console.error(`the meshes of ${models[0].node.name} and ${models[i].node.name} can't be merged`);
                return false;
            }
            if (!this.checkMaterialisSame(models[0], models[i])) {
                console.error(`the materials of ${models[0].node.name} and ${models[i].node.name} can't be merged`);
                return false;
            }
        }
        const batchedMesh = new Mesh();
        const worldMat = new Mat4();
        const rootWorldMatInv = new Mat4();
        staticModelRoot.getWorldMatrix(rootWorldMatInv);
        Mat4.invert(rootWorldMatInv, rootWorldMatInv);
        for (let i = 0; i < models.length; i++) {
            const comp = models[i];
            comp.node.getWorldMatrix(worldMat);
            Mat4.multiply(worldMat, rootWorldMatInv, worldMat);
            batchedMesh.merge(models[i].mesh!, worldMat);
            comp.enabled = false;
        }
        batchedMesh.struct.minPosition = null!;
        batchedMesh.struct.maxPosition = null!;
        let batchedModel = batchedRoot.getComponent(MeshRenderer);
        if (!batchedModel) {
            batchedModel = batchedRoot.addComponent(MeshRenderer);
        }
        batchedModel.mesh = batchedMesh;
        batchedModel.sharedMaterials = models[0].sharedMaterials;
        return true;
    }
    private checkMaterialisSame (comp1: MeshRenderer, comp2: MeshRenderer): boolean {
        const matNum = comp1.sharedMaterials.length;
        if (matNum !== comp2.sharedMaterials.length) {
            return false;
        }
        for (let i = 0; i < matNum; i++) {
            if (comp1.getRenderMaterial(i) !== comp2.getRenderMaterial(i)) {
                return false;
            }
        }
        return true;
    }
}
