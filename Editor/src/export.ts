import { Cell, formula, c1, c2, DEFAULT_SIZE } from "./generate";
import { DXFWriter, SvgWriter, Writer } from "./svg_writer";
import { CollisionBox } from "./collision.ts";

const DEF_SIZE = [500, 500];

export function export_cells(cells: Cell[], format: string) {
  const writer: Writer = format == "svg" ? new SvgWriter(DEF_SIZE[0], DEF_SIZE[1]) : new DXFWriter();
  for (const cell of cells) {
    switch (cell.type) {
      case "basic1d":
        basic1D([cell.position.x + DEF_SIZE[0]/2.0, (cell.position.z + DEF_SIZE[1]/2.0)], cell.amplitude, cell.width, cell.coll, writer);
        break;
      case "basic2d":
        basic2D([cell.position.x + DEF_SIZE[0]/2.0, (cell.position.z + DEF_SIZE[1]/2.0)], cell.amplitude, cell.width, writer);
        break;
      case "chained_basic_1d":
        basic1d_chained([cell.position.x + DEF_SIZE[0]/2.0, (cell.position.z + DEF_SIZE[1]/2.0)], cell.amplitude, cell.width, writer, cell.meta_data);
        break;
      default:
        break;
    }
  }
  writer.save();
}

function basic1d_chained(position: number[], amplitude: number, width: number, writer: Writer, data: string[]) {
  const f = formula(amplitude, width, c1); 

  const b = f[1];
  const a = f[0];

  writer.rect(position[0], position[1], DEFAULT_SIZE, b);
  writer.rect(position[0] + DEFAULT_SIZE*2, position[1], a, b);
  writer.rect(position[0] + DEFAULT_SIZE*3 + a, position[1], a, b);

  var xOffset = DEFAULT_SIZE*4 + a * 2;

  for (let i = 0; i < data.length; i++) {
    if (data[i] == "t1") {
      writer.rect(position[0] + xOffset, position[1], DEFAULT_SIZE, b);
      writer.rect(position[0] + xOffset + DEFAULT_SIZE*2, position[1], a, b);
      writer.rect(position[0] + xOffset + DEFAULT_SIZE*3 + a, position[1], a, b);

      xOffset += 2*a + 4*DEFAULT_SIZE;
    } else if (data[i] == "t2") {
      writer.rect(position[0] + xOffset, position[1], a, b);
      xOffset += a + DEFAULT_SIZE;
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


function basic2D(position: number[], amplitude: number, width: number, writer: SvgWriter) {

  const f = formula(amplitude, width, c2); 

  const b = f[1];
  const a = f[0];
  
  const offsetY = position[1] - b - DEFAULT_SIZE/2.0;
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
