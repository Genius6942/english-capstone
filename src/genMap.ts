import { door, room } from "./room";
import { imageUrls } from "./main";
import { StaticBody } from "platjs";

export default (
  sources: typeof import("./sources").default,
  images: {
    [k in keyof typeof imageUrls]: HTMLImageElement;
  },
  player: import("platjs").ControlledBody,
  pauseRender: () => void,
  restartRender: () => void,
  renderer: import("platjs").Renderer
) => {
  const yGap = 200;

  const stairs: StaticBody[] = [];

  const doors = sources.map((source, idx) => {
    const side = idx % 2 === 0 ? "right" : "left";
    const doorWallMargin = 0;

    const x =
      (window.innerWidth / 2 - 50 - 50 - doorWallMargin) * (side === "left" ? -1 : 1);
    const y = window.innerHeight / 2 - 50 - 75 - (yGap + 150) * idx;

    const generatedDoor = door(images, player, x, y, side, async () => {
      pauseRender();
      await room({
        images,
        charIndex: (source.name.toLowerCase() + "Character") as keyof typeof imageUrls,
        iconUrl:
          imageUrls[(source.name.toLowerCase() + "Icon") as keyof typeof imageUrls],
        texts: source.textChunks,
      });
      player.v = { x: 0, y: 0 };
      player.x =
        x +
        (side === "right" ? -1 : 1) *
          (generatedDoor.closedDoor.width / 2 + player.width / 2 + 20);
      restartRender();
      if (doors[idx + 1] && renderer.objects.findIndex((o) => o._randomId === doors[idx + 1].closedDoor._randomId) !== -1) {
        doors[idx + 1].open(renderer);
      }
    });

    const stairYGap = 60;
    const stairXGap = 20;
    const totalStairWidth = window.innerWidth - 100 * 2 - 50 * 2 - stairXGap;
    const totalYGap = yGap + 150 - stairYGap;
    const stairsNeeded = Math.ceil(totalYGap / stairYGap);
    const stairWidth = totalStairWidth / stairsNeeded - stairXGap;
    const stairHeight = 20;
    const generatedStairs = Array.from({ length: stairsNeeded }).map((_, idx) => {
      const stair = new StaticBody({
        x:
          x +
          (side === "right" ? -1 : 1) *
            (doorWallMargin +
              50 +
              100 +
              stairXGap / 2 +
              stairWidth / 2 +
              (stairWidth + stairXGap) * idx),
        y: y + 50 - (stairYGap / 2 + stairHeight / 2) - idx * stairYGap,
        width: stairWidth,
        height: stairHeight,
        color: "black",
      });
      return stair;
    });

    stairs.push(...generatedStairs);

    return generatedDoor;
  });

  const objects = doors.reduce((acc, door) => {
    acc.push(door.closedDoor);
    acc.push(door.doorCeiling);
    acc.push(door.doorFloor);
    return acc;
  }, [] as import("platjs").GameObject[]);

  return {
    objects,
    doors,
    stairs,
  };
};
