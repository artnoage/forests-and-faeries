// Presentation identity only. No hit points, collision or outcomes are decided here.
export function objectForProp(prop, objects = []) {
  return objects.find(object => object.id === prop.id)
    || objects.find(object => object.kind === prop.kind && object.x === prop.x && object.y === prop.y);
}

export function footprintContains(object, x, y) {
  return x >= object.x && y >= object.y
    && x < object.x + (object.width || 1) && y < object.y + (object.depth || 1);
}
