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
    renderer.setClearColor(0x000000, 1.0)
    renderer.setSize( window.innerWidth, window.innerHeight );
    
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.physicallyBasedShading = true;
    
    container = document.getElementById( 'container' );
    container.appendChild( renderer.domElement );


    var forestTex = THREE.ImageUtils.loadTexture("tex/IMG_2560.JPG");
    var forestMat = new THREE.MeshBasicMaterial({map: forestTex});
    // var onProgress = function ( xhr ) {
    //     if ( xhr.lengthComputable ) {
    //         var percentComplete = xhr.loaded / xhr.total * 100;
    //         console.log( Math.round(percentComplete, 2) + '% downloaded' );
    //     }
    // };

    // var onError = function ( xhr ) {
    // };


    // // THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );

    // var loader = new THREE.OBJMTLLoader();
    // loader.load( 'models/obj/Tree Forest.obj', 'models/obj/Tree Forest.mtl', function ( object ) {

    //     // object.position.y = - 80;
    //     scene.add( object );

    // }, onProgress, onError );

    var urls = ["tex/forest.png","tex/forest.png","tex/forest.png","tex/forest.png","tex/forest.png","tex/forest.png"]
    var texCube = THREE.ImageUtils.loadTextureCube(urls, THREE.CubeRefractionMapping);
    var mat = new THREE.MeshBasicMaterial({
        envMap: texCube,
        side: 2
    });
    loadModel("models/obj/Tree Forest.obj", mat );


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
    if(counter == 0){
         capturer.start();
         counter++;
    } else {
        capturer.stop();
        capturer.save( function( blob ) {
            window.location = blob;
        });
    }
}
function draw(){

	renderer.render(scene, camera);

    capturer.capture( renderer.domElement );

}