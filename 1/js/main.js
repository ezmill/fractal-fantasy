var container;

var camera, scene, renderer;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var emitter;

var mouseDown = false;

var mouseX = 0.0, mouseY = 0.0;
var tube, tubes = [];
var composer;

init();
animate();

function init() {
    
	container = document.createElement( 'div' );
	document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 200000 );
	camera.position.z = 100;
	controls = new THREE.OrbitControls(camera);

	scene = new THREE.Scene();
	// scene.fog = new THREE.Fog( 0x000000, 1, 10 );
    scene.add(new THREE.DirectionalLight( 0x000000, 0.5 ));
	
	renderer = new THREE.WebGLRenderer({alpha: true});
	renderer.setClearColor( 0x000000 );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.sortObjects = false;

	for(var i = 0; i< 1; i++){
		for(var j = 0; j<1; j++){
		    tube = new Tube(scene, camera, new THREE.Vector3(i*50,0,j*50), new THREE.Vector3(0,Math.PI/2, 0), Math.random());
		    tubes.push(tube);
		}
	}

	container.appendChild( renderer.domElement );

	composer = new THREE.EffectComposer( renderer );
	composer.addPass( new THREE.RenderPass( scene, camera ) );

	var effectHBlur = new THREE.ShaderPass( THREE.HorizontalBlurShader );
	var effectVBlur = new THREE.ShaderPass( THREE.VerticalBlurShader );
	effectHBlur.uniforms[ 'h' ].value = 0.4 / ( window.innerWidth / 2 );
	effectVBlur.uniforms[ 'v' ].value = 0.4 / ( window.innerHeight / 2 );
	// composer.addPass(effectVBlur);
	// composer.addPass(effectHBlur);
	// var bloomPass = new THREE.BloomPass(3, 25, 5, 256);
	// var bloomPass = new THREE.BloomPass(1);
	// composer.addPass(bloomPass)
	var effectCopy = new THREE.ShaderPass(THREE.CopyShader);
	effectCopy.renderToScreen = true;
	composer.addPass(effectCopy);

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
    	
	// camera.position.z -= 0.25; 

	for(var i = 0; i < tubes.length; i++){
		tubes[i].update();
	}
	// renderer.clear();
	composer.render( 0.01 );

	// renderer.render( scene, camera );

}