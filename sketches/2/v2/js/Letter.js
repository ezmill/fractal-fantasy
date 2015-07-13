function initLetters(index){
    var letterLoader = new THREE.JSONLoader();
    letterLoader.load( 'models/json/'+chars[index]+'.json', function( geometry, materials ) {
        var mat = letterMat(chars[index]);
        var letter = new Letter(geometry, mat);
        letters.push(letter);
    });
}
function initDebris(index){
    var debrisMat = letterMat();
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
    this.mesh.position.set(Math.random()*20-10, Math.random()*10-5, 0);
    scene.add(this.mesh);

    this.update = function(){
        // this.material.uniforms["tMatCap"].value.needsUpdate = true;
        this.xRot += 0.01;
        this.yRot += 0.01;
        this.zRot += 0.01;
        this.mesh.rotation.set(this.xRot, this.yRot, this.zRot);
    }
}
function letterMat(tex){
    var shader = new LetterShader;
    var mat = new THREE.ShaderMaterial( {
        uniforms: shader.uniforms,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader,
        side: 2
    } );
    // var mat = new THREE.MeshBasicMaterial({
    //     map: THREE.ImageUtils.loadTexture("../tex/"+"stripe"+".png")
    // });
    // mat.map.minFilter = mat.map.magFilter = THREE.NearestFilter; 

    // mat.uniforms["tMatCap"].value = THREE.ImageUtils.loadTexture("tex/"+"stripe"+".png");
    mat.uniforms["tMatCap"].value = tex; 
    // mat.uniforms["tMatCap"].value.minFilter = mat.uniforms["tMatCap"].value.magFilter = THREE.NearestFilter; 
/*    var video = document.createElement("video");
    video.src = "tex/leaves.m4v";
    video.loop = true;
    mat.uniforms["tMatCap"].value = new THREE.Texture(video);*/
    return mat;
}

function Gradient(WIDTH, HEIGHT){
    this.canvas, this.context;
    this.width, this.height;
    this.colors = [];
    this.hue, this.saturation, this.lightness, this.alpha;
    this.offset;
    this.init = function(){
        this.canvas = document.createElement("canvas");
        this.context = this.canvas.getContext("2d");
        this.canvas.width = WIDTH;
        this.canvas.height = HEIGHT;
        this.hue = Math.random()*360;
        this.saturation = Math.random()*100;
        this.lightness = Math.random()*65 + 35;
        this.alpha = 1.0;
        this.offset = 100;
    }

    this.update = function(){
        this.sampleColors();
        this.gradient=this.context.createLinearGradient(0,0,this.canvas.width,this.canvas.height);
        this.gradient.addColorStop(0, this.colors[0]);
        this.gradient.addColorStop(1, this.colors[1]);
        this.context.fillStyle=this.gradient;
        this.context.fillRect(0,0,this.canvas.width, this.canvas.height);

        this.hue += 0.5;
    }

    this.sampleColors = function(){
        this.colors[0] = hslaColor(this.hue, this.saturation, this.lightness, this.alpha)
        this.colors[1] = hslaColor(this.hue + this.offset, this.saturation, this.lightness, this.alpha)
    }

}