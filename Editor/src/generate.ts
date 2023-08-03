import * as Three from 'three';


//
export function generate_rect(width: number, height: number): Three.Geometry {
  
  const vertices = [
    0, 0, 0,
    width, 0, 0,
    0, 0, height,

    width, 0, 0,
    width, 0, height,
    0, 0, height,
  ]

  const verticesFloat32Array = new Float32Array(vertices);

  // Create the BufferGeometry
  const geometry = new Three.BufferGeometry();

  // Set the custom vertex attribute 'position'
  const positionAttribute = new Three.BufferAttribute(verticesFloat32Array, 3);
  geometry.setAttribute('position', positionAttribute);
  return geometry;
}

export function generate_object(geometry: Three.Geometry, color: Three.Color): PlacedObject {
  const material = new Three.MeshBasicMaterial( { color: color} );
  const mesh = new Three.Mesh( geometry, material );
  mesh.rotateX(-Math.PI )
  return new PlacedObject(mesh, new Three.Vector3(0, 0, 0));
}

export class PlacedObject {
  mesh: Three.Mesh;
  position: Three.Vector3;

  constructor(geometry: Three.Mesh, position: Three.Vector3) {
    this.mesh = geometry;
    this.position = position;
  }

}
