var passThroughShader = {
    uniforms: THREE.UniformsUtils.merge( [

        {
            "texture"  : { type: "t", value: null },
            "texture2"  : { type: "t", value: null },
            "color"  : { type: "c", value: new THREE.Color('#'+Math.floor(Math.random()*16777215).toString(16)) }
        }
    ] ),

    vertexShader: [
        "varying vec2 vUv;",
        "uniform float time;",
        "void main() {",
        "    vUv = uv;",
        "    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
        "}"
    ].join("\n"),

    fragmentShader: [
        "uniform sampler2D texture; ",
        "uniform sampler2D texture2; ",
        "uniform vec3 color; ",
        "varying vec2 vUv;",

        "void main() {",
        // "    float avg = normalize((texture2D(texture, vUv).rgb + texture2D(texture2, vUv).rgb)*0.5);",
        // "    float avg = dot(texture2D(texture2, vUv), vec4(1.0))/3.0;",
        "    float avg = dot(texture2D(texture2, vUv).rgb, vec3(1.0))/3.0;",
        "    if(avg < 0.1){",
        "      gl_FragColor = vec4(texture2D(texture, vUv).rgb, texture2D(texture, vUv).a);",
        // "      gl_FragColor = vec4(1.0,0.0,0.0,1.0);",
        // "      gl_FragColor = vec4(color,1.0);",
        "    }",
        "    else {",
        "      discard;",
        "    }",
        "    ",
        "}"
    ].join("\n")
}