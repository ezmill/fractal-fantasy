/*
 * 4real Liquid Demo
 * Modified version of WebGL Water by Evan Wallace
 * http://madebyevan.com/webgl-water/
 *
 * Released under the MIT license
 */




var waterView = function(pixel) {

	this.paused = false;
	this.physics = true;
	this.animated = false;
	this.skyReady = false;

	var skyOpacity = 0.0;

	var self = this;



	function text2html(text) {
		return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
	}

	window.handleError = function(text) {
		var html = text2html(text);
		if (html == 'WebGL not supported') {
			// TODO fallback
			html = 'Your browser does not support WebGL.<br>Please see\
			<a href="http://www.khronos.org/webgl/wiki/Getting_a_WebGL_Implementation">\
			Getting a WebGL Implementation</a>.';
		}
		var loading = document.getElementById('loading');
		loading.innerHTML = html;
		// loading.style.zIndex = 1;
	}



	window.gl = GL.create({
		id: 'waterCanvas',
		alpha: true
	});


	var canvas = document.getElementById("waterCanvas");

	var water;
	var cubemap;
	var renderer;
	var angleX = -50.0;
	var angleY = 0.0;
	var gravity;
	// Sphere physics info
	var center;
	var oldCenter;
	var velocity;
	var radius;

	self.map = gl.createTexture();


	startRender()


	function startRender() {


		var ratio = window.devicePixelRatio || 1;



		function onresize() {
			var width = innerWidth;
			var height = innerHeight;

			if (self.record) {
				width = 1280;
				height = 720;
			}

			gl.canvas.width = width * ratio;
			gl.canvas.height = height * ratio;
			gl.canvas.style.width = width + 'px';
			gl.canvas.style.height = height + 'px';
			gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
			gl.matrixMode(gl.PROJECTION);
			gl.loadIdentity();
			gl.perspective(45, gl.canvas.width / gl.canvas.height, 0.01, 100);
			gl.matrixMode(gl.MODELVIEW);
			// draw();
		}

		document.body.appendChild(gl.canvas);
		gl.clearColor(0, 0, 0, 1);

		water = new Water();
		renderer = new Renderer();

		// var videoElement = document.getElementById("video");
		// videoElement.addEventListener("canplaythrough", startVideo, true);
		// videoElement.addEventListener("ended", videoDone, true);
		// videoElement.preload = "auto";
		// videoElement.src = "videos/people.mp4";

		function startVideo() {
			videoElement.play();
			intervalID = setInterval(drawScene, 16.67);
		}

		function videoDone() {
			// clearInterval(intervalID);
		}


		cubemap = new Cubemap({
			xneg: pixel,
			xpos: pixel,
			yneg: pixel,
			ypos: pixel,
			zneg: pixel,
			zpos: pixel
		});

		self.renderCubemap = function() {
			cubemap = new Cubemap({
				xneg: document.getElementById('xneg'),
				xpos: document.getElementById('xpos'),
				yneg: document.getElementById('yneg'),
				ypos: document.getElementById('ypos'),
				zneg: document.getElementById('zneg'),
				zpos: document.getElementById('zpos')
			});
			skyOpacity = 1.4;
		}

		if (!water.textureA.canDrawTo() || !water.textureB.canDrawTo()) {
			throw new Error('Rendering to floating-point textures is required but not supported');
		}

		center = oldCenter = new GL.Vector(0.0, 0.3, 0.2);
		velocity = new GL.Vector();
		gravity = new GL.Vector(0, -2, 0);
		radius = .4;

		self.drops = function() {
			for (var i = 0; i < 10; i++) {
				setTimeout(function() {
					water.addDrop(Math.random() * 2 - 1, Math.random() * 2 - 1, 0.01, (i & 1) ? 0.01 : -0.01);
				}, 300 * i);
			}
		}
		self.drops()


		self.reset = function() {

			gravity = new GL.Vector(0, 1, 0);
			setTimeout(function() {
				gravity = new GL.Vector(0, -4, 0);
			}, 2000)
			setTimeout(self.reset, 20000);
		}

		self.moreDrops = function() {
			self.drops()
			t = Math.random()
			setTimeout(self.moreDrops, t * 12000)
		}

		self.move = function() {
			var v = Math.random()
			var h = Math.random()
			angleX = -v * 90
			angleY = (h - .5) * 360 * 10
			setTimeout(self.move, 10000)
		}

		self.animate = function() {

			self.reset()
			self.moreDrops()
			self.move();
		}



		var video = gl.createTexture();

		function initTextures() {
			gl.bindTexture(gl.TEXTURE_2D, video);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		}
		initTextures()

		function updateTexture(unit) {
			gl.activeTexture(gl.TEXTURE0 + (unit || 0));
			gl.bindTexture(gl.TEXTURE_2D, video);
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
				gl.UNSIGNED_BYTE, videoElement);
		}

		// document.getElementById('loading').innerHTML = '';
		onresize();

		var requestAnimationFrame =
			window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
				function(callback) {
					setTimeout(callback, 0);
			};

		var prevTime = new Date().getTime();

		function animate() {
			var nextTime = new Date().getTime();
			if (!self.paused) {
				update((nextTime - prevTime) / 1000);
				draw();
			}
			prevTime = nextTime;
			requestAnimationFrame(animate);
		}
		requestAnimationFrame(animate);

		window.onresize = onresize;

		var prevHit;
		var planeNormal;
		var mode = -1;
		var MODE_ADD_DROPS = 0;
		var MODE_MOVE_SPHERE = 1;
		var MODE_ORBIT_CAMERA = 2;

		var oldX, oldY;

		document.onmousedown = function(e) {
			if (self.paused)
				return;
			oldX = e.pageX;
			oldY = e.pageY;
			var tracer = new GL.Raytracer();
			var ray = tracer.getRayForPixel(e.pageX * ratio, e.pageY * ratio);
			var pointOnPlane = tracer.eye.add(ray.multiply(-tracer.eye.y / ray.y));
			var min = center.add(new GL.Vector(-0.15, -0.02, -0.008).multiply(radius / 0.1))
			var max = center.add(new GL.Vector(0.15, 0.03, 0.008).multiply(radius / 0.1));

			var sphereHitTest = GL.Raytracer.hitTestBox(tracer.eye, ray, min, max);
			// var sphereHitTest = GL.Raytracer.hitTestSphere(tracer.eye, ray, center, radius);
			if (sphereHitTest) {
				mode = MODE_MOVE_SPHERE;
				prevHit = sphereHitTest.hit;
				planeNormal = tracer.getRayForPixel(gl.canvas.width / 2, gl.canvas.height / 2).negative();
			} else if (Math.abs(pointOnPlane.x) < 1 && Math.abs(pointOnPlane.z) < 1) {
				mode = MODE_ADD_DROPS;
				document.onmousemove(e);
			} else {
				mode = MODE_ORBIT_CAMERA;
			}
		};

		document.onmouseup = function(e) {
			mode = -1;
		};

		document.onmousemove = function(e) {
			if (self.paused)
				return;
			switch (mode) {
				case MODE_ADD_DROPS:
					var tracer = new GL.Raytracer();
					var ray = tracer.getRayForPixel(e.pageX * ratio, e.pageY * ratio);
					var pointOnPlane = tracer.eye.add(ray.multiply(-tracer.eye.y / ray.y));
					water.addDrop(pointOnPlane.x, pointOnPlane.z, 0.03, 0.03);
					// if (paused) {
					// 	water.updateNormals();
					// 	renderer.updateCaustics(water);
					// }
					break;
				case MODE_MOVE_SPHERE:
					var tracer = new GL.Raytracer();
					var ray = tracer.getRayForPixel(e.pageX * ratio, e.pageY * ratio);
					var t = -planeNormal.dot(tracer.eye.subtract(prevHit)) / planeNormal.dot(ray);
					var nextHit = tracer.eye.add(ray.multiply(t));
					center = center.add(nextHit.subtract(prevHit));
					center.x = Math.max(radius * 1.5 - 1, Math.min(1 - radius * 1.5, center.x));
					center.y = Math.max(radius - 1, Math.min(10, center.y));
					center.z = Math.max(radius * .2 - 1, Math.min(1 - radius * .2, center.z));
					prevHit = nextHit;
					if (self.paused) renderer.updateCaustics(water);
					break;
				case MODE_ORBIT_CAMERA:
					angleY -= e.pageX - oldX;
					angleX -= e.pageY - oldY;
					angleX = Math.max(-89.999, Math.min(89.999, angleX));
					break;
			}
			oldX = e.pageX;
			oldY = e.pageY;
			// if (paused) draw();
		};

		document.onkeydown = function(e) {
			// if (e.which == ' '.charCodeAt(0)) paused = !paused;
			if (e.which == 'G'.charCodeAt(0)) self.physics = !self.physics;
			else if (e.which == 'L'.charCodeAt(0) && self.paused) draw();
		};

		var frame = 0;

		function update(seconds) {
			if (seconds > 1) return;
			frame += seconds * 2;

			if (mode == MODE_MOVE_SPHERE) {
				// Start from rest when the player releases the mouse after moving the sphere
				velocity = new GL.Vector();
			} else if (self.physics) {
				// Fall down with viscosity under water
				var percentUnderWater = Math.max(0, Math.min(1, (radius - center.y) / (2 * radius))) * 2;
				velocity = velocity.add(gravity.multiply(seconds - 1.1 * seconds * percentUnderWater));
				velocity = velocity.subtract(velocity.unit().multiply(percentUnderWater * seconds * velocity.dot(velocity)));
				center = center.add(velocity.multiply(seconds));

				// Bounce off the bottom
				if (center.y < radius - 1) {
					center.y = radius - 1;
					velocity.y = Math.abs(velocity.y) * 0.7;
				}
			}

			// Displace water around the sphere
			water.moveSphere(oldCenter, center, radius);
			oldCenter = center;

			// Update the water simulation and graphics
			water.stepSimulation();
			water.stepSimulation();
			water.updateNormals();
			renderer.updateCaustics(water);
		}


		var currentY = 0;
		var currentX = 0;
		var currentOpacity = 0.0;

		var captureFrame = 0;

		function draw() {


			var tracer = new GL.Raytracer();

			dy = angleY - currentY;
			dx = angleX - currentX;
			dop = skyOpacity - currentOpacity;

			if (Math.abs(dy) > .02)
				currentY += dy * .02
			else currentY + dy;
			if (Math.abs(dx) > .02)
				currentX += dx * .02
			else currentX += dx;
			if (Math.abs(dop) > .02)
				currentOpacity += dop * .02
			else currentOpacity += dop;

			// Change the light direction to the camera look vector when the L key is pressed
			if (GL.keys.L) {
				renderer.lightDir = GL.Vector.fromAngles((90 - angleY) * Math.PI / 180, -angleX * Math.PI / 180);
				if (self.paused) renderer.updateCaustics(water);
			}

			gl.enable(gl.BLEND);
			gl.clearColor(0, 0, 0, 0)

			// gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
			gl.clear(gl.COLOR_BUFFER_BIT);
			// gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			gl.loadIdentity();

			// gl.rotate(-angleY / 3, 0, 1, 0);

			// gl.rotate(-angleX / 3, 1, 0, 0);
			gl.translate(0, -.0, -3.0);
			// gl.translate(0, 0.6, 0);
			gl.rotate(-currentX / 3, 1, 0, 0);
			gl.rotate(-currentY / 10, 0, 1, 0);

			// gl.scale(1.2,1.2,1.2);
			gl.enable(gl.DEPTH_TEST);
			renderer.sphereCenter = center;
			renderer.sphereRadius = radius;

			renderer.renderSky(cubemap, currentOpacity);

			// gl.pushMatrix()
			// gl.loadIdentity();
			// gl.translate(-angleY / 100, angleX / 100, 1, 0);
			// updateTexture(0)
			// renderer.renderVideo(video)
			// gl.popMatrix()

			renderer.renderCube(water, cubemap, tracer, currentOpacity);
			// updateTexture(5)
			renderer.renderWater(water, cubemap, video, tracer, currentOpacity);
			renderer.renderSphere(water);
			gl.disable(gl.DEPTH_TEST);


			if (self.record) {
				var r = new XMLHttpRequest();
				r.open('POST', 'http://localhost:3999/' + captureFrame, false);
				var blob = dataURItoBlob(canvas.toDataURL());
				r.send(blob);
				captureFrame++
			}
		}
	};
}

var pixel = new Image()
pixel.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs="

pixel.onload = function(){

	try {
		var water = new waterView(pixel);
		if (getParameterByName('auto'))
			water.animate();

		if (getParameterByName('record'))
			water.record = true;

	} catch (error) {
		var html = error.message
		if (html == 'WebGL not supported')
			if (window.innerWidth < 700)
				error = document.getElementById('errorMobile');
			else
				error = document.getElementById('error');
		error.style.display = 'table'
		var video = error.getElementsByClassName('youtubeVid');
		video[0].innerHTML = '<iframe width="640" height="360" src="//www.youtube.com/embed/7eUWHAZCSXs?rel=0" frameborder="0" allowfullscreen></iframe>';
		document.getElementById('waterCanvas').style.display = 'none';
	}

	window.onload = function() {
	if (water)
		water.renderCubemap()
	}

}




var canvas = document.getElementById("waterCanvas");

canvas.addEventListener('mousedown', function() {
	canvas.classList.add('grab')
})
canvas.addEventListener('mouseup', function() {
	canvas.classList.remove('grab')
})

var handleError = function(errro) {
	console.log(error)
}

window.onerror = window.handleError;




function dataURItoBlob(dataURI) {
	var mimetype = dataURI.split(",")[0].split(':')[1].split(';')[0];
	var byteString = atob(dataURI.split(',')[1]);
	var u8a = new Uint8Array(byteString.length);
	for (var i = 0; i < byteString.length; i++) {
		u8a[i] = byteString.charCodeAt(i);
	}
	return new Blob([u8a.buffer], {
		type: mimetype
	});
};



function getParameterByName(name) {
	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		results = regex.exec(location.search);
	return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}