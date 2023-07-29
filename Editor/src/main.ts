import './style.css'

import * as Three from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

// Positions are in cm

const scene = new Three.Scene();
const camera = new Three.PerspectiveCamera(80, (window.innerWidth * 0.6) / window.innerHeight, 0.1, 1000);
const renderer = new Three.WebGLRenderer({
    canvas: document.querySelector('#editor'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth * 0.6, window.innerHeight);
camera.position.setZ(30);

// const test = new Three.TorusGeometry(10, 3 ,16, 100);
// const test_mat = new Three.MeshBasicMaterial({color: 0xFF0000});
// const t = new Three.Mesh(test, test_mat);
//
const geometry = new Three.CircleGeometry( 1, 20 ); 
const material = new Three.MeshBasicMaterial( { color: 0xffff00 } ); 
const circle = new Three.Mesh( geometry, material ); 
circle.rotateX(-Math.PI / 2);
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

// check keyboard input to move OrbitControls 
document.addEventListener("keydown", function(event) {
  switch (event.key) {
    case "w":
      orbitControl.target.z += 1;
      break;
    case "s":
      orbitControl.target.z -= 1;
      break;
    case "d":
      orbitControl.target.x += 1;
      break;
    case "a":
      orbitControl.target.x -= 1;
      break;
    default:
      break;
  }

  circle.position.set(orbitControl.target.x, 0, orbitControl.target.z);
});

animate();
