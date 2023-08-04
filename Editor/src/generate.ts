import * as Three from 'three';

  
export function create_basic1d(amplitude: number): Cell {
  const vertices = generate_basic1d(amplitude, 10);
  
  return new Cell(vertices, vertices, new Three.Vector3(0, 0, 0));
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
function compute_values_from_amplitude_basic1d(amplitude: number): number[] {
  return [
    2,
    4,
    10,
    16,
    10,
    28,
    2,
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

function generate_basic1d(amplitude: number, scale: number): number[] {
  
  const vals = compute_values_from_amplitude_basic1d(amplitude);

  const vertices = [
    ...rect(vals[0], scale),
    ...rect(vals[2], scale, [vals[1], 0]),
    ...rect(vals[4], scale, [vals[3], 0]),
    ...rect(vals[6], scale, [vals[5], 0]),
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
}
