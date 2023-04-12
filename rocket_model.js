
import * as THREE from 'three'

let Colors = {
    white: 0xffffff,
    black: 0x000000,
    red1: 0xd25138,
    red2: 0xc2533b,
    red3: 0xbf5139,
    grey: 0xd9d1b9,
    darkGrey: 0x4d4b54,
    windowBlue: 0xaabbe3,
    windowDarkBlue: 0x4a6e8a,
    thrusterOrange: 0xfea036
};

class RocketModel {

    constructor() {
        this.mesh = new THREE.Group();

        this.scalarBurner = 1.5;
        //custom shapes
        let geoFinShape = new THREE.Shape();
        let x = 0,
            y = 0;

        geoFinShape.moveTo(x, y);
        geoFinShape.lineTo(x, y + 50);
        geoFinShape.lineTo(x + 35, y + 10);
        geoFinShape.lineTo(x + 35, y - 10);
        geoFinShape.lineTo(x, y);

        let finExtrudeSettings = {
            depth: 8,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 2,
            bevelSize: 1,
            bevelThickness: 1
        };

        // geometry
        let headCylinder = new THREE.CylinderGeometry(85, 85, 150,8);
        let headCone = new THREE.CylinderGeometry(5, 85, 150,8);
        let headHemisphere = new THREE.CylinderGeometry(8, 50, 20, 8);
        let geoUpper = new THREE.CylinderGeometry(50, 75, 20, 8);
        let geoMiddle = new THREE.CylinderGeometry(75, 85, 60, 8);
        let geoColumn = new THREE.CylinderGeometry(85, 85, 200, 8);
        let geoFin = new THREE.ExtrudeGeometry(geoFinShape, finExtrudeSettings);
        let geoThruster = new THREE.CylinderGeometry(0, 0, 0, 8);
        let geoConnector = new THREE.CylinderGeometry(35, 55, 90, 8);

        // materials
        let matRoof1 = new THREE.MeshPhongMaterial({
            color: Colors.red1,
            flatShading: true
        });
        let matRoof2 = new THREE.MeshPhongMaterial({
            color: Colors.red2,
            flatShading: true
        });
        let matRoof3 = new THREE.MeshPhongMaterial({
            color: Colors.red3,
            flatShading: true
        });
        let matBody = new THREE.MeshPhongMaterial({
            color: Colors.grey,
            flatShading: true
        });
        let matWindowFrame = new THREE.MeshPhongMaterial({
            color: Colors.darkGrey,
            side: THREE.DoubleSide,
            flatShading: true
        });
        let matWindow = new THREE.MeshPhongMaterial({
            color: Colors.windowDarkBlue
        });
        let matWindowReflection = new THREE.MeshPhongMaterial({
            color: Colors.windowBlue
        });
        let matThruster = new THREE.MeshPhongMaterial({
            color: Colors.thrusterOrange,
            flatShading: true
        });

        this.m = new THREE.Mesh(headHemisphere, matRoof1);
        this.m.position.y = -30;
        this.m.castShadow = true;
        this.m.receiveShadow = true;

        this.m2 = new THREE.Mesh(geoUpper, matRoof2);
        this.m2.position.y = -50
        this.m2.castShadow = true;
        this.m2.receiveShadow = true;

        this.m3 = new THREE.Mesh(geoMiddle, matRoof3);
        this.m3.position.y = -90;
        this.m3.castShadow = true;
        this.m3.receiveShadow = true;

        this.m4 = new THREE.Mesh(headCylinder, matRoof1);
        this.m4.position.y = -40
        this.m4.castShadow = true;
        this.m4.receiveShadow = true;

        this.m5 = new THREE.Mesh(headCone,matRoof1);
        this.m5.position.y = -40
        this.m5.castShadow = true;
        this.m5.receiveShadow = true;


        this.roof = new THREE.Group();
        // the head is cone
        // this.roof.add(this.m, this.m2, this.m3);
        this.roof.add(this.m5)
        // the head is cylinder
        // this.roof.add(m4)

        // this.roof.remove(m4)
        // this.roof.add(m, m2, m3);

        // the head is hemesphere


        let mColumn = new THREE.Mesh(geoColumn, matBody);
        mColumn.position.y = -210;
        mColumn.position.x = 0;
        mColumn.position.z = 0;
        mColumn.castShadow = true;
        mColumn.receiveShadow = true;

        let zPlacement = 85;
        let yPlacement = -310;
        let xPlacement = 8;
        let yRotation = 1.6;
        let scale = 1.8;
        let finWidth = 15;
        let mFinLeft = new THREE.Mesh(geoFin, matRoof3);
        mFinLeft.position.y = yPlacement;
        mFinLeft.position.z = -zPlacement;
        mFinLeft.rotation.y = yRotation - 0.08;
        mFinLeft.scale.set(scale, scale, scale);
        mFinLeft.castShadow = true;
        mFinLeft.receiveShadow = true;
        let mFinRight = new THREE.Mesh(geoFin, matRoof3);
        mFinRight.position.y = yPlacement;
        mFinRight.position.z = zPlacement;
        mFinRight.rotation.y = -yRotation;
        mFinRight.scale.set(scale, scale, scale);
        mFinRight.castShadow = true;
        mFinRight.receiveShadow = true;

        let mfins = new THREE.Group();
        mfins.rotation.y += 1.5;
        mfins.add(mFinLeft, mFinRight);
        this.body = new THREE.Group();
        this.body.add(mColumn, mfins);

        let mThruster = new THREE.Mesh(geoThruster, matWindowFrame);
        mThruster.position.y = -305;
        mThruster.receiveShadow = true;
        mThruster.castShadow = true;

        let mBurner = new THREE.Mesh(geoConnector, matWindowFrame);
        mBurner.position.y = -340;
        mBurner.scale.set(0.7, 0.55, 0.7);
        mBurner.receiveShadow = true;
        mBurner.castShadow = true;


        this.base = new THREE.Group();
        this.base.add(mThruster, mBurner);

        this.base.scale.x = this.scalarBurner;
        this.base.scale.z = this.scalarBurner;

        this.mesh.add(this.roof);
        this.mesh.add(this.body);
        this.mesh.add(this.base);
    }
    headCylinder(){
        this.roof.remove(this.m,this.m2,this.m3,this.m4,this.m5)
        this.roof.add(this.m4)
    }
    headHemisphere(){
        this.roof.remove(this.m,this.m2,this.m3,this.m4,this.m5)
        this.roof.add(this.m,this.m2,this.m3)
    }
    headCone(){
        this.roof.remove(this.m,this.m2,this.m3,this.m4,this.m5)
        this.roof.add(this.m5)
    }
}

export default RocketModel;