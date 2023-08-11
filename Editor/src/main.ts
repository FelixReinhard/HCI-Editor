/*
 * Positions in mm 
 */

import './style.css'

import * as Three from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

import {Cell, create_basic1d, create_basic2d, will_1d_break, will_2d_break} from './generate.ts';
import {make_3d_mesh_visible} from "./utils.ts";
import { export_cells } from './export.ts';

// controls the speed you can drag the camera with in editing mode.
const DRAG_SPEED = .25;
const EDITING_MODE_DEFAULT_DIST = 15.0;
const AMPLITUDE_RANGE = [4, 20];
const WIDTH_RANGE = [8, 40];
const IS_2D_STRECHED = false;

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

const lineGeometry = new Three.BufferGeometry().setFromPoints([
    new Three.Vector3(0, 0, 0), // Start point
    new Three.Vector3(0, 100, 0), // End point (change Y value to adjust the height)
]);

const lineMaterial = new Three.LineBasicMaterial({ color: 0x000000 }); 

// Create the line object and add it to the scene
const line = new Three.Line(lineGeometry, lineMaterial);
scene.add(line);

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
    case "Delete":
      remove_selected_cell();
      break;
    default:
      break;
  }
});

function remove_selected_cell() {
  if (current_object != null) {
    scene.remove(current_object.mesh);
    scene.remove(current_object.mesh_flat);
    scene.remove(current_object.selected_mesh);
    cells = cells.filter(item => item !== current_object);
  }
}

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
  current_object.position.copy(position);
  if (!cells.includes(current_object)) cells.push(current_object);
}

// warning always when generating flat
export function warning(visible: boolean, message: string = "") {
  const elem = document.getElementById("warningText")!;
  elem.style.display = visible ? "block" : "none";
  elem.textContent = message;
} 

function update_current_cell() {
  if (current_object != null) {
    const prev_amplitude = current_object.amplitude;
    const prev_width = current_object.width;
    var will_break = false;
    switch (current_object.type) {
      case "basic1d":
        will_break = will_1d_break(amplitude_value, width_value);
        break;
      case "basic2d":
        will_break = will_2d_break(amplitude_value, width_value);
        break;
    }
    if (!will_break) current_object.regenerate(amplitude_value, width_value);
    else {
      amplitude_value = prev_amplitude;
      width_value = prev_width;
      set_sliders(current_object.amplitude, current_object.width, current_object.elastic_d);
    }
  }
}

var last_pos = {'x': 0, 'y': 0}
var mouse_pressed = 0;
var clicked_on_cell = false;

document.addEventListener("mouseup", function() {
  --mouse_pressed
  last_pos = {'x': 0, 'y': 0}
  clicked_on_cell = false;
})

document.addEventListener("mousedown", function(event) {
  ++mouse_pressed
  last_pos = {'x': event.clientX, 'y': event.clientY}
  const intersects = get_clicked_on(event.clientX, event.clientY);
  if (intersects.length > 0) {

    const cell = get_cell_by_mesh_uuid(intersects[0].object.userData);
    if (cell != null && cell == current_object) {
      clicked_on_cell = true;
      const mouseInWorld = get_mouse_in_world(event.clientX, event.clientY);
      move_offset = current_object.position.clone().sub(mouseInWorld);
      return;
    } 
  } 
  clicked_on_cell = false;
})

document.getElementById("add")?.addEventListener("click", function () {
  switch (selected_type) {
    case "basic1d":
      set_current_object(create_basic1d(amplitude_value, width_value));
    break;
    case "basic2d":
      set_current_object(create_basic2d(amplitude_value, width_value));
    break;
  }
  place_current_selected_cell(orbitControl.target);
})

const raycaster = new Three.Raycaster();
const canvas = document.querySelector("canvas");

canvas?.addEventListener("click", function(event) {
	//raycaster.ray.intersectPlane(plane, intersects);
  const intersects = get_clicked_on(event.clientX, event.clientY);
  
  if (intersects.length > 0) {
    // The ray intersects with one or more objects
    const cell = get_cell_by_mesh_uuid(intersects[0].object.userData);
    clicked_on_cell = cell != null;
    if (cell != null) {
      set_current_object(cell);
    }
  } else {
    clicked_on_cell = false;
  }
})

function get_clicked_on(clientX: number, clientY: number) {

  const mouse = new Three.Vector2();
  mouse.x = ( clientX / canvas?.offsetWidth) * 2 - 1;
	mouse.y = - ( clientY / canvas?.offsetHeight) * 2 + 1;

  raycaster.setFromCamera( mouse, camera );

  //var intersects = new Three.Vector3();
	//raycaster.ray.intersectPlane(plane, intersects);
  return raycaster.intersectObjects(scene.children);
}

function get_mouse_in_world(clientX, clientY): Three.Vector3 {
  const mouse = new Three.Vector2();
  mouse.x = ( clientX / canvas?.offsetWidth) * 2 - 1;
  mouse.y = - ( clientY / canvas?.offsetHeight) * 2 + 1;

  raycaster.setFromCamera( mouse, camera );
  const plane = new Three.Plane( new Three.Vector3( 0, 1, 0 ), 0 );

  var intersects = new Three.Vector3();
  raycaster.ray.intersectPlane(plane, intersects);
  return intersects;
}

function set_sliders(amplitude: number, width: number, elastic: number) {
  amplitude_slider.value = (amplitude - AMPLITUDE_RANGE[0]) / (AMPLITUDE_RANGE[1] - AMPLITUDE_RANGE[0]) * 100.0;
  width_slider.value = (width - WIDTH_RANGE[0]) / (WIDTH_RANGE[1] - WIDTH_RANGE[0]) * 100.0;
  // TODO elastic slider
}

function set_current_object(newObj: Cell) {
  if (current_object != null) {
    current_object.selected_mesh.visible = false;
  }
  current_object = newObj;
  current_object.selected_mesh.visible = true;

  set_sliders(newObj.amplitude, newObj.width, newObj.elastic_d);

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

var move_offset: Three.Vector3 = new Three.Vector3(0, 0, 0);

function move_cell(mousePos) {
  place_current_selected_cell(mousePos.add(move_offset));
}

// editing mode drag camera
document.addEventListener("mousemove", function(event) {
  if (mouse_pressed && mode == "editing" && event.clientX <= window.innerWidth * .6 && clicked_on_cell) { 
    move_cell(get_mouse_in_world(event.clientX, event.clientY));
  } else if (mouse_pressed && mode == "editing" && event.clientX <= window.innerWidth * .6) {
    const dir = {'x': event.clientX - last_pos.x, 'y': event.clientY - last_pos.y}
    const zoom = orbitControl.target.distanceTo(camera.position) / EDITING_MODE_DEFAULT_DIST * DRAG_SPEED;
    moveX(-dir.x * 0.1 * zoom)
    moveY(-dir.y * 0.1 * zoom)
    last_pos = {'x': event.clientX, 'y': event.clientY}
  } 
})

// Setup buttons 
const btn_basic1d = document.getElementById("basic1d") as HTMLButtonElement;
btn_basic1d.addEventListener("click", function () {
  selected_type = "basic1d";
  enable_all_btns_not_me("basic1d");
})

const btn_basic2d = document.getElementById("basic2d") as HTMLButtonElement;
btn_basic2d.addEventListener("click", function() {
  selected_type = "basic2d";
  enable_all_btns_not_me("basic2d");
})

const btn_export = document.getElementById("export") as HTMLButtonElement;
btn_export.addEventListener("click", function() {
  export_cells(cells);
})

function enable_all_btns_not_me(not_disable_id: string) {
  btn_basic1d.disabled = false;
  btn_basic2d.disabled = false;
  
  document.getElementById(not_disable_id).disabled = true;
}

const amplitude_slider = document.getElementById("amplitude")!;
amplitude_slider.oninput = function () {
  amplitude_value = AMPLITUDE_RANGE[0] + amplitude_slider.value / 100.0 * (AMPLITUDE_RANGE[1] - AMPLITUDE_RANGE[0]);
  update_current_cell();
}

const width_slider = document.getElementById("width")!;
width_slider.oninput = function () {
  width_value = WIDTH_RANGE[0] + width_slider.value / 100.0 * (WIDTH_RANGE[1] - WIDTH_RANGE[0]);
  update_current_cell();
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



// basic1d is selected by default.
enable_all_btns_not_me("basic1d");

animate();
