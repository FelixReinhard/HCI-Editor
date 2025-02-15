/*
 * Positions in mm 
 */

import './style.css'

import * as Three from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

import {Cell, create_right1d, create_basic1d, create_basic2d, will_1d_break, will_2d_break, create_full1d, create_slope701d, create_slope1d, create_angle1d, create_right2d, create_full2d, create_slope702d, create_slope2d, create_angle2d} from './generate.ts';
import {make_3d_mesh_visible} from "./utils.ts";
import { export_cells } from './export.ts';
import { merge_1d_all, merge_2d_all } from './merge.ts';

// controls the speed you can drag the camera with in editing mode.
const DRAG_SPEED = .25;
const EDITING_MODE_DEFAULT_DIST = 15.0;
const AMPLITUDE_RANGE = [4, 20];
const WIDTH_RANGE = [8, 40];
const ELASTIC_RANGE = [1, 10];

// State 
// ######################################################
var mode: String = "inspect"
var cells: Cell[] = []
var is_elastic = false;
var has_2d_cells = false;

// Which type of thing is currently selected, changed with the buttons on the left.
var selected_type = "basic1d"; // basic1d
var amplitude_value = AMPLITUDE_RANGE[1]/2.0;
var width_value = WIDTH_RANGE[1]/2.0;
var elastic_value = ELASTIC_RANGE[0] + (ELASTIC_RANGE[1] - ELASTIC_RANGE[0])/2.0;
var current_object: Cell = null;// create_basic1d(amplitude_value, width_value, cells);

// Setup three js scene 
// ######################################################
const scene = new Three.Scene();
const camera = new Three.PerspectiveCamera(80, (window.innerWidth * 0.5) / window.innerHeight, 0.1, 1000);
const renderer = new Three.WebGLRenderer({
    canvas: document.querySelector('#editor'),
});
scene.background = new Three.Color(0xffffff);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth * 0.5, window.innerHeight);
camera.position.setZ(EDITING_MODE_DEFAULT_DIST);
camera.rotation.set(0, -Math.PI / 2, 0)

// Add Grid visual
// ######################################################

const lineGeometry = new Three.BufferGeometry().setFromPoints([
    new Three.Vector3(0, 0, 0), // Start point
    new Three.Vector3(0, 50, 0), // End point (change Y value to adjust the height)
]);
// Create the line object and add it to the scene
const line = new Three.Line(lineGeometry, 
  new Three.LineBasicMaterial({ color: 0x0000FF })
); 
scene.add(line);

const line2 = new Three.Line(new Three.BufferGeometry().setFromPoints([
    new Three.Vector3(0, 0, 0), // Start point
    new Three.Vector3(50, 0, 0), // End point (change Y value to adjust the height)
]), new Three.LineBasicMaterial({ color: 0xFF0000 }));  
scene.add(line2);

const line3 = new Three.Line(new Three.BufferGeometry().setFromPoints([
    new Three.Vector3(0, 0, 0), // Start point
    new Three.Vector3(0, 0, -50), // End point (change Y value to adjust the height)
]), new Three.LineBasicMaterial({ color: 0x00FF00 }));
scene.add(line3);

const orbitControl = new OrbitControls(camera, renderer.domElement);
//scene.add( new Three.GridHelper(500, 50) );
 
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

function moveX(dir: number) {
  orbitControl.target.x += dir;
  camera.position.x += dir;
}


function remove_selected_cell() {
  remove(current_object);
}

function remove(cell: Cell) {
  if (cell != null) {
    scene.remove(cell.mesh);
    scene.remove(cell.mesh_flat);
    scene.remove(cell.selected_mesh);
    scene.remove(cell.gap.boundingBox);
    cells = cells.filter(item => item !== cell);

    const old_has2 = has_2d_cells;
    has_2d_cells = cells.reduce((acc: boolean, value: Cell) => { return acc || value.type.includes("2d"); }, false);
    if (old_has2 != has_2d_cells && old_has2) {
      // was on now off so change all ones.
      for (let cell of cells) {
        update_cell_position(cell);
      }
    }
  }
}

export const scalar = [.8, .8];

function update_cell_position(cell: Cell) {
  const position = cell.position;

  cell.mesh_flat.position.copy(position);
  cell.selected_mesh.position.copy(position);
  cell.mesh.position.copy(position);

  const PLANE_SCALAR = has_2d_cells ? scalar[0] : scalar[1];
  // if (cell.type.includes("1d")) {
  //   if (Math.abs(cell.position.x) > cell.get_width()/2) {
  //     const center_dir_x = cell.position.x + cell.get_width()/2 < 0 ? -1 : 1;
  //     cell.mesh.position.x = (cell.mesh.position.x) * PLANE_SCALAR - cell.get_width()/2 * center_dir_x;
  //     if (has_2d_cells) {
  //       const center_dir_y = cell.position.y + cell.get_height()/2 < 0 ? -1 : 1;
  //       cell.mesh.position.z = cell.mesh.position.z * PLANE_SCALAR - cell.get_height()/2 * center_dir_y;
  //     }
  //   } else {
  //     cell.mesh.position.x = -cell.get_width()/2;
  //   }
  // } else {
  //   const center_dir_x = cell.position.x + cell.get_width()/2 < 0 ? -1 : 1;
  //   cell.mesh.position.x = (cell.mesh.position.x) * PLANE_SCALAR; 
  //   if (has_2d_cells) {
  //     const center_dir_y = cell.position.y + cell.get_height()/2 < 0 ? -1 : 1;
  //     cell.mesh.position.z = cell.mesh.position.z * PLANE_SCALAR;
  //   }
  // }
  cell.mesh.position.x = (cell.mesh.position.x + cell.get_width()/2) * PLANE_SCALAR - cell.get_width()/2;
  if (has_2d_cells) {
    cell.mesh.position.z = (cell.mesh.position.z - cell.get_height()/2) * PLANE_SCALAR + cell.get_height()/2;
  }
  // cell.mesh.position.z = (has_2d_cells) ? (cell.mesh.position.z - cell.get_height()/2 + cell.get_height_mesh()/2) * PLANE_SCALAR : cell.mesh.position.z ;
  // add offset 
  cell.selected_mesh.position.x -= 1;
  cell.selected_mesh.position.z += 1;
  cell.mesh.position.y = 0.1;
  cell.mesh_flat.position.y = 0;
  // add offset of elastic to the 3d mesh so it is centered on the flat one first.
  if (cell.elastic) {
    cell.mesh.position.x += cell.elastic_offset[0];
    cell.mesh.position.z -= cell.elastic_offset[1];
  }

}

function place_current_selected_cell(position: Three.Vector3) {
  if (current_object == null) return;
  current_object.position.copy(position);

  // current_object.mesh_flat.position.copy(position);
  // current_object.selected_mesh.position.copy(position);
  // current_object.mesh.position.copy(position);
  //
  // const PLANE_SCALAR = has_2d_cells ? 1.0/1.75 : .5;
  // current_object.mesh.position.x = (current_object.mesh.position.x - current_object.get_width()/2) * PLANE_SCALAR;
  // current_object.mesh.position.z = (has_2d_cells) ? (current_object.mesh.position.z - current_object.get_width()/2) * PLANE_SCALAR : current_object.mesh.position.z;
  // // add offset 
  // current_object.selected_mesh.position.x -= 1;
  // current_object.selected_mesh.position.z += 1;
  // current_object.mesh.position.y = 0.1;
  // // add offset of elastic to the 3d mesh so it is centered on the flat one first.
  // if (current_object.elastic) {
  //   current_object.mesh.position.x += current_object.elastic_offset[0];
  //   current_object.mesh.position.z -= current_object.elastic_offset[1];
  // }
  update_cell_position(current_object);

  scene.add(current_object.mesh_flat);
  scene.add(current_object.mesh);
  scene.add(current_object.selected_mesh);
  current_object.add_bounding_box(scene);

  current_object.mesh.visible = mode == "inspect";
  current_object.position.copy(position);
  current_object.gen_coll();
  if (!cells.includes(current_object)) {
    if (current_object.type.includes("2d") && !has_2d_cells) {
      has_2d_cells = true;
    }
    cells.push(current_object);
  }   
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
      case "chained_basic_1d":
      case "right1d":
      case "full1d":
      case "slope71d":
      case "slope1d":
      case "angle1d":
        will_break = will_1d_break(amplitude_value, width_value);
        break;
      case "basic2d":
      case "right2d":
      case "full2d":
      case "slope72d":
      case "slope2d":
      case "angle2d":
      case "chained_basic_2d":
        will_break = will_2d_break(amplitude_value, width_value);
        break;
    }
    if (!will_break) current_object.regenerate(amplitude_value, width_value, cells);
    else {
      amplitude_value = prev_amplitude;
      width_value = prev_width;
      set_sliders(current_object.amplitude, current_object.width, current_object.elastic_d);
    }
    check_gap();
    place_current_selected_cell(current_object.position);
    for (let cell of cells) {
      update_cell_position(cell);
    }
  }
}

var last_pos = {'x': 0, 'y': 0}
var mouse_pressed = 0;
var clicked_on_cell = false;

// check keyboard input to move OrbitControls 
document.addEventListener("keydown", function(event) {
  switch (event.key) {
    case "e":
      if (mode == "editing") switch_mode("inspect");
      else switch_mode("editing");
      switch_mode_text.innerText = (mode == "editing") ? "3D (e)" : "2D (e)";
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
      add_btn.dispatchEvent(new Event("click"));
      break;
    case "Delete":
      remove_selected_cell();
      break;
    default:
      break;
  }
});

document.addEventListener("mouseup", function() {
  --mouse_pressed
  last_pos = {'x': 0, 'y': 0}
  clicked_on_cell = false;
  check_mergin();
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

// Add new btn/ Button
//
//// amplitude_slider.dispatchEvent(new Event("input"));
const add_btn = document.getElementById("add")!;
add_btn.addEventListener("click", function () {
  const is_now_elastic = current_object != null ? current_object.elastic: is_elastic;
  switch (selected_type) {
    case "basic1d":
      set_current_object(create_basic1d(amplitude_value, width_value, cells));
      break;
    case "right1d":
      set_current_object(create_right1d(amplitude_value, width_value, cells));
      break;
    case "full1d":
      set_current_object(create_full1d(amplitude_value, width_value, cells));
      break;
    case "slope71d":
      set_current_object(create_slope701d(amplitude_value, width_value, cells));
      break;
    case "slope1d":
      set_current_object(create_slope1d(amplitude_value, width_value, cells));
      break;
    case "angle1d":
      set_current_object(create_angle1d(amplitude_value, width_value, cells));
      break;

    case "basic2d":
      set_current_object(create_basic2d(amplitude_value, width_value, cells));
      break;
    case "right2d":
      set_current_object(create_right2d(amplitude_value, width_value, cells));
      break;
    case "full2d":
      set_current_object(create_full2d(amplitude_value, width_value, cells));
      break;
    case "slope72d":
      set_current_object(create_slope702d(amplitude_value, width_value, cells));
      break;
    case "slope2d":
      set_current_object(create_slope2d(amplitude_value, width_value, cells));
      break;
    case "angle2d":
      set_current_object(create_angle2d(amplitude_value, width_value, cells));
      break;
  }
  place_current_selected_cell(orbitControl.target);
  if (is_now_elastic) {
    set_current_cell_elastic(true, elastic_value);
    turn_elastic(current_object.elastic);
  }
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
  mouse.x = ( clientX / canvas!.offsetWidth) * 2 - 1;
	mouse.y = - ( clientY / canvas!.offsetHeight) * 2 + 1;

  raycaster.setFromCamera( mouse, camera );

  //var intersects = new Three.Vector3();
	//raycaster.ray.intersectPlane(plane, intersects);
  return raycaster.intersectObjects(scene.children);
}

function get_mouse_in_world(clientX: number, clientY: number): Three.Vector3 {
  const mouse = new Three.Vector2();
  mouse.x = ( clientX / canvas!.offsetWidth) * 2 - 1;
  mouse.y = - ( clientY / canvas!.offsetHeight) * 2 + 1;

  raycaster.setFromCamera( mouse, camera );
  const plane = new Three.Plane( new Three.Vector3( 0, 1, 0 ), 0 );

  var intersects = new Three.Vector3();
  raycaster.ray.intersectPlane(plane, intersects);
  return intersects;
}

function set_sliders(amplitude: number, width: number, elastic: number) {
  amplitude_slider.value = ((amplitude - AMPLITUDE_RANGE[0]) / (AMPLITUDE_RANGE[1] - AMPLITUDE_RANGE[0]) * 100.0).toString();
  width_slider.value = ((width - WIDTH_RANGE[0]) / (WIDTH_RANGE[1] - WIDTH_RANGE[0]) * 100.0).toString();
  elastic_slider.value = ((elastic - ELASTIC_RANGE[0]) / (ELASTIC_RANGE[1] - ELASTIC_RANGE[0]) * 100.0).toString();
}

function set_current_object(newObj: Cell) {
  if (current_object != null) {
    current_object.set_selected_mesh(false, true)
  }
  current_object = newObj;
  current_object.set_selected_mesh(true, true);

  set_sliders(newObj.amplitude, newObj.width, newObj.elastic_d);
  turn_elastic(newObj.elastic);

  amplitude_value = newObj.amplitude;
  width_value = newObj.width;
  elastic_value = newObj.elastic_d;
  is_elastic = newObj.elastic;
  amplitude_slider.dispatchEvent(new Event("input"));
  width_slider.dispatchEvent(new Event("input"));
  elastic_slider.dispatchEvent(new Event("input"));
}

function turn_elastic(on: boolean) {
  elasticToggle.checked = on; 
  elasticToggle.dispatchEvent(new Event("input"));
  if (elasticToggle.checked) {
    is_elastic = true;
    elastic_slider_visual.style.display = "block";
  } else {
    is_elastic = false;
    elastic_slider_visual.style.display = "none";
  }
}

function get_cell_by_mesh_uuid(id: number): Cell | null {
  for (const item of cells) {
    if (item.mesh.userData == id || item.mesh_flat.userData == id) {
      return item;
    }
  }
  return null;
}

var move_offset: Three.Vector3 = new Three.Vector3(0, 0, 0);

function move_cell(mousePos: Three.Vector3) {
  place_current_selected_cell(mousePos.add(move_offset));
  checkCollision(current_object);
  check_gap();
}

// editing mode drag camera
document.addEventListener("mousemove", function(event) {
  // reset collision_type before move, so only if collision is possible

  collision_type = {"type": "none", "agent1": null, "agent2": null};

  if (mouse_pressed && mode == "editing" && event.clientX <= window.innerWidth * .6 && clicked_on_cell) { 
    move_cell(get_mouse_in_world(event.clientX, event.clientY));
  } else if (mouse_pressed && mode == "editing" && event.clientX <= window.innerWidth * .6) {
    const dir = {'x': event.clientX - last_pos.x, 'y': event.clientY - last_pos.y}
    const zoom = orbitControl.target.distanceTo(camera.position) / EDITING_MODE_DEFAULT_DIST * DRAG_SPEED;
    moveX(-dir.x * 0.1 * zoom);
    moveY(-dir.y * 0.1 * zoom);
    last_pos = {'x': event.clientX, 'y': event.clientY};
  } 
});


  
// Setup buttons 
//

const btn_switch_mode = document.getElementById("switch_mode") as HTMLButtonElement;
const switch_mode_text = document.getElementById("switch_mode_inner")!;
btn_switch_mode.addEventListener("click", function () {
  if (mode == "editing") switch_mode("inspect");
  else switch_mode("editing");
  switch_mode_text.innerText = (mode == "editing") ? "3D (e)" : "2D (e)";
});

const btn_basic1d = document.getElementById("basic1d") as HTMLButtonElement;
btn_basic1d.addEventListener("click", function () {
  selected_type = "basic1d";
  enable_all_btns_not_me("basic1d");
});

const btn_right1d = document.getElementById("right1d") as HTMLButtonElement;
btn_right1d.addEventListener("click", function () {
  selected_type = "right1d";
  enable_all_btns_not_me("right1d");
});

const btn_full1d = document.getElementById("full1d") as HTMLButtonElement;
btn_full1d.addEventListener("click", function () {
  selected_type = "full1d";
  enable_all_btns_not_me("full1d");
});

const btn_slope71d= document.getElementById("slope71d") as HTMLButtonElement;
btn_slope71d.addEventListener("click", function () {
  selected_type = "slope71d";
  enable_all_btns_not_me("slope71d");
});

const btn_slope1d= document.getElementById("slope1d") as HTMLButtonElement;
btn_slope1d.addEventListener("click", function () {
  selected_type = "slope1d";
  enable_all_btns_not_me("slope1d");
});

const btn_angle1d = document.getElementById("angle1d") as HTMLButtonElement;
btn_angle1d.addEventListener("click", function () {
  selected_type = "angle1d";
  enable_all_btns_not_me("angle1d");
});



const btn_basic2d = document.getElementById("basic2d") as HTMLButtonElement;
btn_basic2d.addEventListener("click", function() {
  selected_type = "basic2d";
  enable_all_btns_not_me("basic2d");
});

const btn_right2d = document.getElementById("right2d") as HTMLButtonElement;
btn_right2d.addEventListener("click", function() {
  selected_type = "right2d";
  enable_all_btns_not_me("right2d");
});

const btn_full2d = document.getElementById("full2d") as HTMLButtonElement;
btn_full2d.addEventListener("click", function() {
  selected_type = "full2d";
  enable_all_btns_not_me("full2d");
});

const btn_slope72d= document.getElementById("slope72d") as HTMLButtonElement;
btn_slope72d.addEventListener("click", function() {
  selected_type = "slope72d";
  enable_all_btns_not_me("slope72d");
});

const btn_slope2d = document.getElementById("slope2d") as HTMLButtonElement;
btn_slope2d.addEventListener("click", function() {
  selected_type = "slope2d";
  enable_all_btns_not_me("slope2d");
});


const btn_angle2d = document.getElementById("angle2d") as HTMLButtonElement;
btn_angle2d.addEventListener("click", function() {
  selected_type = "angle2d";
  enable_all_btns_not_me("angle2d");
});


const btn_export = document.getElementById("export") as HTMLButtonElement;
btn_export.addEventListener("click", function() {
  export_cells(cells, export_type);
});

function enable_all_btns_not_me(not_disable_id: string) {
  btn_basic1d.disabled = false;
  btn_right1d.disabled = false;
  btn_full1d.disabled = false;
  btn_slope71d.disabled = false;
  btn_slope1d.disabled = false;
  btn_angle1d.disabled = false;

  btn_basic2d.disabled = false;
  btn_right2d.disabled = false;
  btn_full2d.disabled = false;
  btn_slope72d.disabled = false;
  btn_slope2d.disabled = false;
  btn_angle2d.disabled = false;
  
  (document.getElementById(not_disable_id)! as HTMLButtonElement).disabled = true;
}

const amplitude_text = document.getElementById("amplitude_text")!;
const width_text = document.getElementById("width_text")!;

const amplitude_slider = document.getElementById("amplitude")! as HTMLInputElement;
amplitude_slider.oninput = function () {
  amplitude_value = AMPLITUDE_RANGE[0] + parseInt(amplitude_slider.value) / 100.0 * (AMPLITUDE_RANGE[1] - AMPLITUDE_RANGE[0]);
  update_current_cell();
  amplitude_text.innerHTML= `<strong>Amplitude:</strong> ${amplitude_value.toFixed(2)}mm`;
}

const width_slider = document.getElementById("width")! as HTMLInputElement;
width_slider.oninput = function () {
  width_value = WIDTH_RANGE[0] + parseInt(width_slider.value) / 100.0 * (WIDTH_RANGE[1] - WIDTH_RANGE[0]);
  update_current_cell();
  width_text.innerHTML= `<strong>Width:</strong> ${width_value.toFixed(2)}mm`;
}

const elastic_slider_visual = document.getElementById("deform_slider")!;
const elastic_slider = document.getElementById("deform")! as HTMLInputElement;
elastic_slider.oninput = function () {
  elastic_value = ELASTIC_RANGE[0] + parseInt(elastic_slider.value) / 100.0 * (ELASTIC_RANGE[1] - ELASTIC_RANGE[0]);
  set_current_cell_elastic(is_elastic, elastic_value);
}

const elasticToggle = document.getElementById('toggleSwitch') as HTMLInputElement;
elasticToggle.addEventListener('change', function () {
  if (current_object == null || current_object.type.includes("chained")) {
    elasticToggle.checked = false; 
    elasticToggle.dispatchEvent(new Event("input"));
    return;
  } 
  if (elasticToggle.checked) {
    is_elastic = true;
    elastic_slider_visual.style.display = "block";
  } else {
    is_elastic = false;
    elastic_slider_visual.style.display = "none";
  }
  set_current_cell_elastic(is_elastic, elastic_value);
});

function set_current_cell_elastic(is_elastic: boolean, val: number) {
  if (current_object != null) {
    current_object.elastic = is_elastic;
    current_object.elastic_d = val;
    update_current_cell();
  }
}

var export_type = "svg";

// used on the mouseup event to check if a merging should be done.
var collision_type: {[key: string]: string | null | Cell} = {"type" : "none", "agent1": null, "agent2": null};

function check_mergin() {

  if (collision_type["type"] == "1d") {
    if ("type_override_other" in collision_type) {
      (collision_type["agent2"] as Cell).type = collision_type["type_override_other"] as string;
    }
    merge_1d_all(collision_type["agent1"] as Cell, collision_type["agent2"] as Cell, cells);
    remove(collision_type["agent2"] as Cell);

    check_gap();
  } else if (collision_type["type"] == "2d") {
    if ("type_override_other" in collision_type) {
      (collision_type["agent2"] as Cell).type = collision_type["type_override_other"] as string;
    }
    merge_2d_all(collision_type["agent1"] as Cell, collision_type["agent2"] as Cell, cells);
    remove(collision_type["agent2"] as Cell);

    check_gap();
  }
}
// collision 
function checkCollision(cell: Cell) {
  for (let other of cells) {
    if (other == cell || cell.coll == null) continue;
    for (let col1 of cell.coll) {
      if (other.coll == null) continue;
      for (let col2 of other.coll) { 

        // const key = `${cell.type}_${other.type}:${col1.meta}_${col2.meta}`;
        // if (key in collision_callbacks && col1.collisionBoxesIntersect(col2)) {
        //   collision_callbacks[key](cell, other);
        // }
        if (col1.collisionBoxesIntersect(col2)) {
          if (col1.meta == "1d_left" && col2.meta == "1d_right") {
            collision_type = {"type": "1d", "agent1": other, "agent2": cell};
          } else if (col1.meta == "1d_right" && col2.meta == "1d_left") {
            collision_type = {"type": "1d", "agent1": cell, "agent2": other};
          } 
          // special case 1d
          else if (col1.meta == "1d_right_m" && col2.meta == "1d_left_m") {
            collision_type = {"type": "1d", "agent1": cell, "agent2": other, "type_override_other": "basic1d_m"};
          } else if (col1.meta == "1d_left_m" && col2.meta == "1d_right_m") {
            collision_type = {"type": "1d", "agent1": other, "agent2": cell, "type_override_other": "basic1d_m"};
          }

          else if (col1.meta == "2d_left" && col2.meta == "2d_right") {
            collision_type = {"type": "2d", "agent1": other, "agent2": cell};
          } else if (col1.meta == "2d_right" && col2.meta == "2d_left") {
            collision_type = {"type": "2d", "agent1": cell, "agent2": other};
          }

          else if(col1.meta == "2d_right_m" && col2.meta == "2d_left_m") {
            collision_type = {"type": "2d", "agent1": cell, "agent2": other, "type_override_other": "basic2d_m"};
          } else if (col1.meta == "2d_left_m" && col2.meta == "2d_right_m") {
            collision_type = {"type": "2d", "agent1": other, "agent2": cell, "type_override_other": "basic2d_m"};
          }
        }
      }
    }
  }
}
function check_gap() {
  // const newCenter = [
  //   cells.reduce((acc: number, value: Cell) => { return Math.max(acc, value.position.x + value.get_width())}, 0) / 2.0,
  //   cells.reduce((acc: number, value: Cell) => { return Math.max(acc, value.position.z + value.get_height())}, 0) / 2.0
  // ];
  // 
  // const offset = [newCenter[0] - center[0], newCenter[1] - center[1]];
  // for (let cell of cells) {
  //   cell.mesh.position.x += offset[0];
  //   cell.mesh.position.z += offset[1];
  // }
  // center = newCenter;

  for (let c of cells) {
    c.update_gap(cells, current_object);
  }
  if (current_object.length == 0) return;
  if (cells.length == 1) {
    current_object.gap.boundingBox.visible = false;
    return;
  }
  for (let cell of cells) {
    cell.gap.boundingBox.visible = false;
    for (let other of cells) {
      if (other == cell) continue;
      if (other.gap.overlaps(cell.gap)) {
        cell.gap.boundingBox.visible = true;
      }
    }
  }
}

// basic1d is selected by default.
enable_all_btns_not_me("basic1d");

amplitude_slider.dispatchEvent(new Event("input"));
width_slider.dispatchEvent(new Event("input"));

animate();
