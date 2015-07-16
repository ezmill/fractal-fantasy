// function TubeForest(){
    
//  this.arrFull = false;
//  this.index = 0;
//  this.arr=[];
//  this.max = 100;
//  this.update = function(){
//      for(var i = 0; i < this.arr.length; i++){
//          this.arr[i].update();   
//      }
//  }

//  this.init = function(SCENE, POS, ROT){
        
//         if(this.arrFull){
//             this.arr[this.index].killSelf(); 
//         }
        
//         // this.arr[this.index] = new Tube(SCENE, POS, ROT);
//         // for(var i = 0; i< 3; i++){
//         //     for(var j = 0; j<3; j++){
//         //         this.arr[this.index] = new Tube(SCENE, new THREE.Vector3(i*100,0,j*100), new THREE.Vector3(0,Math.PI/2, Math.PI/2));
//         //     }
//         // }
//         this.index++;

//         if(this.index == this.max){
//             this.index=0;
//             this.arrFull = true; 
//         }
//  }
// }

function Tube(SCENE, CAMERA, POS, ROT, OFFSET){
    
    this.scene = SCENE; 
    this.camera = CAMERA; 
    this.time = 0.0;    
    this.offset = OFFSET
    CustomSinCurve = THREE.Curve.create(
        function ( scale ) { //custom curve constructor
            this.scale = (scale === undefined) ? 1 : scale;
        },
        
        function ( t ) { //getPoint: t is between 0-1
            // var tx = t * 3 - 1.5,
            var tx = Math.sin(t*Math.PI*4)/3,
                // ty = Math.sin( Math.PI * t )*0.4,
                ty = 0,
                tz = Math.cos( t*Math.PI*4)/3;
            
            return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);
        }
    );

    this.path = new CustomSinCurve( 1000 );
    // this.path = new THREE.Curves.DecoratedTorusKnot4a();
    this.shader = matcapShader;
    // this.shader = THREE.ShaderLib["cube"];
    // this.matCap = THREE.ImageUtils.loadTexture( 'tex/matcap3.jpg' );
    this.geometry = new THREE.TubeGeometry(this.path, 1000, 50, 100, false);
    // this.geometry = new THREE.TubeGeometry(this.path, 1000, 10, 100, false);
    // this.geometry = new THREE.IcosahedronGeometry(40,4);
    console.log(this.shader.uniforms);
    this.material = new THREE.ShaderMaterial({
        uniforms: this.shader.uniforms,
        vertexShader: this.shader.vertexShader,
        fragmentShader: this.shader.fragmentShader,
        // blending: THREE.AdditiveBlending,
        transparent: true,
        side: 2,
        // depthWrite: false
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
    
    
    this.update = function(){
       
        this.time+=0.01;
        this.material.uniforms["time"].value = this.time;
        this.material.uniforms.viewVector.value = 
        new THREE.Vector3().subVectors( this.camera.position, this.mesh.position );

        this.geometry.verticesNeedUpdate = true;
        for(var i = 0; i < this.geometry.vertices.length; i++){
            this.geometry.vertices[i].y += Math.sin((i-i/2)/(1000) + this.time*10)*1.5; //sin wave effect
            this.geometry.vertices[i].z += Math.sin((i-i/2)/(2000) + this.time*5)*1.3; //sin wave effect
        }
    }

    this.killSelf = function(){
        this.mesh.material.dispose();
        this.mesh.geometry.dispose();

        this.scene.remove(this.mesh);
    }
}