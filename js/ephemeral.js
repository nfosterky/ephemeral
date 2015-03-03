// ephemeral.js
// scene where glitchy controls thrive
var QUARTER_CIRCLE_RADIANS = 1.57079633; // Math.PI / 2
var SCENE_HEIGHT = 1000;

// create scene, camera, one plane, light,
var camera, scene, renderer, deviceControls, ground;

function init() {
  var plane, light, groundTexture;

  camera = new THREE.PerspectiveCamera( 45, window.innerWidth /
      window.innerHeight, 1, 2000 );

	camera.position.set( 0, 0, 0 );

  deviceControls = new THREE.DeviceOrientationControls( camera );

	scene = new THREE.Scene();
  scene.fog = new THREE.Fog( 0xcce0ff, 500, 10000 );

  scene.add( new THREE.AmbientLight( 0x666666 ) );

  var light = new THREE.PointLight( 0xaaddaa, .5 );
  light.position.set( 50, 1200, -500 );
  scene.add( light );

  groundTexture = THREE.ImageUtils.loadTexture(
      "textures/moon.png" );

  // groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
  // groundTexture.repeat.set( 432, 432 );
  groundTexture.anisotropy = 16;

  var groundMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff,
      specular: 0x111111, map: groundTexture } );

	ground = new THREE.Mesh( new THREE.PlaneBufferGeometry( 10000, 10000 ),
      groundMaterial );

	ground.position.y = -10;
	ground.rotation.x = -Math.PI / 2;
  camera.rotation.x = -Math.PI / 2;
	ground.receiveShadow = true;
	scene.add( ground );

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  startBalloons();
  makeHUD();
}

function animate() {

  requestAnimationFrame( animate );

  deviceControls.update();

  TWEEN.update();

  renderer.render( scene, camera );

}

function startBalloons () {
  setInterval(function() {

    if (balloons.length < 50) {
      makeBalloon({
        x: 2000 * Math.random() - 1000,
        y: 0, //-200,
        z: 2000 * Math.random() - 1000
      });

    } else {
      resetBalloon();
    }

  }, 500);
}

var balloons = [];

/*
 *  make new balloon
 *  setBalloon()
 */
function makeBalloon (pos) {
  // make sphere
  var geometry = new THREE.SphereGeometry(15, 10, 10);

  var groundTexture = THREE.ImageUtils.loadTexture(
      "textures/moon.png" );

  // TODO: random color
  var material = new THREE.MeshPhongMaterial({
    color: 0xaff00,
    map: groundTexture
  });

  var mesh = new THREE.Mesh( geometry, material );

  mesh.position.set(pos.x, pos.y, pos.z);

  balloons.push(mesh);

  scene.add(mesh);

  // tween up to top position
  var target = {
    x: pos.x,
    y: SCENE_HEIGHT,
    z: pos.z
  };

  doTween(pos, target, mesh, TWEEN.Easing.Cubic.Out, 25000)
}

var lastBalloonReset = 0;

function resetBalloon () {
  var b, pos, target;

  for (var i = lastBalloonReset; i < balloons.length; i++) {
    b = balloons[i];

    if (b.position.y === SCENE_HEIGHT) {
      target = {
        x: b.position.x,
        y: b.position.y,
        z: b.position.z
      };
      pos = {
        x: b.position.x,
        y: 0,
        z: b.position.z
      };

      doTween(pos, target, b, TWEEN.Easing.Cubic.In, 25000)
      break;
    }

    if (i + 1 === balloons.length) {
      lastBalloonReset = 0;
    }
  }
}

// animate item from start position, to target,
function doTween (position, target, obj, easing, time) {
  var tween = new TWEEN.Tween(position).to(target, time);

  tween.onUpdate(function(){
    obj.position.x = position.x;
    obj.position.y = position.y;
    obj.position.z = position.z;
  });

  tween.easing(easing);

  tween.start();
}

function findNewPoint (x, y, angleRadians, distance) {
    var result = {};

    result.x = Math.round(Math.cos(angleRadians) * distance + x);
    result.z = Math.round(Math.sin(angleRadians) * distance + y);

    return result;
}

function addKeyHandler () {
  document.addEventListener( 'keyup', onKeyUp, false);
}

// TODO: start using velocities as demonstrated in example_3d_movement.html
function onKeyUp (event) {
  var increment = 50,
      angleY    = camera.rotation.y,
      x         = camera.position.x,
      z         = camera.position.z,
      distance;

  event.preventDefault();

  console.log(event.keyCode);

  switch(event.keyCode) {
    case 38: //Up
    angleY += QUARTER_CIRCLE_RADIANS
    distance = increment;
    break;

    case 40: //Down
    angleY -= QUARTER_CIRCLE_RADIANS
    distance = increment;
    break;

    case 39: //Right
    distance = -increment;
    break;

    case 37:// left
    distance = increment;
    break;
  }

  var newPoint = findNewPoint(x, z, angleY, distance);

  camera.position.x = newPoint.x;
  camera.position.z = newPoint.z;
}

function makeHUD () {
  var geometry = new THREE.SphereGeometry(15, 10, 10);

  var texture = THREE.ImageUtils.loadTexture(
      "textures/golfball.jpg" );

  var material = new THREE.MeshPhongMaterial({
    color: 0xaff00,
    map: texture
  });

  var huds = [];

  for (var i = 0; i < 6; i++) {
    huds[i] = new THREE.Mesh( geometry, material );
    camera.add(huds[i]);
  }

  var offset = 20;

  huds[0].position.z =  offset;
  huds[1].position.z = -offset;

  huds[2].position.y =  offset;
  huds[3].position.y = -offset;

  huds[4].position.x =  offset;
  huds[5].position.x = -offset;

  // huds.lookAt(camera.position);

  console.log("mesh", huds);
  console.log("camera", camera);
}

init();
animate();
addKeyHandler();
