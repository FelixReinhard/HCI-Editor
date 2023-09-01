import { Cell } from "./generate";

const types: {[key: string]: string} = {
  "basic1d": "t1",
  "basic1d_m": "t2",
  "right1d": "t3",
  "full1d": "t4",
  "slope71d": "t5",
  "slope1d": "t6",
  "angle1d": "t7",
  "basic2d": "t8",
  "basic2d_m" : "t9",
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
