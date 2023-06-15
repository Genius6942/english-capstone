import { door, room } from "./room";
import { imageUrls } from "./main";
import { StaticBody } from "platjs";
import { createObject } from "./objects";
import { showCover } from "./fade";

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
  const camelCase = (str: string) => {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, "");
  };

  const doors = sources.map((source, idx) => {
    const side = idx % 2 === 0 ? "right" : "left";
    const doorWallMargin = 0;

    const x =
      (window.innerWidth / 2 - 50 - 50 - doorWallMargin) * (side === "left" ? -1 : 1);
    const y = window.innerHeight / 2 - 50 - 75 - (yGap + 150) * idx;

    const object = createObject(
      imageUrls[(camelCase(source.name) + "Object") as keyof typeof imageUrls],
      idx
    );
    const generatedDoor = door(images, player, x, y, side, async () => {
      pauseRender();
      await showCover();
      object.start();
      await room({
        images,
        charIndex: (camelCase(source.name) + "Character") as keyof typeof imageUrls,
        iconUrl: imageUrls[(camelCase(source.name) + "Icon") as keyof typeof imageUrls],
        bgImage:
          images[(camelCase(source.name) + "Background") as keyof typeof imageUrls],
        texts: source.textChunks,
        name: source.name,
        charName: source.character,
        overrides: source.overrides,
        onCollectObject: () => {
          const div = document.createElement("div");
          div.className =
            "fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center";
          div.style.backdropFilter = "blur(10px)";
          div.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
          div.style.opacity = "0";
          div.style.transition = "opacity 0.5s";
          div.style.opacity = "1";
          div.style.zIndex = (999).toString();
          object.middle();
          document.body.appendChild(div);
					
          const image = document.createElement("img");
          image.src =
            imageUrls[(camelCase(source.name) + "Image") as keyof typeof imageUrls];
          div.appendChild(image);

          const close = () => {
            window.removeEventListener("keydown", keyListener);
            div.removeEventListener("click", clickListener);
            object.end();
            div.style.opacity = "0";
            setTimeout(() => {
              div.remove();
              div.style.display = "none";
            }, 500);
          };

          const keyListener = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
              close();
            }
          };
          window.addEventListener("keydown", keyListener);
          const clickListener = close;
          div.addEventListener("click", clickListener);
        },
      });
      player.v = { x: 0, y: 0 };
      player.x =
        x +
        (side === "right" ? -1 : 1) *
          (generatedDoor.closedDoor.width / 2 + player.width / 2 + 20);
      restartRender();
      if (
        doors[idx + 1] &&
        renderer.objects.findIndex(
          (o) => o._randomId === doors[idx + 1].closedDoor._randomId
        ) !== -1
      ) {
        doors[idx + 1].open(renderer);
      }
    });

    const stairYGap = 60;
    const stairXGap = 20;
    const totalStairWidth = window.innerWidth - 100 * 2 - 50 * 2 - stairXGap;
    const totalYGap = yGap + 150 - stairYGap;
    const stairsNeeded = Math.ceil(totalYGap / stairYGap);
    const stairWidth = totalStairWidth / stairsNeeded - stairXGap;
    const stairHeight = 15;
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
