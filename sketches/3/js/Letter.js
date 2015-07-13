function initLetters(index){
    var letterLoader = new THREE.JSONLoader();
    letterLoader.load( 'models/json/'+chars[index]+'.json', function( geometry, materials ) {
        var mat = letterMat(chars[index]);
        var letter = new Letter(geometry, mat);
        letters.push(letter);
    });
}
function initDebris(index){
    // var debrisMat = letterMat();
    // var debrisMat = new THREE.MeshBasicMaterial({color:"red"})
    loadModel("models/obj/ob"+index+".obj", debrisMat );
}


function Letter(GEOMETRY, MATERIAL){

    this.geometry = GEOMETRY;
    
    this.offSpeeds;
    
    this.material = MATERIAL;
    
    
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.scale.set(10,10,10);
    this.xRot = Math.random()*Math.PI*2;
    this.yRot = Math.random()*Math.PI*2;
    this.zRot = Math.random()*Math.PI*2;
    this.mesh.rotation.set(this.xRot, this.yRot, this.zRot);
    // this.mesh.position.set(Math.random()*20-10, Math.random()*10-5, 0);
    this.mesh.position.set(Math.random()*20-10,Math.random()*10-5, 0);
    scene.add(this.mesh);

    this.update = function(){
        // this.material.uniforms["tMatCap"].value.needsUpdate = true;
        this.xRot += 0.01;
        this.yRot += 0.01;
        this.zRot += 0.01;
        this.mesh.rotation.set(this.xRot, this.yRot, this.zRot);
    }
}
function letterMat(LETTER){
/*    var shader = new LetterShader;
    var mat = new THREE.ShaderMaterial( {
        uniforms: shader.uniforms,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader
    } );

    mat.uniforms["tMatCap"].value = THREE.ImageUtils.loadTexture("tex/"+"matcap2"+".png");*/
    var urls = ["tex/forest.png","tex/forest.png","tex/forest.png","tex/forest.png","tex/forest.png","tex/forest.png"]
    var texCube = THREE.ImageUtils.loadTextureCube(urls);
    var mat = new THREE.MeshBasicMaterial({
        envMap: texCube,
        side: 2
    });
/*    var video = document.createElement("video");
    video.src = "tex/leaves.m4v";
    video.loop = true;
    mat.uniforms["tMatCap"].value = new THREE.Texture(video);*/
    return mat;
}