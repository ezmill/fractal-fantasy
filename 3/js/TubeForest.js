function Tube(SCENE, CAMERA, POS, ROT, OFFSET){
    
    this.scene = SCENE; 
    this.camera = CAMERA; 
    this.time = 0.0;    
    this.offset = OFFSET;

    var binormal = new THREE.Vector3();
    var normal = new THREE.Vector3();
    splineCamera = new THREE.PerspectiveCamera( 84, window.innerWidth / window.innerHeight, 0.01, 10000 );
    var parent = new THREE.Object3D();
    parent.position.y = 100;
    this.scene.add( parent );
    this.cameraScale = 1.0;
    this.lookAhead = true;
    this.cameraTime = 0.0;    

    CustomSinCurve = THREE.Curve.create(
        function ( scale ) { //custom curve constructor
            this.scale = (scale === undefined) ? 1 : scale;
        },
        
        function ( t ) { //getPoint: t is between 0-1
            // var tx = t * 3 - 1.5,
            var tx = Math.cos( t*30)*0.2,
            // var tx = 0,
                ty = Math.sin(t-(Math.PI*2)),
                // ty = t,
                tz = Math.sin( t*50)*0.2;
                // tz = 0;
            
            return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);
        }
    );

    this.path = new CustomSinCurve( 2000 );
    // this.path = new THREE.Curves.DecoratedTorusKnot4a();
    this.shader = matcapShader;
    // this.shader = THREE.ShaderLib["cube"];
    // this.matCap = THREE.ImageUtils.loadTexture( 'tex/matcap3.jpg' );
    this.geometry = new THREE.TubeGeometry(this.path, 1000, 50, 100, false);
    // this.geometry = new THREE.this.meshGeometry(this.path, 1000, 10, 100, false);
    // this.geometry = new THREE.IcosahedronGeometry(40,4);
    console.log(this.shader.uniforms);
    this.material = new THREE.ShaderMaterial({
        uniforms: this.shader.uniforms,
        vertexShader: this.shader.vertexShader,
        fragmentShader: this.shader.fragmentShader,
        blending: THREE.AdditiveBlending,
        transparent: true,
        side: 2,
        depthWrite: false
    })
    this.texture = THREE.ImageUtils.loadTexture("tex/lightning.jpg");
    // this.texture.wrapS = this.texture.wrapT = THREE.RepeatWrapping;
    // this.texture.repeat.set(1,1);
    // this.material = new THREE.MeshBasicMaterial({
    //     map: this.texture,
    //     side: 2
    // })

    this.material.uniforms["tMatCap"].value = this.texture;
    this.material.uniforms["noiseScale"].value = 20.0;
    this.material.uniforms["noiseDetail"].value = 0.01;
    // this.material.uniforms["glowColor"].value = new THREE.Color(0x3a73ca);
    this.material.uniforms["glowColor"].value = new THREE.Color(0xffffff);
    this.material.uniforms["viewVector"].value = this.camera.position;
    this.material.uniforms["u_p"].value = 0.1;
    this.material.uniforms["c"].value = 10.0;
    this.material.uniforms["resolution"].value = new THREE.Vector2(window.innerWidth, window.innerHeight);

    // this.material.uniforms["time"].value = this.time;
    // this.material.uniforms["tCube"].value = this.textureCube;
    // this.material.uniforms["tFlip"].value = -1;

    this.mesh = new THREE.Mesh( this.geometry, this.material );

    this.scene.add(this.mesh);

    this.mesh.position.set(POS.x, POS.y, POS.z);
    this.mesh.rotation.set(ROT.x, ROT.y, ROT.z);
    console.log(this.mesh);
    
    this.update = function(){
       
        // this.time+=1;
        this.cameraTime+=0.25;
        this.time+=0.01;
        this.material.uniforms["time"].value = this.time;
        this.material.uniforms.viewVector.value = 
        new THREE.Vector3().subVectors( this.camera.position, this.mesh.position );

        this.geometry.verticesNeedUpdate = true;
        for(var i = 0; i < this.geometry.vertices.length; i++){
            this.geometry.vertices[i].y += Math.sin((i-i/2)/(500) + this.time*5)*0.75; //sin wave effect
            this.geometry.vertices[i].z += Math.sin((i-i/2)/(1000) + this.time*2.5)*0.75; //sin wave effect
        }
    }

    this.animateSplineCamera = function(){
        var looptime = 1000;
        var t = ( this.cameraTime % looptime ) / looptime;

        var pos = this.mesh.geometry.parameters.path.getPointAt( t );
        pos.multiplyScalar( this.cameraScale );

        // interpolation
        var segments = this.mesh.geometry.tangents.length;
        var pickt = t * segments;
        var pick = Math.floor( pickt );
        var pickNext = ( pick + 1 ) % segments;

        binormal.subVectors( this.mesh.geometry.binormals[ pickNext ], this.mesh.geometry.binormals[ pick ] );
        binormal.multiplyScalar( pickt - pick ).add( this.mesh.geometry.binormals[ pick ] );


        var dir = this.mesh.geometry.parameters.path.getTangentAt( t );

        var offset = 1;

        normal.copy( binormal ).cross( dir );

        // We move on a offset on its binormal
        pos.add( normal.clone().multiplyScalar( offset ) );

        splineCamera.position.copy( pos );


        // Camera Orientation 1 - default look at

        // Using arclength for stablization in look ahead.
        var lookAt = this.mesh.geometry.parameters.path.getPointAt( ( t + 30 / this.mesh.geometry.parameters.path.getLength() ) % 1 ).multiplyScalar( this.cameraScale );
        // splineCamera.lookAt( lookAt );

        // Camera Orientation 2 - up orientation via normal
        // if (!this.lookAhead)
        lookAt.copy( pos ).add( dir );
        splineCamera.matrix.lookAt(splineCamera.position, lookAt, normal);
        splineCamera.rotation.setFromRotationMatrix( splineCamera.matrix, splineCamera.rotation.order );
        // splineCamera.rotation.set(Math.PI/2, Math.PI/2, Math.PI/2)
        // parent.rotation.y += ( targetRotation - parent.rotation.y ) * 0.05;

    }
}