import { Cell, formula, c1, c2, DEFAULT_SIZE } from "./generate";
import { SvgWriter, Writer } from "./svg_writer";
import { CollisionBox } from "./collision.ts";

const DEF_SIZE: [number, number] = [500, 500];

const export_functions = {
  "basic1d": basic1D,
  "right1d": right1D,
  "full1d": full1D,
  "slope71d": slope71D,
  "slope1d": slope1D,
  "angle1d": angle1D,

  "basic2d": basic2D,
  "right2d": right2D,
  "full2d": full2D,
  "slope72d": slope72D,
  "slope2d": slope2D,
  "angle2d": angle2D,
}

export function export_cells(cells: Cell[], format: string) {
  const writer: Writer = new SvgWriter(DEF_SIZE[0], DEF_SIZE[1]); 
  for (const cell of cells) {
    const pos = [
      cell.mesh_flat.position.x + (cell.elastic ? cell.elastic_offset[0]: 0) + DEF_SIZE[0]/2,
      cell.mesh_flat.position.z - (cell.elastic ? cell.elastic_offset[1]: 0) + DEF_SIZE[1]/2 - (cell.type.includes("2d") ? cell.dims_without_elastic[1]/2 : 0) 
    ];

    if (cell.type in export_functions) {
      export_functions[cell.type](pos, cell.amplitude, cell.width, cell.coll, writer);
    } else if (cell.type == "chained_basic_1d"){
      basic1d_chained(pos, cell.amplitude, cell.width, writer, cell.meta_data);
    } else if (cell.type == "chained_basic_2d") {
      basic2d_chained(pos, cell.amplitude, cell.width, writer, cell.meta_data);
    } else {
      console.log(`Cant export ${cell.type}`);
    }
  }
  writer.save("file");
  writer.clear();

  const has_2d_cells = cells.reduceRight((cell: Cell, b: boolean) => {return b || cell.type.includes("2d")}, false);
  const PLANE_SCALAR = has_2d_cells ? 1.0/1.75 : .5;

  // fabric is stretched 200% for printing the flat ones. then relaxed and therefore the scalar must be applied for the elastic exportl.
  for (const cell of cells) {
    if (cell.elastic) { 
      const pos = [
        (cell.mesh_flat.position.x + (cell.elastic ? cell.elastic_offset[0]: 0)) * PLANE_SCALAR + DEF_SIZE[0]/2,
        (cell.mesh_flat.position.z - (cell.elastic ? cell.elastic_offset[1]: 0)) * PLANE_SCALAR + DEF_SIZE[1]/2 - (cell.type.includes("2d") ? cell.dims_without_elastic[1]/2 : 0) 
      ];
      if (cell.type.includes("1d"))
        elastic_1D(writer, pos, cell.amplitude, cell.width, cell.gap.d, cell.dims_without_elastic[0], cell.dims_without_elastic[1], cell.elastic_d);
      else 
        elastic_2D(writer, pos, cell.amplitude, cell.width, cell.type, cell.dims_without_elastic[0], cell.dims_without_elastic[1], cell.elastic_d);
    }
  }
  writer.save("elastic");
}

function elastic_1D(writer: Writer, pos: [number, number], amplitude: number, width: number, gap: number[], cellW: number, cellH: number, elastic_val: number) {
  const f = formula(amplitude, width, c1);

  const b = f[1];

  const h = b + 2* Math.max(gap[2], gap[3]) + DEFAULT_SIZE*2 ; // max of d on top and bottom.D
  // TODO formula wrong 
  const w = width + 4 + (14 - elastic_val) + DEFAULT_SIZE*2;
  
  const x = (w-cellW)/2.0;
  const y = (h-cellH)/2.0;
  writer.rect(pos[0] - x, pos[1] + y, w, DEFAULT_SIZE, 0, 0xFF0000);
  writer.rect(pos[0] - x, pos[1] - y - cellH, w, DEFAULT_SIZE, 0, 0xFF0000);
  writer.rect(pos[0] - x, pos[1] + y - DEFAULT_SIZE, DEFAULT_SIZE, h - DEFAULT_SIZE, 0, 0xFF0000);
  writer.rect(pos[0] + x + cellW - DEFAULT_SIZE, pos[1] + y - DEFAULT_SIZE, DEFAULT_SIZE, h - DEFAULT_SIZE, 0, 0xFF0000);
}

function elastic_2D(writer: Writer, pos: [number, number], amplitude: number, width: number, type: string, cellW: number, cellH: number, elastic_val: number) {
  const f = formula(amplitude, width, c1);

  const b = f[1];
  const a = f[0];
  const l = width + 4 + 2*(12 - elastic_val) + DEFAULT_SIZE*2;
  if (type == "right2d") {
    const offset = -((DEFAULT_SIZE*4 + 2*a + b)/2 - (DEFAULT_SIZE*2 + a*.6 + b/2)); 
    writer.circle(pos[0] + cellW/2 , pos[1], DEFAULT_SIZE, l/2, 0xFF0000);
  } else {
    writer.circle(pos[0] + cellW/2 , pos[1], DEFAULT_SIZE, l/2, 0xFF0000);
  }
}

function angle1D(position: number[], amplitude: number, width: number,collisions: CollisionBox[], writer: Writer) {
  const f = formula(amplitude, width, c1); 

  const b = f[1];
  const a = f[0];


  const yOffset = -(a * Math.sin(20 * (Math.PI / 180.0))) / Math.sin(70 * (Math.PI / 180.0));
  position[1] += yOffset;

  writer.rect(position[0], position[1], DEFAULT_SIZE, b);
  writer.path([
    [position[0] + DEFAULT_SIZE*2, position[1] - b],
    [position[0] + DEFAULT_SIZE*2 + a, position[1] - yOffset - b],
    [position[0] + DEFAULT_SIZE*2 + a, position[1] - yOffset],
    [position[0] + DEFAULT_SIZE*2, position[1]],
  ]);
  writer.path([
    [position[0] + DEFAULT_SIZE*3 + a, position[1] - b - yOffset],
    [position[0] + DEFAULT_SIZE*3 + a, position[1] - yOffset],
    [position[0] + DEFAULT_SIZE*3 + 2*a, position[1]],
    [position[0] + DEFAULT_SIZE*3 + 2*a, position[1] - b],
  ]);
  writer.rect(position[0] + DEFAULT_SIZE*4 + 2*a , position[1], DEFAULT_SIZE, b);
}

function slope1D(position: number[], amplitude: number, width: number,collisions: CollisionBox[], writer: Writer) {
  const f = formula(amplitude, width, c1); 

  const b = f[1];
  const a = f[0];

  writer.rect(position[0], position[1], DEFAULT_SIZE, b);
  writer.path([
    [position[0] + DEFAULT_SIZE*2, position[1] - b],
    [position[0] + DEFAULT_SIZE*2 + a, position[1] + b/2.0 - b],
    [position[0] + DEFAULT_SIZE*2, position[1]]
  ]);
  writer.path([
    [position[0] + DEFAULT_SIZE*3 + a, position[1] + b/2.0 - b],
    [position[0] + DEFAULT_SIZE*3 + 2*a, position[1] - b],
    [position[0] + DEFAULT_SIZE*3 + 2*a, position[1]],
  ]);
  writer.rect(position[0] + DEFAULT_SIZE*4 + 2*a , position[1], DEFAULT_SIZE, b);
}

function slope71D(position: number[], amplitude: number, width: number,collisions: CollisionBox[], writer: Writer) {
  const f = formula(amplitude, width, c1); 

  const b = f[1];
  const a = f[0];

  writer.rect(position[0], position[1], DEFAULT_SIZE, b);
  writer.path([
    [position[0] + DEFAULT_SIZE*2, position[1] - b],
    [position[0] + DEFAULT_SIZE*2 + a, position[1] + b*.15 - b],
    [position[0] + DEFAULT_SIZE*2 + a, position[1] + b*.85 - b],
    [position[0] + DEFAULT_SIZE*2, position[1]]
  ]);
  writer.path([
    [position[0] + DEFAULT_SIZE*3 + a, position[1] + b*.15 - b],
    [position[0] + DEFAULT_SIZE*3 + 2*a, position[1] - b],
    [position[0] + DEFAULT_SIZE*3 + 2*a, position[1]],
    [position[0] + DEFAULT_SIZE*3 + a, position[1] + b*.85 - b],
  ]);
  writer.rect(position[0] + DEFAULT_SIZE*4 + 2*a , position[1], DEFAULT_SIZE, b);
}
function full1D(position: number[], amplitude: number, width: number,collisions: CollisionBox[], writer: Writer) {
  const f = formula(amplitude, width, c1); 

  const b = f[1];
  const a = f[0];

    //...rect(a*2 + DEFAULT_SIZE, b, [DEFAULT_SIZE*2, 0]),
  writer.rect(position[0], position[1], DEFAULT_SIZE, b);
  writer.rect(position[0] + DEFAULT_SIZE*2, position[1], a*2 + DEFAULT_SIZE, b);
  writer.rect(position[0] + DEFAULT_SIZE*4 + 2*a , position[1], DEFAULT_SIZE, b);
}


function basic2d_chained(position: number[], amplitude: number, width: number, writer: Writer, data: string[]) {
  const f = formula(amplitude, width, c2); 

  const b = f[1];
  const a = f[0];
  
  var offsetX = position[0]; 
  var offsetY = position[1] + b/2;

  for (let i = 0; i < data.length; i++) {
    if (data[i] == "t8") {
      // v.push(...move_verticies(0, 0, a+DEFAULT_SIZE/2.0 + DEFAULT_SIZE*2, [
      //   // left
      //   ...rect(DEFAULT_SIZE, b, [xOffset, 0 ]),
      //   ...rect(a, b, [xOffset + DEFAULT_SIZE*2, 0]),
      //   ...vertex([xOffset + DEFAULT_SIZE*2 + a, 0, 0], [xOffset + DEFAULT_SIZE*2 + a + b/2.0, 0, b/2.0], [xOffset + DEFAULT_SIZE*2 +a, 0, b]),
      //   //right
      //   ...vertex([xOffset + DEFAULT_SIZE*3 + a + b, 0, 0], [xOffset + DEFAULT_SIZE*2 + a + b/2.0 + DEFAULT_SIZE, 0, b/2.0], [xOffset + DEFAULT_SIZE*3 + a + b, 0, b]),
      //   ...rect(a, b, [xOffset + DEFAULT_SIZE*3 + a+ b, 0]),
      //   // ...rect(DEFAULT_SIZE, b, [xOffset + DEFAULT_SIZE*4 + 2*a + b, 0]),
      //   // top,
      //   ...vertex([xOffset + DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0, 0, b + DEFAULT_SIZE/2.0],
      //     [xOffset + DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0 + b, 0, b + DEFAULT_SIZE/2.0], 
      //     [xOffset + DEFAULT_SIZE*2 + a + b/2.0 + DEFAULT_SIZE/2.0, 0, b/2.0 + DEFAULT_SIZE/2.0] 
      //   ),
      //   ...rect(b, a, [xOffset + DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0, b + DEFAULT_SIZE/2.0]),
      //   ...rect(b, DEFAULT_SIZE, [xOffset + DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0, b + DEFAULT_SIZE/2.0 + a + DEFAULT_SIZE]),
      //   // down
      //   ...vertex([xOffset + DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0, 0, -DEFAULT_SIZE/2.0],
      //     [xOffset + DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0 + b, 0, -DEFAULT_SIZE/2.0], 
      //     [xOffset + DEFAULT_SIZE*2 + a + b/2.0 + DEFAULT_SIZE/2.0, 0, b/2.0 - DEFAULT_SIZE/2.0] 
      //   ),
      //   ...rect(b, a, [xOffset + DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0, -a -DEFAULT_SIZE/2.0]),
      //   ...rect(b, DEFAULT_SIZE, [xOffset + DEFAULT_SIZE*2 + a + DEFAULT_SIZE/2.0, -DEFAULT_SIZE/2.0 - a - DEFAULT_SIZE*2]),
      //   ]));
      
      writer.rect(offsetX, offsetY, DEFAULT_SIZE, b); 
      writer.path([
        [offsetX + DEFAULT_SIZE*2, offsetY],
        [offsetX + DEFAULT_SIZE*2 + a, offsetY],
        [offsetX + DEFAULT_SIZE*2 + a + b/2.0, offsetY - b/2.0],
        [offsetX + DEFAULT_SIZE*2 + a, offsetY - b],
        [offsetX + DEFAULT_SIZE*2, offsetY - b],
      ]);

      //writer.rect(offsetX + DEFAULT_SIZE*4 + 2*a + b, offsetY, DEFAULT_SIZE, b);
      writer.path([
        [offsetX + DEFAULT_SIZE*3 + a + b/2.0, offsetY - b/2.0],
        [offsetX + DEFAULT_SIZE*3 + a + b, offsetY],
        [offsetX + DEFAULT_SIZE*3 + 2*a + b, offsetY],
        [offsetX + DEFAULT_SIZE*3 + 2*a + b, offsetY - b],
        [offsetX + DEFAULT_SIZE*3 + a + b, offsetY - b],
      ]);

      writer.rect(offsetX + DEFAULT_SIZE*2.5 + a, offsetY + a + DEFAULT_SIZE*2.5, b, DEFAULT_SIZE);
      writer.path([
        [offsetX + a + DEFAULT_SIZE*2.5 + b/2.0, offsetY - b/2.0 + DEFAULT_SIZE/2.0],
        [offsetX + a + DEFAULT_SIZE*2.5, offsetY + DEFAULT_SIZE/2.0],
        [offsetX + a + DEFAULT_SIZE*2.5, offsetY + a + DEFAULT_SIZE/2.0],
        [offsetX + a + DEFAULT_SIZE*2.5 + b, offsetY + a + DEFAULT_SIZE/2.0],
        [offsetX + a + DEFAULT_SIZE*2.5 + b, offsetY + DEFAULT_SIZE/2.0],
      ]);

      writer.rect(offsetX + DEFAULT_SIZE*2.5 + a, offsetY - a - b - DEFAULT_SIZE*1.5, b, DEFAULT_SIZE);
      writer.path([
        [offsetX + a + DEFAULT_SIZE*2.5 + b/2.0, offsetY - b/2.0 - DEFAULT_SIZE/2.0],
        [offsetX + a + DEFAULT_SIZE*2.5, offsetY - b - DEFAULT_SIZE/2.0],
        [offsetX + a + DEFAULT_SIZE*2.5, offsetY - a - b - DEFAULT_SIZE/2.0],
        [offsetX + a + DEFAULT_SIZE*2.5 + b, offsetY - a - b - DEFAULT_SIZE/2.0],
        [offsetX + a + DEFAULT_SIZE*2.5 + b, offsetY - b - DEFAULT_SIZE/2.0],
      ]);
      offsetX += DEFAULT_SIZE*4 + 2*a + b; 
    } else if (data[i] == "t9") {
      // v.push(...move_verticies(0, 0, a+DEFAULT_SIZE/2.0 + DEFAULT_SIZE*2,[
      //   ...vertex([xOffset - DEFAULT_SIZE + b/2.0, 0, b/2.0], [xOffset - DEFAULT_SIZE, 0, 0], [xOffset - DEFAULT_SIZE, 0, b]),
      //   ...vertex([xOffset + b/2.0, 0, b/2.0], [xOffset + b, 0, 0], [xOffset + b, 0, b]),
      //   ...rect(a, b, [xOffset + b, 0]),
      //   ...vertex([xOffset + b/2 - DEFAULT_SIZE/2.0, 0, b/2 + DEFAULT_SIZE/2], [xOffset - DEFAULT_SIZE/2.0, 0, b + DEFAULT_SIZE/2], [xOffset + b - DEFAULT_SIZE/2.0, 0, b + DEFAULT_SIZE/2]),
      //   ...rect(b, a, [xOffset  - DEFAULT_SIZE/2, b + DEFAULT_SIZE/2]),
      //   ...rect(b, DEFAULT_SIZE, [xOffset - DEFAULT_SIZE/2, b + DEFAULT_SIZE*1.5 + a]),
      //   ...vertex([xOffset + b/2 - DEFAULT_SIZE/2, 0, b/2 - DEFAULT_SIZE/2], [xOffset - DEFAULT_SIZE/2, 0, -DEFAULT_SIZE/2], [xOffset + b - DEFAULT_SIZE/2.0, 0, -DEFAULT_SIZE/2]),
      //   ...rect(b, a, [xOffset - DEFAULT_SIZE/2, -DEFAULT_SIZE/2 - a]),
      //   ...rect(b, DEFAULT_SIZE, [xOffset - DEFAULT_SIZE/2, - DEFAULT_SIZE*2.5 - a]),
      // ]));
      writer.path([
        [offsetX - DEFAULT_SIZE, offsetY], [offsetX - DEFAULT_SIZE, offsetY - b], [offsetX - DEFAULT_SIZE + b/2, offsetY - b/2]
      ]);
      writer.path([
        [offsetX + b/2, offsetY - b/2],
        [offsetX + b, offsetY],
        [offsetX + b + a, offsetY],
        [offsetX + b + a, offsetY - b],
        [offsetX + b, offsetY - b],         
      ]);
      // top
      writer.path([
        [offsetX + b/2 - DEFAULT_SIZE/2, offsetY - DEFAULT_SIZE/2 - b/2], 
        [offsetX - DEFAULT_SIZE/2, offsetY - b - DEFAULT_SIZE/2],
        [offsetX - DEFAULT_SIZE/2, offsetY - b - a - DEFAULT_SIZE/2 ],
        [offsetX + b - DEFAULT_SIZE/2, offsetY - b - a - DEFAULT_SIZE/2],
        [offsetX + b - DEFAULT_SIZE/2, offsetY - b - DEFAULT_SIZE/2]
      ]);
      writer.rect(offsetX - DEFAULT_SIZE/2, offsetY - DEFAULT_SIZE*1.5 - b - a, b, DEFAULT_SIZE);
      
      writer.path([
        [offsetX + b/2 - DEFAULT_SIZE/2, offsetY + DEFAULT_SIZE/2 - b/2], 
        [offsetX - DEFAULT_SIZE/2, offsetY + DEFAULT_SIZE/2],
        [offsetX - DEFAULT_SIZE/2, offsetY + a + DEFAULT_SIZE/2 ],
        [offsetX + b - DEFAULT_SIZE/2, offsetY + a + DEFAULT_SIZE/2],
        [offsetX + b - DEFAULT_SIZE/2, offsetY + DEFAULT_SIZE/2]
      ]);
      writer.rect(offsetX - DEFAULT_SIZE/2, offsetY + a + DEFAULT_SIZE*2.5, b, DEFAULT_SIZE);
      offsetX += b + a + DEFAULT_SIZE; 
    }
  }

  writer.rect(offsetX, offsetY, DEFAULT_SIZE, b);

}
function basic1d_chained(position: number[], amplitude: number, width: number, writer: Writer, data: string[]) {
  const f = formula(amplitude, width, c1); 

  const b = f[1];
  const a = f[0];
  
  if (data.includes("t7")) {
    // Add offset to pos.y if we have a angle1d
    position[1] += -(a * Math.sin(20 * (Math.PI / 180.0))) / Math.sin(70 * (Math.PI / 180.0));
  }
  var xOffset = 0; 

  for (let i = 0; i < data.length; i++) {
    if (data[i] == "t1") {
      writer.rect(position[0] + xOffset, position[1], DEFAULT_SIZE, b);
      writer.rect(position[0] + xOffset + DEFAULT_SIZE*2, position[1], a, b);
      writer.rect(position[0] + xOffset + DEFAULT_SIZE*3 + a, position[1], a, b);

      xOffset += 2*a + 4*DEFAULT_SIZE;
    } else if (data[i] == "t2") {
      writer.rect(position[0] + xOffset, position[1], a, b);
      xOffset += a + DEFAULT_SIZE;
    } else if (data[i] == "t3") {
      writer.rect(position[0] + xOffset, position[1], DEFAULT_SIZE, b);
      writer.rect(position[0] + xOffset + DEFAULT_SIZE*2, position[1], a*.6, b);
      writer.rect(position[0] + xOffset + DEFAULT_SIZE*3 + a*.6, position[1], a*1.4, b);

      xOffset += 2*a + 4*DEFAULT_SIZE;
    } else if (data[i] == "t4") {
      writer.rect(position[0] + xOffset, position[1], DEFAULT_SIZE, b);
      writer.rect(position[0] + xOffset + DEFAULT_SIZE*2, position[1], a*2 + DEFAULT_SIZE, b);

      xOffset += 2*a + 4*DEFAULT_SIZE;
    } else if (data[i] == "t5") {

      writer.rect(position[0] + xOffset, position[1], DEFAULT_SIZE, b);
      writer.path([
        [position[0] + DEFAULT_SIZE*2 + xOffset, position[1] - b],
        [position[0] + DEFAULT_SIZE*2 + a + xOffset, position[1] + b*.15 - b],
        [position[0] + DEFAULT_SIZE*2 + a + xOffset, position[1] + b*.85 - b],
        [position[0] + DEFAULT_SIZE*2 + xOffset, position[1]]
      ]);
      writer.path([
        [position[0] + DEFAULT_SIZE*3 + a + xOffset, position[1] + b*.15 - b],
        [position[0] + DEFAULT_SIZE*3 + 2*a + xOffset, position[1] - b],
        [position[0] + DEFAULT_SIZE*3 + 2*a + xOffset, position[1]],
        [position[0] + DEFAULT_SIZE*3 + a + xOffset, position[1] + b*.85 - b],
      ]);

      xOffset += 2*a + 4*DEFAULT_SIZE;
    } else if (data[i] == "t6") {

      writer.rect(position[0] + xOffset, position[1], DEFAULT_SIZE, b);
      writer.path([
        [position[0] + DEFAULT_SIZE*2 + xOffset, position[1] - b],
        [position[0] + DEFAULT_SIZE*2 + a + xOffset, position[1] + b/2.0 - b],
        [position[0] + DEFAULT_SIZE*2 + xOffset, position[1]]
      ]);
      writer.path([
        [position[0] + DEFAULT_SIZE*3 + a + xOffset, position[1] + b/2.0 - b],
        [position[0] + DEFAULT_SIZE*3 + 2*a + xOffset, position[1] - b],
        [position[0] + DEFAULT_SIZE*3 + 2*a + xOffset, position[1]],
      ]);
      xOffset += 2*a + 4*DEFAULT_SIZE;
    } else if (data[i] == "t7") {

      const yOffset = -(a * Math.sin(20 * (Math.PI / 180.0))) / Math.sin(70 * (Math.PI / 180.0));

      writer.rect(position[0] + xOffset, position[1], DEFAULT_SIZE, b);
      writer.path([
        [position[0] + DEFAULT_SIZE*2 + xOffset, position[1] - b],
        [position[0] + DEFAULT_SIZE*2 + a + xOffset, position[1] - yOffset - b],
        [position[0] + DEFAULT_SIZE*2 + a + xOffset, position[1] - yOffset],
        [position[0] + DEFAULT_SIZE*2 + xOffset, position[1]],
      ]);
      writer.path([
        [position[0] + DEFAULT_SIZE*3 + a + xOffset, position[1] - b - yOffset],
        [position[0] + DEFAULT_SIZE*3 + a + xOffset, position[1] - yOffset],
        [position[0] + DEFAULT_SIZE*3 + 2*a + xOffset, position[1]],
        [position[0] + DEFAULT_SIZE*3 + 2*a + xOffset, position[1] - b],
      ]);
      xOffset += 2*a + 4*DEFAULT_SIZE;
    }
  }
  writer.rect(position[0] + xOffset, position[1], DEFAULT_SIZE, b);
}

function basic1D(position: number[], amplitude: number, width: number,collisions: CollisionBox[], writer: Writer) {
  const f = formula(amplitude, width, c1); 

  const b = f[1];
  const a = f[0];

  writer.rect(position[0], position[1], DEFAULT_SIZE, b);
  writer.rect(position[0] + DEFAULT_SIZE*2, position[1], a, b);
  writer.rect(position[0] + DEFAULT_SIZE*3 + a, position[1], a, b);
  writer.rect(position[0] + DEFAULT_SIZE*4 + 2*a , position[1], DEFAULT_SIZE, b);
}

function right1D(position: number[], amplitude: number, width: number,collisions: CollisionBox[], writer: Writer) {
  const f = formula(amplitude, width, c1); 

  const b = f[1];
  const a = f[0];

  writer.rect(position[0], position[1], DEFAULT_SIZE, b);
  writer.rect(position[0] + DEFAULT_SIZE*2, position[1], a*.6, b);
  writer.rect(position[0] + DEFAULT_SIZE*3 + a*.6, position[1], a*1.4, b);
  writer.rect(position[0] + DEFAULT_SIZE*4 + 2*a , position[1], DEFAULT_SIZE, b);
}

function right2D(position: number[], amplitude: number, width: number, collisions: CollisionBox[],  writer: Writer) {
  
  const f = formula(amplitude, width, c2); 

  const b = f[1];
  const a = f[0];
  
  // we shift each 2d cell by its center regarding its height, but here the real center is not the geometric center so shift again by the difference.
  const offsetY = position[1] + b/2 - ((DEFAULT_SIZE*4 + 2*a + b)/2 - (DEFAULT_SIZE*2 + a*.6 + b/2)); 
  const offsetX = position[0];

  writer.rect(offsetX, offsetY, DEFAULT_SIZE, b); 
  writer.path([
    [offsetX + DEFAULT_SIZE*2, offsetY],
    [offsetX + DEFAULT_SIZE*2 + a*.6, offsetY],
    [offsetX + DEFAULT_SIZE*2 + a*.6 + b/2.0, offsetY - b/2.0],
    [offsetX + DEFAULT_SIZE*2 + a*.6, offsetY - b],
    [offsetX + DEFAULT_SIZE*2, offsetY - b],
  ]);

  writer.rect(offsetX + DEFAULT_SIZE*4 + 2*a + b, offsetY, DEFAULT_SIZE, b);
  writer.path([
    [offsetX + DEFAULT_SIZE*3 + a*.6 + b/2.0, offsetY - b/2.0],
    [offsetX + DEFAULT_SIZE*3 + a*.6 + b, offsetY],
    [offsetX + DEFAULT_SIZE*3 + 2*a + b, offsetY],
    [offsetX + DEFAULT_SIZE*3 + 2*a + b, offsetY - b],
    [offsetX + DEFAULT_SIZE*3 + a*.6 + b, offsetY - b],
  ]);

  writer.rect(offsetX + DEFAULT_SIZE*2.5 + a*.6, offsetY + a*1.4 + DEFAULT_SIZE*2.5, b, DEFAULT_SIZE);
  writer.path([
    [offsetX + a*.6 + DEFAULT_SIZE*2.5 + b/2.0, offsetY - b/2.0 + DEFAULT_SIZE/2.0],
    [offsetX + a*.6 + DEFAULT_SIZE*2.5, offsetY + DEFAULT_SIZE/2.0],
    [offsetX + a*.6 + DEFAULT_SIZE*2.5, offsetY + a*1.4 + DEFAULT_SIZE/2.0],
    [offsetX + a*.6 + DEFAULT_SIZE*2.5 + b, offsetY + a*1.4 + DEFAULT_SIZE/2.0],
    [offsetX + a*.6 + DEFAULT_SIZE*2.5 + b, offsetY + DEFAULT_SIZE/2.0],
  ]);

  writer.rect(offsetX + DEFAULT_SIZE*2.5 + a*.6, offsetY - a*.6 - b - DEFAULT_SIZE*1.5, b, DEFAULT_SIZE);
  writer.path([
    [offsetX + a*.6 + DEFAULT_SIZE*2.5 + b/2.0, offsetY - b/2.0 - DEFAULT_SIZE/2.0],
    [offsetX + a*.6 + DEFAULT_SIZE*2.5, offsetY - b - DEFAULT_SIZE/2.0],
    [offsetX + a*.6 + DEFAULT_SIZE*2.5, offsetY - a*.6 - b - DEFAULT_SIZE/2.0],
    [offsetX + a*.6 + DEFAULT_SIZE*2.5 + b, offsetY - a*.6 - b - DEFAULT_SIZE/2.0],
    [offsetX + a*.6 + DEFAULT_SIZE*2.5 + b, offsetY - b - DEFAULT_SIZE/2.0],
  ]);
}


function basic2D(position: number[], amplitude: number, width: number, collisions: CollisionBox[],  writer: Writer) {

  const f = formula(amplitude, width, c2); 

  const b = f[1];
  const a = f[0];
  // b/2 because we shift to center for y
  const offsetY = position[1] + b/2;
  const offsetX = position[0];
  
  writer.rect(offsetX, offsetY, DEFAULT_SIZE, b); 
  writer.path([
    [offsetX + DEFAULT_SIZE*2, offsetY],
    [offsetX + DEFAULT_SIZE*2 + a, offsetY],
    [offsetX + DEFAULT_SIZE*2 + a + b/2.0, offsetY - b/2.0],
    [offsetX + DEFAULT_SIZE*2 + a, offsetY - b],
    [offsetX + DEFAULT_SIZE*2, offsetY - b],
  ]);

  writer.rect(offsetX + DEFAULT_SIZE*4 + 2*a + b, offsetY, DEFAULT_SIZE, b);
  writer.path([
    [offsetX + DEFAULT_SIZE*3 + a + b/2.0, offsetY - b/2.0],
    [offsetX + DEFAULT_SIZE*3 + a + b, offsetY],
    [offsetX + DEFAULT_SIZE*3 + 2*a + b, offsetY],
    [offsetX + DEFAULT_SIZE*3 + 2*a + b, offsetY - b],
    [offsetX + DEFAULT_SIZE*3 + a + b, offsetY - b],
  ]);

  writer.rect(offsetX + DEFAULT_SIZE*2.5 + a, offsetY + a + DEFAULT_SIZE*2.5, b, DEFAULT_SIZE);
  writer.path([
    [offsetX + a + DEFAULT_SIZE*2.5 + b/2.0, offsetY - b/2.0 + DEFAULT_SIZE/2.0],
    [offsetX + a + DEFAULT_SIZE*2.5, offsetY + DEFAULT_SIZE/2.0],
    [offsetX + a + DEFAULT_SIZE*2.5, offsetY + a + DEFAULT_SIZE/2.0],
    [offsetX + a + DEFAULT_SIZE*2.5 + b, offsetY + a + DEFAULT_SIZE/2.0],
    [offsetX + a + DEFAULT_SIZE*2.5 + b, offsetY + DEFAULT_SIZE/2.0],
  ]);

  writer.rect(offsetX + DEFAULT_SIZE*2.5 + a, offsetY - a - b - DEFAULT_SIZE*1.5, b, DEFAULT_SIZE);
  writer.path([
    [offsetX + a + DEFAULT_SIZE*2.5 + b/2.0, offsetY - b/2.0 - DEFAULT_SIZE/2.0],
    [offsetX + a + DEFAULT_SIZE*2.5, offsetY - b - DEFAULT_SIZE/2.0],
    [offsetX + a + DEFAULT_SIZE*2.5, offsetY - a - b - DEFAULT_SIZE/2.0],
    [offsetX + a + DEFAULT_SIZE*2.5 + b, offsetY - a - b - DEFAULT_SIZE/2.0],
    [offsetX + a + DEFAULT_SIZE*2.5 + b, offsetY - b - DEFAULT_SIZE/2.0],
  ]);
}


function full2D(position: number[], amplitude: number, width: number, collisions: CollisionBox[], writer: Writer) {

  const f = formula(amplitude, width, c2); 

  const b = f[1];
  const a = f[0];
  
  const offsetY = position[1] + b/2;
  const offsetX = position[0];
  
  writer.rect(offsetX, offsetY, DEFAULT_SIZE, b); 
  writer.rect(offsetX + DEFAULT_SIZE*2, offsetY, b + 2*a + DEFAULT_SIZE, b);
  writer.rect(offsetX + DEFAULT_SIZE*4 + 2*a + b, offsetY, DEFAULT_SIZE, b);

  writer.rect(offsetX + DEFAULT_SIZE*2.5 + a, offsetY + a + DEFAULT_SIZE*2.5, b, DEFAULT_SIZE);
  writer.path([
    [offsetX + a + DEFAULT_SIZE*2.5, offsetY],
    [offsetX + a + DEFAULT_SIZE*2.5, offsetY + a + DEFAULT_SIZE/2.0],
    [offsetX + a + DEFAULT_SIZE*2.5 + b, offsetY + a + DEFAULT_SIZE/2.0],
    [offsetX + a + DEFAULT_SIZE*2.5 + b, offsetY],
  ]);

  writer.rect(offsetX + DEFAULT_SIZE*2.5 + a, offsetY - a - b - DEFAULT_SIZE*1.5, b, DEFAULT_SIZE);
  writer.path([
    [offsetX + a + DEFAULT_SIZE*2.5, offsetY - b] ,
    [offsetX + a + DEFAULT_SIZE*2.5, offsetY - a - b - DEFAULT_SIZE/2.0],
    [offsetX + a + DEFAULT_SIZE*2.5 + b, offsetY - a - b - DEFAULT_SIZE/2.0],
    [offsetX + a + DEFAULT_SIZE*2.5 + b, offsetY - b],
  ]);
}


function slope72D(position: number[], amplitude: number, width: number, collisions: CollisionBox[], writer: Writer) {
  const f = formula(amplitude, width, c2); 

  const b = f[1];
  const a = f[0];
  
  const offsetY = position[1] + b/2;
  const offsetX = position[0];
  
  writer.rect(offsetX, offsetY, DEFAULT_SIZE, b); 
  writer.path([
    [offsetX + DEFAULT_SIZE*2, offsetY],
    [offsetX + DEFAULT_SIZE*2 + a*.7, offsetY],
    [offsetX + DEFAULT_SIZE*2 + a + b/2.0, offsetY - b/2.0],
    [offsetX + DEFAULT_SIZE*2 + a*.7, offsetY - b],
    [offsetX + DEFAULT_SIZE*2, offsetY - b],
  ]);

  writer.rect(offsetX + DEFAULT_SIZE*4 + 2*a + b, offsetY, DEFAULT_SIZE, b);
  writer.path([
    [offsetX + DEFAULT_SIZE*3 + a + b/2.0, offsetY - b/2.0],
    [offsetX + DEFAULT_SIZE*3 + a*1.3 + b, offsetY],
    [offsetX + DEFAULT_SIZE*3 + 2*a + b, offsetY],
    [offsetX + DEFAULT_SIZE*3 + 2*a + b, offsetY - b],
    [offsetX + DEFAULT_SIZE*3 + a*1.3 + b, offsetY - b],
  ]);

  writer.rect(offsetX + DEFAULT_SIZE*2.5 + a, offsetY + a + DEFAULT_SIZE*2.5, b, DEFAULT_SIZE);
  writer.path([
    [offsetX + a + DEFAULT_SIZE*2.5 + b/2.0, offsetY - b/2.0 + DEFAULT_SIZE/2.0],
    [offsetX + a + DEFAULT_SIZE*2.5, offsetY + a*.3 + DEFAULT_SIZE/2.0],
    [offsetX + a + DEFAULT_SIZE*2.5, offsetY + a + DEFAULT_SIZE/2.0],
    [offsetX + a + DEFAULT_SIZE*2.5 + b, offsetY + a + DEFAULT_SIZE/2.0],
    [offsetX + a + DEFAULT_SIZE*2.5 + b, offsetY + a*.3 + DEFAULT_SIZE/2.0],
  ]);

  writer.rect(offsetX + DEFAULT_SIZE*2.5 + a, offsetY - a - b - DEFAULT_SIZE*1.5, b, DEFAULT_SIZE);
  writer.path([
    [offsetX + a + DEFAULT_SIZE*2.5 + b/2.0, offsetY - b/2.0 - DEFAULT_SIZE/2.0],
    [offsetX + a + DEFAULT_SIZE*2.5, offsetY -a*.3 - b - DEFAULT_SIZE/2.0],
    [offsetX + a + DEFAULT_SIZE*2.5, offsetY - a - b - DEFAULT_SIZE/2.0],
    [offsetX + a + DEFAULT_SIZE*2.5 + b, offsetY - a - b - DEFAULT_SIZE/2.0],
    [offsetX + a + DEFAULT_SIZE*2.5 + b, offsetY - a*.3 - b - DEFAULT_SIZE/2.0],
  ]);
}


function slope2D(position: number[], amplitude: number, width: number, collisions: CollisionBox[], writer: Writer) {
  const f = formula(amplitude, width, c2); 

  const b = f[1];
  const a = f[0];
  
  const offsetY = position[1] + b/2;
  const offsetX = position[0];
  
  writer.rect(offsetX, offsetY, DEFAULT_SIZE, b); 
  writer.path([
    [offsetX + DEFAULT_SIZE*2, offsetY],
    [offsetX + DEFAULT_SIZE*2 + a + b/2.0, offsetY - b/2.0],
    [offsetX + DEFAULT_SIZE*2, offsetY - b],
  ]);

  writer.rect(offsetX + DEFAULT_SIZE*4 + 2*a + b, offsetY, DEFAULT_SIZE, b);
  writer.path([
    [offsetX + DEFAULT_SIZE*3 + a + b/2.0, offsetY - b/2.0],
    [offsetX + DEFAULT_SIZE*3 + 2*a + b, offsetY],
    [offsetX + DEFAULT_SIZE*3 + 2*a + b, offsetY - b],
  ]);

  writer.rect(offsetX + DEFAULT_SIZE*2.5 + a, offsetY + a + DEFAULT_SIZE*2.5, b, DEFAULT_SIZE);
  writer.path([
    [offsetX + a + DEFAULT_SIZE*2.5 + b/2.0, offsetY - b/2.0 + DEFAULT_SIZE/2.0],
    [offsetX + a + DEFAULT_SIZE*2.5, offsetY + a + DEFAULT_SIZE/2.0],
    [offsetX + a + DEFAULT_SIZE*2.5 + b, offsetY + a + DEFAULT_SIZE/2.0],
  ]);

  writer.rect(offsetX + DEFAULT_SIZE*2.5 + a, offsetY - a - b - DEFAULT_SIZE*1.5, b, DEFAULT_SIZE);
  writer.path([
    [offsetX + a + DEFAULT_SIZE*2.5 + b/2.0, offsetY - b/2.0 - DEFAULT_SIZE/2.0],
    [offsetX + a + DEFAULT_SIZE*2.5, offsetY - a - b - DEFAULT_SIZE/2.0],
    [offsetX + a + DEFAULT_SIZE*2.5 + b, offsetY - a - b - DEFAULT_SIZE/2.0],
  ]);
}


function angle2D(position: number[], amplitude: number, width: number, collisions: CollisionBox[],  writer: Writer) {

  const f = formula(amplitude, width, c2); 

  const b = f[1];
  const a = f[0];
  
  const offsetY = position[1] + b/2;
  const offsetX = position[0];

  const xOffsetAngle = -(a * Math.sin(20 * (Math.PI / 180.0))) / Math.sin(70 * (Math.PI / 180.0));
  
  writer.rect(offsetX, offsetY, DEFAULT_SIZE, b); 
  writer.path([
    [offsetX + DEFAULT_SIZE*2, offsetY],
    [offsetX + DEFAULT_SIZE*2 + a, offsetY],
    [offsetX + DEFAULT_SIZE*2 + a + b/2.0, offsetY - b/2.0],
    [offsetX + DEFAULT_SIZE*2 + a, offsetY - b],
    [offsetX + DEFAULT_SIZE*2, offsetY - b],
  ]);

  writer.rect(offsetX + DEFAULT_SIZE*4 + 2*a + b, offsetY, DEFAULT_SIZE, b);
  writer.path([
    [offsetX + DEFAULT_SIZE*3 + a + b/2.0, offsetY - b/2.0],
    [offsetX + DEFAULT_SIZE*3 + a + b, offsetY],
    [offsetX + DEFAULT_SIZE*3 + 2*a + b, offsetY],
    [offsetX + DEFAULT_SIZE*3 + 2*a + b, offsetY - b],
    [offsetX + DEFAULT_SIZE*3 + a + b, offsetY - b],
  ]);

  writer.rect(offsetX + DEFAULT_SIZE*2.5 + a + xOffsetAngle, offsetY + a + DEFAULT_SIZE*2.5, b, DEFAULT_SIZE);
  writer.path([
    [offsetX + a + DEFAULT_SIZE*2.5 + b/2.0, offsetY - b/2.0 + DEFAULT_SIZE/2.0],
    [offsetX + a + DEFAULT_SIZE*2.5, offsetY + DEFAULT_SIZE/2.0],
    [offsetX + a + DEFAULT_SIZE*2.5 + xOffsetAngle, offsetY + a + DEFAULT_SIZE/2.0],
    [offsetX + a + DEFAULT_SIZE*2.5 + b + xOffsetAngle, offsetY + a + DEFAULT_SIZE/2.0],
    [offsetX + a + DEFAULT_SIZE*2.5 + b, offsetY + DEFAULT_SIZE/2.0],
  ]);

  writer.rect(offsetX + DEFAULT_SIZE*2.5 + a + xOffsetAngle, offsetY - a - b - DEFAULT_SIZE*1.5, b, DEFAULT_SIZE);
  writer.path([
    [offsetX + a + DEFAULT_SIZE*2.5 + b/2.0, offsetY - b/2.0 - DEFAULT_SIZE/2.0],
    [offsetX + a + DEFAULT_SIZE*2.5, offsetY - b - DEFAULT_SIZE/2.0],
    [offsetX + a + DEFAULT_SIZE*2.5 + xOffsetAngle, offsetY - a - b - DEFAULT_SIZE/2.0],
    [offsetX + a + DEFAULT_SIZE*2.5 + b + xOffsetAngle, offsetY - a - b - DEFAULT_SIZE/2.0],
    [offsetX + a + DEFAULT_SIZE*2.5 + b, offsetY - b - DEFAULT_SIZE/2.0],
  ]);
}
