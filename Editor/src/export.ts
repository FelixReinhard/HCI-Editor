import { Cell, formula, c1, c2, DEFAULT_SIZE } from "./generate";
import { SvgWriter } from "./svg_writer";

const DEF_SIZE = [500, 500];

export function export_cells(cells: Cell[]) {
  const writer: SvgWriter = new SvgWriter(DEF_SIZE[0], DEF_SIZE[1]);
  for (const cell of cells) {
    switch (cell.type) {
      case "basic1d":
        basic1D([cell.position.x, cell.position.z], cell.amplitude, cell.width, writer);
        break;
      default:
        break;
    }
  }
  writer.save();
}

function basic1D(position: number[], amplitude: number, width: number, writer: SvgWriter) {
  const f = formula(amplitude, width, c1); 

  const b = f[1];
  const a = f[0];

  writer.rect(position[0], position[1], DEFAULT_SIZE, b);
  writer.rect(position[0] + DEFAULT_SIZE*2, position[1], a, b);
  writer.rect(position[0] + DEFAULT_SIZE*3 + a, position[1], a, b);
  writer.rect(position[0] + DEFAULT_SIZE*4 + 2*a , position[1], DEFAULT_SIZE, b);
}

function basic2D(position: number[], amplitude: number, width: number, writer: SvgWriter) {

}
