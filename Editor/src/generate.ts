import * as Three from 'three';
import {warning} from './main.ts';
  
const WARNING_STRING = "Combination of amplitude and width lead to negative Dimensions. Try changing the sliders.";
const SELECTED_COLOR = 0xFF0000;
var id = 0;

export function create_basic1d(amplitude: number, width: number): Cell {
  const vertices = generate_basic1d(amplitude, width);
  const vertices_flat = generate_basic1d_flat(amplitude, width);
  
  return new Cell("basic1d", vertices_flat, vertices, new Three.Vector3(0, 0, 0), amplitude, width);
}

export function will_1d_break(amplitude: number, width: number): boolean {
  const c = amplitude;
  const d = width;

  const b = (c1[4]*c - c1[1]*d) / (c1[0]*c1[4] - c1[1]*c1[3]);
  const a = (c - c1[0]*b - c1[2]) / c1[1];
  return a <= 0.0 || b <= 0.0;
}
export function will_2d_break(amplitude: number, width: number): boolean {
  const c = amplitude;
  const d = width;

  const b = (c2[4]*c - c2[1]*d) / (c2[0]*c2[4] - c2[1]*c2[3]);
  const a = (c - c2[0]*b - c2[2]) / c2[1];
  return a <= 0.0 || b <= 0.0;
}
  
export function create_basic2d(amplitude: number, width: number): Cell {
  const vertices = generate_basic2d(amplitude, width);
  const vertices_flat = generate_basic2d_flat(amplitude, width);
  
  return new Cell("basic2d", vertices_flat, vertices, new Three.Vector3(0, 0, 0), amplitude, width);
}


const DEFAULT_SIZE = 2; // 2mm
// basic1d formuala params
const c1 = [-0.050187499999999934, 0.6711875000000004, 1.1248749999999932,
              0.11856250000000003, 1.2491875000000001, 1.2176250000000017 ]

function generate_basic1d_flat(amplitude: number, width: number): number[] {
  // taken from the formuala provided
  const c = amplitude;
  const d = width;

  const b = (c1[4]*c - c1[1]*d) / (c1[0]*c1[4] - c1[1]*c1[3]);
  const a = (c - c1[0]*b - c1[2]) / c1[1];
  
  if (a < 0 || b < 0) {
    warning(true, WARNING_STRING);
  } else {
    warning(false);
  }

  const vertices = [
    ...rect(DEFAULT_SIZE, b),
    ...rect(a, b, [DEFAULT_SIZE*2, 0]),
    ...rect(a, b, [DEFAULT_SIZE*3 + a, 0]),
    ...rect(DEFAULT_SIZE, b, [DEFAULT_SIZE*4 + 2*a, 0]),
  ]

  return vertices;
}

function generate_basic1d(amplitude: number, width: number): number[] {
  const c = amplitude;
  const d = width;

  const b = (c1[4]*c - c1[1]*d) / (c1[0]*c1[4] - c1[1]*c1[3]);
  const a = (c - c1[0]*b - c1[2]) / c1[1];
  
  const center = DEFAULT_SIZE*2.5 + a;

  const vertices = [
    ...quad(
      [center - DEFAULT_SIZE*2 - d/2.0, -DEFAULT_SIZE/2.0, 0], 
      [center - DEFAULT_SIZE*2 - d/2.0, -DEFAULT_SIZE/2.0, b],
      [center - DEFAULT_SIZE- d/2.0, 0, 0], 
      [center - DEFAULT_SIZE- d/2.0, 0, b],
    ),
    // ...rect(DEFAULT_SIZE, b, [center - DEFAULT_SIZE*2 - d/2.0, 0]),
    ...quad(
      [center - d/2.0, 0, 0], [center, -c, 0],
      [center - d/2.0, 0, b], [center, -c, b],
    ),
    ...quad(
      [center, -c, 0], [center + d/2.0, 0, 0], 
      [center, -c, b], [center + d/2.0, 0, b], 
    ),
    ...quad(
      [center + DEFAULT_SIZE*2 + d/2.0, -DEFAULT_SIZE/2.0, 0], 
      [center + DEFAULT_SIZE*2 + d/2.0, -DEFAULT_SIZE/2.0, b],
      [center + DEFAULT_SIZE + d/2.0, 0, 0], 
      [center + DEFAULT_SIZE + d/2.0, 0, b],
    ),
    //...rect(DEFAULT_SIZE, b, [center + DEFAULT_SIZE + d/2.0, 0])
  ]
  return vertices;
}

const c2 = [
  0.8932499999999999,
  0.149,
  0.9269999999999996, // perhaps wrong because -- in formuala whatsapp
  0.8803124999999999,
  0.9789375,
  6.489625
]
// Tells you the slope for the triangles in the middle in amplitude
const BASIC_2D_TRIANGLE_AMPL = 1;

function generate_basic2d(amplitude: number, width: number): number[] {
  const c = amplitude;
  const d = width;

  const b = (c2[4]*c - c2[1]*d) / (c2[0]*c2[4] - c2[1]*c2[3]);
  const a = (c - c2[0]*b - c2[2]) / c2[1];
  
  const center = DEFAULT_SIZE*2.5 + a + b/2;

  if (a < 0 || b < 0) {
    warning(true, WARNING_STRING);
  } else {
    warning(false);
  }
  
  const elem_len = a + b/2.0;
  const elem_len_3d_triangle = (b/2.0)/elem_len * d/2.0;
  const elem_len_3d_rect = a/elem_len * d/2.0;

  return move_verticies(0, 0, a+DEFAULT_SIZE/2.0 + DEFAULT_SIZE*2,[
    // left
    ...vertex(
      [center - DEFAULT_SIZE/2.0 - elem_len_3d_triangle, -c*BASIC_2D_TRIANGLE_AMPL , 0], 
      [center - DEFAULT_SIZE/2.0, -c, b/2.0], 
      [center - DEFAULT_SIZE/2.0 - elem_len_3d_triangle, -c*BASIC_2D_TRIANGLE_AMPL , b], 
    ),
    ...quad(
      [center - DEFAULT_SIZE/2.0 - elem_len_3d_triangle, -c*BASIC_2D_TRIANGLE_AMPL , 0], 
      [center - DEFAULT_SIZE/2.0 - elem_len_3d_triangle, -c*BASIC_2D_TRIANGLE_AMPL , b], 
      [center - DEFAULT_SIZE/2.0 - elem_len_3d_rect - elem_len_3d_triangle, 0, 0], 
      [center - DEFAULT_SIZE/2.0 - elem_len_3d_rect - elem_len_3d_triangle, 0, b], 
    ),
    ...quad(
      [center - 3*DEFAULT_SIZE/2.0 - elem_len_3d_rect - elem_len_3d_triangle, 0, 0], 
      [center - 3*DEFAULT_SIZE/2.0 - elem_len_3d_rect - elem_len_3d_triangle, 0, b], 
      [center - 5*DEFAULT_SIZE/2.0 - elem_len_3d_rect - elem_len_3d_triangle, -DEFAULT_SIZE/2.0, 0], 
      [center - 5*DEFAULT_SIZE/2.0 - elem_len_3d_rect - elem_len_3d_triangle, -DEFAULT_SIZE/2.0, b], 
    ),

    // right 
    ...vertex(
      [center + DEFAULT_SIZE/2.0 + elem_len_3d_triangle, -c*BASIC_2D_TRIANGLE_AMPL , 0], 
      [center + DEFAULT_SIZE/2.0, -c, b/2.0], 
      [center + DEFAULT_SIZE/2.0 + elem_len_3d_triangle, -c*BASIC_2D_TRIANGLE_AMPL , b], 
    ),
    ...quad(
      [center + DEFAULT_SIZE/2.0 + elem_len_3d_triangle, -c*BASIC_2D_TRIANGLE_AMPL , 0], 
      [center + DEFAULT_SIZE/2.0 + elem_len_3d_triangle, -c*BASIC_2D_TRIANGLE_AMPL , b], 
      [center + DEFAULT_SIZE/2.0 + elem_len_3d_rect + elem_len_3d_triangle, 0, 0], 
      [center + DEFAULT_SIZE/2.0 + elem_len_3d_rect + elem_len_3d_triangle, 0, b], 
    ),
    ...quad(
      [center + 3*DEFAULT_SIZE/2.0 + elem_len_3d_rect + elem_len_3d_triangle, 0, 0], 
      [center + 3*DEFAULT_SIZE/2.0 + elem_len_3d_rect + elem_len_3d_triangle, 0, b], 
      [center + 5*DEFAULT_SIZE/2.0 + elem_len_3d_rect + elem_len_3d_triangle, -DEFAULT_SIZE/2.0, 0], 
      [center + 5*DEFAULT_SIZE/2.0 + elem_len_3d_rect + elem_len_3d_triangle, -DEFAULT_SIZE/2.0, b], 
    ),
    // top 
    ...vertex(
      [center - b/2.0, -c*BASIC_2D_TRIANGLE_AMPL, b/2.0 + DEFAULT_SIZE/2.0 + elem_len_3d_triangle],
      [center, -c, b/2.0 + DEFAULT_SIZE/2.0],
      [center + b/2.0, -c*BASIC_2D_TRIANGLE_AMPL, b/2.0 + DEFAULT_SIZE/2.0 + elem_len_3d_triangle],
    ),
    ...quad(
      [center - b/2.0, -c*BASIC_2D_TRIANGLE_AMPL, b/2.0 + DEFAULT_SIZE/2.0 + elem_len_3d_triangle],
      [center + b/2.0, -c*BASIC_2D_TRIANGLE_AMPL, b/2.0 + DEFAULT_SIZE/2.0 + elem_len_3d_triangle],

      [center - b/2.0, 0, b/2.0 + DEFAULT_SIZE/2.0 + elem_len_3d_triangle + elem_len_3d_rect],
      [center + b/2.0, 0, b/2.0 + DEFAULT_SIZE/2.0 + elem_len_3d_triangle + elem_len_3d_rect],
    ),
    ...quad(
      [center - b/2.0, 0, b/2.0 + 3*DEFAULT_SIZE/2.0 + elem_len_3d_triangle + elem_len_3d_rect],
      [center + b/2.0, 0, b/2.0 + 3*DEFAULT_SIZE/2.0 + elem_len_3d_triangle + elem_len_3d_rect],
      [center - b/2.0, -DEFAULT_SIZE/2.0, b/2.0 + 5*DEFAULT_SIZE/2.0 + elem_len_3d_triangle + elem_len_3d_rect],
      [center + b/2.0, -DEFAULT_SIZE/2.0, b/2.0 + 5*DEFAULT_SIZE/2.0 + elem_len_3d_triangle + elem_len_3d_rect],
    ),
    // bottom
    ...vertex(
      [center - b/2.0, -c*BASIC_2D_TRIANGLE_AMPL, b/2.0 - DEFAULT_SIZE/2.0 - elem_len_3d_triangle],
      [center, -c, b/2.0 - DEFAULT_SIZE/2.0],
      [center + b/2.0, -c*BASIC_2D_TRIANGLE_AMPL, b/2.0 - DEFAULT_SIZE/2.0 - elem_len_3d_triangle],
    ),
    ...quad(
      [center - b/2.0, -c*BASIC_2D_TRIANGLE_AMPL, b/2.0 - DEFAULT_SIZE/2.0 - elem_len_3d_triangle],
      [center + b/2.0, -c*BASIC_2D_TRIANGLE_AMPL, b/2.0 - DEFAULT_SIZE/2.0 - elem_len_3d_triangle],

      [center - b/2.0, 0, b/2.0 - DEFAULT_SIZE/2.0 - elem_len_3d_triangle - elem_len_3d_rect],
      [center + b/2.0, 0, b/2.0 - DEFAULT_SIZE/2.0 - elem_len_3d_triangle - elem_len_3d_rect],
    ),
    ...quad(
      [center - b/2.0, 0, b/2.0 - 3*DEFAULT_SIZE/2.0 - elem_len_3d_triangle - elem_len_3d_rect],
      [center + b/2.0, 0, b/2.0 - 3*DEFAULT_SIZE/2.0 - elem_len_3d_triangle - elem_len_3d_rect],
      [center - b/2.0, -DEFAULT_SIZE/2.0, b/2.0 - 5*DEFAULT_SIZE/2.0 - elem_len_3d_triangle - elem_len_3d_rect],
      [center + b/2.0, -DEFAULT_SIZE/2.0, b/2.0 - 5*DEFAULT_SIZE/2.0 - elem_len_3d_triangle - elem_len_3d_rect],
    ),

  ]);
}
function generate_basic2d_flat(amplitude: number, width: number): number[] {
  const c = amplitude;
  const d = width;

  const b = (c2[4]*c - c2[1]*d) / (c2[0]*c2[4] - c2[1]*c2[3]);
  const a = (c - c2[0]*b - c2[2]) / c2[1];
  
  if (a < 0 || b < 0) {
    warning(true, WARNING_STRING);
  } else {
    warning(false);
  }
  // move vertices so that the selected mesh generation can start at 0,0 (2d plane)
  return move_verticies(0, 0, a+DEFAULT_SIZE/2.0 + DEFAULT_SIZE*2,[
    // left
    ...rect(DEFAULT_SIZE, b),
    ...rect(a, b, [DEFAULT_SIZE*2, 0]),
    ...vertex([DEFAULT_SIZE*2 + a, 0, 0], [DEFAULT_SIZE*2 + a + b/2.0, 0, b/2.0], [DEFAULT_SIZE*2 +a, 0, b]),
    //right
    ...vertex([DEFAULT_SIZE*3 + a + b, 0, 0], [DEFAULT_SIZE*2 + a + b/2.0 + DEFAULT_SIZE, 0, b/2.0], [DEFAULT_SIZE*3 + a + b, 0, b]),
    ...rect(a, b, [DEFAULT_SIZE*3 + a+ b, 0]),
    ...rect(DEFAULT_SIZE, b, [DEFAULT_SIZE*4 + 2*a + b, 0]),
    // top,
    ...vertex([DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0, 0, b + DEFAULT_SIZE/2.0],
      [DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0 + b, 0, b + DEFAULT_SIZE/2.0], 
      [DEFAULT_SIZE*2 + a + b/2.0 + DEFAULT_SIZE/2.0, 0, b/2.0 + DEFAULT_SIZE/2.0] 
    ),
    ...rect(b, a, [DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0, b + DEFAULT_SIZE/2.0]),
    ...rect(b, DEFAULT_SIZE, [DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0, b + DEFAULT_SIZE/2.0 + a + DEFAULT_SIZE]),
    // down
    ...vertex([DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0, 0, -DEFAULT_SIZE/2.0],
      [DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0 + b, 0, -DEFAULT_SIZE/2.0], 
      [DEFAULT_SIZE*2 + a + b/2.0 + DEFAULT_SIZE/2.0, 0, b/2.0 - DEFAULT_SIZE/2.0] 
    ),
    ...rect(b, a, [DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0, -a -DEFAULT_SIZE/2.0]),
    ...rect(b, DEFAULT_SIZE, [DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0, -DEFAULT_SIZE/2.0 - a - DEFAULT_SIZE*2]),
  ])
}


function move_verticies(x:number, y:number, z:number, vertices: number[]): number[] {
  // x
  for (var i = 0; i < vertices.length; i+=3) {
    vertices[i] += x;
  }

  // y
  for (var i = 1; i < vertices.length; i+=3) {
    vertices[i] += y;
  }

  // z
  for (var i = 2; i < vertices.length; i+=3) {
    vertices[i] += z;
  }
  return vertices;
}

function vertex(x1: number[], x2: number[], x3: number[]): number[] {
  return [
    x1[0], x1[1], x1[2],
    x2[0], x2[1], x2[2],
    x3[0], x3[1], x3[2]
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

function quad(x1: number[], x2: number[], x3: number[], x4: number[]): number[] {
  return [
    x1[0], x1[1], x1[2],
    x2[0], x2[1], x2[2],
    x3[0], x3[1], x3[2],

    x2[0], x2[1], x2[2],
    x3[0], x3[1], x3[2],
    x4[0], x4[1], x4[2],
  ]
}

function generate_selected_rect(width: number, height: number): number[] {
  return [ 
    ...rect(width - 1.0, .5, [.5, 0]),
    ...rect(width - 1.0, .5, [.5, height - .5]),
    ...rect(.5, height),
    ...rect(.5, height, [width - .5, 0])
  ];
}

function generate_selected_rect_mesh(width: number, height: number): Three.Mesh {
  const vertices = generate_selected_rect(width, height);
  const verticesFloat32Array = new Float32Array(vertices);

  // Create the BufferGeometry
  const geometry = new Three.BufferGeometry();

  // Set the custom vertex attribute 'position'
  const positionAttribute = new Three.BufferAttribute(verticesFloat32Array, 3);
  geometry.setAttribute('position', positionAttribute);

  const material = new Three.LineBasicMaterial( { 
    side: Three.DoubleSide ,color: SELECTED_COLOR,
    opacity: 0.7,    
    transparent: true
  });
  const mesh = new Three.Mesh( geometry, material );
  mesh.userData = ++id;
  mesh.rotateX(-Math.PI )
  return mesh;
}

function generate_object(vertices: number[], color: Three.Color): Three.Mesh {
  const verticesFloat32Array = new Float32Array(vertices);

  // Create the BufferGeometry
  const geometry = new Three.BufferGeometry();

  // Set the custom vertex attribute 'position'
  const positionAttribute = new Three.BufferAttribute(verticesFloat32Array, 3);
  geometry.setAttribute('position', positionAttribute);

  const material = new Three.MeshBasicMaterial( { transparent: true, opacity: 0.9, side: Three.DoubleSide ,color: color} );
  const mesh = new Three.Mesh( geometry, material );
  mesh.userData = ++id;
  mesh.rotateX(-Math.PI)
  return mesh;
}

const DEFAULT_ELASTIC_D = 20; // mm
const DEFAULT_ELASTIC_X = 20; // mm
const DEFAULT_SCALE = 1;
const COLOR_MESH = new Three.Color(0.23, 0.23, 0.23);
const COLOR_FLAT_MESH = new Three.Color(0.75, 0.75, 0.75);

export class Cell {
  type: string;
  vertices_flat: number[];
  vertices: number[];
  mesh: Three.Mesh;
  mesh_flat: Three.Mesh;
  position: Three.Vector3;
  scale: number; // width
  elastic: boolean;
  elastic_d: number;
  elastic_x: number;
  amplitude: number;
  width: number;
  selected_mesh: Three.Mesh;

  constructor(type: string, vertices_flat: number[], vertices: number[], position: Three.Vector3, amplitude: number, width: number) {
    this.type = type;
    this.vertices = vertices;
    this.vertices_flat = vertices_flat;
    this.position = position;
    this.width = width;
    this.amplitude = amplitude;

    this.elastic = false;
    this.scale = DEFAULT_SCALE;
    this.elastic_d = DEFAULT_ELASTIC_D;
    this.elastic_x = DEFAULT_ELASTIC_X;

    this.mesh = generate_object(vertices, COLOR_MESH);
    this.mesh_flat = generate_object(vertices_flat, COLOR_FLAT_MESH);
    this.selected_mesh = generate_selected_rect_mesh(this.get_width() + 2 , this.get_height() + 2);
  }

  get_width() {
    var max = 0.0;
    for (let i = 0; i < this.vertices_flat.length; i += 3) {
      max = Math.max(max, this.vertices_flat[i]);
    }
    return max;
  }

  get_height() {
    var max = 0.0;
    for (let i = 2; i < this.vertices_flat.length; i += 3) {
      max = Math.max(max, this.vertices_flat[i]);
    }
    return max;
  }

  

  regenerate(amplitude: number, width: number) {
    this.amplitude = amplitude;
    this.width = width;
    var vertices_flat = [];
    var vertices = []; 
    
    switch (this.type) {
      case "basic1d":
        vertices_flat = generate_basic1d_flat(amplitude, width);
        vertices = generate_basic1d(amplitude, width); 
        break;
      case "basic2d":
        vertices_flat = generate_basic2d_flat(amplitude, width);
        vertices = generate_basic2d(amplitude, width);
        break;

      default:
        break;
    }

    this.vertices_flat = vertices_flat;
    this.vertices = vertices;
    
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
    this.amplitude = amplitude;
    this.width = width;

    this.selected_mesh.geometry.dispose();

    const verticesFloat32Array3 = new Float32Array(generate_selected_rect(this.get_width() + 2, this.get_height() + 2));
    // Create the BufferGeometry
    const geometry3 = new Three.BufferGeometry();

    // Set the custom vertex attribute 'position'
    const positionAttribute3 = new Three.BufferAttribute(verticesFloat32Array3, 3);
    geometry3.setAttribute('position', positionAttribute3);
    this.selected_mesh.geometry = geometry3;
  }
}
