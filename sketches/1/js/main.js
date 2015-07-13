var container;
var scene, renderer, camera, controls;
var mouseX = 0, mouseY = 0;
var time = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var start = Date.now(); 
var letters = [];
var debris = [];

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
var debrisIndex = 0;
var matCap = THREE.ImageUtils.loadTexture("tex/matcap2.png");
init();
animate();

function init() {
        
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 100000);
    // camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, -10000, 10000 );camera.position.set(0,0, 1);

    camera.position.set(0,0, 10);
    controls = new THREE.OrbitControls(camera);
    
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer( {preserveDrawingBuffer: true} );
    renderer.setClearColor(0xffffff, 1.0)
    renderer.setSize( window.innerWidth, window.innerHeight );
    
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.physicallyBasedShading = true;
    
    container = document.getElementById( 'container' );
    container.appendChild( renderer.domElement );
    
    // for(var i = 0; i < chars.length; i++){
    //     initLetters(index);
    //     index++;
    // }

    debrisMat = new letterMat();
    for(var i = 0; i < 999; i++){
        initDebris(debrisIndex);
        debrisIndex++;
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

}
function draw(){
    // for(var i = 0; i < letters.length; i++){
    //     letters[i].update();
    // }
    for(var i = 0; i<debris.length;i++){
        debris[i].rotation.x += 0.001;
        debris[i].rotation.y += 0.001;
        debris[i].rotation.z += 0.001;
        // debris[i].children[0].rotation.x += 0.001;
        // debris[i].children[0].rotation.y += 0.001;
        // debris[i].children[0].rotation.z += 0.001;
    }
	renderer.render(scene, camera);

    capturer.capture( renderer.domElement );

}