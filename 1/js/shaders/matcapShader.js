
var noiseChunck = {  

	text:[

		"vec3 mod289(vec3 x){",
		  "return x - floor(x * (1.0 / 289.0)) * 289.0;",
		"}",

		"vec4 mod289(vec4 x){",
		  "return x - floor(x * (1.0 / 289.0)) * 289.0;",
		"}",

		"vec4 permute(vec4 x){",
		  "return mod289(((x*34.0)+1.0)*x);",
		"}",

		"vec4 taylorInvSqrt(vec4 r){",
		  "return 1.79284291400159 - 0.85373472095314 * r;",
		"}",

		"vec3 fade(vec3 t) {",
		  "return t*t*t*(t*(t*6.0-15.0)+10.0);",
		"}",

		"float pnoise(vec3 P, vec3 rep){",
		  "vec3 Pi0 = mod(floor(P), rep);",
		  "vec3 Pi1 = mod(Pi0 + vec3(1.0), rep);",
		  "Pi0 = mod289(Pi0);",
		  "Pi1 = mod289(Pi1);",
		  "vec3 Pf0 = fract(P);",
		  "vec3 Pf1 = Pf0 - vec3(1.0);",
		  "vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);",
		  "vec4 iy = vec4(Pi0.yy, Pi1.yy);",
		  "vec4 iz0 = Pi0.zzzz;",
		  "vec4 iz1 = Pi1.zzzz;",

		  "vec4 ixy = permute(permute(ix) + iy);",
		  "vec4 ixy0 = permute(ixy + iz0);",
		  "vec4 ixy1 = permute(ixy + iz1);",

		  "vec4 gx0 = ixy0 * (1.0 / 7.0);",
		  "vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;",
		  "gx0 = fract(gx0);",
		  "vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);",
		  "vec4 sz0 = step(gz0, vec4(0.0));",
		  "gx0 -= sz0 * (step(0.0, gx0) - 0.5);",
		  "gy0 -= sz0 * (step(0.0, gy0) - 0.5);",

		  "vec4 gx1 = ixy1 * (1.0 / 7.0);",
		  "vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;",
		  "gx1 = fract(gx1);",
		  "vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);",
		  "vec4 sz1 = step(gz1, vec4(0.0));",
		  "gx1 -= sz1 * (step(0.0, gx1) - 0.5);",
		  "gy1 -= sz1 * (step(0.0, gy1) - 0.5);",

		  "vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);",
		  "vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);",
		  "vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);",
		  "vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);",
		  "vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);",
		  "vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);",
		  "vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);",
		  "vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);",

		  "vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));",
		  "g000 *= norm0.x;",
		  "g010 *= norm0.y;",
		  "g100 *= norm0.z;",
		  "g110 *= norm0.w;",
		  "vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));",
		  "g001 *= norm1.x;",
		  "g011 *= norm1.y;",
		  "g101 *= norm1.z;",
		  "g111 *= norm1.w;",

		  "float n000 = dot(g000, Pf0);",
		  "float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));",
		  "float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));",
		  "float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));",
		  "float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));",
		  "float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));",
		  "float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));",
		  "float n111 = dot(g111, Pf1);",

		  "vec3 fade_xyz = fade(Pf0);",
		  "vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);",
		  "vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);",
		  "float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);", 
		  "return 2.2 * n_xyz;",
		"}",

		"float turbulence( vec3 p){",
			"float w = 100.0;",
			"float t = -0.5;",
			"for(float f = 1.0; f<=10.0; f++){",
				"float power = pow(2.0, f);",
				"t += abs( pnoise( vec3( power * p ), vec3( 10.0,10.0,10.0) ) / power);",
			"}",
			"return t;",
		"}",
		"vec3 doTwist( vec3 pos, float t ){",
			"float st = sin(t);",
			"float ct = cos(t);",
			"vec3 new_pos;",
			
			"new_pos.x = pos.x*ct - pos.z*st;",
			"new_pos.z = pos.x*st + pos.z*ct;",
			
			"new_pos.y = pos.y;",
			
			"return new_pos;",
		"}"
	].join("\n")
};

var matcapShader =  {

	uniforms: THREE.UniformsUtils.merge( [

		{
			"tMatCap" : {type: 't', value: null },
			"noiseScale":{type: "f", value:0.0},
			"noiseDetail":{type: "f", value:0.0},
			"time":{type: "f", value:0.0},
			"glowColor":{type: "c", value: null},
			"viewVector": { type: "v3", value: null },
			"c":   { type: "f", value: 0.0 },
			"u_p":   { type: "f", value: 0.0 },
			"resolution":   { type: "v2", value: null }

		}
	] ),

	vertexShader: [

		noiseChunck.text,

		"varying vec2 vN;",
		"varying vec2 vUv;",
		"uniform float noiseDetail;",
		"uniform float noiseScale;",
		"uniform float time;",
		"uniform vec3 viewVector;",
		"uniform float c;",
		"uniform float u_p;",
		"varying float intensity;",
		"varying vec3 pos;",
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
		"    vUv = uv;",
	    "vec3 vNormal = normalize( normalMatrix * normal );",
		"vec3 vNormel = normalize( normalMatrix * viewVector );",
        "pos = position;",

		"intensity = pow( c - dot(vNormal, vNormel), u_p );",

		"float disp = noiseScale * pnoise( noiseDetail * position + vec3(time*2.0), vec3( 10.0 ) );",

		"vec3 newPosition = p.xyz - normal * disp;",


		"    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);",

		"}"
	
	].join("\n"),
	
	fragmentShader: [
		
		"uniform sampler2D tMatCap;",
		"uniform float u_p;",
		"uniform float c;",
		"uniform float time;",
		"uniform vec2 resolution;",

		// "varying vec2 vN;",
		"varying vec2 vUv;",
		"varying vec3 pos;",

		// "void main() {",
		// "    ",
		// "    vec4 base = texture2D( tMatCap, vUv );",
		// "    gl_FragColor = vec4( base.rgb, base.a );",

		// "}"
		"uniform vec3 glowColor;",
		"varying float intensity;",
		"void main() ",
		"{",
		"   float inten = intensity;",
		// "   inten*=(sin(pos.x/10.05));",
		"  float step_w = 1.0/resolution.x;",
		"  float step_h = 1.0/resolution.y;",
		// "  vec4 input0 = texture2D(tMatCap,vUv);",
		"	vec3 glow = glowColor * inten;",

		"  vec3 input0 = mix(glow, texture2D(tMatCap,vUv).rgb, 0.5);",
		"   ",
		"  vec2 x1 = vec2(step_w, 0.0);",
		"  vec2 y1 = vec2(0.0, step_h);",
		"    ",
		"  input0 += texture2D(tMatCap, vUv+x1).rgb; // right",
		"  input0 += texture2D(tMatCap, vUv-x1).rgb; // left",
		"  input0 += texture2D(tMatCap, vUv+y1).rgb; // top",
		"  input0 += texture2D(tMatCap, vUv-y1).rgb; // bottom",

		"  input0 *=0.1;",

		"    gl_FragColor = vec4( texture2D(tMatCap,vUv).rgb, 1.0 );",
		// "    gl_FragColor = vec4( 1.0,0.0,0.0, 1.0 );",
		"}"
	
	].join("\n")
	
}
console.log(matcapShader);
