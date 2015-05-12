// function TubeForest(){
    
// 	this.arrFull = false;
// 	this.index = 0;
// 	this.arr=[];
// 	this.max = 100;
// 	this.update = function(){
// 		for(var i = 0; i < this.arr.length; i++){
// 			this.arr[i].update();	
// 		}
// 	}

// 	this.init = function(SCENE, POS, ROT){
        
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
// 	}
// }

function Tube(SCENE, POS, ROT, OFFSET){
	
    this.scene = SCENE;	
    this.time = 0.0;	
    this.offset = OFFSET
    CustomSinCurve = THREE.Curve.create(
        function ( scale ) { //custom curve constructor
            this.scale = (scale === undefined) ? 1 : scale;
        },
        
        function ( t ) { //getPoint: t is between 0-1
            var tx = t * 3 - 1.5,
                // ty = Math.sin( Math.PI * t )*0.4,
                ty = 0,
                tz = 0;
            
            return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);
        }
    );

    this.path = new CustomSinCurve( 1000 );
    this.shader = matcapShader;
    this.matCap = THREE.ImageUtils.loadTexture( 'tex/matcap3.jpg' );
    this.geometry = new THREE.TubeGeometry(this.path, 1000, 20, 100, false);

    this.material = new THREE.ShaderMaterial({
        uniforms: this.shader.uniforms,
        vertexShader: this.shader.vertexShader,
        fragmentShader: this.shader.fragmentShader,
        side: 2
    })

    this.material.uniforms["tMatCap"].value = this.matCap;
    this.material.uniforms["noiseScale"].value = 20.0;
    this.material.uniforms["noiseDetail"].value = 0.01;
    this.material.uniforms["time"].value = this.time;

    this.mesh = new THREE.Mesh( this.geometry, this.material );

	this.scene.add(this.mesh);

    // this.pos;
    // this.pos.x = 0;
    // this.pos.y = 0;
    // this.pos.z = 0;
    
    this.mesh.position.set(POS.x, POS.y, POS.z);
    this.mesh.rotation.set(ROT.x, ROT.y, ROT.z);
    
	
    this.update = function(){
        this.time+=0.01;
        this.material.uniforms["time"].value = this.time;

        this.geometry.verticesNeedUpdate = true;
        for(var i = 0; i < this.geometry.vertices.length; i++){
            this.geometry.vertices[i].y += Math.sin((i-i/2)/(1000) + this.time*10)*0.5; //sin wave effect
        }
	}

	this.killSelf = function(){
		this.mesh.material.dispose();
        this.mesh.geometry.dispose();

		this.scene.remove(this.mesh);
	}
}