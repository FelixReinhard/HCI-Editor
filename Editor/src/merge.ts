import { Cell } from "./generate";

export function merge_1d(cell1: Cell, cell2: Cell, cells: Cell[]) {
  cell2.type = "chained_basic_1d";
  // TODO change meta data to dict with types array
  cell2.meta_data = ["t1"];
  cell2.regenerate(cell1.amplitude, cell1.width);
}

export function merge_1d_chain(cell1: Cell, cell2: Cell, cells: Cell[]) {
  cell2.type = "chained_basic_1d";
  cell2.meta_data.push("t1");
  cell2.regenerate(cell1.amplitude, cell1.width);
}

export function merge_1d_chain_left(cell1: Cell, cell2: Cell, cells: Cell[]) {
  cell2.type = "chained_basic_1d";
  cell2.meta_data.unshift("t1");
  cell2.regenerate(cell1.amplitude, cell1.width);
}

export function merge_1d_t2(cell1: Cell, cell2: Cell, cells: Cell[]) {
  cell2.type = "chained_basic_1d";
  cell2.meta_data = ["t2"];
  cell2.regenerate(cell1.amplitude, cell1.width);
}
