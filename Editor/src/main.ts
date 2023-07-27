import './style.css'

import * as Three from 'three';

const scene = new Three.Scene();
const camera = new Three.PerspectiveCamera(80, (window.innerWidth * 0.6) / window.innerHeight, 0.1, 1000);
const renderer = new Three.WebGLRenderer({
    canvas: document.querySelector('#editor'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth * 0.6, window.innerHeight);
camera.position.setZ(30);

const test = new Three.TorusGeometry(10, 3 ,16, 100);
const test_mat = new Three.MeshBasicMaterial({color: 0xFF0000});
const t = new Three.Mesh(test, test_mat);

scene.add(t);

const gridHelper = new Three.GridHelper( 10, 10);
scene.add( gridHelper );

// camera.position.x+=Math.sin(camera.rotationy)*3;
// camera.position.z+=Math.cos(camera.rotationy)*3;
// tempVector.copy(target).y+=window.innerHeight; // the += is optional
// camera.lookAt( tempVector );

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();
