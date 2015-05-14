function NoiseBall(SCENE, POS, ROT, OFFSET){
    
    this.scene = SCENE; 
    this.time = 0.0;    
    this.offset = OFFSET

    // this.shader = matcapShader;
    this.shader = textureCubeNoiseShader;
    this.geometry = new THREE.IcosahedronGeometry( 40, 4 );
    // this.geometry = new THREE.SphereGeometry( 40, 100,100 ),

    this.cubeCamera = new THREE.CubeCamera( 1, 10000, 1024 );
    this.cubeCamera.renderTarget.minFilter = THREE.LinearMipMapLinearFilter;
    this.scene.add( this.cubeCamera );

    this.material = new THREE.MeshBasicMaterial( { envMap: this.cubeCamera.renderTarget } );

    var path = "tex/Cube/";
    var format = '.png';
    var urls = [
        path + 'px' + format, path + 'nx' + format,
        path + 'py' + format, path + 'ny' + format,
        path + 'pz' + format, path + 'nz' + format
    ];
    this.textureCube = THREE.ImageUtils.loadTextureCube( urls );
    this.material = new THREE.ShaderMaterial({
        uniforms: this.shader.uniforms,
        vertexShader: this.shader.vertexShader,
        fragmentShader: this.shader.fragmentShader,
        side: 2
    })
    this.material.uniforms["time"].value = this.time;
    this.material.uniforms["tCube"].value = this.cubeCamera.renderTarget;
    this.material.uniforms["tFlip"].value = 1;
    this.material.uniforms["noiseScale"].value = 15.0;
    this.material.uniforms["noiseDetail"].value = 0.05;

    this.mesh = new THREE.Mesh( this.geometry, this.material );

    this.scene.add(this.mesh);

    // this.skyGeo = new THREE.BoxGeometry(10000,10000,10000);
    // this.skyMat = new THREE.MeshBasicMaterial({envMap: this.textureCube});
    // this.skybox = new THREE.Mesh(this.skyGeo, this.skyMat);
    // this.scene.add(this.skybox);

    this.skyShader = THREE.ShaderLib[ "cube" ];
    this.skyShader.uniforms[ "tCube" ].value = this.textureCube;

    this.skyMaterial = new THREE.ShaderMaterial( {

        fragmentShader: this.skyShader.fragmentShader,
        vertexShader: this.skyShader.vertexShader,
        uniforms: this.skyShader.uniforms,
        side: THREE.BackSide

    } )

    this.skyGeometry = new THREE.BoxGeometry(10000,10000,10000);
    this.skyBox = new THREE.Mesh(this.skyGeometry, this.skyMaterial);
    this.scene.add(this.skyBox);

    this.floor = new THREE.Mesh( new THREE.PlaneBufferGeometry( 1000, 1000 ), new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("tex/vessel2.jpg"), side:THREE.DoubleSide}) );
    this.floor.rotation.x = -Math.PI/2;
    this.floor.position.y = -100;
    // this.scene.add( this.floor );

    this.orb = new THREE.Mesh( new THREE.SphereGeometry( 10, 10, 10 ), new THREE.MeshBasicMaterial({/*map: THREE.ImageUtils.loadTexture("tex/vessel2.jpg"),*/ side:THREE.DoubleSide}) );
    this.orb.rotation.x = -Math.PI/2;
    this.orb.position.z = -100;
    // this.orb.position.y = 100;
    this.scene.add( this.orb );

    this.mesh.position.set(POS.x, POS.y, POS.z);
    this.mesh.rotation.set(ROT.x, ROT.y, ROT.z);
    
    
    this.update = function(){
       
        this.time+=0.01;
        this.material.uniforms["time"].value = this.time;
        this.mesh.position.y = 100;
        this.cubeCamera.position.y = this.orb.position.y = this.mesh.position.y;

        this.skyBox.visible = true;

        this.cubeCamera.updateCubeMap( renderer, this.scene );

        this.skyBox.visible = false;

        this.orb.position.z = Math.sin(this.time*10)*100;
        this.orb.position.x = Math.cos(this.time*10)*100;
        // this.orb.material.color = (Math.sin(this.time)>0) ? 0xfffff : 0xff0000;
        this.geometry.verticesNeedUpdate = true;
        // for(var i = 0; i < this.geometry.vertices.length; i++){
        //     this.geometry.vertices[i].y += Math.sin((i-i/2)/(1000) + this.time*10)*0.5; //sin wave effect
        //     this.geometry.vertices[i].z += Math.sin((i-i/2)/(2000) + this.time*5)*0.3; //sin wave effect
        // }
    }

    this.killSelf = function(){
        this.mesh.material.dispose();
        this.mesh.geometry.dispose();

        this.scene.remove(this.mesh);
    }
}