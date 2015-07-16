var container, stats;

var camera, scene, renderer;

var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var material;
var shaderMaterial;
var geometry;
var mesh;
var normalsMesh;

var speeds = [];
var texture;

var sphere, uniforms, attributes;

var rotationX, rotationY;

var lightl;

var controls;
init();

animate();

var gui;
var effectController;
var controls;

var texturesIndex = 0;
var textures = [
	"MatCapZBrush/Lib/material3.jpg",
	"MatCapZBrush/Lib/93e1bbcf77ece0c0f7fc79ecb8ff0d00.png",
	"MatCapZBrush/Lib/_01egg.png",
	"MatCapZBrush/Lib/droplet_01.png",
	"MatCapZBrush/Lib/green_glass_860.png",
	"MatCapZBrush/Lib/JG_Drink01.png",
	"MatCapZBrush/Lib/755_large.jpg"
];


function init() 
{
	container = document.createElement( 'div' );
	document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.z = 500;
		
	scene = new THREE.Scene();
	
	initGeometry();
	initShader();
	
	var r = "assets/tex/";

    var urls = [r + "GARDEN.png", r + "GARDEN.png",
        r + "GARDEN.png", r + "GARDEN.png",
        r + "GARDEN.png", r + "GARDEN.png"
    ];

    var textureCube = THREE.ImageUtils.loadTextureCube(urls, THREE.CubeRefractionMapping);
    textureCube.minFilter = textureCube.magFilter = THREE.NearestFilter;

    var cubeMaterial2 = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: 2,
        envMap: textureCube,
        refractionRatio: 0.8
    });
	//geometry.computeTangents();
	mesh = new THREE.Mesh( geometry, cubeMaterial2);
		
	scene.add(mesh);
	
	for (var i = 0; i < mesh.geometry.vertices.length; i++) {
		speeds.push(0);
	}
	
	light = new THREE.PointLight( 0x222222, 20.5, 1000);
	light.position.set( 100, 10, 100 );
	scene.add(light);
	

	renderer = new THREE.WebGLRenderer();		
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );
	
	
	
	
	initGUI();



	window.addEventListener( 'resize', onWindowResize, false );
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'mouseleave', onMouseLeave, false );
}

// ------------------------------------------- geometry -----------------------------------------------------
function initGeometry() 
{
	var holes = [];
	geometry = new THREE.Geometry();
	
	var size = 15;
	var countX = 85;
	var countY = 60;
	
	for (var i = 0; i < countX; i++) {
		for (var j = 0; j < countY; j++) {
			geometry.vertices.push( new THREE.Vector3( i * size - size * countX / 2, j * size - size * countY / 2, 0 ) );
			geometry.vertices.push( new THREE.Vector3( i * size - size * countX / 2, j * size + size - size * countY / 2, 0 ) );
			geometry.vertices.push( new THREE.Vector3( i * size + size - size * countX / 2, j * size + size - size * countY / 2, 0 ) );
		}
	}
	
	triangles = THREE.Shape.Utils.triangulateShape ( geometry.vertices, holes );
	for( var i = 0; i < triangles.length; i++ )
	{
	    geometry.faces.push(new THREE.Face3(triangles[i][0], triangles[i][1], triangles[i][2]));
	}
	geometry.mergeVertices();
	geometry.computeBoundingSphere();
	geometry.computeCentroids();
	geometry.computeFaceNormals();
    geometry.computeBoundingSphere();
}

function initShader() 
{
	texture = THREE.ImageUtils.loadTexture( "MatCapZBrush/Lib/material3.jpg" );

	attributes = {
	};
	
	uniforms = {
		color:     { type: "c", value: new THREE.Color( 0xff2200 ) },
		texture:   { type: "t", value: texture },
	};
	
	uniforms.texture.value.wrapS = uniforms.texture.value.wrapT = THREE.RepeatWrapping;
	
	shaderMaterial = new THREE.ShaderMaterial( {
		uniforms: 		uniforms,
		attributes:     attributes,
		vertexShader:   document.getElementById('vertexshader').textContent,
		fragmentShader: document.getElementById('fragmentshader').textContent
	});
	
	material = shaderMaterial;
	// material = new THREE.MeshBasicMaterial({
	// 	color: 0xff0000
	// });
}

function initGUI() 
{
	effectController = {
		depth: 200.0,
		radius: 0.9,
		power: 1.0,
	};
	
}

function animate() 
{
	requestAnimationFrame( animate );
	
	var mouseVector = new THREE.Vector3(mouseX / 1.1, mouseY / 1.1, 0);
	
	for (var i = 0; i < mesh.geometry.vertices.length; i++) {
		var vector = mesh.geometry.vertices[i];
		var coord = new THREE.Vector3( vector.x, -vector.y, vector.z );
		var power = effectController.power * 100.0 / (effectController.radius * 0.1 * coord.sub(mouseVector).length() + effectController.radius * 10.0);
		
		speeds[i] -= power * power + mesh.geometry.vertices[i].z * .1;
		speeds[i] *= 0.95;
		mesh.geometry.vertices[i].z += speeds[i];
		mesh.geometry.vertices[i].z = Math.max(-effectController.depth, mesh.geometry.vertices[i].z);
	}
	
	mesh.geometry.verticesNeedUpdate = true;	
	mesh.geometry.computeVertexNormals( true );
	mesh.geometry.normalsNeedUpdate = true;
	
	render();
}

function render() {
	camera.lookAt(scene.position);
	renderer.render( scene, camera );
}

function onWindowResize() {

	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function onMouseLeave(e) {
	mouseX = 100000000;
	mouseY = 100000000;
	e.preventDefault();
	
}

function onDocumentMouseMove(event) {
	mouseX = ( event.clientX - windowHalfX );
	mouseY = ( event.clientY - windowHalfY );
	
	light.position.set(0.3 * mouseX, -0.3 * mouseY, 200);
	
}