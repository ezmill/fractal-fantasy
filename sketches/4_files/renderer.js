/*
 * WebGL Water
 * http://madebyevan.com/webgl-water/
 *
 * Copyright 2011 Evan Wallace
 * Released under the MIT license
 */

var helperFunctions = '\
  const float IOR_AIR = 1.0;\
  const float IOR_WATER = 1.333;\
  const vec3 abovewaterColor = vec3(0.8, 0.9, 0.9);\
  const vec3 underwaterColor = vec3(0.8, 0.9, 1.0);\
  const float poolHeight = .7;\
  uniform float op;\
  uniform vec3 light;\
  uniform vec3 sphereCenter;\
  uniform vec3 sphereNormals;\
  uniform float sphereRadius;\
  uniform sampler2D causticTex;\
  uniform sampler2D water;\
  uniform sampler2D sref;\
  uniform sampler2D srefl;\
  uniform samplerCube sky;\
  uniform vec3 eye;\
  \
  vec2 intersectCube(vec3 origin, vec3 ray, vec3 cubeMin, vec3 cubeMax) {\
    vec3 tMin = (cubeMin - origin) / ray;\
    vec3 tMax = (cubeMax - origin) / ray;\
    vec3 t1 = min(tMin, tMax);\
    vec3 t2 = max(tMin, tMax);\
    float tNear = max(max(t1.x, t1.y), t1.z);\
    float tFar = min(min(t2.x, t2.y), t2.z);\
    return vec2(tNear, tFar);\
  }\
  vec2 intersectLogo(vec3 origin, vec3 ray, vec3 cubeMin, vec3 cubeMax) {\
    vec3 tMin = (cubeMin - origin) / ray;\
    vec3 tMax = (cubeMax - origin) / ray;\
    vec3 t1 = min(tMin, tMax);\
    vec3 t2 = max(tMin, tMax);\
    float tNear = max(max(t1.x, t1.y), t1.z);\
    float tFar = min(min(t2.x, t2.y), t2.z);\
    return vec2(tNear, tFar);\
  }\
  \
  \
  float intersectSphere(vec3 origin, vec3 ray, vec3 sphereCenter, float sphereRadius) {\
    vec3 toSphere = origin - sphereCenter;\
    float a = dot(ray, ray);\
    float b = 2.0 * dot(toSphere, ray);\
    float c = dot(toSphere, toSphere) - sphereRadius * sphereRadius;\
    float discriminant = b*b - 4.0*a*c;\
    if (discriminant > 0.0) {\
      float t = (-b - sqrt(discriminant)) / (2.0 * a);\
      if (t > 0.0) return t;\
    }\
    return 1.0e6;\
  }\
  \
  vec3 getSphereColor(vec3 point) {\
    vec3 color = vec3(0.5,1.0,1.0);\
    \
    /* ambient occlusion with walls */\
    color *= 1.0 - 0.9 / pow((1.0 + sphereRadius - abs(point.x)) / sphereRadius, 3.0);\
    color *= 1.0 - 0.9 / pow((1.0 + sphereRadius - abs(point.z)) / sphereRadius, 3.0);\
    color *= 1.0 - 0.9 / pow((point.y + 1.0 + sphereRadius) / sphereRadius, 3.0);\
    \
    /* caustics */\
    vec3 sphereNormal = (point - sphereCenter) / sphereRadius;\
    vec3 refractedLight = refract(-light, vec3(0.0, 1.0, 0.0), IOR_AIR / IOR_WATER);\
    float diffuse = max(0.0, dot(-refractedLight, sphereNormal)) * 0.5;\
    vec4 info = texture2D(water, point.xz * 0.5 + 0.5);\
    if (point.y < info.r) {\
      vec4 caustic = texture2D(causticTex, 0.75 * (point.xz - point.y * refractedLight.xz / refractedLight.y) * 0.5 + 0.5);\
      diffuse *= caustic.r * 4.0;\
    }\
    color += diffuse;\
    \
    return color;\
  }\
  \
  vec3 getWallColor(vec3 point) {\
    float scale = 0.7;\
    \
    vec3 wallColor;\
    vec3 normal;\
    if (abs(point.x) > 0.999) {\
      /*wallColor = texture2D(tiles, point.zy * vec2(-0.5, 0.8) + vec2(0.5, 1.0)).rgb;*/\
      normal = vec3(-point.x, 0.0, 0.0);\
    } else if (abs(point.z) > 0.999) {\
      /*wallColor = texture2D(tiles, point.xy * vec2(0.5, 0.8) + vec2(0.5, 1.0)).rgb;*/\
      normal = vec3(0.0, 0.0, -point.z);\
    } else {\
      /*wallColor = texture2D(tiles, point.xz * vec2(0.5, -0.5) + 0.5).rgb;*/\
      normal = vec3(0.0, 1.0, 0.0);\
    }\
    vec3 incomingRay = normalize(point - eye);\
    vec3 refractedRay = refract(incomingRay, normal, .75);\
    wallColor = textureCube(sky, refractedRay*vec3(1.0,-1.0,1.0)).rgb*op*1.2;\
    \
    scale /= length(point); /* pool ambient occlusion */\
    /*scale *= 1.0 - 0.9 / pow(length(point - sphereCenter) / sphereRadius, 4.0); sphere ambient occlusion */\
    \
    /* caustics */\
    vec3 refractedLight = -refract(-light, vec3(0.0, 1.0, 0.0), IOR_AIR / IOR_WATER);\
    float diffuse = max(0.0, dot(refractedLight, normal));\
    vec4 info = texture2D(water, point.xz * 0.5 + 0.5);\
    if (point.y < info.r) {\
      vec4 caustic = texture2D(causticTex, 0.75 * (point.xz - point.y * refractedLight.xz / refractedLight.y) * 0.5 + 0.5);\
      scale += diffuse * caustic.r * 2.0 * caustic.g;\
    } else {\
      /* shadow for the rim of the pool */\
      vec2 t = intersectCube(point, refractedLight, vec3(-1.0, -poolHeight, -1.0), vec3(1.0, 2.0, 1.0));\
      diffuse *= 1.0 / (1.0 + exp(-200.0 / (1.0 + 10.0 * (t.y - t.x)) * (point.y + refractedLight.y * t.y - 2.0 / 12.0)));\
      \
      scale += diffuse * 0.5;\
    }\
    \
    /*substitute scale to get shadow*/\
    return wallColor * scale;\
  }\
';

function Renderer() {
  // this.tileTexture = GL.Texture.fromImage(document.getElementById('tiles'), {
  //   // minFilter: gl.LINEAR_MIPMAP_LINEAR,
  //   minFilter: gl.LINEAR,
  //   // wrap: gl.REPEAT,
  //   format: gl.RGB
  // });
  this.lightDir = new GL.Vector(-0.3, 0.5, 0.8).unit();
  this.causticTex = new GL.Texture(1024, 1024);

  var filter = GL.Texture.canUseFloatingPointLinearFiltering() ? gl.LINEAR : gl.NEAREST;
  this.sref = new GL.Texture(2048, 2048);
  this.srefl = new GL.Texture(2048, 2048);

  this.waterMesh = GL.Mesh.plane({ detail: 200 });
  this.waterShaders = [];
  for (var i = 0; i < 2; i++) {
    this.waterShaders[i] = new GL.Shader('\
      uniform sampler2D water;\
      varying vec3 position;\
      void main() {\
        vec4 info = texture2D(water, gl_Vertex.xy * 0.5 + 0.5);\
        position = gl_Vertex.xzy;\
        position.y += info.r;\
        gl_Position = gl_ModelViewProjectionMatrix * vec4(position, 1.0);\
      }\
    ', helperFunctions + '\
      varying vec3 position;\
      uniform vec2 scale;\
      \
      vec3 getSurfaceRayColor(vec3 origin, vec3 ray, vec3 waterColor, vec3 normal, float r) {\
        vec3 color= vec3(0.0,0.0,0.0);\
        /*float q = intersectSphere(origin, ray, sphereCenter, sphereRadius);*/\
        vec3 boxBottom = sphereCenter+vec3(-0.15, -0.025, -0.008)*sphereRadius/0.1;\
        vec3 boxTop = sphereCenter+vec3(0.15, 0.035, 0.008)*sphereRadius/0.1;\
        vec2 q = intersectCube(origin,ray,boxBottom,boxTop);\
        /*if( q.y>-1.0 && q.y>q.x) {*/\
        if(r == 1.0){\
          /*color = getSphereColor(origin);*/\
          vec4 clip = (gl_ModelViewProjectionMatrix * vec4(origin+vec3(ray.x,-ray.y,ray.z)*q.y, 1.0));\
          vec2 screen = (clip.xyz/clip.w).xy;\
          vec2 texcoords = screen*(0.5,0.5) + 0.5;\
          color = texture2D(srefl,texcoords).rgb;\
        }\
        if(r == 0.0){\
          /*color = getSphereColor(origin);*/\
          vec4 clip = (gl_ModelViewProjectionMatrix * vec4(origin+ray*q.y, 1.0));\
          vec2 screen = (clip.xyz/clip.w).xy;\
          vec2 texcoords = screen*(0.5,0.5) + 0.5;\
          color = texture2D(sref,texcoords).rgb;\
        }\
        if (ray.y < 0.0 && color.g < 0.1) {\
          vec2 t = intersectCube(origin, ray, vec3(-1.0, -poolHeight, -1.0), vec3(1.0, 2.0, 1.0));\
          color = getWallColor(origin + ray * t.y);\
        } else if(color.g < 0.1) {\
          vec2 t = intersectCube(origin, ray, vec3(-1.0, -poolHeight, -1.0), vec3(1.0, 2.0, 1.0));\
          vec3 hit = origin + ray * t.y;\
          if (hit.y < -2.0 / 12.0) {\
            color = getWallColor(hit);\
          } else {\
            color += textureCube(sky, -ray).rgb*op;\
            color += vec3(pow(max(0.0, dot(light, ray)), 5000.0)) * vec3(10.0, 8.0, 6.0);\
          }\
        }\
        if (ray.y < 0.0) color *= waterColor;\
        return color;\
      }\
      \
      void main() {\
        vec2 coord = position.xz * 0.5 + 0.5;\
        vec4 info = texture2D(water, coord);\
        \
        /* make water look more "peaked" */\
        for (int i = 0; i < 5; i++) {\
          coord += info.ba * 0.005;\
          info = texture2D(water, coord);\
        }\
        \
        vec3 normal = vec3(info.b, sqrt(1.0 - dot(info.ba, info.ba)), info.a);\
        vec3 incomingRay = normalize(position - eye);\
        \
        ' + (i ? /* underwater */ '\
          normal = -normal;\
          vec3 reflectedRay = reflect(incomingRay, normal);\
          vec3 refractedRay = refract(incomingRay, normal, IOR_WATER / IOR_AIR);\
          float fresnel = mix(0.5, 1.0, pow(1.0 - dot(normal, -incomingRay), 3.0));\
          \
          vec3 reflectedColor = getSurfaceRayColor(position, reflectedRay, underwaterColor, normal, 1.0);\
          vec3 refractedColor = getSurfaceRayColor(position, refractedRay, vec3(1.0),normal, 0.0) * vec3(0.8, 1.0, 1.1);\
          \
          gl_FragColor = vec4(mix(reflectedColor, refractedColor, (1.0 - fresnel) * length(refractedRay)), 1.0);\
        ' : /* above water */ '\
          vec3 reflectedRay = reflect(incomingRay, normal);\
          vec3 refractedRay = refract(incomingRay, normal, IOR_AIR / IOR_WATER);\
          float fresnel = mix(0.25, 1.0, pow(1.0 - dot(normal, -incomingRay), 3.0));\
          \
          vec3 reflectedColor = getSurfaceRayColor(position, reflectedRay, abovewaterColor,normal,1.0);\
          vec3 refractedColor = getSurfaceRayColor(position, refractedRay, abovewaterColor,normal,0.0);\
          \
          gl_FragColor = vec4(mix(refractedColor, reflectedColor, fresnel), 1.0);\
        ') + '\
      }\
    ');
  }

  // this.sphereMesh = GL.Mesh.sphere({ detail: 10 });
  this.sphereMesh= GL.Mesh.load(logo)
  this.sphereNormals = this.sphereMesh.vertexBuffers.gl_Normal

  // this.waterMesh.addVertexBuffer('sNormals', 'sNormal');  
  // this.waterMesh.sNormals = this.sphereMesh.sNormals

  // this.waterMesh.addVertexBuffer('sVertices', 'xVertex');  
  // this.waterMesh.sNormals = this.sphereMesh.vertices

  this.sphereShader = new GL.Shader(helperFunctions + '\
    varying vec3 position;\
    varying vec3 normal;\
    void main() {\
      normal = gl_Normal.xyz;\
      position = sphereCenter + gl_Vertex.xyz * sphereRadius;\
      gl_Position = gl_ModelViewProjectionMatrix * vec4(position, 1.0);\
    }\
  ', helperFunctions + '\
    varying vec3 position;\
    varying vec3 normal;\
    void main() {\
      vec3 color = vec3(.5);\
      vec3 refractedLight = refract(-light, vec3(0.0, 1.0, 0.0), IOR_AIR / IOR_WATER);\
      float diffuse = max(0.0, dot(-refractedLight, normal)) * 0.5;\
      vec4 info = texture2D(water, position.xz * 0.5 + 0.5);\
      if (position.y < info.r) {\
        vec4 caustic = texture2D(causticTex, 0.75 * (position.xz - position.y * refractedLight.xz / refractedLight.y) * 0.5 + 0.5);\
        diffuse *= caustic.r * 4.0;\
      }\
      color += diffuse;\
      gl_FragColor = vec4(color, 1.0);\
      info = texture2D(water, position.xz * 0.5 + 0.5);\
    }\
  ');
  this.sphereShaderRef = new GL.Shader(helperFunctions + '\
    varying vec3 position;\
    varying vec3 normal;\
    varying vec3 neye;\
    varying float reflect;\
    uniform float reflection;\
    void main() {\
      normal = gl_Normal.xyz;\
      reflect = reflection;\
      position = sphereCenter + gl_Vertex.xyz * sphereRadius;\
      gl_Position = gl_ModelViewProjectionMatrix*vec4(position, 1.0);\
    }\
  ', helperFunctions + '\
    varying vec3 position;\
    varying vec3 normal;\
    varying float reflect;\
    void main() {\
      vec3 color = vec3(.5);\
      vec3 refractedLight = refract(-light, vec3(0.0, 1.0, 0.0), IOR_AIR / IOR_WATER);\
      float diffuse = max(0.0, dot(-refractedLight, normal)) * 0.5;\
      vec4 info = texture2D(water, position.xz * 0.5 + 0.5);\
      if (position.y < info.r) {\
        vec4 caustic = texture2D(causticTex, 0.75 * (position.xz - position.y * refractedLight.xz / refractedLight.y) * 0.5 + 0.5);\
        diffuse *= caustic.r * 4.0;\
      }\
      color += diffuse;\
      if(reflect > 0.0 && position.y<info.r){\
        color = vec3(0.0);\
      }\
      if(reflect == 0.0 && position.y>info.r){\
        color = vec3(0.0);\
      }\
      gl_FragColor = vec4(color, 1.0);\
    }\
  ');
  this.cubeMesh = GL.Mesh.cube();
  this.cubeMesh.triangles.splice(4, 2);
  this.cubeMesh.compile();
  this.cubeShader = new GL.Shader(helperFunctions + '\
    varying vec3 position;\
    void main() {\
      position = gl_Vertex.xyz;\
      position.y = ((1.0 - position.y) * (6.1 / 12.0) - 1.0) * poolHeight;\
      gl_Position = gl_ModelViewProjectionMatrix * vec4(position, 1.0);\
    }\
  ', helperFunctions + '\
    varying vec3 position;\
    void main() {\
      gl_FragColor = vec4(getWallColor(position)*underwaterColor*1.1, 1.0);\
      vec4 info = texture2D(water, position.xz * 0.5 + 0.5);\
      if (position.y < info.r) {\
        gl_FragColor.rgb *= underwaterColor * 1.2;\
      }\
    }\
  ');
  this.sphereCenter = new GL.Vector();
  this.sphereRadius = 0;

  var hasDerivatives = !!gl.getExtension('OES_standard_derivatives');
  this.causticsShader = new GL.Shader(helperFunctions + '\
    varying vec3 oldPos;\
    varying vec3 newPos;\
    varying vec3 ray;\
    \
    /* project the ray onto the plane */\
    vec3 project(vec3 origin, vec3 ray, vec3 refractedLight) {\
      vec2 tcube = intersectCube(origin, ray, vec3(-1.0, -poolHeight, -1.0), vec3(1.0, 2.0, 1.0));\
      origin += ray * tcube.y;\
      float tplane = (-origin.y - 1.0) / refractedLight.y;\
      return origin + refractedLight * tplane;\
    }\
    \
    void main() {\
      vec4 info = texture2D(water, gl_Vertex.xy * 0.5 + 0.5);\
      info.ba *= 0.5;\
      vec3 normal = vec3(info.b, sqrt(1.0 - dot(info.ba, info.ba)), info.a);\
      \
      /* project the vertices along the refracted vertex ray */\
      vec3 refractedLight = refract(-light, vec3(0.0, 1.0, 0.0), IOR_AIR / IOR_WATER);\
      ray = refract(-light, normal, IOR_AIR / IOR_WATER);\
      oldPos = project(gl_Vertex.xzy, refractedLight, refractedLight);\
      newPos = project(gl_Vertex.xzy + vec3(0.0, info.r, 0.0), ray, refractedLight);\
      \
      gl_Position = vec4(0.75 * (newPos.xz + refractedLight.xz / refractedLight.y), 0.0, 1.0);\
    }\
  ', (hasDerivatives ? '#extension GL_OES_standard_derivatives : enable\n' : '') + '\
    ' + helperFunctions + '\
    varying vec3 oldPos;\
    varying vec3 newPos;\
    varying vec3 ray;\
    \
    void main() {\
      ' + (hasDerivatives ? '\
        /* if the triangle gets smaller, it gets brighter, and vice versa */\
        float oldArea = length(dFdx(oldPos)) * length(dFdy(oldPos));\
        float newArea = length(dFdx(newPos)) * length(dFdy(newPos));\
        gl_FragColor = vec4(oldArea / newArea * 0.2, 1.0, 0.0, 0.0);\
      ' : '\
        gl_FragColor = vec4(0.2, 0.2, 0.0, 0.0);\
      ' ) + '\
      \
      vec3 refractedLight = refract(-light, vec3(0.0, 1.0, 0.0), IOR_AIR / IOR_WATER);\
      \
      /* compute a blob shadow and make sure we only draw a shadow if the player is blocking the light */\
      vec3 dir = (sphereCenter - newPos) / sphereRadius;\
      vec3 area = cross(dir, refractedLight);\
      float shadow = dot(area, area);\
      float dist = dot(dir, -refractedLight);\
      shadow = 1.0 + (shadow - 1.0) / (0.05 + dist * 0.025);\
      shadow = clamp(1.0 / (1.0 + exp(-shadow)), 0.0, 1.0);\
      shadow = mix(1.0, shadow, clamp(dist * 2.0, 0.0, 1.0));\
      gl_FragColor.g = shadow;\
      \
      /* shadow for the rim of the pool */\
      vec2 t = intersectCube(newPos, -refractedLight, vec3(-1.0, -poolHeight, -1.0), vec3(1.0, 2.0, 1.0));\
      gl_FragColor.r *= 1.0 / (1.0 + exp(-200.0 / (1.0 + 10.0 * (t.y - t.x)) * (newPos.y - refractedLight.y * t.y - 2.0 / 12.0)));\
    }\
  ');


  this.skyMesh = GL.Mesh.cube();
  // this.cubeMesh.triangles.splice(4, 2);
  this.cubeMesh.compile();
  this.skyShader = new GL.Shader(helperFunctions + '\
    varying vec3 position;\
    void main() {\
      position = gl_Vertex.xyz;\
      gl_Position = gl_ModelViewProjectionMatrix * vec4(position, 1.0);\
    }\
  ', helperFunctions + '\
    varying vec3 position;\
    void main() {\
  gl_FragColor = textureCube(sky, position * vec3(1.0, -1.0, 1.0)) * op;\
      gl_FragColor.a = 1.0;\
    }\
  ');

  this.vidMesh = GL.Mesh.plane();
  // this.cubeMesh.triangles.splice(4, 2);
  this.vidMesh.compile();
  this.vidShader = new GL.Shader(helperFunctions + '\
    varying vec3 position;\
    void main() {\
      position = gl_Vertex.xyz;\
      /*position.y = ((1.0 - position.y) * (6.0 / 12.0) - 1.0) * poolHeight;*/\
      gl_Position = gl_ModelViewProjectionMatrix * vec4(position, 1.0);\
    }\
  ', helperFunctions + '\
    varying vec3 position;\
    uniform sampler2D video;\
    void main() {\
      gl_FragColor = texture2D(video, position.xy*.5+.5);\
    }\
  ');


}

Renderer.prototype.updateCaustics = function(water) {
  if (!this.causticsShader) return;
  var this_ = this;
  this.causticTex.drawTo(function() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    water.textureA.bind(0);
    this_.causticsShader.uniforms({
      light: this_.lightDir,
      water: 0,
      sphereCenter: this_.sphereCenter,
      sphereRadius: this_.sphereRadius,
      sphereNormals: this.sphereNormals
    }).draw(this_.waterMesh);
  });
};

Renderer.prototype.renderSky = function(sky,op) {

  sky.bind(0);
  // gl.enable(gl.CULL_FACE);
  gl.pushMatrix()
  gl.scale(15,15,15)
  this.skyShader.uniforms({
    sky: 0,
    op: op
  }).draw(this.skyMesh);
  gl.popMatrix()
  // gl.disable(gl.CULL_FACE);

}

Renderer.prototype.renderVideo = function(video) {

  // video.bind(0);
  // gl.enable(gl.CULL_FACE);
  gl.pushMatrix()
  var scale = 1920/1080;
  var mult = 30;
  gl.scale(mult*scale,mult,mult)
  // gl.rotate(90,1,0,0)
  gl.translate(0,0,-2)
  this.vidShader.uniforms({
    video: 0,
  }).draw(this.vidMesh);
  gl.popMatrix()
  // gl.disable(gl.CULL_FACE);

}

Renderer.prototype.renderWater = function(water, sky, video, tracer,op) {

  this.sref.bind(4);
  this.srefl.bind(5);
  sky.bind(2);

  // video.bind(5);

  water.textureA.bind(0);
  // this.tileTexture.bind(1);
  sky.bind(2);
  this.causticTex.bind(3);
  gl.enable(gl.CULL_FACE);
  for (var i = 0; i < 2; i++) {
    gl.cullFace(i ? gl.BACK : gl.FRONT);
    this.waterShaders[i].uniforms({
      light: this.lightDir,
      water: 0,
      // tiles: 1,
      sky: 2,
      sref: 4,
      srefl: 5,
      causticTex: 3,
      eye: tracer.eye,
      op:op,
      scale: [gl.canvas.width,gl.canvas.height],
      sphereCenter: this.sphereCenter,
      sphereRadius: this.sphereRadius,
    }).draw(this.waterMesh);
  }
  gl.disable(gl.CULL_FACE);


  var this_ = this;



  this.sref.drawTo(function() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.pushMatrix()
    // gl.translate(0,0,0.085);
    this_.sphereShaderRef.uniforms({
      light: this_.lightDir,
      water: 0,
      causticTex: 2,
      eye: tracer.eye,
      reflection: 0.0,
      sphereCenter: this_.sphereCenter,
      sphereRadius: this_.sphereRadius,
    }).draw(this_.sphereMesh);
    gl.popMatrix();
  });

  this.srefl.drawTo(function() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.pushMatrix()
    gl.scale(1.0,-1.0,1.0)
    // gl.translate(0,0,0.085);
    this_.sphereShaderRef.uniforms({
      light: this_.lightDir,
      water: 0,
      causticTex: 2,
      eye: tracer.eye,
      reflection: 1.0,
      sphereCenter: this_.sphereCenter,
      sphereRadius: this_.sphereRadius,
    }).draw(this_.sphereMesh);
    gl.popMatrix();
  });

};

Renderer.prototype.renderSphere = function(water) {
  water.textureA.bind(0);
  this.causticTex.bind(1);
  gl.pushMatrix()
  // gl.rotate(Math.acos((center.y+.5))*2*Math.PI,1,0,0);

  // gl.translate(0,0,0.085);
  this.sphereShader.uniforms({
    light: this.lightDir,
    water: 0,
    causticTex: 2,
    sphereCenter: this.sphereCenter,
    sphereRadius: this.sphereRadius,
  }).draw(this.sphereMesh);
  gl.popMatrix();


};

Renderer.prototype.renderCube = function(water,sky, tracer,op) {
  // gl.enable(gl.CULL_FACE);
  water.textureA.bind(0);
  // this.tileTexture.bind(1);
  this.causticTex.bind(2);
  sky.bind(3);
  this.cubeShader.uniforms({
    light: this.lightDir,
    water: 0,
    causticTex: 2,
    sky:3,
    op:op,
    eye: tracer.eye,
    sphereCenter: this.sphereCenter,
    sphereRadius: this.sphereRadius,
  }).draw(this.cubeMesh);
  // gl.disable(gl.CULL_FACE);
};
