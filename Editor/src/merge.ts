import { Cell } from "./generate";

export function merge_1d(cell1: Cell, cell2: Cell, cells: Cell[]) {
  cell2.type = "chained_basic_1d";
  // TODO change meta data to dict with types array
  cell2.meta_data = ["t1"];
  cell2.regenerate(cell2.amplitude, cell2.width, cells);
}

const types = {
  "basic1d": "t1",
  "basic1d_m": "t2",
  "right1d": "t3",
  "full1d": "t4",
  "slope71d": "t5",
  "slope1d": "t6",
  "angle1d": "t7",
  "basic2d": "t8",
};

export function merge_1d_all(cell1: Cell, cell2: Cell, cells: Cell[]) {
  let data = [];
  if (cell1.type == "chained_basic_1d") data.push(...cell1.meta_data);
  else data.push(types[cell1.type]);

  if (cell2.type == "chained_basic_1d") data.push(...cell2.meta_data);
  else data.push(types[cell2.type]);
  

  cell1.type = "chained_basic_1d";
  cell1.meta_data = data;
  cell1.regenerate(cell1.amplitude, cell1.width, cells);
}

export function merge_2d_all(cell1: Cell, cell2: Cell, cells: Cell[]) {
  let data = [];
  if (cell1.type == "chained_basic_2d") data.push(...cell1.meta_data);
  else data.push(types[cell1.type]);

  if (cell2.type == "chained_basic_2d") data.push(...cell2.meta_data);
  else data.push(types[cell2.type]);
  
  cell1.type = "chained_basic_2d";
  cell1.meta_data = data;
  cell1.regenerate(cell1.amplitude, cell1.width, cells);
}

export function merge_1d_chain(cell1: Cell, cell2: Cell, cells: Cell[]) {
  cell2.type = "chained_basic_1d";
  cell2.meta_data.push("t1");
  cell2.regenerate(cell2.amplitude, cell2.width, cells);
}

export function merge_1d_chain_left(cell1: Cell, cell2: Cell, cells: Cell[]) {
  cell2.type = "chained_basic_1d";
  cell2.meta_data.unshift("t1");
  cell2.regenerate(cell2.amplitude, cell2.width, cells);
}

export function merge_1d_t2(cell1: Cell, cell2: Cell, cells: Cell[]) {
  cell2.type = "chained_basic_1d";
  cell2.meta_data = ["t2"];
  cell2.regenerate(cell2.amplitude, cell2.width, cells);
}
