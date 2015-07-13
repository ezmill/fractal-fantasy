var LetterShader =  function(){

	this.uniforms = THREE.UniformsUtils.merge( [

		{
			"tMatCap" : {type: 't', value: null },
			"alpha" : {type: 'f', value: 0.0 },
		}
	] ),

	this.vertexShader = [
		"varying vec2 vN;",
		// "varying vec2 vUv;",

		"void main() {",

		"    vec4 p = vec4( position, 1. );",

		"    vec3 e = normalize( vec3( modelViewMatrix * p ) );",
		"    vec3 n = normalize( normalMatrix * normal );",

		"    vec3 r = reflect( e, n );",
		"    float m = 2. * sqrt( ",
		"        pow( r.x, 2. ) + ",
		"        pow( r.y, 2. ) + ",
		"        pow( r.z + 1., 2. ) ",
		"    );",
		"    vN = r.xy / m + .5;",

		"    gl_Position = projectionMatrix * modelViewMatrix * p;",

		"}"
	].join("\n"),
	
	this.fragmentShader = [
		
		"uniform sampler2D tMatCap;",
		"uniform float alpha;",

		"varying vec2 vN;",
		// "varying vec2 vUv;",

		"void main() {",
		"    ",
		"    vec4 base = texture2D( tMatCap, vN );",
		"    gl_FragColor = vec4( base.rgb, alpha );",

		"}"
	
	].join("\n")
	
}
