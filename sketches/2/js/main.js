var container;
var scene, renderer, camera, controls;
var mouseX = 0, mouseY = 0;
var time = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var start = Date.now(); 
var letters = [];
var wallCubes = [];

var capturer = new CCapture( { format: 'webm', workersPath: 'js/' } );
var counter = 0;
var chars = [
'A','B','C','D',
'E','F','G','H',
'I','J','K','L',
'M','N','O','P',
'Q','R','S','T',
'U','V','W','X',
'Y','Z','0','1',
'2','3','4','5',
'6','7','8','9'
];
var index = 0;
var matCap = THREE.ImageUtils.loadTexture("tex/matcap2.png");
var targZ = 100000;
var offs = 100;
var speed = 0.01;
init();
animate();

function init() {
        
    // camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 100000);camera.position.set(0,0, 1000);
    camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, -10000, 10000 );camera.position.set(0,0, 1);
    controls = new THREE.OrbitControls(camera);
    
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer( {preserveDrawingBuffer: true} );
    renderer.setClearColor(0xffffff, 1.0)
    // renderer.autoClear = false;
    renderer.setSize( window.innerWidth, window.innerHeight );
    
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.physicallyBasedShading = true;
    
    container = document.getElementById( 'container' );
    container.appendChild( renderer.domElement );
    
    for(var i = 0; i < window.innerWidth; i+=offs){
        for(var j = 0; j < window.innerHeight; j+=offs){
            var wallCube = new WallCube(i-window.innerWidth/2,j-window.innerHeight/2);
            // var wallCube = new WallCube(0,0);
            wallCubes.push(wallCube);
            wallCube.init();
        }
    }

    // document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    // document.addEventListener( 'mousedown', onDocumentMouseDown, false );
    document.addEventListener( 'keydown', function(){screenshot(renderer)}, false );
    // window.addEventListener( 'resize', onWindowResize, false );

}
function animate(){
	window.requestAnimationFrame(animate);
	draw();
}
function onDocumentMouseDown(event){
    // for(var i = 0; i < wallCubes.length; i++){
    //     wallCubes[i].handleDirection();
    // }
    // if(counter == 0){
    //     capturer.start();
    //     counter++;
    // } else {
    //     capturer.stop();
    //     capturer.save( function( blob ) {
    //         window.location = blob;
    //     });
    // }
    // console.log(camera.position.z);


}
function draw(){
    time+=0.01;
    for(var i = 0; i < wallCubes.length; i++){
        wallCubes[i].update();
    }

    // handleCam();
	renderer.render(scene, camera);

    capturer.capture( renderer.domElement );

}

function WallCube(xPos, yPos){
    this.xPos = xPos;
    this.yPos = yPos;

    this.geometry = new THREE.BoxGeometry(offs,offs,offs);
    // this.geometry = new THREE.PlaneBufferGeometry(offs,offs);
    // this.geometry = new THREE.SphereGeometry(offs/2,100,100);
    // this.geometry = new THREE.TetrahedronGeometry(offs+50);
    // this.material = new THREE.MeshNormalMaterial();

    this.directions = ["UP", "DOWN", "LEFT", "RIGHT"];
    this.targetXRot = this.xRot = 0.0;
    this.targetYRot = this.yRot = 0.0;

    this.gradient = new Gradient(4,4);
    this.gradient.init();

    this.texture = new THREE.Texture(this.gradient.canvas);
    this.material = new letterMat(this.texture);

    this.init = function(){
        this.handleDirection();
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(this.xPos, this.yPos, 0.0);
        this.mesh.rotation.set(Math.random()*Math.PI*2,Math.random()*Math.PI*2,Math.random()*Math.PI*2);
        scene.add(this.mesh);
    }
    this.handleDirection = function(){
        this.direction = this.directions[Math.floor(Math.random()*this.directions.length)];
        this.targetXRot = this.xRot = 0.0;
        this.targetYRot = this.yRot = 0.0;
        switch(this.direction){
            case "UP":
                this.targetXRot = -Math.PI/2;
                break;
            case "DOWN":
                this.targetXRot = Math.PI/2;
                break;
            case "LEFT":
                this.targetYRot = -Math.PI/2;
                break;
            case "RIGHT":
                this.targetYRot = Math.PI/2;
                break;
        }
    }
    this.update = function(){
        this.texture.needsUpdate = true;
        this.gradient.update();

        this.rotate();
        // if(Math.abs(this.xRot) == 1.5707963267948966 || Math.abs(this.xRot) == 1.5707963267948966){
            // console.log("pork");
        // }
    }

    this.rotate = function(){
        // this.xRot += (this.targetXRot - this.xRot)*0.1;
        // this.yRot += (this.targetYRot - this.yRot)*0.1;
        // this.mesh.rotation.set(this.xRot, this.yRot, 0.0);
        switch(this.direction){
            case "UP":
                this.mesh.rotation.x -= speed;    
                break;
            case "DOWN":
                this.mesh.rotation.x += speed;    
                break;
            case "LEFT":
                this.mesh.rotation.y -= speed;    
                break;
            case "RIGHT":
                this.mesh.rotation.y += speed;    
                break;
        }
    }
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
        this.saturation = Math.random()*100 + 50;
        // this.saturation = 100;
        this.lightness = Math.random()*65 + 35;
        // this.lightness = 50;
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

        this.hue += 0.05;
    }

    this.sampleColors = function(){
        this.colors[0] = hslaColor(this.hue, this.saturation, this.lightness, this.alpha)
        this.colors[1] = hslaColor(this.hue + this.offset, this.saturation, this.lightness, this.alpha)
    }

}
function hslaColor(h,s,l,a){
    return 'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ')';
}
function handleCam(){
    camera.position.z += (targZ - camera.position.z)*0.001*Math.cos(time*2.0);
    // camera.position.z += (targZ-camera.position.z);
}