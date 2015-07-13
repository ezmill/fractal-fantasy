function Room(SCENE){
    this.scene = SCENE;

    this.room = new THREE.Object3D();

    this.roomWidth = 200;
    this.roomHeight = 120;
    this.roomDepth = 200;
    this.wallThickness = 2;

    this.noiseTex = THREE.ImageUtils.loadTexture("tex/noise.png");
    this.noiseTex.wrapS = THREE.RepeatWrapping;
    this.noiseTex.wrapT = THREE.RepeatWrapping;
    this.noiseTex.repeat.set(2, 2);

    this.concreteTex = THREE.ImageUtils.loadTexture("tex/concrete.jpg");
    this.concreteTex.wrapS = THREE.RepeatWrapping;
    this.concreteTex.wrapT = THREE.RepeatWrapping;
    this.concreteTex.repeat.set(2, 2);

    this.alloyTex = THREE.ImageUtils.loadTexture("tex/alloy-diffuse.jpg");
    this.alloyBump = THREE.ImageUtils.loadTexture("tex/alloy-bump.jpg");
    this.alloyNormal = THREE.ImageUtils.loadTexture("tex/alloy-normal.jpg");
    this.alloyTex.wrapS = this.alloyTex.wrapT = this.alloyBump.wrapS = this.alloyBump.wrapT = this.alloyBump.wrapS = this.alloyBump.wrapT = THREE.RepeatWrapping;
    this.alloyTex.repeat.set(16, 16);
    this.alloyBump.repeat.set(16, 16);
    this.alloyNormal.repeat.set(16, 16);

    this.wallTex = THREE.ImageUtils.loadTexture("tex/wall.jpg");

    this.loader = new THREE.BinaryLoader();

    this.init = function(){
        this.initLights();
        this.initGeometry();

        // this.room.position.y = -20;
        this.scene.add(this.room);
        this.room.scale.set(3,3,3);
    }

    this.initGeometry = function(){
        this.floorGeometry = new THREE.BoxGeometry(this.roomWidth*2, this.wallThickness, this.roomDepth*2);
        this.floorMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            specular: 0xffffff,
            shininess: 10,
            side: 2,
            map: this.concreteTex,
            lightMap: this.concreteTex,
            bumpMap: this.concreteTex,
            bumpScale: 0.38,
            combine: THREE.MixOperation,
            reflectivity: 0.5
        });
        this.floor = new THREE.Mesh(this.floorGeometry, this.floorMaterial);
        // this.floor.rotation.x = -0.5 * Math.PI;
        this.floor.position.set(0, 0, 0);
        this.scene.add(this.floor);
        this.room.add(this.floor);

        this.leftWallGeometry = new THREE.BoxGeometry(this.wallThickness, this.roomHeight, this.roomDepth);
        this.leftWallMaterial = new THREE.MeshLambertMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            // bumpMap: this.alloyBump,
            // map: this.alloyTex,
            // normalMap: this.alloyNormal,
            // map: this.wallTex
        })
        this.leftWall = new THREE.Mesh(this.leftWallGeometry, this.leftWallMaterial);
        this.leftWall.position.set(-this.roomWidth / 2, this.roomHeight / 2, 0);
        this.scene.add(this.leftWall);
        this.room.add(this.leftWall);

        this.backWallGeometry = new THREE.BoxGeometry(this.roomWidth, this.roomHeight, this.wallThickness);
        this.backWallMaterial = new THREE.MeshLambertMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            // bumpMap: this.alloyBump,
            // map: this.alloyTex,
            // normalMap: this.alloyNormal,
            map: this.wallTex
        })
        this.backWall = new THREE.Mesh(this.backWallGeometry, this.backWallMaterial);
        this.backWall.position.set(0, this.roomHeight / 2, -this.roomDepth / 2);
        this.scene.add(this.backWall);
        this.room.add(this.backWall);

        this.frontWallGeometry = new THREE.BoxGeometry(this.roomWidth, this.roomHeight, this.wallThickness);
        this.frontWallMaterial = new THREE.MeshLambertMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            // bumpMap: this.alloyBump,
            // map: this.alloyTex,
            // normalMap: this.alloyNormal,
            map: this.wallTex
        })
        this.frontWall = new THREE.Mesh(this.frontWallGeometry, this.frontWallMaterial);
        this.frontWall.position.set(0, this.roomHeight / 2, this.roomDepth / 2);
        // this.scene.add(this.frontWall);
        // this.room.add(this.frontWall);


        this.rightWallGeometry = new THREE.BoxGeometry(this.wallThickness, this.roomHeight, this.roomDepth);
        this.rightWallMaterial = new THREE.MeshLambertMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            // bumpMap: this.alloyBump,
            // map: this.alloyTex,
            // normalMap: this.alloyNormal,
            map: this.wallTex
        });
        this.rightWall = new THREE.Mesh(this.rightWallGeometry, this.rightWallMaterial);
        this.rightWall.position.set(this.roomWidth / 2, this.roomHeight / 2, 0);
        this.scene.add(this.rightWall);
        this.room.add(this.rightWall);   


        this.loader.load("obj/ceiling-test.js", function(geometry) {
            this.ceilingMaterial = new THREE.MeshLambertMaterial({
                color: 0xffffff,
                ambient: 0xffffff,
                emissive: 0x666666,
                bumpMap: this.noiseTex
            });
            this.ceiling = new THREE.Mesh(geometry, this.ceilingMaterial);
            this.ceiling.y = -20;
            this.ceiling.scale.set(3,3,3);
            this.scene.add(this.ceiling);
            this.room.add(this.ceiling);
        });      

    }

    this.initLights = function(){
        this.lightTex = THREE.ImageUtils.loadTexture("tex/light.jpg");
        this.lightTex.flipX = true;
        this.lightGeometry = new THREE.BoxGeometry(1, 1, 1);
        this.lightMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            vertexColors: THREE.FaceColors,
            map: this.lightTex
        });

        this.light1 = new THREE.Mesh(this.lightGeometry, this.lightMaterial);
        this.light1.position.set(48, 120, 0);
        this.light1.rotation.set(0, 0, 0);
        this.light1.width = 23.5 / 2;
        this.light1.height = 47.5 / 2;
        this.scene.add(this.light1);
        this.room.add(this.light1);
        this.light1.scale.set(this.light1.width * 2, 0.5, this.light1.height * 2);

        this.light2 = new THREE.Mesh(this.lightGeometry, this.lightMaterial);
        this.light2.position.set(0, 120, 0);
        this.light2.rotation.set(0, 0, 0);
        this.light2.width = 23.5 / 2;
        this.light2.height = 47.5 / 2;
        this.scene.add(this.light2);
        this.room.add(this.light2);
        this.light2.scale.set(this.light2.width * 2, 0.5, this.light2.height * 2);

        this.light3 = new THREE.Mesh(this.lightGeometry, this.lightMaterial);
        this.light3.position.set(-48, 120, 0);
        this.light3.rotation.set(0, 0, 0);
        this.light3.width = 23.5 / 2;
        this.light3.height = 47.5 / 2;
        this.scene.add(this.light3);
        this.room.add(this.light3);
        this.light3.scale.set(this.light3.width * 2, 0.5, this.light3.height * 2);


        this.pointLight1 = new THREE.PointLight(0xffffff, 0.5);
        this.pointLight1.position = this.light1.position;
        this.pointLight1.rotation = this.light1.position;
        this.scene.add(this.pointLight1);
        this.room.add(this.pointLight1);
        this.pointLight2 = new THREE.PointLight(0xffffff, 0.5);
        this.pointLight2.position = this.light2.position;
        this.pointLight2.rotation = this.light2.position;
        this.scene.add(this.pointLight2);
        this.room.add(this.pointLight2);
        this.pointLight3 = new THREE.PointLight(0xffffff, 0.5);
        this.pointLight3.position = this.light3.position;
        this.pointLight3.rotation = this.light3.position;
        this.scene.add(this.pointLight3);
        this.room.add(this.pointLight3);

    }
   
}
