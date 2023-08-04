/*
 * Positions in mm 
 */


import './style.css'

import * as Three from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

import {generate_object, Cell, create_basic1d} from './generate.ts';

// controls the speed you can drag the camera with in editing mode.
const DRAG_SPEED = .25;
const EDITING_MODE_DEFAULT_DIST = 15.0;

// State 
var mode: String = "inspect"
var editing_mode: String = "drag"; // drag, put, scale
var current_object: Cell = null;
var cells: Cell[] = []

// Positions are in mm
const scene = new Three.Scene();
const camera = new Three.PerspectiveCamera(80, (window.innerWidth * 0.6) / window.innerHeight, 0.1, 1000);
const renderer = new Three.WebGLRenderer({
    canvas: document.querySelector('#editor'),
});
scene.background = new Three.Color(0xffffff);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth * 0.6, window.innerHeight);
camera.position.setZ(EDITING_MODE_DEFAULT_DIST);
camera.rotation.set(0, -Math.PI / 2, 0)

const orbitControl = new OrbitControls(camera, renderer.domElement);
//
// scene.add(t);
// Grid 
const gridHelper = new Three.GridHelper(500, 50);
scene.add( gridHelper );

function animate() {
  requestAnimationFrame(animate);
  orbitControl.update();
  renderer.render(scene, camera);
}

var last_camera_rotation = {'x': 0, 'y': 0, 'z': 0}
function switch_mode(new_mode: String) {
  mode = new_mode
  switch (mode) {
    case "editing":
      orbitControl.enablePan = false
      orbitControl.enableRotate = false
      camera.position.set(orbitControl.target.x, EDITING_MODE_DEFAULT_DIST, orbitControl.target.z);
 
      last_camera_rotation = {'x': camera.rotation.x, 'y': camera.rotation.y, 'z': camera.rotation.z}
      camera.rotation.set(0, -Math.PI / 2, 0)
      editing_mode = "move";
      break;
    case "inspect":
      camera.rotation.set(last_camera_rotation.x, last_camera_rotation.y, last_camera_rotation.z)
      orbitControl.enablePan = true 
      orbitControl.enableRotate = true 
      break;
    default:
      break;
  }
}

// Camera movement 
function moveY(dir: number) {
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
      if (mode == "editing") switch_mode("inspect")
      else switch_mode("editing")
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
    case " ": 
      if (mode == "editing") {
        editing_mode = (editing_mode == "move") ? "place" : "move"; 
      }
      break;
    default:
      break;
  }
});

function place_current_selected_cell(position: Three.Vector3) {
  if (current_object == null) return;
  current_object.mesh.position.copy(position);
  scene.add(current_object.mesh);
}

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


const raycaster = new Three.Raycaster();
const canvas = document.querySelector("canvas");

canvas.addEventListener("click", function(event) {
  if (!(editing_mode == "place" && mode == "editing")) {
    return;
  }
  const mouse = new Three.Vector2();
  mouse.x = ( event.clientX / canvas?.offsetWidth) * 2 - 1;
	mouse.y = - ( event.clientY / canvas?.offsetHeight) * 2 + 1;

  raycaster.setFromCamera( mouse, camera );
  
  // check if selected

  const plane = new Three.Plane( new Three.Vector3( 0, 1, 0 ), 0 );

  var intersects = new Three.Vector3();
	raycaster.ray.intersectPlane(plane, intersects);
  place_current_selected_cell(intersects);
})

// editing mode drag camera
document.addEventListener("mousemove", function(event) {
  if (mouse_pressed && mode == "editing" && editing_mode == "move") {
    const dir = {'x': event.clientX - last_pos.x, 'y': event.clientY - last_pos.y}
    const zoom = orbitControl.target.distanceTo(camera.position) / EDITING_MODE_DEFAULT_DIST * DRAG_SPEED;
    moveX(-dir.x * 0.1 * zoom)
    moveY(-dir.y * 0.1 * zoom)
    last_pos = {'x': event.clientX, 'y': event.clientY}
  }
})

// Setup buttons 
document.getElementById("basic1d")?.addEventListener("click", function () {
  if (current_object == null) current_object = create_basic1d(10);
})

animate();
