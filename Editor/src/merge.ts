import { Cell } from "./generate";

export function merge_1d(cell1: Cell, cell2: Cell, cells: Cell[]) {
  cell2.type = "chained_basic_1d";
  cell2.meta_data = ["t1"];
  cell2.regenerate(cell1.amplitude, cell1.width);
}
