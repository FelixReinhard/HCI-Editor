/*
 * Positions in mm 
 */

import './style.css'

import * as Three from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

import {Cell, create_basic1d} from './generate.ts';
import {make_3d_mesh_visible} from "./utils.ts";

// controls the speed you can drag the camera with in editing mode.
const DRAG_SPEED = .25;
const EDITING_MODE_DEFAULT_DIST = 15.0;
const AMPLITUDE_RANGE = [4, 20];
const WIDTH_RANGE = [8, 40];

// State 
var mode: String = "inspect"
var cells: Cell[] = []
// Which type of thing is currently selected, changed with the buttons on the left.
var selected_type = "basic1d"; // basic1d
var amplitude_value = AMPLITUDE_RANGE[1]/2.0;
var width_value = WIDTH_RANGE[1]/2.0;
var current_object: Cell = create_basic1d(amplitude_value, width_value);

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
      const zoom = camera.position.distanceTo(orbitControl.target);
      camera.position.set(orbitControl.target.x, zoom, orbitControl.target.z);
 
      last_camera_rotation = {'x': camera.rotation.x, 'y': camera.rotation.y, 'z': camera.rotation.z}
      camera.rotation.set(0, -Math.PI / 2, 0)
      make_3d_mesh_visible(false, cells);
      break;
    case "inspect":
      camera.rotation.set(last_camera_rotation.x, last_camera_rotation.y, last_camera_rotation.z)
      orbitControl.enablePan = true 
      orbitControl.enableRotate = true 
      make_3d_mesh_visible(true, cells);
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
      break;
    default:
      break;
  }
});

function place_current_selected_cell(position: Three.Vector3) {
  if (current_object == null) return;
  current_object.mesh_flat.position.copy(position);
  current_object.mesh.position.copy(position);
  current_object.selected_mesh.position.copy(position);
  current_object.selected_mesh.position.x -= 1;
  current_object.selected_mesh.position.z += 1;
  current_object.mesh.position.y += 0.1;

  scene.add(current_object.mesh_flat);
  scene.add(current_object.mesh);
  scene.add(current_object.selected_mesh);

  current_object.mesh.visible = mode == "inspect";
  cells.push(current_object);
}

// warning always when generating flat
export function warning(visible: boolean, message: string = "") {
  const elem = document.getElementById("warningText")!;
  elem.style.display = visible ? "block" : "none";
  elem.textContent = message;
} 

function update_current_cell_amplitude() {
  if (current_object != null) current_object.regenerate(amplitude_value, width_value);
}

function update_current_cell_width() {
  if (current_object != null) current_object.regenerate(amplitude_value, width_value);
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

document.getElementById("add")?.addEventListener("click", function (event) {
  place_current_selected_cell(orbitControl.target);
})

const raycaster = new Three.Raycaster();
const canvas = document.querySelector("canvas");

canvas?.addEventListener("click", function(event) {
  const mouse = new Three.Vector2();
  mouse.x = ( event.clientX / canvas?.offsetWidth) * 2 - 1;
	mouse.y = - ( event.clientY / canvas?.offsetHeight) * 2 + 1;

  raycaster.setFromCamera( mouse, camera );
  
  // check if selected
  const intersects = raycaster.intersectObjects(scene.children);
  if (intersects.length > 0) {
    // The ray intersects with one or more objects
    const cell = get_cell_by_mesh_uuid(intersects[0].object.userData);
    if (cell != null) {
      set_current_object(cell);
    }
  }
})

function set_current_object(newObj: Cell) {
  if (current_object != null) {
    current_object.selected_mesh.visible = false;
  }
  current_object = newObj;
  current_object.selected_mesh.visible = true;
  amplitude_slider.value = (newObj.amplitude - AMPLITUDE_RANGE[0]) / (AMPLITUDE_RANGE[1] - AMPLITUDE_RANGE[0]) * 100.0;
  width_slider.value = (newObj.width - WIDTH_RANGE[0]) / (WIDTH_RANGE[1] - WIDTH_RANGE[0]) * 100.0;
  
  amplitude_value = newObj.amplitude;
  width_value = newObj.width;
  amplitude_slider.dispatchEvent(new Event("input"));
  width_slider.dispatchEvent(new Event("input"));
}

function get_cell_by_mesh_uuid(id): Cell | null {
  for (const item of cells) {
    if (item.mesh.userData == id || item.mesh_flat.userData == id) {
      return item;
    }
  }
  return null;
}

// editing mode drag camera
document.addEventListener("mousemove", function(event) {
  if (mouse_pressed && mode == "editing" && event.clientX <= window.innerWidth * .6) {
    const dir = {'x': event.clientX - last_pos.x, 'y': event.clientY - last_pos.y}
    const zoom = orbitControl.target.distanceTo(camera.position) / EDITING_MODE_DEFAULT_DIST * DRAG_SPEED;
    moveX(-dir.x * 0.1 * zoom)
    moveY(-dir.y * 0.1 * zoom)
    last_pos = {'x': event.clientX, 'y': event.clientY}
  }
})

// Setup buttons 
document.getElementById("basic1d")?.addEventListener("click", function () {
  set_current_object(create_basic1d(amplitude_value, width_value));
})

const amplitude_slider = document.getElementById("amplitude")!;
amplitude_slider.oninput = function () {
  amplitude_value = AMPLITUDE_RANGE[0] + amplitude_slider.value / 100.0 * (AMPLITUDE_RANGE[1] - AMPLITUDE_RANGE[0]);
  update_current_cell_amplitude();
}

const width_slider = document.getElementById("width")!;
width_slider.oninput = function () {
  width_value = WIDTH_RANGE[0] + width_slider.value / 100.0 * (WIDTH_RANGE[1] - WIDTH_RANGE[0]);
  update_current_cell_width();
}

const deform_slider = document.getElementById("deform_slider")!;
deform_slider.oninput = function () {
}

const toggleSwitch = document.getElementById('toggleSwitch') as HTMLInputElement;
toggleSwitch.addEventListener('change', function () {
  if (toggleSwitch.checked) {
    deform_slider.style.display = "block";
  } else {
    deform_slider.style.display = "none";
  }
});

animate();
