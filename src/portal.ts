import { ControlledBody, GameObject } from "platjs";
import { hideCover, showCover } from "./fade";
import type { createObject } from "./objects";
import { Images, room } from "./room";
import { imageUrls } from "./main";
import sources from "./sources";

export const portal = ({
  x,
  y,
  width = 70,
  images,
  objectOptions,
}: {
  x: number;
  y: number;
  width?: number;
  images: {
    portal1: HTMLImageElement;
    portal2: HTMLImageElement;
    portal3: HTMLImageElement;
    portal4: HTMLImageElement;
  };
  objectOptions?: Partial<ConstructorParameters<typeof GameObject>[0]>;
}) => {
  const height = width * 2.364;

  const totalAnimationLength = 20;
  const numAnimationSteps = 4;
  let animationStep = 0;

  const obj = new GameObject({
    x,
    y,
    width,
    height,
    image: images.portal1,
    ...objectOptions,
  });

  return {
    object: obj,
    update: (body: GameObject, player: ControlledBody) => {
      animationStep = (animationStep + 1) % totalAnimationLength;
      const step: 1 | 2 | 3 | 4 = (Math.floor(
        animationStep / (totalAnimationLength / numAnimationSteps)
      ) + 1) as 1 | 2 | 3 | 4;
      body.image = images[`portal${step}`];
      if (body.collides(player)) {
      }
    },
  };
};

export const doPortal = async (
  objects: ReturnType<typeof createObject>[],
  images: Images,
  pauseRender: () => void,
  restartRender: () => void
) => {
  await showCover();
  pauseRender();
  const img = document.createElement("img");
  img.src = "assets/portal/gif.webp";
  const outerImg = document.createElement("div");
  outerImg.style.backgroundPosition = "center";
  outerImg.style.position = "fixed";
  outerImg.style.top =
    outerImg.style.left =
    outerImg.style.right =
    outerImg.style.bottom =
      "0";
  img.style.borderRadius = "9999px";
  outerImg.style.zIndex = "988";
  document.body.appendChild(outerImg);
  const inner = document.createElement("div");
  inner.style.position = "relative";
  inner.style.width = "100vw";
  inner.style.height = "100vh";
  inner.style.display = "flex";
  inner.style.justifyContent = "center";
  inner.style.alignItems = "center";
  const bg = document.createElement("div");
  bg.style.position = "absolute";
  bg.style.top = bg.style.left = bg.style.right = bg.style.bottom = "0";
  bg.style.backgroundImage = `url(${img.src})`;
  bg.style.backgroundSize = "cover";
  bg.style.backgroundPosition = "center";
  bg.style.zIndex = "-1";
  bg.style.filter = "blur(10px)";
  inner.appendChild(bg);
  inner.appendChild(img);
  outerImg.appendChild(inner);

  await hideCover();

  const numObjects = objects.length;
  const totalTime = 4;

  for (const { object } of objects.map((object, idx) => ({ object, idx }))) {
    object.final();
    // if (idx !== numObjects - 1) {
    await new Promise((resolve) => setTimeout(resolve, (totalTime / numObjects) * 1000));
    // }
  }
  await showCover();
  document.body.removeChild(outerImg);
  (document.querySelector("#object-bg") as HTMLDivElement).remove();

  await room({
    end: true,
    images,
    charIndex: "playerLeftStandstill",
    iconUrl: imageUrls["playerLeftStandstill"],
    bgImage: "" as unknown as HTMLImageElement,
    texts: [
      "So, what do all these stories have in common?",
      "The common theme that runs through " +
        sources
          .slice(0, sources.length - 1)
          .map((source) => source.name)
          .join(", ") +
        ", and Adventures of Huckleberry Finn is that they all show the importance of pushing past cultural boundaries with our own decisions. They help the readers understand how rather than succumbing to societal norms, we should always do what is best for us and the people around us. Each stories presented in this game points towards one part of culture where this can occur, whether it be individually, in your community, or in the world.",
      "I hope you enjoyed this game and were able to learn something new about stories from it! Thank you for playing!",
    ],
    charName: "the creator",
  });

  await showCover();
  restartRender();
  await hideCover();
  return;
};
