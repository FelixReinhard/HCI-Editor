import { Cell } from "./generate";

export function make_3d_mesh_visible(visible: bool, ls: Cell[]) {
  ls.forEach((elem) => {
    elem.mesh.visible = visible;
  });
}
