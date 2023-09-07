import * as Three from 'three';
import {warning} from './main.ts';
import { CollisionBox } from './collision.ts';
  
const WARNING_STRING = "Combination of amplitude and width lead to negative Dimensions. Try changing the sliders.";
const SELECTED_COLOR = 0xFF0000;
const SELECTED_COLOR_OK = 0x00FF00;
var id = 0;
// if elastic_val == -1 not elastic otherwise is.
export function create_basic1d(amplitude: number, width: number, cells: Cell[]): Cell {
  const vertices = generate_basic1d(amplitude, width);
  const vertices_flat = generate_basic1d_flat(amplitude, width);
  
  return new Cell("basic1d", vertices_flat, vertices, new Three.Vector3(0, 0, 0), amplitude, width, cells);
}

export function create_right1d(amplitude: number, width: number, cells: Cell[]): Cell {
  const vertices = generate_right1d(amplitude, width);
  const vertices_flat = generate_right1d_flat(amplitude, width);
  
  return new Cell("right1d", vertices_flat, vertices, new Three.Vector3(0, 0, 0), amplitude, width, cells);
}

export function create_full1d(amplitude: number, width: number, cells: Cell[]): Cell {
  const vertices = generate_full1d(amplitude, width);
  const vertices_flat = generate_full1d_flat(amplitude, width);
  
  return new Cell("full1d", vertices_flat, vertices, new Three.Vector3(0, 0, 0), amplitude, width, cells);
}

export function create_slope701d(amplitude: number, width: number, cells: Cell[]): Cell {
  const vertices = generate_slope71d(amplitude, width);
  const vertices_flat = generate_slope71d_flat(amplitude, width);
  
  return new Cell("slope71d", vertices_flat, vertices, new Three.Vector3(0, 0, 0), amplitude, width, cells);
}

export function create_slope1d(amplitude: number, width: number, cells: Cell[]): Cell {
  const vertices = generate_slope1d(amplitude, width);
  const vertices_flat = generate_slope1d_flat(amplitude, width);
  
  return new Cell("slope1d", vertices_flat, vertices, new Three.Vector3(0, 0, 0), amplitude, width, cells);
}

export function create_angle1d(amplitude: number, width: number, cells: Cell[]): Cell {
  const vertices = generate_angle1d(amplitude, width);
  const vertices_flat = generate_angle1d_flat(amplitude, width);
  
  return new Cell("angle1d", vertices_flat, vertices, new Three.Vector3(0, 0, 0), amplitude, width, cells);
}

export function will_1d_break(amplitude: number, width: number): boolean {
  const f = formula(amplitude, width, c1);

  const b = f[1];
  const a = f[0];
  return a <= 0.0 || b <= 0.0;
}
export function will_2d_break(amplitude: number, width: number): boolean {
  const f = formula(amplitude, width, c2);

  const b = f[1];
  const a = f[0];
  return a <= 0.0 || b <= 0.0;
}
  
export function create_basic2d(amplitude: number, width: number, cells: Cell[]): Cell {
  const vertices = generate_basic2d(amplitude, width);
  const vertices_flat = generate_basic2d_flat(amplitude, width);
  
  return new Cell("basic2d", vertices_flat, vertices, new Three.Vector3(0, 0, 0), amplitude, width, cells);
}

export function create_right2d(amplitude: number, width: number, cells: Cell[]): Cell {
  const vertices = generate_right2d(amplitude, width);
  const vertices_flat = generate_basic2d_flat(amplitude, width);
  
  return new Cell("right2d", vertices_flat, vertices, new Three.Vector3(0, 0, 0), amplitude, width, cells);
}

export function create_full2d(amplitude: number, width: number, cells: Cell[]): Cell {
  const vertices = generate_full2d(amplitude, width);
  const vertices_flat = generate_full2d_flat(amplitude, width);
  
  return new Cell("full2d", vertices_flat, vertices, new Three.Vector3(0, 0, 0), amplitude, width, cells);
}

export function create_slope702d(amplitude: number, width: number, cells: Cell[]): Cell {
  const vertices = generate_slope72d(amplitude, width);
  const vertices_flat = generate_slope72d_flat(amplitude, width);
  
  return new Cell("slope72d", vertices_flat, vertices, new Three.Vector3(0, 0, 0), amplitude, width, cells);
}

export function create_slope2d(amplitude: number, width: number, cells: Cell[]): Cell {
  const vertices = generate_slope2d(amplitude, width);
  const vertices_flat = generate_slope2d_flat(amplitude, width);
  
  return new Cell("slope2d", vertices_flat, vertices, new Three.Vector3(0, 0, 0), amplitude, width, cells);
}


export function create_angle2d(amplitude: number, width: number, cells: Cell[]): Cell {
  const vertices = generate_angle2d(amplitude, width);
  const vertices_flat = generate_slope2d_flat(amplitude, width);
  
  return new Cell("angle2d", vertices_flat, vertices, new Three.Vector3(0, 0, 0), amplitude, width, cells);
}

export function formula(amplitude: number, width: number, c: number[]): number[] {
  const cc = amplitude;
  const d = width;

  const b = (-cc*c[4] + c[2]*c[4] + d*c[1] - c[5]*c[1]) / (-c[0]*c[4] + c[3]*c[1]);
  const a = (d - c[0] * b - c[5]) / c[4];
  return [a, b];
}

function generate_basic2d_chained_flat(amplitude: number, width: number, data: string[]): number[] {
  const f = formula(amplitude, width, c2);
  
  const c = amplitude;
  const d = width;
  const b = f[1];
  const a = f[0];
  
  var xOffset = 0;
  // move for angle1d
  var yMove = 0;
  // t1 small, t2 big ones merge.
  var v = [];
  for (let i = 0; i < data.length; i++) {
    if (data[i] == "t8") {
    v.push(...move_verticies(0, 0, a+DEFAULT_SIZE/2.0 + DEFAULT_SIZE*2, [
      // left
      ...rect(DEFAULT_SIZE, b, [xOffset, 0 ]),
      ...rect(a, b, [xOffset + DEFAULT_SIZE*2, 0]),
      ...vertex([xOffset + DEFAULT_SIZE*2 + a, 0, 0], [xOffset + DEFAULT_SIZE*2 + a + b/2.0, 0, b/2.0], [xOffset + DEFAULT_SIZE*2 +a, 0, b]),
      //right
      ...vertex([xOffset + DEFAULT_SIZE*3 + a + b, 0, 0], [xOffset + DEFAULT_SIZE*2 + a + b/2.0 + DEFAULT_SIZE, 0, b/2.0], [xOffset + DEFAULT_SIZE*3 + a + b, 0, b]),
      ...rect(a, b, [xOffset + DEFAULT_SIZE*3 + a+ b, 0]),
      // ...rect(DEFAULT_SIZE, b, [xOffset + DEFAULT_SIZE*4 + 2*a + b, 0]),
      // top,
      ...vertex([xOffset + DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0, 0, b + DEFAULT_SIZE/2.0],
        [xOffset + DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0 + b, 0, b + DEFAULT_SIZE/2.0], 
        [xOffset + DEFAULT_SIZE*2 + a + b/2.0 + DEFAULT_SIZE/2.0, 0, b/2.0 + DEFAULT_SIZE/2.0] 
      ),
      ...rect(b, a, [xOffset + DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0, b + DEFAULT_SIZE/2.0]),
      ...rect(b, DEFAULT_SIZE, [xOffset + DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0, b + DEFAULT_SIZE/2.0 + a + DEFAULT_SIZE]),
      // down
      ...vertex([xOffset + DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0, 0, -DEFAULT_SIZE/2.0],
        [xOffset + DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0 + b, 0, -DEFAULT_SIZE/2.0], 
        [xOffset + DEFAULT_SIZE*2 + a + b/2.0 + DEFAULT_SIZE/2.0, 0, b/2.0 - DEFAULT_SIZE/2.0] 
      ),
      ...rect(b, a, [xOffset + DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0, -a -DEFAULT_SIZE/2.0]),
      ...rect(b, DEFAULT_SIZE, [xOffset + DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0, -DEFAULT_SIZE/2.0 - a - DEFAULT_SIZE*2]),
      ]));
      xOffset += DEFAULT_SIZE*4 + 2*a + b; 
    } else if (data[i] == "t9") {
      v.push(...move_verticies(0, 0, a+DEFAULT_SIZE/2.0 + DEFAULT_SIZE*2,[
        ...vertex([xOffset - DEFAULT_SIZE + b/2.0, 0, b/2.0], [xOffset - DEFAULT_SIZE, 0, 0], [xOffset - DEFAULT_SIZE, 0, b]),
        ...vertex([xOffset + b/2.0, 0, b/2.0], [xOffset + b, 0, 0], [xOffset + b, 0, b]),
        ...rect(a, b, [xOffset + b, 0]),
        ...vertex([xOffset + b/2 - DEFAULT_SIZE/2.0, 0, b/2 + DEFAULT_SIZE/2], [xOffset - DEFAULT_SIZE/2.0, 0, b + DEFAULT_SIZE/2], [xOffset + b - DEFAULT_SIZE/2.0, 0, b + DEFAULT_SIZE/2]),
        ...rect(b, a, [xOffset  - DEFAULT_SIZE/2, b + DEFAULT_SIZE/2]),
        ...rect(b, DEFAULT_SIZE, [xOffset - DEFAULT_SIZE/2, b + DEFAULT_SIZE*1.5 + a]),
        ...vertex([xOffset + b/2 - DEFAULT_SIZE/2, 0, b/2 - DEFAULT_SIZE/2], [xOffset - DEFAULT_SIZE/2, 0, -DEFAULT_SIZE/2], [xOffset + b - DEFAULT_SIZE/2.0, 0, -DEFAULT_SIZE/2]),
        ...rect(b, a, [xOffset - DEFAULT_SIZE/2, -DEFAULT_SIZE/2 - a]),
        ...rect(b, DEFAULT_SIZE, [xOffset - DEFAULT_SIZE/2, - DEFAULT_SIZE*2.5 - a]),
      ]));
      xOffset += b + a + DEFAULT_SIZE; 
    }
  }
  v.push(
    ...rect(DEFAULT_SIZE, b, [xOffset, a + DEFAULT_SIZE*2.5]),
  );
  return move_verticies(0, 0, -yMove, v);
}


function generate_basic2d_chained(amplitude: number, width: number, data: string[]): number[] {

  const c = amplitude;
  const d = width;

  const f = formula(amplitude, width, c2);

  const b = f[1];
  const a = f[0];
  
  var xOffset = 0;
  var flatOffset = 0;

  var vertices = [];

  for (let i = 0; i < data.length; i++) {
    if (data[i] == "t8") { 

      const center = xOffset + DEFAULT_SIZE*2.5 + a + b/2;
      const elem_len = a + b/2.0;
      const elem_len_3d_triangle = (b/2.0)/elem_len * d/2.0;
      const elem_len_3d_rect = a/elem_len * d/2.0;

      vertices.push(...move_verticies(0, 0, a+DEFAULT_SIZE/2.0 + DEFAULT_SIZE*2,[
        // left
        ...quad(
          [center - 3*DEFAULT_SIZE/2.0 - elem_len_3d_rect - elem_len_3d_triangle, 0, 0], 
          [center - 3*DEFAULT_SIZE/2.0 - elem_len_3d_rect - elem_len_3d_triangle, 0, b], 
          [center - 5*DEFAULT_SIZE/2.0 - elem_len_3d_rect - elem_len_3d_triangle, 0, 0], 
          [center - 5*DEFAULT_SIZE/2.0 - elem_len_3d_rect - elem_len_3d_triangle, 0, b], 
        ),
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
        // ...quad(
        //   [center + 3*DEFAULT_SIZE/2.0 + elem_len_3d_rect + elem_len_3d_triangle, 0, 0], 
        //   [center + 3*DEFAULT_SIZE/2.0 + elem_len_3d_rect + elem_len_3d_triangle, 0, b], 
        //   [center + 5*DEFAULT_SIZE/2.0 + elem_len_3d_rect + elem_len_3d_triangle, -DEFAULT_SIZE/2.0, 0], 
        //   [center + 5*DEFAULT_SIZE/2.0 + elem_len_3d_rect + elem_len_3d_triangle, -DEFAULT_SIZE/2.0, b], 
        // ),
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

      ]));
      xOffset += d + DEFAULT_SIZE*4;
      flatOffset += DEFAULT_SIZE*4 + 2*a + b;
    } else if (data[i] == "t9") {
      const start = xOffset + a + b/2 - d/2.0 - DEFAULT_SIZE;

      vertices.push(...move_verticies(0, 0, a+DEFAULT_SIZE/2.0 + DEFAULT_SIZE*2,[
        ...vertex([start, 0, 0], [start, 0, b], [start + b/2, 0, b/2]),
        ...vertex([start + b + DEFAULT_SIZE/2, 0, 0], [start + b + DEFAULT_SIZE/2, 0, b], [start + b/2 + DEFAULT_SIZE/2, 0, b/2]),
        ...rect(a, b, [start + b + DEFAULT_SIZE/2, 0]),
        ...vertex([start + b/2 + DEFAULT_SIZE/4, 0, b/2 + DEFAULT_SIZE/2], [start + DEFAULT_SIZE/4, 0, b + DEFAULT_SIZE/2], [start + b + DEFAULT_SIZE/4.0, 0, b + DEFAULT_SIZE/2]),
        ...vertex([start + b/2 + DEFAULT_SIZE/4, 0,  b/2 - DEFAULT_SIZE/2], [start + DEFAULT_SIZE/4, 0, -DEFAULT_SIZE/2], [start + b + DEFAULT_SIZE/4.0, 0,  -DEFAULT_SIZE/2 ]),
        ...rect(b, a, [start +  DEFAULT_SIZE/4, b + DEFAULT_SIZE/2]),
        ...rect(b, DEFAULT_SIZE, [start +  DEFAULT_SIZE/4, b + a + DEFAULT_SIZE*1.5]),
        ...rect(b, a, [start +  DEFAULT_SIZE/4, -a  - DEFAULT_SIZE/2]),
        ...rect(b, DEFAULT_SIZE, [start +  DEFAULT_SIZE/4, -a - DEFAULT_SIZE*2.5]),
      ]));
      xOffset += b + a + DEFAULT_SIZE/2;
      flatOffset += DEFAULT_SIZE + a + b;
    }
  }

  xOffset +=  a + b/2 - d/2.0;
  vertices.push(...move_verticies(0, 0, a + DEFAULT_SIZE*2.5, quad(
      [xOffset, 0, 0], 
      [xOffset, 0, b], 
      [xOffset + DEFAULT_SIZE, -DEFAULT_SIZE/2.0, 0], 
      [xOffset + DEFAULT_SIZE, -DEFAULT_SIZE/2.0, b], 
  )));

  vertices[7] = -DEFAULT_SIZE/2.0;
  vertices[13] = -DEFAULT_SIZE/2.0;
  vertices[16] = -DEFAULT_SIZE/2.0;
  //vertices[16] = -DEFAULT_SIZE/2.0;
  const wi = vertices_width(vertices);
  const w_flat = flatOffset;
  
  if (data[0] == "t8" && data[1] == "t9" && data.length == 2) {
    const v = move_verticies((w_flat - wi) / 2.0, 0, 0, vertices);

    const f = formula(amplitude, width, c1);

    const b = f[1];
    
    // Add the 2DEFAULT_SIZE important for scale of left and right most rects 
    // 2*Math.max(...)
    const min = vertices_min_x(v);
    
    const vw = vertices_width(v) - min;
    const vh = vertices_height(v);

    const h = DEFAULT_SIZE*4; 
    const w = DEFAULT_SIZE*4;
  
    const x = w/2;
    const y = h/2

    v.push(
      ...rect(vw + w, DEFAULT_SIZE, [-x + min, - y]),
      ...rect(vw + w, DEFAULT_SIZE, [-x + min, vh + y]),
      ...rect(DEFAULT_SIZE, vh + h - DEFAULT_SIZE, [-x + min, -y + DEFAULT_SIZE]),
      ...rect(DEFAULT_SIZE, vh + h - DEFAULT_SIZE, [vw + x - DEFAULT_SIZE + min, -y + DEFAULT_SIZE])
    );
    return  v;
  } else {
    return move_verticies((w_flat - wi) / 2.0, 0, 0, vertices);
  }
}

function generate_basic1d_chained_flat(amplitude: number, width: number, data: string[]): number[] {
  const f = formula(amplitude, width, c1);

  const b = f[1];
  const a = f[0];
  
  var xOffset = 0;
  // move for angle1d
  var yMove = 0;
  // t1 small, t2 big ones merge.
  var v = [
  ];
  for (let i = 0; i < data.length; i++) {
    if (data[i] == "t1") {
      v.push(
      ...rect(DEFAULT_SIZE, b, [xOffset, 0]),
      ...rect(a, b, [xOffset + DEFAULT_SIZE*2, 0]),
      ...rect(a, b, [xOffset + a + DEFAULT_SIZE*3, 0]),
      );
      xOffset += 2*a + 4*DEFAULT_SIZE;
    } else if (data[i] == "t2") {
      v.push(
        ...rect(a, b, [xOffset, 0]),
      );
      xOffset += a + DEFAULT_SIZE;
    } else if (data[i] == "t3") {
      v.push(
      ...rect(DEFAULT_SIZE, b, [xOffset, 0]),
      ...rect(a*.6, b, [xOffset + DEFAULT_SIZE*2, 0]),
      ...rect(a*1.4, b, [xOffset + a*.6 + DEFAULT_SIZE*3, 0]),
      );
      xOffset += 2*a + 4*DEFAULT_SIZE;
    } else if (data[i] == "t4") {
      v.push(
      ...rect(DEFAULT_SIZE, b, [xOffset, 0]),
      ...rect(a*2 + DEFAULT_SIZE, b, [xOffset + DEFAULT_SIZE*2, 0]),
      );
      xOffset += 2*a + 4*DEFAULT_SIZE;
    } else if (data[i] == "t5") {
      v.push(
        ...rect(DEFAULT_SIZE, b, [xOffset, 0]),
        ...quad(
          [xOffset + DEFAULT_SIZE*2 + a, 0, b*.15], 
          [xOffset + DEFAULT_SIZE*2 + a, 0, b*.85], 
          [xOffset + DEFAULT_SIZE*2, 0, 0], 
          [xOffset + DEFAULT_SIZE*2, 0, b]
        ),
        ...quad(
          [xOffset + DEFAULT_SIZE*3 + 2*a, 0, 0], 
          [xOffset + DEFAULT_SIZE*3 + 2*a, 0, b], 
          [xOffset + DEFAULT_SIZE*3 + a, 0, b*.15], 
          [xOffset + DEFAULT_SIZE*3 + a, 0, b*.85]
        ),
      );
      xOffset += 2*a + 4*DEFAULT_SIZE;
    } else if (data[i] == "t6") {
      v.push(
        ...rect(DEFAULT_SIZE, b, [xOffset, 0]),
        ...quad(
          [xOffset + DEFAULT_SIZE*2 + a, 0, b/2], 
          [xOffset + DEFAULT_SIZE*2 + a, 0, b/2], 
          [xOffset + DEFAULT_SIZE*2, 0, 0], 
          [xOffset + DEFAULT_SIZE*2, 0, b]
        ),
        ...quad(
          [xOffset + DEFAULT_SIZE*3 + 2*a, 0, 0], 
          [xOffset + DEFAULT_SIZE*3 + 2*a, 0, b], 
          [xOffset + DEFAULT_SIZE*3 + a, 0, b/2], 
          [xOffset + DEFAULT_SIZE*3 + a, 0, b/2]
        ),
      );
      xOffset += 2*a + 4*DEFAULT_SIZE;
    } else if (data[i] == "t7") {
      const yOffset = -(a * Math.sin(20 * (Math.PI / 180.0))) / Math.sin(70 * (Math.PI / 180.0));
      yMove = yOffset;
      v.push(
        ...rect(DEFAULT_SIZE, b, [xOffset, 0]),
        ...quad(
          [xOffset + DEFAULT_SIZE*2, 0, 0], [xOffset + DEFAULT_SIZE*2, 0, b], [xOffset + DEFAULT_SIZE*2 + a, 0, yOffset], [xOffset + DEFAULT_SIZE*2 + a, 0, yOffset + b]
        ),
        ...quad(
          [xOffset + DEFAULT_SIZE*3 + a, 0, yOffset], [xOffset + DEFAULT_SIZE*3 + a, 0, yOffset + b], [xOffset + DEFAULT_SIZE*3 + 2*a, 0, 0], [xOffset + DEFAULT_SIZE*3 + 2*a, 0, b]
        ),
      );
      xOffset += 2*a + 4*DEFAULT_SIZE;
    }
  }
  v.push(
    ...rect(DEFAULT_SIZE, b, [xOffset, 0]),
  );
  return move_verticies(0, 0, -yMove, v);
}

function generate_basic1d_chained(amplitude: number, width: number, data: string[]): number[] {

  const c = amplitude;
  const d = width;

  const f = formula(amplitude, width, c1);

  const b = f[1];
  const a = f[0];
  
  var xOffset = 0;
  var flatOffset = 0;

  // move for angle1d
  var yMove = 0;

  var vertices = [];

  for (let i = 0; i < data.length; i++) {
    if (data[i] == "t1") { 
      vertices.push(
        ...rect(DEFAULT_SIZE, b, [xOffset, 0]),
        ...quad(
          [xOffset + DEFAULT_SIZE*2, 0, 0], [xOffset +  DEFAULT_SIZE*2 + d/2.0, -c, 0],
          [xOffset + DEFAULT_SIZE*2, 0, b], [xOffset + DEFAULT_SIZE*2 + d/2.0, -c, b],
        ),
        ...quad(
          [xOffset + DEFAULT_SIZE*2 + d/2.0,-c, 0], [xOffset +  DEFAULT_SIZE*2 + d, 0, 0], 
          [xOffset + DEFAULT_SIZE*2 + d/2.0, -c, b], [xOffset + DEFAULT_SIZE* 2 + d, 0, b], 
        ),
      );
      xOffset += DEFAULT_SIZE*3 + d;
      flatOffset += 2*a + 3*DEFAULT_SIZE;
    } else if (data[i] == "t2") {
      vertices.push(
        ...rect(a, b, [xOffset, 0])
      );
      xOffset += a + DEFAULT_SIZE;
      flatOffset += a;
    } else if (data[i] == "t3") {
      vertices.push(
        ...rect(DEFAULT_SIZE, b, [xOffset, 0]),
        ...quad(
          [xOffset + DEFAULT_SIZE*2, 0, 0], [xOffset +  DEFAULT_SIZE*2 + d/2.0 * .6, -c, 0],
          [xOffset + DEFAULT_SIZE*2, 0, b], [xOffset + DEFAULT_SIZE*2 + d/2.0 * .6, -c, b],
        ),
        ...quad(
          [xOffset + DEFAULT_SIZE*2 + d/2.0 * .6,-c, 0], [xOffset +  DEFAULT_SIZE*2 + d, 0, 0], 
          [xOffset + DEFAULT_SIZE*2 + d/2.0 * .6, -c, b], [xOffset + DEFAULT_SIZE* 2 + d, 0, b], 
        ),
      );
      xOffset += DEFAULT_SIZE*3 + d;
      flatOffset += 2*a + 3*DEFAULT_SIZE;
    } else if (data[i] == "t4") {
      vertices.push(
        ...rect(DEFAULT_SIZE, b, [xOffset, 0]),
        ...arc(xOffset + DEFAULT_SIZE*2 + d/2,d, c, b),
      );
      xOffset += DEFAULT_SIZE*3 + d;
      flatOffset += 2*a + 3*DEFAULT_SIZE;
    } else if (data[i] == "t5") {
      const center = xOffset + DEFAULT_SIZE*2 + d/2;
      vertices.push(
        ...rect(DEFAULT_SIZE, b, [xOffset, 0]),
        ...quad(
          [center - d/2.0, 0, 0], [center, -c, b*.15],
          [center - d/2.0, 0, b], [center, -c, b*.85],
        ),
        ...quad(
          [center, -c, b*.15], [center + d/2.0, 0, 0], 
          [center, -c, b*.85], [center + d/2.0, 0, b], 
        ),
      );
      xOffset += DEFAULT_SIZE*3 + d;
      flatOffset += 2*a + 3*DEFAULT_SIZE;
    } else if (data[i] == "t6") {
      const center = xOffset + DEFAULT_SIZE*2 + d/2;
      vertices.push(
        ...rect(DEFAULT_SIZE, b, [xOffset, 0]),
        ...vertex([center - d/2.0, 0, 0], [center - d/2.0, 0, b], [center, -c, b/2.0]),
        ...vertex([center + d/2.0, 0, 0], [center + d/2.0, 0, b], [center, -c, b/2.0]),
      );
      xOffset += DEFAULT_SIZE*3 + d;
      flatOffset += 2*a + 3*DEFAULT_SIZE;
    } else if (data[i] == "t7") {

      const yOffset = -(a * Math.sin(20 * (Math.PI / 180.0))) / Math.sin(70 * (Math.PI / 180.0));
      yMove = yOffset;

      const center = xOffset + DEFAULT_SIZE*2 + d/2;
      vertices.push(
        ...rect(DEFAULT_SIZE, b, [xOffset, 0]),
        ...quad(
          [center - d/2.0, 0, 0], [center, -c, yOffset],
          [center - d/2.0, 0, b], [center, -c, b + yOffset],
        ),
        ...quad(
          [center, -c, yOffset], [center + d/2.0, 0, 0], 
          [center, -c, yOffset + b], [center + d/2.0, 0, b], 
        ),
      );
      xOffset += DEFAULT_SIZE*3 + d;
      flatOffset += 2*a + 3*DEFAULT_SIZE;
    }
  }
  
  vertices.push(
    ...quad(
      [xOffset, 0, 0], 
      [xOffset, 0, b],
      [xOffset + DEFAULT_SIZE, -DEFAULT_SIZE/2.0, 0], 
      [xOffset + DEFAULT_SIZE, -DEFAULT_SIZE/2.0, b],
    ),
  );
  // Make first rect point upwards. With that we can add flat ones for the normal generation as they are flat between two cells.
  vertices[1] = -DEFAULT_SIZE/2.0;
  vertices[7] = -DEFAULT_SIZE/2.0;
  vertices[16] = -DEFAULT_SIZE/2.0;
  const wi = vertices_width(vertices);
  const w_flat = flatOffset;
  
  if (data[0] == "t1" && data[1] == "t2" && data.length == 2) {
    const v = move_verticies((w_flat - wi) / 2.0, 0, -yMove, vertices);

    const f = formula(amplitude, width, c1);

    const b = f[1];
    
    // Add the 2DEFAULT_SIZE important for scale of left and right most rects 
    // 2*Math.max(...)
    const h =  b + DEFAULT_SIZE*2;
    const w = width + 8 + DEFAULT_SIZE*2;
    
    const vw = vertices_width(v);
    const vh = vertices_height(v);
  
    const x = w/2;
    const y = h/2

    v.push(
      ...rect(vw + w, DEFAULT_SIZE, [-x, - y]),
      ...rect(vw + w, DEFAULT_SIZE, [-x, vh + y]),
      ...rect(DEFAULT_SIZE, vh + h - DEFAULT_SIZE, [-x, -y + DEFAULT_SIZE]),
      ...rect(DEFAULT_SIZE, vh + h - DEFAULT_SIZE, [vw + x - DEFAULT_SIZE, -y + DEFAULT_SIZE])
    );
    return  v;
  } else {
    return move_verticies((w_flat - wi) / 2.0, 0, -yMove, vertices);
  }
}

export const DEFAULT_SIZE = 2; // 2mm
// basic1d formuala params
export const c1 = [-0.050187499999999934, 0.6711875000000004, 1.1248749999999932,
              0.11856250000000003, 1.2491875000000001, 1.2176250000000017 ]

function generate_basic1d_flat(amplitude: number, width: number): number[] {
  
  const f = formula(amplitude, width, c1);

  const b = f[1];
  const a = f[0];

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
  ];

  return vertices;
}

function generate_basic1d(amplitude: number, width: number): number[] {
  const c = amplitude;
  const d = width;

  const f = formula(amplitude, width, c1);

  const b = f[1];
  const a = f[0];
  
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

function generate_right1d_flat(amplitude: number, width: number): number[] {

  const f = formula(amplitude, width, c1);

  const b = f[1];
  const a = f[0];

  return [
    ...rect(DEFAULT_SIZE, b),
    ...rect(a*.6, b, [DEFAULT_SIZE*2, 0]),
    ...rect(a*1.4, b, [DEFAULT_SIZE*3 + a*.6, 0]),
    ...rect(DEFAULT_SIZE, b, [DEFAULT_SIZE*4 + 2*a, 0]),
  ];
}


function generate_right1d(amplitude: number, width: number): number[] {
  const c = amplitude;
  const d = width;

  const f = formula(amplitude, width, c1);

  const b = f[1];
  const a = f[0];
  
  const center = DEFAULT_SIZE*2.5 + a*.6;
  const vertices = [
    ...quad(
      [center - DEFAULT_SIZE*2 - d/2.0*.6, -DEFAULT_SIZE/2.0, 0], 
      [center - DEFAULT_SIZE*2 - d/2.0*.6, -DEFAULT_SIZE/2.0, b],
      [center - DEFAULT_SIZE- d/2.0*.6, 0, 0], 
      [center - DEFAULT_SIZE- d/2.0*.6, 0, b],
    ),
    // ...rect(DEFAULT_SIZE, b, [center - DEFAULT_SIZE*2 - d/2.0, 0]),
    ...quad(
      [center - d/2.0*.6, 0, 0], [center, -c, 0],
      [center - d/2.0*.6, 0, b], [center, -c, b],
    ),
    ...quad(
      [center, -c, 0], [center + d/2.0*1.4, 0, 0], 
      [center, -c, b], [center + d/2.0*1.4, 0, b], 
    ),
    ...quad(
      [center + DEFAULT_SIZE*2 + d/2.0*1.4, -DEFAULT_SIZE/2.0, 0], 
      [center + DEFAULT_SIZE*2 + d/2.0*1.4, -DEFAULT_SIZE/2.0, b],
      [center + DEFAULT_SIZE + d/2.0*1.4, 0, 0], 
      [center + DEFAULT_SIZE + d/2.0*1.4, 0, b],
    ),
    //...rect(DEFAULT_SIZE, b, [center + DEFAULT_SIZE + d/2.0, 0])
  ]
  return vertices;
}


function generate_full1d_flat(amplitude: number, width: number): number[] {

  const f = formula(amplitude, width, c1);

  const b = f[1];
  const a = f[0];

  return [
    ...rect(DEFAULT_SIZE, b),
    ...rect(a*2 + DEFAULT_SIZE, b, [DEFAULT_SIZE*2, 0]),
    ...rect(DEFAULT_SIZE, b, [DEFAULT_SIZE*4 + 2*a, 0]),
  ];
}
// acutally 2*ARK_NUM segments are created
const ARK_NUM = 6;

function generate_full1d(amplitude: number, width: number): number[] {
  const c = amplitude;
  const d = width;

  const f = formula(amplitude, width, c1);

  const b = f[1];
  const a = f[0];
  
  const center = DEFAULT_SIZE*2.5 + a;


  const vertices = [
    ...quad(
      [center - DEFAULT_SIZE*2 - d/2.0, -DEFAULT_SIZE/2.0, 0], 
      [center - DEFAULT_SIZE*2 - d/2.0, -DEFAULT_SIZE/2.0, b],
      [center - DEFAULT_SIZE- d/2.0, 0, 0], 
      [center - DEFAULT_SIZE- d/2.0, 0, b],
    ),
    ...arc(center,d, c, b),
    ...quad(
      [center + DEFAULT_SIZE*2 + d/2.0, -DEFAULT_SIZE/2.0, 0], 
      [center + DEFAULT_SIZE*2 + d/2.0, -DEFAULT_SIZE/2.0, b],
      [center + DEFAULT_SIZE + d/2.0, 0, 0], 
      [center + DEFAULT_SIZE + d/2.0, 0, b],
    ),
  ]
  return vertices;
}


function generate_slope71d_flat(amplitude: number, width: number): number[] {
  
  const f = formula(amplitude, width, c1);

  const b = f[1];
  const a = f[0];

  if (a < 0 || b < 0) {
    warning(true, WARNING_STRING);
  } else {
    warning(false);
  }

  const vertices = [
    ...rect(DEFAULT_SIZE, b),
    ...quad(
      [DEFAULT_SIZE*2 + a, 0, b*.15], 
      [DEFAULT_SIZE*2 + a, 0, b*.85], 
      [DEFAULT_SIZE*2, 0, 0], 
      [DEFAULT_SIZE*2, 0, b]
    ),
    ...quad(
      [DEFAULT_SIZE*3 + 2*a, 0, 0], 
      [DEFAULT_SIZE*3 + 2*a, 0, b], 
      [DEFAULT_SIZE*3 + a, 0, b*.15], 
      [DEFAULT_SIZE*3 + a, 0, b*.85]
    ),
    ...rect(DEFAULT_SIZE, b, [DEFAULT_SIZE*4 + 2*a, 0])
  ];

  return vertices;
}

function generate_slope71d(amplitude: number, width: number): number[] {
  const c = amplitude;
  const d = width;

  const f = formula(amplitude, width, c1);

  const b = f[1];
  const a = f[0];
  
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
      [center - d/2.0, 0, 0], [center, -c, b*.15],
      [center - d/2.0, 0, b], [center, -c, b*.85],
    ),
    ...quad(
      [center, -c, b*.15], [center + d/2.0, 0, 0], 
      [center, -c, b*.85], [center + d/2.0, 0, b], 
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

function generate_slope1d_flat(amplitude: number, width: number): number[] {
  
  const f = formula(amplitude, width, c1);

  const b = f[1];
  const a = f[0];

  if (a < 0 || b < 0) {
    warning(true, WARNING_STRING);
  } else {
    warning(false);
  }

  const vertices = [
    ...rect(DEFAULT_SIZE, b),
    ...vertex([DEFAULT_SIZE*2, 0, 0], [DEFAULT_SIZE*2, 0, b], [DEFAULT_SIZE*2 + a, 0, b/2.0]),
    ...vertex([DEFAULT_SIZE*3 + a, 0, b/2.0], [DEFAULT_SIZE*3 + 2*a, 0, 0], [DEFAULT_SIZE*3 + 2*a, 0, b]),
    ...rect(DEFAULT_SIZE, b, [DEFAULT_SIZE*4 + 2*a, 0])
  ];

  return vertices;
}

function generate_slope1d(amplitude: number, width: number): number[] {
  const c = amplitude;
  const d = width;

  const f = formula(amplitude, width, c1);

  const b = f[1];
  const a = f[0];
  
  const center = DEFAULT_SIZE*2.5 + a;

  const vertices = [
    ...quad(
      [center - DEFAULT_SIZE*2 - d/2.0, -DEFAULT_SIZE/2.0, 0], 
      [center - DEFAULT_SIZE*2 - d/2.0, -DEFAULT_SIZE/2.0, b],
      [center - DEFAULT_SIZE- d/2.0, 0, 0], 
      [center - DEFAULT_SIZE- d/2.0, 0, b],
    ),
    // ...rect(DEFAULT_SIZE, b, [center - DEFAULT_SIZE*2 - d/2.0, 0]),
    ...vertex([center - d/2.0, 0, 0], [center - d/2.0, 0, b], [center, -c, b/2.0]),
    ...vertex([center + d/2.0, 0, 0], [center + d/2.0, 0, b], [center, -c, b/2.0]),
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

function generate_angle1d_flat(amplitude: number, width: number): number[] {
  
  const f = formula(amplitude, width, c1);

  const b = f[1];
  const a = f[0];

  if (a < 0 || b < 0) {
    warning(true, WARNING_STRING);
  } else {
    warning(false);
  }
  
  const yOffset = -(a * Math.sin(20 * (Math.PI / 180.0))) / Math.sin(70 * (Math.PI / 180.0));

  const vertices = [
    ...rect(DEFAULT_SIZE, b),
    ...quad(
      [DEFAULT_SIZE*2, 0, 0], [DEFAULT_SIZE*2, 0, b], [DEFAULT_SIZE*2 + a, 0, yOffset], [DEFAULT_SIZE*2 + a, 0, yOffset + b]
    ),
    ...quad(
      [DEFAULT_SIZE*3 + a, 0, yOffset], [DEFAULT_SIZE*3 + a, 0, yOffset + b], [DEFAULT_SIZE*3 + 2*a, 0, 0], [DEFAULT_SIZE*3 + 2*a, 0, b]
    ),
    ...rect(DEFAULT_SIZE, b, [DEFAULT_SIZE*4 + 2*a, 0])
  ];

  return move_verticies(0, 0, -yOffset, vertices);
}

function generate_angle1d(amplitude: number, width: number): number[] {
  const c = amplitude;
  const d = width;

  const f = formula(amplitude, width, c1);

  const b = f[1];
  const a = f[0];
  
  const center = DEFAULT_SIZE*2.5 + a;
  const yOffset = -(a * Math.sin(20 * (Math.PI / 180.0))) / Math.sin(70 * (Math.PI / 180.0));

  const vertices = [
    ...quad(
      [center - DEFAULT_SIZE*2 - d/2.0, -DEFAULT_SIZE/2.0, 0], 
      [center - DEFAULT_SIZE*2 - d/2.0, -DEFAULT_SIZE/2.0, b],
      [center - DEFAULT_SIZE- d/2.0, 0, 0], 
      [center - DEFAULT_SIZE- d/2.0, 0, b],
    ),
    // ...rect(DEFAULT_SIZE, b, [center - DEFAULT_SIZE*2 - d/2.0, 0]),
    ...quad(
      [center - d/2.0, 0, 0], [center, -c, yOffset],
      [center - d/2.0, 0, b], [center, -c, b + yOffset],
    ),
    ...quad(
      [center, -c, yOffset], [center + d/2.0, 0, 0], 
      [center, -c, yOffset + b], [center + d/2.0, 0, b], 
    ),
    ...quad(
      [center + DEFAULT_SIZE*2 + d/2.0, -DEFAULT_SIZE/2.0, 0], 
      [center + DEFAULT_SIZE*2 + d/2.0, -DEFAULT_SIZE/2.0, b],
      [center + DEFAULT_SIZE + d/2.0, 0, 0], 
      [center + DEFAULT_SIZE + d/2.0, 0, b],
    ),
    //...rect(DEFAULT_SIZE, b, [center + DEFAULT_SIZE + d/2.0, 0])
  ]
  return move_verticies(0, 0, -yOffset, vertices);
}

export const c2 = [
  0.149,
  0.8932499999999999,
  0.9269999999999996, // perhaps wrong because -- in formuala whatsapp
  0.9789375,
  0.8803124999999999,
  6.489625
]
// Tells you the slope for the triangles in the middle in amplitude
const BASIC_2D_TRIANGLE_AMPL = 0.85;

function generate_basic2d(amplitude: number, width: number): number[] {
  const c = amplitude;
  const d = width;

  const f = formula(amplitude, width, c2);

  const b = f[1];
  const a = f[0];
  
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

  const f = formula(amplitude, width, c2);

  const b = f[1];
  const a = f[0];
  
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

function generate_right2d(amplitude: number, width: number): number[] {
  const c = amplitude;
  const d = width;

  const f = formula(amplitude, width, c2);

  const b = f[1];
  const a = f[0];
  
  const center = DEFAULT_SIZE*2.5 + a*.6 + b/2;

  if (a < 0 || b < 0) {
    warning(true, WARNING_STRING);
  } else {
    warning(false);
  }
  
  const elem_len = a + b/2.0;
  const elem_len_3d_triangle = (b/2.0)/elem_len * d/2.0;
  const elem_len_3d_rect = a/elem_len * d/2.0;

  const elem_len_short = a*.6 + b/2.0;
  const elem_len_3d_triangle_short = (b/2.0)/elem_len_short * d/2.0;
  const elem_len_3d_rect_short = (a*.6)/elem_len_short * d/2.0;

  return move_verticies(0, 0, a*1.4+DEFAULT_SIZE/2.0 + DEFAULT_SIZE*2,[
    // left
    ...vertex(
      [center - DEFAULT_SIZE/2.0 - elem_len_3d_triangle*.6, -c*BASIC_2D_TRIANGLE_AMPL , 0], 
      [center - DEFAULT_SIZE/2.0, -c, b/2.0], 
      [center - DEFAULT_SIZE/2.0 - elem_len_3d_triangle*.6, -c*BASIC_2D_TRIANGLE_AMPL , b ], 
    ),
    ...quad(
      [center - DEFAULT_SIZE/2.0 - elem_len_3d_triangle*.6, -c*BASIC_2D_TRIANGLE_AMPL , 0], 
      [center - DEFAULT_SIZE/2.0 - elem_len_3d_triangle*.6, -c*BASIC_2D_TRIANGLE_AMPL , b ], 
      [center - DEFAULT_SIZE/2.0 - elem_len_3d_rect*.6 - elem_len_3d_triangle*.6, 0, 0], 
      [center - DEFAULT_SIZE/2.0 - elem_len_3d_rect*.6 - elem_len_3d_triangle*.6, 0, b ], 
    ),
    ...quad(
      [center - 3*DEFAULT_SIZE/2.0 - elem_len_3d_rect*.6- elem_len_3d_triangle*.6, 0, 0], 
      [center - 3*DEFAULT_SIZE/2.0 - elem_len_3d_rect*.6- elem_len_3d_triangle*.6, 0, b], 
      [center - 5*DEFAULT_SIZE/2.0 - elem_len_3d_rect*.6- elem_len_3d_triangle*.6, -DEFAULT_SIZE/2.0, 0], 
      [center - 5*DEFAULT_SIZE/2.0 - elem_len_3d_rect*.6- elem_len_3d_triangle*.6, -DEFAULT_SIZE/2.0, b], 
    ),

    // right 
    ...vertex(
      [center + DEFAULT_SIZE/2.0 + elem_len_3d_triangle*1.4, -c*BASIC_2D_TRIANGLE_AMPL , 0], 
      [center + DEFAULT_SIZE/2.0, -c, b/2.0], 
      [center + DEFAULT_SIZE/2.0 + elem_len_3d_triangle*1.4, -c*BASIC_2D_TRIANGLE_AMPL , b], 
    ),
    ...quad(
      [center + DEFAULT_SIZE/2.0 + elem_len_3d_triangle*1.4, -c*BASIC_2D_TRIANGLE_AMPL , 0], 
      [center + DEFAULT_SIZE/2.0 + elem_len_3d_triangle*1.4, -c*BASIC_2D_TRIANGLE_AMPL , b], 
      [center + DEFAULT_SIZE/2.0 + elem_len_3d_rect*1.4 + elem_len_3d_triangle*1.4, 0, 0], 
      [center + DEFAULT_SIZE/2.0 + elem_len_3d_rect*1.4 + elem_len_3d_triangle*1.4, 0, b], 
    ),
    ...quad(
      [center + 3*DEFAULT_SIZE/2.0 + elem_len_3d_rect*1.4 + elem_len_3d_triangle*1.4, 0, 0], 
      [center + 3*DEFAULT_SIZE/2.0 + elem_len_3d_rect*1.4 + elem_len_3d_triangle*1.4, 0, b], 
      [center + 5*DEFAULT_SIZE/2.0 + elem_len_3d_rect*1.4 + elem_len_3d_triangle*1.4, -DEFAULT_SIZE/2.0, 0], 
      [center + 5*DEFAULT_SIZE/2.0 + elem_len_3d_rect*1.4 + elem_len_3d_triangle*1.4, -DEFAULT_SIZE/2.0, b], 
    ),
    // top 
    ...vertex(
      [center - b/2.0, -c*BASIC_2D_TRIANGLE_AMPL, b/2.0 + DEFAULT_SIZE/2.0 + elem_len_3d_triangle*.6],
      [center, -c, b/2.0 + DEFAULT_SIZE/2.0],
      [center + b/2.0, -c*BASIC_2D_TRIANGLE_AMPL, b/2.0 + DEFAULT_SIZE/2.0 + elem_len_3d_triangle*.6],
    ),
    ...quad(
      [center - b/2.0, -c*BASIC_2D_TRIANGLE_AMPL, b/2.0 + DEFAULT_SIZE/2.0 + elem_len_3d_triangle*.6],
      [center + b/2.0, -c*BASIC_2D_TRIANGLE_AMPL, b/2.0 + DEFAULT_SIZE/2.0 + elem_len_3d_triangle*.6],

      [center - b/2.0, 0, b/2.0 + DEFAULT_SIZE/2.0 + elem_len_3d_triangle*.6 + elem_len_3d_rect*.6],
      [center + b/2.0, 0, b/2.0 + DEFAULT_SIZE/2.0 + elem_len_3d_triangle*.6 + elem_len_3d_rect*.6],
    ),
    ...quad(
      [center - b/2.0, 0, b/2.0 + 3*DEFAULT_SIZE/2.0 + elem_len_3d_triangle*.6 + elem_len_3d_rect*.6],
      [center + b/2.0, 0, b/2.0 + 3*DEFAULT_SIZE/2.0 + elem_len_3d_triangle*.6 + elem_len_3d_rect*.6],
      [center - b/2.0, -DEFAULT_SIZE/2.0, b/2.0 + 5*DEFAULT_SIZE/2.0 + elem_len_3d_triangle*.6 + elem_len_3d_rect*.6],
      [center + b/2.0, -DEFAULT_SIZE/2.0, b/2.0 + 5*DEFAULT_SIZE/2.0 + elem_len_3d_triangle*.6 + elem_len_3d_rect*.6],
    ),
    // bottom
    ...vertex(
      [center - b/2.0, -c*BASIC_2D_TRIANGLE_AMPL, b/2.0 - DEFAULT_SIZE/2.0 - elem_len_3d_triangle*1.4],
      [center, -c, b/2.0 - DEFAULT_SIZE/2.0],
      [center + b/2.0, -c*BASIC_2D_TRIANGLE_AMPL, b/2.0 - DEFAULT_SIZE/2.0 - elem_len_3d_triangle*1.4],
    ),
    ...quad(
      [center - b/2.0, -c*BASIC_2D_TRIANGLE_AMPL, b/2.0 - DEFAULT_SIZE/2.0 - elem_len_3d_triangle*1.4],
      [center + b/2.0, -c*BASIC_2D_TRIANGLE_AMPL, b/2.0 - DEFAULT_SIZE/2.0 - elem_len_3d_triangle*1.4],

      [center - b/2.0, 0, b/2.0 - DEFAULT_SIZE/2.0 - elem_len_3d_triangle*1.4 - elem_len_3d_rect*1.4],
      [center + b/2.0, 0, b/2.0 - DEFAULT_SIZE/2.0 - elem_len_3d_triangle*1.4 - elem_len_3d_rect*1.4],
    ),
    ...quad(
      [center - b/2.0, 0, b/2.0 - 3*DEFAULT_SIZE/2.0 - elem_len_3d_triangle*1.4 - elem_len_3d_rect*1.4],
      [center + b/2.0, 0, b/2.0 - 3*DEFAULT_SIZE/2.0 - elem_len_3d_triangle*1.4 - elem_len_3d_rect*1.4],
      [center - b/2.0, -DEFAULT_SIZE/2.0, b/2.0 - 5*DEFAULT_SIZE/2.0 - elem_len_3d_triangle*1.4 - elem_len_3d_rect*1.4],
      [center + b/2.0, -DEFAULT_SIZE/2.0, b/2.0 - 5*DEFAULT_SIZE/2.0 - elem_len_3d_triangle*1.4 - elem_len_3d_rect*1.4],
    ),

  ]);
}
function generate_right2d_flat(amplitude: number, width: number): number[] {

  const f = formula(amplitude, width, c2);

  const b = f[1];
  const a = f[0];
  
  if (a < 0 || b < 0) {
    warning(true, WARNING_STRING);
  } else {
    warning(false);
  }
  // move vertices so that the selected mesh generation can start at 0,0 (2d plane)
  return move_verticies(0, 0, a*1.4 +DEFAULT_SIZE/2.0 + DEFAULT_SIZE*2,[
    // left
    ...rect(DEFAULT_SIZE, b),
    ...rect(a*.6, b, [DEFAULT_SIZE*2, 0]),
    ...vertex([DEFAULT_SIZE*2 + a*.6, 0, 0], [DEFAULT_SIZE*2 + a*.6+ b/2.0, 0, b/2.0], [DEFAULT_SIZE*2 +a*.6, 0, b]),
    //right
    ...vertex([DEFAULT_SIZE*3 + a*.6 + b, 0, 0], [DEFAULT_SIZE*2 + a*.6 + b/2.0 + DEFAULT_SIZE, 0, b/2.0], [DEFAULT_SIZE*3 + a*.6 + b, 0, b]),
    ...rect(a*1.4, b, [DEFAULT_SIZE*3 + a*.6+ b, 0]),
    ...rect(DEFAULT_SIZE, b, [DEFAULT_SIZE*4 + 2*a + b, 0]),
    // top,
    ...vertex([DEFAULT_SIZE*2 + a*.6 + DEFAULT_SIZE/2.0, 0, b + DEFAULT_SIZE/2.0],
      [DEFAULT_SIZE*2 + a*.6 + DEFAULT_SIZE/2.0 + b, 0, b + DEFAULT_SIZE/2.0], 
      [DEFAULT_SIZE*2 + a*.6 + b/2.0 + DEFAULT_SIZE/2.0, 0, b/2.0 + DEFAULT_SIZE/2.0] 
    ),
    ...rect(b, a*.6, [DEFAULT_SIZE*2 + a*.6 + DEFAULT_SIZE/2.0, b + DEFAULT_SIZE/2.0]),
    ...rect(b, DEFAULT_SIZE, [DEFAULT_SIZE*2 + a*.6 + DEFAULT_SIZE/2.0, b + DEFAULT_SIZE/2.0 + a*.6 + DEFAULT_SIZE]),
    // down
    ...vertex([DEFAULT_SIZE*2 + a*.6 + DEFAULT_SIZE/2.0, 0, -DEFAULT_SIZE/2.0],
      [DEFAULT_SIZE*2 + a*.6 + DEFAULT_SIZE/2.0 + b, 0, -DEFAULT_SIZE/2.0], 
      [DEFAULT_SIZE*2 + a*.6 + b/2.0 + DEFAULT_SIZE/2.0, 0, b/2.0 - DEFAULT_SIZE/2.0] 
    ),
    ...rect(b, a*1.4, [DEFAULT_SIZE*2 + a*.6 + DEFAULT_SIZE/2.0, -a*1.4 -DEFAULT_SIZE/2.0]),
    ...rect(b, DEFAULT_SIZE, [DEFAULT_SIZE*2 + a*.6 + DEFAULT_SIZE/2.0, -DEFAULT_SIZE/2.0 - a*1.4 - DEFAULT_SIZE*2]),
  ])
}

function generate_full2d(amplitude: number, width: number): number[] {
  const c = amplitude;
  const d = width;

  const f = formula(amplitude, width, c2);

  const b = f[1];
  const a = f[0];
  

  if (a < 0 || b < 0) {
    warning(true, WARNING_STRING);
  } else {
    warning(false);
  }
  const center = DEFAULT_SIZE*2.5 + a + b/2;
  const centerY = b/2.0
  
  return move_verticies(0, 0, a+DEFAULT_SIZE/2.0 + DEFAULT_SIZE*2,[
    // left
    ...quad(
      [center - b/2 - (d-b)/2 - DEFAULT_SIZE, 0, 0], 
      [center - b/2 - (d-b)/2 - DEFAULT_SIZE, 0, b], 
      [center - b/2 - (d-b)/2 - 2*DEFAULT_SIZE, -DEFAULT_SIZE/2.0, 0], 
      [center - b/2 - (d-b)/2 - 2*DEFAULT_SIZE, -DEFAULT_SIZE/2.0, b], 
    ),
    ...half_arc_x([center - b/2 - (d-b)/2, 0], [center - b/2, b], c),
    // right 
    ...quad(
      [center + b/2 + (d-b)/2 + DEFAULT_SIZE, 0, 0], 
      [center + b/2 + (d-b)/2 + DEFAULT_SIZE, 0, b], 
      [center + b/2 + (d-b)/2 + 2*DEFAULT_SIZE, -DEFAULT_SIZE/2.0, 0], 
      [center + b/2 + (d-b)/2 + 2*DEFAULT_SIZE, -DEFAULT_SIZE/2.0, b], 
    ),
    ...half_arc_x([center + b/2 + (d-b)/2, 0], [center + b/2, b], c),
    // top 
    ...quad(
      [center - b/2.0, 0, centerY + b/2 + (d-b)/2 + DEFAULT_SIZE],
      [center + b/2.0, 0, centerY + b/2 + (d-b)/2 + DEFAULT_SIZE],
      [center - b/2.0, -DEFAULT_SIZE/2.0, centerY + b/2 + (d-b)/2 + 2*DEFAULT_SIZE],
      [center + b/2.0, -DEFAULT_SIZE/2.0, centerY + b/2 + (d-b)/2 + 2*DEFAULT_SIZE],
    ),
    ...quad(
      [center - b/2, -c, centerY - b/2], 
      [center - b/2, -c, centerY + b/2], 
      [center + b/2, -c, centerY - b/2], 
      [center + b/2, -c, centerY + b/2], 
    ),
    ...half_arc_y([center - b/2.0, centerY - b/2 - (d-b)/2], [center + b/2.0, centerY - b/2], c),
    // bottom
    ...quad(
      [center - b/2.0, 0, centerY - b/2 - (d-b)/2 - DEFAULT_SIZE],
      [center + b/2.0, 0, centerY - b/2 - (d-b)/2 - DEFAULT_SIZE],
      [center - b/2.0, -DEFAULT_SIZE/2.0, centerY - b/2 - (d-b)/2 - 2*DEFAULT_SIZE],
      [center + b/2.0, -DEFAULT_SIZE/2.0, centerY - b/2 - (d-b)/2 - 2*DEFAULT_SIZE],
    ),
    ...half_arc_y([center - b/2.0, centerY + b/2 + (d-b)/2], [center + b/2.0, centerY + b/2], c),
  ]);
}
function generate_full2d_flat(amplitude: number, width: number): number[] {

  const f = formula(amplitude, width, c2);

  const b = f[1];
  const a = f[0];
  
  if (a < 0 || b < 0) {
    warning(true, WARNING_STRING);
  } else {
    warning(false);
  }
  // move vertices so that the selected mesh generation can start at 0,0 (2d plane)
  return move_verticies(0, 0, a+DEFAULT_SIZE/2.0 + DEFAULT_SIZE*2,[
    // left
    ...rect(DEFAULT_SIZE, b),
    ...rect(a + DEFAULT_SIZE/2.0, b, [DEFAULT_SIZE*2, 0]),
    //right
    ...rect(DEFAULT_SIZE, b, [DEFAULT_SIZE*4 + 2*a + b, 0]),
    ...rect(a + DEFAULT_SIZE/2.0, b, [DEFAULT_SIZE*2.5 + a + b, 0]),
    // top,
    ...rect(b, DEFAULT_SIZE, [DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0, b + DEFAULT_SIZE/2.0 + a + DEFAULT_SIZE]),
    // down
    ...rect(b, 2*a + b + DEFAULT_SIZE, [DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0, -a -DEFAULT_SIZE/2.0]),
    ...rect(b, DEFAULT_SIZE, [DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0, -DEFAULT_SIZE/2.0 - a - DEFAULT_SIZE*2]),
  ])
}


function generate_slope72d(amplitude: number, width: number): number[] {
  const c = amplitude;
  const d = width;

  const f = formula(amplitude, width, c2);

  const b = f[1];
  const a = f[0];
  
  const center = DEFAULT_SIZE*2.5 + a + b/2;

  if (a < 0 || b < 0) {
    warning(true, WARNING_STRING);
  } else {
    warning(false);
  }
  
  const elem_len = a + b/2.0;
  const elem_len_3d_triangle = (b/2.0 + a*.3)/elem_len * d/2.0;
  const elem_len_3d_rect = (a*.7)/elem_len * d/2.0;

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
function generate_slope72d_flat(amplitude: number, width: number): number[] {

  const f = formula(amplitude, width, c2);

  const b = f[1];
  const a = f[0];
  
  if (a < 0 || b < 0) {
    warning(true, WARNING_STRING);
  } else {
    warning(false);
  }
  // move vertices so that the selected mesh generation can start at 0,0 (2d plane)
  return move_verticies(0, 0, a+DEFAULT_SIZE/2.0 + DEFAULT_SIZE*2,[
    // left
    ...rect(DEFAULT_SIZE, b),
    ...rect(a*.7, b, [DEFAULT_SIZE*2, 0]),
    ...vertex([DEFAULT_SIZE*2 + a*.7, 0, 0], [DEFAULT_SIZE*2 + a + b/2.0, 0, b/2.0], [DEFAULT_SIZE*2 + a*.7, 0, b]),
    //right
    ...vertex([DEFAULT_SIZE*3 + a*1.3 + b, 0, 0], [DEFAULT_SIZE*2 + a + b/2.0 + DEFAULT_SIZE, 0, b/2.0], [DEFAULT_SIZE*3 + a*1.3 + b, 0, b]),
    ...rect(a*.7, b, [DEFAULT_SIZE*3 + a*1.3 + b, 0]),
    ...rect(DEFAULT_SIZE, b, [DEFAULT_SIZE*4 + 2*a + b, 0]),
    // top,
    ...vertex(
      [DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0, 0, a*.3 + b + DEFAULT_SIZE/2.0],
      [DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0 + b, 0, a*.3 + b + DEFAULT_SIZE/2.0], 
      [DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0 + b/2.0, 0, b/2.0 + DEFAULT_SIZE/2.0] 
    ),
    ...rect(b, a*.7, [DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0, a*.3 + b + DEFAULT_SIZE/2.0]),
    ...rect(b, DEFAULT_SIZE, [DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0, b + DEFAULT_SIZE/2.0 + a + DEFAULT_SIZE]),
    // down
    ...vertex(
      [DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0, 0, -a*.3 - DEFAULT_SIZE/2.0],
      [DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0 + b, 0, -a*.3 - DEFAULT_SIZE/2.0], 
      [DEFAULT_SIZE*2 + a + b/2.0 + DEFAULT_SIZE/2.0, 0, b/2.0 - DEFAULT_SIZE/2.0] 
    ),
    ...rect(b, a*.7, [DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0, -a -DEFAULT_SIZE/2.0]),
    ...rect(b, DEFAULT_SIZE, [DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0, -DEFAULT_SIZE/2.0 - a - DEFAULT_SIZE*2]),
  ])
}

function generate_slope2d(amplitude: number, width: number): number[] {
  const c = amplitude;
  const d = width;

  const f = formula(amplitude, width, c2);

  const b = f[1];
  const a = f[0];
  
  const center = DEFAULT_SIZE*2.5 + a + b/2;

  if (a < 0 || b < 0) {
    warning(true, WARNING_STRING);
  } else {
    warning(false);
  }
  
  const elem_len = a + b/2.0;
  const elem_len_3d_triangle = (b/2.0 + a*.3)/elem_len * d/2.0;
  const elem_len_3d_rect = (a*.7)/elem_len * d/2.0;

  return move_verticies(0, 0, a+DEFAULT_SIZE/2.0 + DEFAULT_SIZE*2,[
    // left
    ...vertex(
      [center - DEFAULT_SIZE/2.0 - elem_len_3d_triangle - elem_len_3d_rect, 0, 0], 
      [center - DEFAULT_SIZE/2.0, -c, b/2.0], 
      [center - DEFAULT_SIZE/2.0 - elem_len_3d_triangle - elem_len_3d_rect, 0, b], 
    ),
    ...quad(
      [center - 3*DEFAULT_SIZE/2.0 - elem_len_3d_rect - elem_len_3d_triangle, 0, 0], 
      [center - 3*DEFAULT_SIZE/2.0 - elem_len_3d_rect - elem_len_3d_triangle, 0, b], 
      [center - 5*DEFAULT_SIZE/2.0 - elem_len_3d_rect - elem_len_3d_triangle, -DEFAULT_SIZE/2.0, 0], 
      [center - 5*DEFAULT_SIZE/2.0 - elem_len_3d_rect - elem_len_3d_triangle, -DEFAULT_SIZE/2.0, b], 
    ),

    // right 
    ...vertex(
      [center + DEFAULT_SIZE/2.0 + elem_len_3d_triangle + elem_len_3d_rect, 0, 0], 
      [center + DEFAULT_SIZE/2.0, -c, b/2.0], 
      [center + DEFAULT_SIZE/2.0 + elem_len_3d_triangle + elem_len_3d_rect, 0, b], 
    ),
    ...quad(
      [center + 3*DEFAULT_SIZE/2.0 + elem_len_3d_rect + elem_len_3d_triangle, 0, 0], 
      [center + 3*DEFAULT_SIZE/2.0 + elem_len_3d_rect + elem_len_3d_triangle, 0, b], 
      [center + 5*DEFAULT_SIZE/2.0 + elem_len_3d_rect + elem_len_3d_triangle, -DEFAULT_SIZE/2.0, 0], 
      [center + 5*DEFAULT_SIZE/2.0 + elem_len_3d_rect + elem_len_3d_triangle, -DEFAULT_SIZE/2.0, b], 
    ),
    // top 
    ...vertex(
      [center - b/2.0, 0, b/2.0 + DEFAULT_SIZE/2.0 + elem_len_3d_triangle + elem_len_3d_rect],
      [center, -c, b/2.0 + DEFAULT_SIZE/2.0],
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
      [center - b/2.0, 0, b/2.0 - DEFAULT_SIZE/2.0 - elem_len_3d_triangle - elem_len_3d_rect],
      [center, -c, b/2.0 - DEFAULT_SIZE/2.0],
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

function generate_slope2d_flat(amplitude: number, width: number): number[] {

  const f = formula(amplitude, width, c2);

  const b = f[1];
  const a = f[0];
  
  if (a < 0 || b < 0) {
    warning(true, WARNING_STRING);
  } else {
    warning(false);
  }
  // move vertices so that the selected mesh generation can start at 0,0 (2d plane)
  return move_verticies(0, 0, a+DEFAULT_SIZE/2.0 + DEFAULT_SIZE*2,[
    // left
    ...rect(DEFAULT_SIZE, b),
    ...vertex([DEFAULT_SIZE*2, 0, 0], [DEFAULT_SIZE*2 + a + b/2.0, 0, b/2.0], [DEFAULT_SIZE*2, 0, b]),
    //right
    ...vertex([DEFAULT_SIZE*3 + a*2 + b, 0, 0], [DEFAULT_SIZE*2 + a + b/2.0 + DEFAULT_SIZE, 0, b/2.0], [DEFAULT_SIZE*3 + a*2 + b, 0, b]),
    ...rect(DEFAULT_SIZE, b, [DEFAULT_SIZE*4 + 2*a + b, 0]),
    // top,
    ...vertex(
      [DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0, 0, a + b + DEFAULT_SIZE/2.0],
      [DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0 + b, 0, a + b + DEFAULT_SIZE/2.0], 
      [DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0 + b/2.0, 0, b/2.0 + DEFAULT_SIZE/2.0] 
    ),
    ...rect(b, DEFAULT_SIZE, [DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0, b + DEFAULT_SIZE/2.0 + a + DEFAULT_SIZE]),
    // down
    ...vertex(
      [DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0, 0, -a - DEFAULT_SIZE/2.0],
      [DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0 + b, 0, -a - DEFAULT_SIZE/2.0], 
      [DEFAULT_SIZE*2 + a + b/2.0 + DEFAULT_SIZE/2.0, 0, b/2.0 - DEFAULT_SIZE/2.0] 
    ),
    ...rect(b, DEFAULT_SIZE, [DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0, -DEFAULT_SIZE/2.0 - a - DEFAULT_SIZE*2]),
  ])
}

function generate_angle2d(amplitude: number, width: number): number[] {
  const c = amplitude;
  const d = width;

  const f = formula(amplitude, width, c2);

  const b = f[1];
  const a = f[0];
  
  const center = DEFAULT_SIZE*2.5 + a + b/2;
  const xOffset = -(a * Math.sin(20 * (Math.PI / 180.0))) / Math.sin(70 * (Math.PI / 180.0));

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

      [center - b/2.0 + xOffset, 0, b/2.0 + DEFAULT_SIZE/2.0 + elem_len_3d_triangle + elem_len_3d_rect],
      [center + b/2.0 + xOffset, 0, b/2.0 + DEFAULT_SIZE/2.0 + elem_len_3d_triangle + elem_len_3d_rect],
    ),
    ...quad(
      [center - b/2.0 + xOffset, 0, b/2.0 + 3*DEFAULT_SIZE/2.0 + elem_len_3d_triangle + elem_len_3d_rect],
      [center + b/2.0 + xOffset, 0, b/2.0 + 3*DEFAULT_SIZE/2.0 + elem_len_3d_triangle + elem_len_3d_rect],
      [center - b/2.0 + xOffset, -DEFAULT_SIZE/2.0, b/2.0 + 5*DEFAULT_SIZE/2.0 + elem_len_3d_triangle + elem_len_3d_rect],
      [center + b/2.0 + xOffset, -DEFAULT_SIZE/2.0, b/2.0 + 5*DEFAULT_SIZE/2.0 + elem_len_3d_triangle + elem_len_3d_rect],
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

      [center - b/2.0 + xOffset, 0, b/2.0 - DEFAULT_SIZE/2.0 - elem_len_3d_triangle - elem_len_3d_rect],
      [center + b/2.0 + xOffset, 0, b/2.0 - DEFAULT_SIZE/2.0 - elem_len_3d_triangle - elem_len_3d_rect],
    ),
    ...quad(
      [center - b/2.0 + xOffset, 0, b/2.0 - 3*DEFAULT_SIZE/2.0 - elem_len_3d_triangle - elem_len_3d_rect],
      [center + b/2.0 + xOffset, 0, b/2.0 - 3*DEFAULT_SIZE/2.0 - elem_len_3d_triangle - elem_len_3d_rect],
      [center - b/2.0 + xOffset, -DEFAULT_SIZE/2.0, b/2.0 - 5*DEFAULT_SIZE/2.0 - elem_len_3d_triangle - elem_len_3d_rect],
      [center + b/2.0 + xOffset, -DEFAULT_SIZE/2.0, b/2.0 - 5*DEFAULT_SIZE/2.0 - elem_len_3d_triangle - elem_len_3d_rect],
    ),

  ]);
}

function generate_angle2d_flat(amplitude: number, width: number): number[] {

  const f = formula(amplitude, width, c2);

  const b = f[1];
  const a = f[0];
  
  if (a < 0 || b < 0) {
    warning(true, WARNING_STRING);
  } else {
    warning(false);
  }
  
  const xOffset = -(a * Math.sin(20 * (Math.PI / 180.0))) / Math.sin(70 * (Math.PI / 180.0));

  // move vertices so that the selected mesh generation can start at 0,0 (2d plane)
  return move_verticies(0, 0, a+DEFAULT_SIZE/2.0 + DEFAULT_SIZE*2,[
    // left
    ...rect(DEFAULT_SIZE, b),
    ...rect(a, b, [DEFAULT_SIZE*2, 0]),
    ...vertex([DEFAULT_SIZE*2 + a, 0, 0], [DEFAULT_SIZE*2 + a + b/2.0, 0, b/2.0], [DEFAULT_SIZE*2 + a, 0, b]),
    //right
    ...rect(a, b, [DEFAULT_SIZE*3 + a + b, 0]),
    ...vertex([DEFAULT_SIZE*3 + a + b, 0, 0], [DEFAULT_SIZE*2 + a + b/2.0 + DEFAULT_SIZE, 0, b/2.0], [DEFAULT_SIZE*3 + a + b, 0, b]),
    ...rect(DEFAULT_SIZE, b, [DEFAULT_SIZE*4 + 2*a + b, 0]),
    // top,
    ...vertex(
      [DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0, 0, b + DEFAULT_SIZE/2.0],
      [DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0 + b , 0, b + DEFAULT_SIZE/2.0], 
      [DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0 + b/2.0, 0, b/2.0 + DEFAULT_SIZE/2.0] 
    ),
    ...quad(
      [DEFAULT_SIZE*2.5 + a, 0, b + DEFAULT_SIZE/2.0],
      [DEFAULT_SIZE*2.5 + a + xOffset, 0, a + b + DEFAULT_SIZE/2.0],
      [DEFAULT_SIZE*2.5 + a + b, 0, b + DEFAULT_SIZE/2.0],
      [DEFAULT_SIZE*2.5 + a + xOffset + b, 0, a + b + DEFAULT_SIZE/2.0],
    ),
    ...rect(b, DEFAULT_SIZE, [DEFAULT_SIZE*2.5 + a + xOffset, b + DEFAULT_SIZE/2.0 + a + DEFAULT_SIZE]),
    // down
    ...vertex(
      [DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0, 0, -DEFAULT_SIZE/2.0],
      [DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0 + b, 0,  -DEFAULT_SIZE/2.0], 
      [DEFAULT_SIZE*2 + a + b/2.0 + DEFAULT_SIZE/2.0, 0, b/2.0 - DEFAULT_SIZE/2.0] 
    ),
    ...quad(
      [DEFAULT_SIZE*2.5 + a, 0, -DEFAULT_SIZE/2.0],
      [DEFAULT_SIZE*2.5 + a + xOffset, 0, -DEFAULT_SIZE/2.0 - a],
      [DEFAULT_SIZE*2.5 + a + b, 0, -DEFAULT_SIZE/2.0],
      [DEFAULT_SIZE*2.5 + a + b + xOffset, 0, -DEFAULT_SIZE/2.0 - a],
    ),
    ...rect(b, DEFAULT_SIZE, [DEFAULT_SIZE*2.5 + a + xOffset, -DEFAULT_SIZE/2.0 - a - DEFAULT_SIZE*2]),
  ])
}



function vertices_width(vertices: number[]): number {
  let max = 0;
  for (var i = 0; i < vertices.length; i+=3) {
    if (vertices[i] > 0) max = Math.max(max, vertices[i]);
  }
  return max;
}

function vertices_height(vertices: number[]): number {
  let max = 0;
  for (var i = 2; i < vertices.length; i+=3) {
    if (vertices[i] > 0) max = Math.max(max, vertices[i]);
  }
  return max;
}

function vertices_min_x(vertices: number[]): number {
  let min = 100000000;
  for (var i = 0; i < vertices.length; i+=3) {
    min = Math.min(min, vertices[i]);
  }
  return min;
}

function vertices_min_y(vertices: number[]): number {
  let min = 100000000;
  for (var i = 2; i < vertices.length; i+=3) {
    min = Math.min(min, vertices[i]);
  }
  return min;
}


function half_arc_x(start: [number, number], end: [number, number], c:number): number[] {
  function fn(x: number): number {
    return 1 -((x - 1) ** 2);
  }

  let arc = [];
  for (let i = 0; i < ARK_NUM; i++) {
    const pos = start[0] + (end[0] - start[0]) *((i/ARK_NUM));
    const pos2 = start[0] + (end[0] - start[0]) *(((i+1)/ARK_NUM));
    arc.push(...quad(
      [pos, -c*fn(i/ARK_NUM), start[1]], [pos, -c*fn(i/ARK_NUM), end[1]],
      [pos2, -c*fn((i+1)/ARK_NUM), start[1]], [pos2, -c*fn((i+1)/ARK_NUM), end[1]]
    ));
  }
  return arc;
}


function half_arc_y(start: [number, number], end: [number, number], c:number): number[] {
  function fn(x: number): number {
    return 1 -((x - 1) ** 2);
  }

  let arc = [];
  for (let i = 0; i < ARK_NUM; i++) {
    const pos = start[1] + (end[1] - start[1]) *((i/ARK_NUM));
    const pos2 = start[1] + (end[1] - start[1]) *(((i+1)/ARK_NUM));
    arc.push(...quad(
      [start[0], -c*fn(i/ARK_NUM), pos], [end[0], -c*fn(i/ARK_NUM), pos],
      [start[0], -c*fn((i+1)/ARK_NUM), pos2], [end[0], -c*fn((i+1)/ARK_NUM), pos2]
    ));
  }
  return arc;
}

function arc(center: number, d: number, c: number, b: number) {
  function fn(x: number): number {
    return 1 -((x - 1) ** 2);
  }
  let arc = [];
  for (let i = 0; i < ARK_NUM * 2; i++) {
    const pos = center - d/2.0 * ( 1 - (i/ARK_NUM));
    const pos2 = center - d/2.0 * ( 1 - ((i+1)/ARK_NUM));
    arc.push(...quad(
      [pos, -c*fn(i/ARK_NUM), 0], [pos, -c*fn(i/ARK_NUM), b],
      [pos2, -c*fn((i+1)/ARK_NUM), 0], [pos2, -c*fn((i+1)/ARK_NUM), b]
    ));
  }
  return arc;
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
    side: Three.DoubleSide ,color: SELECTED_COLOR_OK,
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


function generate_other1d_collision(position: number[], amplitude: number, width: number): CollisionBox[] {
  const f = formula(amplitude, width, c1);

  const b = f[1];
  const a = f[0];

  return [
    new CollisionBox(position[0], position[1], DEFAULT_SIZE, b, "1d_left"),
    new CollisionBox(position[0] + DEFAULT_SIZE*4 + 2*a, position[1], DEFAULT_SIZE, b, "1d_right")
  ];
}
function generate_basic1d_collision(position: number[], amplitude: number, width: number): CollisionBox[] {
  const f = formula(amplitude, width, c1);

  const b = f[1];
  const a = f[0];

  return [
    new CollisionBox(position[0], position[1], DEFAULT_SIZE, b, "1d_left"),
    new CollisionBox(position[0] + DEFAULT_SIZE*2, position[1], a, b, "1d_left_m"),
    new CollisionBox(position[0] + DEFAULT_SIZE*3 + a, position[1], a, b, "1d_right_m"),
    new CollisionBox(position[0] + DEFAULT_SIZE*4 + 2*a, position[1], DEFAULT_SIZE, b, "1d_right")
  ];
}

function generate_basic1d_chained_collision(position: number[], amplitude: number, width: number, data): CollisionBox[] {
  const f = formula(amplitude, width, c1);

  const b = f[1];
  const w = vertices_width(generate_basic1d_chained_flat(amplitude, width, data));
  return [
    new CollisionBox(position[0], position[1], DEFAULT_SIZE, b, "1d_left"),
    new CollisionBox(position[0] + (w), position[1], DEFAULT_SIZE, b, "1d_right"),
  ];
}

function generate_basic2d_chained_collision(position: number[], amplitude: number, width: number, data): CollisionBox[] {
  const f = formula(amplitude, width, c1);
  
  const a = f[0];
  const b = f[1];

  const w = vertices_width(generate_basic2d_chained_flat(amplitude, width, data));
  return [
    new CollisionBox(position[0], position[1] + a + DEFAULT_SIZE*2.5, DEFAULT_SIZE, b, "2d_left"),
    new CollisionBox(position[0] + DEFAULT_SIZE*2, position[1] + a + DEFAULT_SIZE*2.5, a, b, "2d_left_m"),
    new CollisionBox(position[0] + w - DEFAULT_SIZE*2 - a, position[1] + a + DEFAULT_SIZE*2.5, a, b, "2d_left_m"),
    new CollisionBox(position[0] + w, position[1] + a + DEFAULT_SIZE*2.5, DEFAULT_SIZE, b, "2d_right"),
  ];
}

function generate_basic2d_collision(position: number[], amplitude: number, width: number): CollisionBox[] {
  const f = formula(amplitude, width, c2);

  const b = f[1];
  const a = f[0];

  const yOffset = a+ DEFAULT_SIZE*2.5;

  // only collisionshape for the outer ones, maybe add for other later.
  return [
    new CollisionBox(position[0], position[1] + yOffset, DEFAULT_SIZE, b, "2d_left"),
    new CollisionBox(position[0] + DEFAULT_SIZE*2, position[1] + yOffset, a, b, "2d_left_m"),
    new CollisionBox(position[0] + DEFAULT_SIZE*4 + 2*a + b, position[1] + yOffset, DEFAULT_SIZE, b, "2d_right"),
    new CollisionBox(position[0] + DEFAULT_SIZE*2 + a + b, position[1] + yOffset, a, b, "2d_right_m"),
  ];
}

const IS_2D_STRECHED = false;
const COLOR_BAD = 0xFF0000;
const COLOR_GOOD = 0x00FF00;

const SHOW_LINE_PERCENT = 1.25;

class GapBox {
  cell: Cell;
  d: number[]; // left, right, up, down
  boundingBox: Three.Mesh;

  constructor(cell: Cell) {
    this.cell = cell;
    this.boundingBox = generate_object([], 0);
    const v = cell.amplitude * 2 +1;
    this.d = [v, v, v, v];
  }

  overlaps(other: GapBox): boolean {
    const c1 = new CollisionBox(
      this.cell.position.x - this.d[0]/2,
      this.cell.position.z - this.d[3]/2 - this.cell.get_height(), 
      this.cell.get_width() + this.d[0]/2 + this.d[1]/2,
      this.cell.get_height() + this.d[3]/2 + this.d[2]/2, 
      "");
    const c2 = new CollisionBox(
      other.cell.position.x - other.d[0]/2,
      other.cell.position.z - other.d[3]/2 - other.cell.get_height(),
      other.cell.get_width() + other.d[0]/2 + other.d[1]/2,
      other.cell.get_height() + other.d[3]/2 + other.d[2]/2,
      "");
    return c1.collisionBoxesIntersect(c2);
  }

  update_bounding_box() {
    const d = this.d;
    const vertices = [
      ...rect(this.cell.get_width() + d[0]/2 + d[1]/2, LINE_THICKNESS, [-d[0]/2, -d[2]/2]),
      ...rect(this.cell.get_width() + d[0]/2 + d[1]/2, LINE_THICKNESS, [-d[0]/2, this.cell.get_height() + d[3]/2]),
      ...rect(LINE_THICKNESS, this.cell.get_height() + d[2]/2 + d[3]/2, [-d[0]/2, -d[2]/2]),
      ...rect(LINE_THICKNESS, this.cell.get_height() + d[2]/2 + d[3]/2, [this.cell.get_width() + d[1]/2, -d[2]/2]),
      // ...rect(
      //   this.cell.get_width() + this.d[1]/2 + this.d[0]/2,
      //   this.cell.get_height() + this.d[3]/2 + this.d[2]/2, 
      //   [-this.cell.position.x + this.cell.position.x - this.d[0]/2, 
      //     this.cell.position.z - this.cell.position.z - this.d[2]/2])
    ];

    this.boundingBox.visible = true;
    this.boundingBox.geometry.dispose();
    const verticesFloat32Array = new Float32Array(vertices);
    const geometry = new Three.BufferGeometry();

    const positionAttribute = new Three.BufferAttribute(verticesFloat32Array, 3);
    geometry.setAttribute('position', positionAttribute);
    this.boundingBox.geometry = geometry;

    const material = new Three.LineBasicMaterial( { 
      side: Three.DoubleSide ,color: 0xFF0000,
      opacity: 0.7,    
      transparent: true
    });
    this.boundingBox.material.dispose();
    this.boundingBox.material = material;
  }

  regenerate(cells: Cell[], mouse_up: boolean, selected_cell: Cell, has_2d_cells: boolean = false) {

    const v = this.cell.amplitude * 2 +1;
    this.d = [v, v, v, v];

    if (cells.length <= 1) {
      this.update_bounding_box();
      return;
    }

    let oldR: Cell | null = null;
    let oldU: Cell | null = null;
    let oldB: Cell | null = null;
    let oldL: Cell | null  = null;

    let boxes = {}

    const w = this.cell.get_width();
      
    function update(t: GapBox, old: Cell, c: Cell, i: number) {
      if (i <= 1) {
        if (old != null && old.amplitude > c.amplitude) 
          t.d[i] = Math.max(old.amplitude, t.cell.amplitude)*2 + 1;
        else {
          t.d[i] = Math.max(c.amplitude, t.cell.amplitude)*2 + 1;
          old = c;
        }
      } else {
        if (old != null && old.amplitude > c.amplitude) 
          t.d[i] = Math.max(old.amplitude, t.cell.amplitude) + (has_2d_cells? .7: 0) + 1;
        else {
          t.d[i] = Math.max(c.amplitude, t.cell.amplitude) + (has_2d_cells? .7: 0) + 1;
          old = c;
        }
      }
    }

    for (let c of cells) {

      const center = c.get_center();
      // normal ones
      if (center[0] >= this.cell.position.x + this.cell.get_width()
        && center[1] >= this.cell.position.z 
        && center[1] <= this.cell.position.z + this.cell.get_height()
      ) {
        // right of cell
        // if (this.cell == selected_cell)
        update(this, oldR!, c, 1);
      }
      else if (center[0] <= this.cell.position.x
        && center[1] >= this.cell.position.z 
        && center[1] <= this.cell.position.z + this.cell.get_height()
      ) {
        // left of cell
        //
        // if (this.cell == selected_cell)
        update(this, oldL!, c, 0);
      } 
      else if (center[0] >= this.cell.position.x 
        && center[0] <= this.cell.position.x + this.cell.get_width()
        && center[1] >= this.cell.position.z + this.cell.get_height()
      ) {
        // top of cell
        // if (this.cell == selected_cell)
        update(this, oldU!, c, 2);
      } 
      else if (center[0] >= this.cell.position.x 
        && center[0] <= this.cell.position.x + this.cell.get_width()
        && center[1] <= this.cell.position.z
      ) {
        // if (this.cell == selected_cell)
        update(this, oldB!, c, 3);
      }
      else if (center[0] >= this.cell.position.x + this.cell.get_width()
        && center[1] >= this.cell.position.z + this.cell.get_height()
      ) {
        // if (this.cell == selected_cell)
        update(this, oldR!, c, 1);
        update(this, oldU!, c, 2);
      }
      else if (center[0] <= this.cell.position.x 
        && center[1] >= this.cell.position.z + this.cell.get_height()
      ) {
        // if (this.cell == selected_cell)
        update(this, oldL!, c, 0);
        update(this, oldU!, c, 2);
      }
      else if (center[0] >= this.cell.position.x + this.cell.get_width()
        && center[1] <= this.cell.position.z 
      ) {
        // if (this.cell == selected_cell)

        update(this, oldR!, c, 1);
        update(this, oldB!, c, 3);
      }
      else if (center[0] <= this.cell.position.x
        && center[1] <= this.cell.position.z
      ) {
        // if (this.cell == selected_cell)
        update(this, oldL!, c, 0);
        update(this, oldB!, c, 3);
      }
    }
      // find nearest cell right of this cell.
    this.update_bounding_box();
  }
}

const LINE_THICKNESS = .25;

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
  elastic_offset: number[] = [0, 0];
  amplitude: number;
  width: number;
  selected_mesh: Three.Mesh;
  coll: CollisionBox[];
  meta_data: any;
  dims_without_elastic: number[];

  bounding_box: CollisionBox;
  d: number;

  gap: GapBox;

  constructor(type: string, vertices_flat: number[], vertices: number[], position: Three.Vector3, amplitude: number, width: number, cells: Cell[]) {
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

    this.gap = new GapBox(this);

    this.gen_coll();
    this.update_gap(cells);
    // needs to go after, relies on gap
    this.selected_mesh = generate_selected_rect_mesh(this.get_width() + 2, this.get_height() + 2);
  }

  get_center() {
    return [this.position.x + this.get_width() / 2, this.position.z + this.get_height() / 2];
  }

  update_gap(otherCells: Cell[], current_cell: Cell, regen: boolean = true) {
    this.gap.regenerate(otherCells, false, current_cell);
  }

  add_bounding_box(scene: Three.Scene) {
    // scene.add(this.lines.right);
    // scene.add(this.lines.left);
    // scene.add(this.lines.up);
    // scene.add(this.lines.down);
    scene.add(this.gap.boundingBox);
    this.gap.boundingBox.position.copy(this.position);
  }

  get_corner_points(): [number, number][] {
    return [
      // left top,
      [this.position.x, this.position.z],
      // right top
      [this.position.x + this.get_width(), this.position.z],
      // right, bottom 
      [this.position.x + this.get_width(), this.position.z + this.get_height()],
      // left, bottom
      [this.position.x, this.position.z + this.get_height()]
    ];
  }

  gen_coll() {
    switch (this.type) {
      case "basic1d":
        this.coll = generate_basic1d_collision([this.position.x + this.elastic_offset[0], this.position.z - this.elastic_offset[1]], this.amplitude, this.width);
        break;
      case "right1d":
      case "full1d":
      case "slope71d":
      case "slope1d":
      case "angle1d":
        this.coll = generate_other1d_collision([this.position.x + this.elastic_offset[0], this.position.z - this.elastic_offset[1]], this.amplitude, this.width);
        break;
      case "basic2d":
        this.coll = generate_basic2d_collision([this.position.x + this.elastic_offset[0], this.position.z - this.elastic_offset[1]], this.amplitude, this.width);
        break;
      case "chained_basic_1d":
        this.coll = generate_basic1d_chained_collision([this.position.x + this.elastic_offset[0], this.position.z - this.elastic_offset[1]], this.amplitude, this.width, this.meta_data);
        break;
      case "chained_basic_2d":
        this.coll = generate_basic2d_chained_collision([this.position.x + this.elastic_offset[0], this.position.z - this.elastic_offset[1]], this.amplitude, this.width, this.meta_data);
        break;
      default:
        break;
    }
  }
  
  get_width_mesh() {
    var max = 0.0;
    for (let i = 0; i < this.vertices.length; i += 3) {
      max = Math.max(max, this.vertices[i]);
    }
    return max;
  }

  get_width() {
    var max = 0.0;
    for (let i = 0; i < this.vertices_flat.length; i += 3) {
      max = Math.max(max, this.vertices_flat[i]);
    }
    return max;
  }

  get_height_mesh() {
    var max = 0.0;
    for (let i = 2; i < this.vertices.length; i += 3) {
      max = Math.max(max, this.vertices[i]);
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

  regenerate(amplitude: number, width: number, cells: Cell[]) {
    this.amplitude = amplitude;
    this.width = width;
    var vertices_flat = [];
    var vertices = []; 
    
    switch (this.type) {
      case "basic1d":
        vertices_flat = generate_basic1d_flat(amplitude, width);
        vertices = generate_basic1d(amplitude, width); 
        break;
      case "right1d":
        vertices_flat = generate_right1d_flat(amplitude, width);
        vertices = generate_right1d(amplitude, width); 
        break;
      case "full1d":
        vertices_flat = generate_full1d_flat(amplitude, width);
        vertices = generate_full1d(amplitude, width); 
        break;
      case "slope71d":
        vertices_flat = generate_slope71d_flat(amplitude, width);
        vertices = generate_slope71d(amplitude, width); 
        break;
      case "slope1d":
        vertices_flat = generate_slope1d_flat(amplitude, width);
        vertices = generate_slope1d(amplitude, width); 
        break;
      case "angle1d":
        vertices_flat = generate_angle1d_flat(amplitude, width);
        vertices = generate_angle1d(amplitude, width); 
        break;
      case "basic2d":
        vertices_flat = generate_basic2d_flat(amplitude, width);
        vertices = generate_basic2d(amplitude, width);
        break;
      case "right2d":
        vertices_flat = generate_right2d_flat(amplitude, width);
        vertices = generate_right2d(amplitude, width);
        break;
      case "full2d":
        vertices_flat = generate_full2d_flat(amplitude, width);
        vertices = generate_full2d(amplitude, width);
        break;
      case "slope72d":
        vertices_flat = generate_slope72d_flat(amplitude, width);
        vertices = generate_slope72d(amplitude, width);
        break;
      case "slope2d":
        vertices_flat = generate_slope2d_flat(amplitude, width);
        vertices = generate_slope2d(amplitude, width);
        break;
      case "angle2d":
        vertices_flat = generate_angle2d_flat(amplitude, width);
        vertices = generate_angle2d(amplitude, width);
        break;
      // 
      case "chained_basic_1d":
        vertices_flat = generate_basic1d_chained_flat(amplitude, width, this.meta_data);
        vertices = generate_basic1d_chained(amplitude, width, this.meta_data);
        break;
      case "chained_basic_2d":
        vertices_flat = generate_basic2d_chained_flat(amplitude, width, this.meta_data);
        vertices = generate_basic2d_chained(amplitude, width, this.meta_data);
        break;
      default:
        break;
    }
    
    this.vertices_flat = vertices_flat;
    this.vertices = vertices;
    
    this.dims_without_elastic = [this.get_width(), this.get_height()];

    if (this.elastic) {
      if (this.type.includes("1d")) {
        vertices.push(
          ...generate_elastic_1d_cell(this),
          // ...generate_selected_rect(this.get_width(), this.get_height())
        );
      } else {
        vertices.push(
          ...generate_elastic_2d_cell(this),
        );
      }
      this.elastic_offset = [-vertices_min_x(vertices_flat), -vertices_min_y(vertices_flat)];
      vertices_flat = move_verticies(this.elastic_offset[0], 0, this.elastic_offset[1], vertices_flat);
    } else {
        this.elastic_offset = [0, 0]; 
    }

    this.vertices_flat = vertices_flat;
    
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

    //this.update_gap(cells);

    const verticesFloat32Array3 = new Float32Array(generate_selected_rect(this.get_width() + 2, this.get_height() + 2));
    // Create the BufferGeometry
    const geometry3 = new Three.BufferGeometry();

    // Set the custom vertex attribute 'position'
    const positionAttribute3 = new Three.BufferAttribute(verticesFloat32Array3, 3);
    geometry3.setAttribute('position', positionAttribute3);
    this.selected_mesh.geometry = geometry3;

    // regen collision
    this.gen_coll();
  }
  // if selected green or red outline,
  // ok ignored if not selected so dotted
  set_selected_mesh(selected: boolean, ok: boolean) { 
    this.selected_mesh.visible = selected;
  }

  reset_displacement() {
   // this.mesh.position.copy(this.position);
  }

  add_displacement(cell: Cell) {
    const distX = ((this.position.x + this.get_width() / 2.0) - (cell.position.x + cell.get_width()));
    const distZ = ((this.position.z + this.get_height() / 2.0) - (cell.position.z + cell.get_height()));

    const dir = [
      this.position.x - cell.position.x, this.position.z - cell.position.z
    ];

    this.mesh.position.copy(this.mesh.position.add(new Three.Vector3(dir[0] * 1.0/distX * 50, 0, dir[1] * 1.0/distZ)));
  }
}



// Generate Elastic
//
//
function generate_elastic_1d_cell(cell: Cell): number[] {
  return generate_elastic_1d(cell.get_width(), cell.get_height(), cell.amplitude, cell.width, cell.gap.d[2], cell.gap.d[3], cell.elastic ? cell.elastic_d : -1, cell.type);
}

function generate_elastic_2d_cell(cell: Cell): number[] {
  return generate_elastic_2d(cell.get_width(), cell.get_height(), cell.amplitude, cell.width, cell.gap.d[2], cell.gap.d[3], cell.elastic ? cell.elastic_d : -1);
}

function generate_elastic_1d(cellW: number, cellH: number, amplitude: number, width: number, gapUp: number, gapBo: number, elastic_val: number, type: string): number[] {
  const f = formula(amplitude, width, c1);

  const b = f[1];
  
  // Add the 2DEFAULT_SIZE important for scale of left and right most rects 
  // 2*Math.max(...)
  const h =  b + Math.max(gapBo, gapUp); // max of d on top and bottom.
  let w = width + 4 + (14 - elastic_val) + DEFAULT_SIZE*2;
  
  let x = (w-cellW)/2.0;
  let y = (h-cellH)/2.0;
  
  if (type == "right1d") { 
    x += 1.5*DEFAULT_SIZE;
    cellW -= 3 *DEFAULT_SIZE;
  }

  return [ 
    ...rect(w, DEFAULT_SIZE, [-x, -y]),
    ...rect(w, DEFAULT_SIZE, [-x, y + cellH]),
    ...rect(DEFAULT_SIZE, h- DEFAULT_SIZE, [-x, -y + DEFAULT_SIZE]),
    ...rect(DEFAULT_SIZE, h- DEFAULT_SIZE, [x + cellW - DEFAULT_SIZE, -y + DEFAULT_SIZE])
  ];
}

function generate_elastic_2d(cellW: number, cellH: number, amplitude: number, width: number, gapUp: number, gapBo: number, elastic_val: number): number[] {

  const l = width + 4 + 2*(12 - elastic_val) + DEFAULT_SIZE*2;
  
  return generate_circle([cellW / 2, cellH / 2], DEFAULT_SIZE, width + 4 + 2*(12 - elastic_val) + DEFAULT_SIZE*2);
}

function generate_circle(center: [number, number], width: number = 2, diameter: number): number[] {
  const innerRadius = diameter/2;
  const outerRadius = innerRadius + width;
  const thetaSegments = 32;
  
  const vertices = [];

  for (let i = 0; i <= thetaSegments; i++) {
    const segment = i / thetaSegments * (Math.PI * 2);
    const nextSegment = (i + 1) / thetaSegments * (Math.PI * 2);

  
    const x1 = innerRadius * Math.cos(segment) + center[0];
    const z1 = innerRadius * Math.sin(segment) + center[1];

    const x2 = innerRadius * Math.cos(nextSegment) + center[0];
    const z2 = innerRadius * Math.sin(nextSegment) + center[1];

    const x3 = outerRadius * Math.cos(segment) + center[0];
    const z3 = outerRadius * Math.sin(segment) + center[1];

    const x4 = outerRadius * Math.cos(nextSegment) + center[0];
    const z4 = outerRadius * Math.sin(nextSegment) + center[1];

    vertices.push(...quad(
      [x1, 0, z1], [x2, 0, z2],
      [x3, 0, z3], [x4, 0, z4]
    ));
  }
  return vertices;
}

