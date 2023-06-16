import { door, room } from "./room";
import { imageUrls } from "./main";
import { StaticBody } from "platjs";
import { createObject, createObjectBg } from "./objects";
import { showCover } from "./fade";
import { portal as createPortal } from "./portal";
import { closeTypewriter, openTypewriter, writeTypewriter } from "./typewriter";
import updateInstructions from "./instructions";

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
  const yGap = 250;

  const stairs: StaticBody[] = [];
  const camelCase = (str: string) => {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, "");
  };
  const keys: ReturnType<typeof createObject>[] = [];

  createObjectBg(sources.length);

  const doors = sources.map((source, idx) => {
    const side = idx % 2 === 0 ? "right" : "left";
    const doorWallMargin = 0;

    const x =
      (window.innerWidth / 2 - 50 - 50 - doorWallMargin) * (side === "left" ? -1 : 1);
    const y = window.innerHeight / 2 - 50 - 75 - (yGap + 150) * idx;

    const object = createObject(
      imageUrls[(camelCase(source.name) + "Object") as keyof typeof imageUrls],
      idx,
      sources.length
    );
    keys.push(object);
    const generatedDoor = door(images, player, x, y, side, async () => {
      pauseRender();
      await showCover();
      object.start();
      await room({
        images,
        charIndex: (camelCase(source.name) + "Character") as keyof typeof imageUrls,
        iconUrl: imageUrls[(camelCase(source.name) + "Book") as keyof typeof imageUrls],
        bgImage:
          images[(camelCase(source.name) + "Background") as keyof typeof imageUrls],
        texts: source.textChunks,
        name: source.name,
        charName: source.character,
        overrides: source.overrides,
        onCollectObject: () => {
          const div = document.createElement("div");
          div.className =
            "fixed top-0 left-0 right-0 bottom-0 flex flex-col justify-center items-center";
          div.style.backdropFilter = "blur(10px)";
          div.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
          div.style.opacity = "0";
          div.style.transition = "opacity 0.5s";
          div.style.opacity = "1";
          div.style.zIndex = (10000).toString();
          object.middle();
          document.body.appendChild(div);

          const image = document.createElement("img");
          image.style.cssText = "transition: all .2s ease";
          image.src =
            imageUrls[(camelCase(source.name) + "Image") as keyof typeof imageUrls];
          div.appendChild(image);
          const description = document.createElement("div");
          description.className =
            "text-white text-xl mt-4 mx-[200px] text-center text-xl font-bold rounded-xl bg-[rgba(0,0,0,0.5)], px-4 py-2 backdrop-blur-2xl";
          description.innerText = source.imageExplination;
          div.appendChild(description);
          image.style.maxHeight =
            (window.innerHeight - description.offsetHeight - 100).toString() + "px";
          const btn = document.createElement("button");
          btn.className = "w-0 h-0 focus-visible:outline-none";
          div.appendChild(btn);
          btn.focus();

          const close = () => {
            window.removeEventListener("keydown", keyListener);
            div.removeEventListener("click", clickListener);
            (document.querySelector("#object-bg") as HTMLDivElement).style.opacity = "1";
            object.end();
            div.style.opacity = "0";
            setTimeout(() => {
              div.remove();
              div.style.display = "none";
            }, 500);
          };

          const keyListener = (e: KeyboardEvent) => {
            if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopImmediatePropagation();
              e.stopPropagation();
              close();
            }
          };
          setTimeout(() => btn.addEventListener("keydown", keyListener), 0);
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

      updateInstructions(
        `Move ${
          side === "right" ? "left" : "right"
        } and jump to climb the stairs and reach the next room, which should be unlocked. Having trouble? Simply hold the ${
          side === "right" ? "left" : "right"
        } arrow key and press the up arrow key to jump when you hit a wall.`
      );
      generatedDoor.doorFloor.width += 100;

      if (idx === 0) {
        await openTypewriter();
        await writeTypewriter({
          text: "To continue, go up the stairs on the left and continue to the next floor, which has been unlocked. After that, keep going up to the end!",
        });
        await closeTypewriter();
      }
    });

    const stairYGap = 60;
    const stairXGap = 20;
    const totalStairWidth = window.innerWidth - 100 * 2 - 50 * 2 - stairXGap;
    const totalYGap = yGap + 150 - stairYGap - 50;
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

  const portal = createPortal({
    x: (sources.length % 2 === 0 ? 1 : -1) * (window.innerWidth / 2 - 50 - 50),
    y: window.innerHeight / 2 - 50 - (yGap + 150) * sources.length,
    // x: 0,
    // y: 0,
    images,
    objectOptions: { layer: 1 },
  });

  return {
    objects,
    keys,
    doors,
    stairs,
    portal,
  };
};
