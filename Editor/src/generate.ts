import * as Three from 'three';

  
export function create_basic1d(amplitude: number, width: number): Cell {
  const vertices = generate_basic1d(amplitude, width);
  const vertices_flat = generate_basic1d_flat(amplitude, width);
  
  return new Cell(vertices_flat, vertices, new Three.Vector3(0, 0, 0));
}

// returns [
//          width_left_most_rect, 
//          offset_left_middle, 
//          width_left_midlle,
//          offset_right_middle,
//          width_right_middle,
//          offset_right,
//          width_right,
//    ]
//          
const c1 = [-0.050187499999999934, 0.6711875000000004, 1.1248749999999932,
              0.11856250000000003, 1.2491875000000001, 1.2176250000000017 ]
function compute_values_from_amplitude_basic1d_flat(amplitude: number, width: number): number[] {

  // taken from the formuala provided
  const c = amplitude;
  const d = width;

  const b = (c1[4]*c - c1[1]*d) / (c1[0]*c1[4] - c1[1]*c1[3]);
  const a = (c - c1[0]*b - c1[2]) / c1[1];
  return [
    2,
    4,
    a,
    a + 6,
    a,
    2*a + 8,
    2,
    a,
    b
  ]
}

// returns [
//          width_left_most_rect, 
//
//          left_middle_bottom_point_front, 
//          left_middle_top_point_front
//          right_middle_bottom_point_front, 
//
//          offset_right,
//          width_right,
//          b
//
//    ]
//          
function compute_values_from_amplitude_basic1d(amplitude: number, width: number): number[] {
  return [
    2,

    4,
    0.5*width + 4,
    width + 4,

    width + 6,
    2,

    (c1[4]*amplitude - c1[1]*width) / (c1[0]*c1[4] - c1[1]*c1[3])
  ]
}

function quad(x1: number[], x2: number[], x3: number[]): number[] {
  return [

  ]
}

function rect(width: number, height: number, offset: number[] = [0, 0]): number[] {
  return [ 
    offset[0], 0, offset[1],
    offset[0] + width, 0, offset[1],
    offset[0], 0, height + offset[1],

    offset[0] + width, 0, offset[1],
    offset[0] + width, 0, height + offset[1],
    offset[0], 0, height + offset[1],
  ]
}

function generate_basic1d_flat(amplitude: number, width: number): number[] {
  
  const vals = compute_values_from_amplitude_basic1d_flat(amplitude ,width);
  console.log("Vals", vals);

  const vertices = [
    ...rect(vals[0], vals[8]),
    ...rect(vals[2], vals[8], [vals[1], 0]),
    ...rect(vals[4], vals[8], [vals[3], 0]),
    ...rect(vals[6], vals[8], [vals[5], 0]),
  ]

  return vertices;
}

function generate_basic1d(amplitude: number, width: number): number[] {
  const vals = compute_values_from_amplitude_basic1d(amplitude, width);
  
  const vertices = [
    ...rect(vals[0], vals[7]),
    ...quad([ vals[1], 0], [ vals[2], 0], [ vals[2], vals[7] ]),
    ...quad( [ vals[2], 0], [ vals[2], vals[7] ], [vals[3], 0] ),
    ...rect( vals[5], vals[7], [vals[4], 0]),
  ]
  return vertices;
}

function generate_object(vertices: number[], color: Three.Color): Three.Mesh {
  const verticesFloat32Array = new Float32Array(vertices);

  // Create the BufferGeometry
  const geometry = new Three.BufferGeometry();

  // Set the custom vertex attribute 'position'
  const positionAttribute = new Three.BufferAttribute(verticesFloat32Array, 3);
  geometry.setAttribute('position', positionAttribute);

  const material = new Three.MeshBasicMaterial( { side: Three.DoubleSide ,color: color} );
  const mesh = new Three.Mesh( geometry, material );
  mesh.rotateX(-Math.PI )
  return mesh;
}

const DEFAULT_ELASTIC_D = 20; // mm
const DEFAULT_ELASTIC_X = 20; // mm
const DEFAULT_SCALE = 1;
const COLOR_MESH = new Three.Color(0, 0, 0);
const COLOR_FLAT_MESH = new Three.Color(0.75, 0.75, 0.75);

export class Cell {
  
  vertices_flat: number[];
  vertices: number[];
  mesh: Three.Mesh;
  mesh_flat: Three.Mesh;
  position: Three.Vector3;
  scale: number; // width
  elastic: boolean;
  elastic_d: number;
  elastic_x: number;

  constructor(vertices_flat: number[], vertices: number[], position: Three.Vector3) {
    this.vertices = vertices;
    this.vertices_flat = vertices_flat;
    this.position = position;

    this.elastic = false;
    this.scale = DEFAULT_SCALE;
    this.elastic_d = DEFAULT_ELASTIC_D;
    this.elastic_x = DEFAULT_ELASTIC_X;

    this.mesh = generate_object(vertices, COLOR_MESH);
    this.mesh_flat = generate_object(vertices_flat, COLOR_FLAT_MESH);
  }

  width() {
    var max = 0;
    for (let i = 0; i < this.vertices_flat.length; i += 3) {
      max = Math.max(max, this.vertices_flat[i]);
    }
    return max;
  }

  height() {
    var max = 0;
    for (let i = 2; i < this.vertices_flat.length; i += 3) {
      max = Math.max(max, this.vertices_flat[i]);
    }
    return max;
  }

  regenerate(amplitude: number, width: number) {

    const vertices = generate_basic1d_flat(amplitude, width);
    const vertices_flat = vertices; // temp TODO
    
    // flat
    this.mesh_flat.geometry.dispose();
    const verticesFloat32Array = new Float32Array(vertices_flat);
    // Create the BufferGeometry
    const geometry = new Three.BufferGeometry();

    // Set the custom vertex attribute 'position'
    const positionAttribute = new Three.BufferAttribute(verticesFloat32Array, 3);
    geometry.setAttribute('position', positionAttribute);
    this.mesh_flat.geometry = geometry;
  
    // normal
    this.mesh.geometry.dispose();

    const verticesFloat32Array2 = new Float32Array(vertices);
    // Create the BufferGeometry
    const geometry2 = new Three.BufferGeometry();

    // Set the custom vertex attribute 'position'
    const positionAttribute2 = new Three.BufferAttribute(verticesFloat32Array2, 3);
    geometry2.setAttribute('position', positionAttribute2);
    this.mesh.geometry = geometry2;
  }
}
