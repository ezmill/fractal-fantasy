var container;

var camera, scene, renderer;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var mouseDown = false;

var mouseX = 0.0, mouseY = 0.0;
var noiseBall, room;
init();
animate();

function init() {
    
	container = document.createElement( 'div' );
	document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 100000 );
	camera.position.z = 500;
	camera.position.y = 300;
	controls = new THREE.OrbitControls(camera);

	scene = new THREE.Scene();
	// scene.fog = new THREE.Fog( 0x000000, 1, 10 );
    scene.add(new THREE.DirectionalLight( 0xffffff, 1.0 ));
	
	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor( 0x000000 );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.sortObjects = false;

	container.appendChild( renderer.domElement );
    
    noiseBall = new NoiseBall(scene, new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0), 0);

    room = new Room(scene);
    room.init();

    document.addEventListener( 'mousemove', onMouseMove, false );
    window.addEventListener( 'resize', onWindowResize, false );
    
    //scene.add(new THREE.Mesh(new THREE.BoxGeometry(10,10,10), new THREE.MeshBasicMaterial({color:0x000000})));
}

function onWindowResize() {

	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function onMouseMove(event) {

	mouseX = ( event.clientX - windowHalfX ) * 20;
	mouseY = ( event.clientY - windowHalfY ) * 20;

}

function animate() {

	requestAnimationFrame( animate );

	render();
    
}

function render() {
    	
    noiseBall.update();
    
	renderer.render( scene, camera );

}