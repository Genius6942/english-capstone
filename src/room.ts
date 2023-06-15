import { ControlledBody, GameObject, Renderer, StaticBody } from "platjs";
import { closeTypewriter, openTypewriter, writeTypewriter } from "./typewriter";
import { hideCover, showCover } from "./fade";

export const door = (
  images: {
    doorFull: HTMLImageElement;
    doorFullReversed: HTMLImageElement;
    doorUnlockedLeft: HTMLImageElement;
    doorUnlockedLeftReversed: HTMLImageElement;
    doorUnlockedRight: HTMLImageElement;
  },
  player: ControlledBody,
  x: number,
  y: number,
  side: "left" | "right",
  onActivate: (() => void) | (() => Promise<void>)
) => {
  // let activated = false;
  const width = 100,
    height = 150;
  const inner = new GameObject({
    x: x + (side === "left" ? width / 4 : -width / 4),
    y: y,
    width: side === "left" ? -width / 2 : width / 2,
    height: height,
    layer: 0,
    image: side === "right" ? images.doorUnlockedLeft : images.doorUnlockedLeftReversed,
  });
  const outer = new GameObject({
    x: x + (side === "left" ? -width / 4 : width / 4),
    y: y,
    width: side === "left" ? width / 2 : -width / 2,
    height: height,
    layer: 3,
    image: images.doorUnlockedRight,
  });

  const closedDoor = new StaticBody({
    x: x,
    y: y,
    width: width,
    height: height,
    layer: 0,
    image: side === "left" ? images.doorFull : images.doorFullReversed,
  });

  const doorFloor = new StaticBody({
    x: x,
    y: y + height / 2 + 5,
    width: width * 2,
    height: 10,
    layer: 0,
    color: "black",
  });

  return {
    closedDoor,
    doorCeiling: new StaticBody({
      x: x,
      y: y - height / 2,
      width: width,
      height: 10,
      layer: 0,
      color: "transparent",
    }),
    doorFloor,
    parts: [inner, outer],
    open: (renderer: Renderer) => {
      renderer.destroy(closedDoor);
      renderer.add(inner);
      renderer.add(outer);
    },
    update: () => {
      // draw first
      // if (activated) return;
      // if player is completely inside the outer door fire the onActivate callback
      if (
        player.x - Math.abs(player.width) / 2 >= outer.x - Math.abs(outer.width) / 2 &&
        player.x + Math.abs(player.width) / 2 <= outer.x + Math.abs(outer.width) / 2 &&
        player.y - Math.abs(player.height) / 2 >= outer.y - Math.abs(outer.height) / 2 &&
        player.y + Math.abs(player.height) / 2 <= outer.y + Math.abs(outer.height) / 2
      ) {
        // activated = true;
        onActivate();
      }
    },
  };
};

// type T is imported images from main.ts
export type Images = {
  [k in keyof Awaited<typeof import("./main")>["imageUrls"]]: HTMLImageElement;
};

/**
 * By Ken Fyrstenberg Nilsen
 *
 * drawImageProp(context, image [, x, y, width, height [,offsetX, offsetY]])
 *
 * If image and context are only arguments rectangle will equal canvas
 */
// @ts-ignore
function drawImageProp(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x?: number,
  y?: number,
  w?: number,
  h?: number,
  offsetX?: number,
  offsetY?: number
) {
  if (arguments.length === 2) {
    x = y = 0;
    w = ctx.canvas.width;
    h = ctx.canvas.height;
  }

  // default offset is center
  offsetX = typeof offsetX === "number" ? offsetX : 0.5;
  offsetY = typeof offsetY === "number" ? offsetY : 0.5;

  // keep bounds [0.0, 1.0]
  if (offsetX < 0) offsetX = 0;
  if (offsetY < 0) offsetY = 0;
  if (offsetX > 1) offsetX = 1;
  if (offsetY > 1) offsetY = 1;

  var iw = img.width,
    ih = img.height,
    //@ts-ignore
    r = Math.min(w / iw, h / ih),
    nw = iw * r, // new prop. width
    nh = ih * r, // new prop. height
    cx,
    cy,
    cw,
    ch,
    ar = 1;

  // decide which gap to fill
  // @ts-ignore
  if (nw < w) ar = w / nw;
  // @ts-ignore
  if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh; // updated
  nw *= ar;
  nh *= ar;

  // calc source rectangle
  // @ts-ignore
  cw = iw / (nw / w);
  // @ts-ignore
  ch = ih / (nh / h);

  cx = (iw - cw) * offsetX;
  cy = (ih - ch) * offsetY;

  // make sure source rectangle is valid
  if (cx < 0) cx = 0;
  if (cy < 0) cy = 0;
  if (cw > iw) cw = iw;
  if (ch > ih) ch = ih;

  // fill image in dest. rectangle
  // @ts-ignore
  ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
}
export function room({
  images,
  charIndex,
  iconUrl,
  // @ts-ignore
  bgImage,
  texts,
  name,
  end = false,
  charName,
  onCollectObject,
  overrides = {},
}: {
  end?: boolean;
  images: Images;
  charIndex: keyof Images;
  iconUrl: string;
  bgImage: HTMLImageElement;
  name?: string;
  charName: string;
  texts: string[];
  onCollectObject?: () => void;
  overrides?: Partial<{ charHeight: number }>;
}) {
  return new Promise<void>(async (resolve) => {
    try {
      const renderer = new Renderer()
        .mount(document.body)
        .enableFixedPosition()
        .enablePhysics({})
        .resize();

      // code below doesnt work smh
      // renderer.style.backgroundImage = "url(" + bgUrl + ")";
      // renderer.style.backgroundSize = "cover";

      renderer.style.zIndex = "10";

      renderer.style.backgroundColor = "white";

      const playerState = {
        dir: 1,
        moving: false,
        animation: 1,
      };
      const playerAnimationLength = 10;

      const player = new ControlledBody({
        x: -window.innerWidth / 2 + 50 + 30 / 2 + 50,
        y: window.innerHeight / 2 - 50 - 90 / 2,
        width: 30,
        height: 90,
        layer: 1,
        color: "blue",
        update: (body) => {
          playerState.animation =
            (playerState.animation + 1) % (playerAnimationLength * 2);
          if (body.v.x > 0) {
            playerState.dir = 1;
            playerState.moving = true;
          } else if (body.v.x < 0) {
            playerState.dir = -1;
            playerState.moving = true;
          } else {
            playerState.moving = false;
          }

          if (!player.isOnBody) {
            if (playerState.dir === 1) {
              body.image = images.playerRightStandstill;
            } else {
              body.image = images.playerLeftStandstill;
            }
          } else {
            if (!playerState.moving) {
              if (playerState.dir === 1) {
                body.image = images.playerRightStandstill;
              } else {
                body.image = images.playerLeftStandstill;
              }
            } else {
              if (playerState.dir === 1) {
                if (playerState.animation < playerAnimationLength) {
                  body.image = images.playerRightWalk1;
                } else {
                  body.image = images.playerRightWalk2;
                }
              } else {
                if (playerState.animation < playerAnimationLength) {
                  body.image = images.playerLeftWalk1;
                } else {
                  body.image = images.playerLeftWalk2;
                }
              }
            }
          }
        },
      });

      renderer.add(player);

      // enable keyboard controls
      player.bindKeyboardControls({ spaceJump: false });

      // lock the camera to the player (player st	ays at center of the screen)
      renderer.camera.lock(player, { minXSpace: 0, minYSpace: 0 });

      const doorGapHeight = 200;

      renderer.add(
        new StaticBody({
          x: 0,
          y: window.innerHeight / 2,
          width: window.innerWidth * 2,
          height: 100,
          color: "black",
        })
      );
      // walls on the sides
      renderer.add(
        new StaticBody({
          x: -window.innerWidth / 2,
          y: -doorGapHeight,
          height: end ? 10 ** 6 : window.innerHeight - doorGapHeight,
          width: 100,
          color: "black",
          layer: 1,
        })
      );
      renderer.add(
        new StaticBody({
          x: window.innerWidth / 2,
          y: 0,
          height: 10 ** 6,
          width: 100,
          color: "black",
        })
      );

      const door = renderer.add(
        new StaticBody({
          x: -window.innerWidth / 2,
          y: window.innerHeight / 2 - 75 - doorGapHeight / 2,
          width: 100,
          height: doorGapHeight + 50,
          color: "gray",
        })
      );

      const characterHeight = overrides.charHeight || 120;
      const characterWallMargin = player.width - 1;
      const characterWidth =
        images[charIndex].naturalWidth *
        (characterHeight / images[charIndex].naturalHeight);
      const character = renderer.add(
        new StaticBody({
          x: window.innerWidth / 2 - 50 - characterWallMargin - characterWidth / 2,
          y: window.innerHeight / 2 - 50 - characterHeight / 2,
          width: characterWidth,
          height: characterHeight,
          image: images[charIndex],
          // color: "black",
        })
      );

      let speaking = false;
      let spoken = false;

      const speakingListener = async (e: KeyboardEvent) => {
        if (e.key === " ") {
          speaking = true;
          withinRange = false;
          window.removeEventListener("keydown", speakingListener);
          (document.querySelector("#caninteract") as HTMLDivElement).classList.add(
            "hidden"
          );
          openTypewriter({ image: iconUrl, title: name });
          for (const text of texts) {
            await writeTypewriter({ text });
          }
          closeTypewriter();
          !end && onCollectObject && onCollectObject();
          speaking = false;
          spoken = true;

          // renderer.destroy(door);
        }
      };

      let withinRange = false;
      const requiredRange = 20;
      const updateRange = () => {
        if (speaking) return;
        // x range indluding width of player and character
        const range =
          Math.abs(player.x - character.x) - (player.width + character.width) / 2;

        if (range < requiredRange !== withinRange) {
          if (range < requiredRange) {
            (document.querySelector("#caninteract") as HTMLDivElement).classList.remove(
              "hidden"
            );
            (document.querySelector("#caninteract") as HTMLDivElement).innerHTML =
              "Press space to interact with " + charName + (end ? "" : " from " + name);
            window.addEventListener("keydown", speakingListener);
            withinRange = true;
          } else {
            (document.querySelector("#caninteract") as HTMLDivElement).classList.add(
              "hidden"
            );
            (document.querySelector("#caninteract") as HTMLDivElement).innerHTML =
              "Press space to interact";
            window.removeEventListener("keydown", speakingListener);
            withinRange = false;
          }
        }
      };

      renderer.beforeRender(() => {
        renderer.camera.pos.x = 0;
        renderer.camera.pos.y = Math.min(0, renderer.camera.pos.y);
        // drawImageProp(renderer.ctx, bgImage)
      });

      const animationLoop = async () => {
        if (spoken && player.x + player.width / 2 < -window.innerWidth / 2 - 50) {
          await showCover();
          setTimeout(() => {
            hideCover({});
          }, 10);
          renderer.remove();
          resolve();
          return;
        }
        // update physics
        renderer.update();
        spoken && door.y--;

        updateRange();

        // respawn player if needed
        if (player.y - player.height / 2 > renderer.height) {
          player.v.y = 0;
          player.v.x = 0;
          player.x = 30;
          player.y = 30;
        }

        // draw everything
        renderer.render();
        requestAnimationFrame(animationLoop);
      };

      requestAnimationFrame(animationLoop);

      setTimeout(hideCover, 10);
    } catch (e) {
      console.error(e);
    }
  });
}
