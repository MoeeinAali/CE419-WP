import { type CollisionDetection, closestCorners } from "@dnd-kit/core";
import { arraySwap } from "@dnd-kit/sortable";

export const detectCollision: CollisionDetection = (args) => {
  return args.active.data.current!.isList
    ? detectListCollision(args)
    : detectItemCollision(args);
};

const detectListCollision: CollisionDetection = (args) => {
  const pointerX = args.pointerCoordinates!.x;

  const containers = args.droppableContainers.filter(
    (container) => container.data.current!.isList,
  );

  let minDistance = Number.POSITIVE_INFINITY;
  let closestContainer = containers[0];

  containers.forEach((container) => {
    const distance = Math.abs(pointerX - container.rect.current!.left);

    if (distance < minDistance) {
      minDistance = distance;
      closestContainer = container;
    }
  });

  return [{ id: closestContainer.id }];
};

const detectItemCollision: CollisionDetection = (args) => {
  const collisions = closestCorners(args);

  if (collisions.length < 2) {
    return collisions;
  }

  if (collisions[0].data?.value !== collisions[1].data?.value) {
    return collisions;
  }

  if (collisions[0].id < collisions[1].id) {
    return collisions;
  }

  return arraySwap(collisions, 0, 1);
};
