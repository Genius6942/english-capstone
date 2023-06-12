import {
  ControlledBody,
  GameObject,
  PhysicalBody,
  Renderer,
  StaticBody,
} from "platjs";

export const door = (
  images: {
    doorFull: HTMLImageElement;
    doorFullReversed: HTMLImageElement;
    doorUnlockedLeft: HTMLImageElement;
    doorUnlockedRight: HTMLImageElement;
  },
  player: ControlledBody,
  x: number,
  y: number,
  side: "left" | "right",
  onActivate: (() => void) | (() => Promise<void>)
) => {
  let activated = false;
  const width = 100,
    height = 150;
  const inner = new GameObject({
    x: x + (side === "left" ? width / 4 : -width / 4),
    y: y,
    width: side === "left" ? -width / 2 : width / 2,
    height: height,
    layer: 0,
    image: images.doorUnlockedLeft,
  });
  const outer = new GameObject({
    x: x + (side === "left" ? -width / 4 : width / 4),
    y: y,
    width: side === "left" ? width / 2 : -width / 2,
    height: height,
    layer: 2,
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
    parts: [inner, outer],
    open: (renderer: Renderer) => {
      renderer.destroy(closedDoor);
      renderer.add(inner);
      renderer.add(outer);
    },
    update: () => {
      // draw first
      if (activated) return;
      // if player is completely inside the outer door fire the onActivate callback
      if (
        player.x - Math.abs(player.width) / 2 >=
          outer.x - Math.abs(outer.width) / 2 &&
        player.x + Math.abs(player.width) / 2 <=
          outer.x + Math.abs(outer.width) / 2 &&
        player.y - Math.abs(player.height) / 2 >=
          outer.y - Math.abs(outer.height) / 2 &&
        player.y + Math.abs(player.height) / 2 <=
          outer.y + Math.abs(outer.height) / 2
      ) {
        activated = true;
        onActivate();
      }
    },
  };
};

// type T is imported images from main.ts
type Images = {
  [k in keyof Awaited<typeof import("./main")>["images"]]: HTMLImageElement;
};

export const room = ({
  images,
  charIndex,
  iconIndex,
}: {
  images: Images;
  charIndex: keyof Images;
  iconIndex: keyof Images;
}) =>
  new Promise<void>((resolve) => {
    try {
      const renderer = new Renderer()
        .mount(document.body)
        .enableFixedPosition()
        .enablePhysics({})
        .resize();

      renderer.style.zIndex = "1000000";

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
          height: window.innerHeight - doorGapHeight,
          width: 100,
          color: "black",
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
      const characterHeight = 90;
      const characterWallMargin = 50;
      const characterWidth =
        images[charIndex].naturalWidth *
        (characterHeight / images[charIndex].naturalHeight);
      console.log(characterHeight, characterWidth);
      const character = renderer.add(
        new PhysicalBody({
          x: window.innerWidth / 2 - 50 - characterWallMargin - characterWidth / 2,
          y: window.innerHeight / 2 - 50 - characterHeight / 2,
          width: characterWidth,
          height: characterHeight,
          image: images[charIndex],
          // color: "black",
        })
      );

      console.log(
        {
          x:
            window.innerWidth / 2 -
            50 -
            characterWallMargin -
            characterWidth / 2,
          y: window.innerHeight / 2 - 50 - characterHeight / 2,
          width: characterWidth,
          height: characterHeight,
          image: images[charIndex],
        },
        character
      );

      renderer.beforeRender(() => {
        renderer.camera.pos.x = 0;
        renderer.camera.pos.y = Math.min(0, renderer.camera.pos.y);
      });

      let done = false;

      const animationLoop = () => {
        if (done) return;
        // update physics
        renderer.update();

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
    } catch (e) {
      console.error(e);
    }
  });
