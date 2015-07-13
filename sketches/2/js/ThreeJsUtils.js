//THREE.JS UTILS - EZRA MILLER
function screenshot(renderer) {
    if (event.keyCode == "32") {
        grabScreen(renderer);

        function grabScreen(renderer) {
            var blob = dataURItoBlob(renderer.domElement.toDataURL('image/png'));
            var file = window.URL.createObjectURL(blob);
            var img = new Image();
            img.src = file;
            img.onload = function(e) {
                window.open(this.src);

            }
        }
        function dataURItoBlob(dataURI) {
            var byteString;
            if (dataURI.split(',')[0].indexOf('base64') >= 0)
                byteString = atob(dataURI.split(',')[1]);
            else
                byteString = unescape(dataURI.split(',')[1]);

            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

            var ia = new Uint8Array(byteString.length);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            return new Blob([ia], {
                type: mimeString
            });
        }

        function insertAfter(newNode, referenceNode) {
            referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
        }
    }
    if(event.keyCode == "82"){
        capturer.start();
    }
    if(event.keyCode == "84"){
        capturer.stop();
        capturer.save( function( blob ) {
            window.location = blob;
        });
    }
}
function map(value,max,minrange,maxrange) {
    return ((max-value)/(max))*(maxrange-minrange)+minrange;
}

var manager = new THREE.LoadingManager();
manager.onProgress = function ( item, loaded, total ) {
    // console.log( item, loaded, total );
};
function loadModel(model, material){
    // var loader = new THREE.OBJLoader( manager );
    var loader = new THREE.OBJLoaderGEO( manager );
    loader.load( model, function ( object ) {

        object.traverse( function ( child ) {

            if ( child instanceof THREE.Mesh ) {
                child.material = material;
            }
        } );
        scene.add( object );
        object.position.x = Math.random()*500-250;
        object.position.y = Math.random()*10-5;
        object.position.z = Math.random()*10-5;
        object.rotation.x = Math.random()*Math.PI*2;
        object.rotation.y = Math.random()*Math.PI*2;
        object.rotation.z = Math.random()*Math.PI*2;
        debris.push(object);
    }, onProgress, onError );
}
function onProgress( xhr ) {
if ( xhr.lengthComputable ) {
    var percentComplete = xhr.loaded / xhr.total * 100;
    // console.log( Math.round(percentComplete, 2) + '% downloaded' );
    }
};

function onError( xhr ) {
};
function createTex(string){
    var tex = THREE.ImageUtils.loadTexture(string);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;  
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    tex.antialias = true;
    return tex;
}
