import './style.css'

import * as Three from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

// State 
var mode: String = "move"
var mouse_mode: String = "drag"; // drag, put, scale

// Positions are in cm
const scene = new Three.Scene();
const camera = new Three.PerspectiveCamera(80, (window.innerWidth * 0.6) / window.innerHeight, 0.1, 1000);
const renderer = new Three.WebGLRenderer({
    canvas: document.querySelector('#editor'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth * 0.6, window.innerHeight);
camera.position.setZ(30);

const geometry = new Three.CircleGeometry( 1, 20 ); 
const material = new Three.MeshBasicMaterial( { color: 0xffff00 } ); 
const circle = new Three.Mesh( geometry, material ); 
circle.rotateX(-Math.PI / 2);
circle.scale.set(0.5, 0.5, 1)
scene.add( circle );

const orbitControl = new OrbitControls(camera, renderer.domElement);
//
// scene.add(t);
// Grid 
const gridHelper = new Three.GridHelper( 100, 100);
scene.add( gridHelper );

function animate() {
  requestAnimationFrame(animate);
  orbitControl.update();
  renderer.render(scene, camera);
}

function switch_mode(new_mode: String) {
  mode = new_mode
  switch (mode) {
    case "editing":
      orbitControl.enablePan = false
      orbitControl.enableRotate = false
      camera.position.set(0, 30, 0);
      camera.rotation.set(0, -Math.PI / 2, 0)
      break;

    default:
      break;
  }
}

// Camera movement 
function moveY(dir) {
  orbitControl.target.z += dir;
  camera.position.z += dir;
}

function moveX(dir) {
  orbitControl.target.x += dir;
  camera.position.x += dir;
}

// check keyboard input to move OrbitControls 
document.addEventListener("keydown", function(event) {
  switch (event.key) {
    case "e":
      // switch to editing mode
      switch_mode("editing")
      break;
    case "w":
      moveY(-1)
      break;
    case "s":
      moveY(1)
      break;
    case "d":
      moveX(1)
      break;
    case "a":
      moveX(-1)
      break;
    default:
      break;
  }

  circle.position.set(orbitControl.target.x, 0, orbitControl.target.z);
});

var last_pos = {'x': 0, 'y': 0}
var mouse_pressed = 0;
document.addEventListener("mouseup", function() {
  --mouse_pressed
  last_pos = {'x': 0, 'y': 0}
})

document.addEventListener("mousedown", function(event) {
  ++mouse_pressed
  last_pos = {'x': event.clientX, 'y': event.clientY}
})

// editing mode drag camera
document.addEventListener("mousemove", function(event) {
  if (mouse_pressed && mode == "editing") {
    const dir = {'x': event.clientX - last_pos.x, 'y': event.clientY - last_pos.y}
    moveX(-dir.x * 0.1 * orbitControl.zoom0)
    moveY(-dir.y * 0.1 * orbitControl.zoom0)
    last_pos = {'x': event.clientX, 'y': event.clientY}
  }
})

animate();



