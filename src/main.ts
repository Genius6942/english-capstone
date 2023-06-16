import "./style.css";
import { ControlledBody, StaticBody, Renderer, loadImages } from "platjs";
import { closeTypewriter, openTypewriter, writeTypewriter } from "./typewriter";
import genMap from "./genMap";
import sources from "./sources";
import { doPortal } from "./portal";

// Create a renderer
// This handles physics and rendering for you.
const renderer = new Renderer()
  .mount(document.body)
  .enableFixedPosition()
  .enablePhysics({})
  .resize();

renderer.style.backgroundColor = "white";

const playerState = {
  dir: 1,
  moving: false,
  animation: 1,
};
const playerAnimationLength = 10;

export const imageUrls = {
  // big: "https://i.imgur.com/FX1HVet.png",
  playerLeftStandstill: "/assets/player/player_left_standstill.png",
  playerRightStandstill: "/assets/player/player_right_standstill.png",
  playerLeftWalk1: "/assets/player/player_left_walk_1.png",
  playerLeftWalk2: "/assets/player/player_left_walk_2.png",
  playerRightWalk1: "/assets/player/player_right_walk_1.png",
  playerRightWalk2: "/assets/player/player_right_walk_2.png",
  doorFull: "/assets/door/door_full.png",
  doorUnlockedLeft: "/assets/door/door_unlocked_left.png",
  doorUnlockedLeftReversed: "/assets/door/door_unlocked_left_reversed.png",
  doorUnlockedRight: "/assets/door/door_unlocked_right.png",
  doorFullReversed: "/assets/door/door_full_reversed.png",
  avatarCharacter: "/assets/characters/avatar_character.png",
  avatarIcon: "/assets/characters/avatar_icon.png",
  avatarBackground: "/assets/backgrounds/avatar.jpg",
  avatarObject: "/assets/icons/avatar_object.png",
  avatarImage: "/assets/images/avatar.png",
  avatarBook: "/assets/books/avatar.jpeg",
  byTheWatersOfBabylonCharacter: "/assets/characters/byTheWatersOfBabylon_character.png",
  byTheWatersOfBabylonIcon: "/assets/characters/byTheWatersOfBabylon_icon.png",
  byTheWatersOfBabylonBackground: "/assets/backgrounds/byTheWatersOfBabylon.jpg",
  byTheWatersOfBabylonObject: "/assets/icons/byTheWatersOfBabylon_object.png",
  byTheWatersOfBabylonImage: "/assets/images/byTheWatersOfBabylon.png",
  byTheWatersOfBabylonBook: "/assets/books/byTheWatersOfBabylon.jpg",
  ellenFosterCharacter: "/assets/characters/ellenFoster_character.png",
  ellenFosterIcon: "/assets/characters/ellenFoster_icon.png",
  ellenFosterObject: "/assets/icons/ellenFoster_object.png",
  ellenFosterImage: "/assets/images/ellenFoster.jpg",
  ellenFosterBook: "/assets/books/ellenFoster.jpg",
  romeoAndJulietCharacter: "/assets/characters/romeoAndJuliet_character.png",
  romeoAndJulietIcon: "/assets/characters/romeoAndJuliet_character.png",
  romeoAndJulietObject: "/assets/icons/romeoAndJuliet_object.png",
  romeoAndJulietImage: "/assets/images/romeoAndJuliet.png",
  romeoAndJulietBook: "/assets/books/romeoAndJuliet.jpg",
  theHobbitCharacter: "/assets/characters/theHobbit_character.png",
  theHobbitIcon: "/assets/characters/theHobbit_character.png",
  theHobbitObject: "/assets/icons/theHobbit_object.png",
  theHobbitImage: "/assets/images/theHobbit.png",
  theHobbitBook: "/assets/books/theHobbit.jpg",
  adventuresOfHuckleberryFinnCharacter:
    "/assets/characters/adventuresOfHuckleberryFinn_character.png",
  adventuresOfHuckleberryFinnIcon:
    "/assets/characters/adventuresOfHuckleberryFinn_character.png",
  adventuresOfHuckleberryFinnObject:
    "/assets/icons/adventuresOfHuckleberryFinn_object.png",
  adventuresOfHuckleberryFinntImage: "/assets/images/adventuresOfHuckleberryFinn.png",
  adventuresOfHuckleberryFinnBook: "/assets/books/adventuresOfHuckleberryFinn.jpg",

  portal1: "/assets/portal/door/1.webp",
  portal2: "/assets/portal/door/2.webp",
  portal3: "/assets/portal/door/3.webp",
  portal4: "/assets/portal/door/4.webp",
};
// for (let i = 0; i < 100; i++)
// // @ts-ignore
//   imageUrls["big" + i.toString()] = "https://i.imgur.com/FX1HVet.png";

// load images
loadImages(imageUrls, (loaded, total) => {
  (document.querySelector("#progress") as HTMLProgressElement).value =
    (loaded / total) * 100;
}).then((images) => {
  (document.querySelector("#loading") as HTMLDivElement).style.display = "none";
  const player = new ControlledBody({
    x: window.innerWidth / 2 - 30 - 50 - 150,
    y: 0,
    width: 30,
    height: 90,
    layer: 2,
    color: "blue",
    update: (body) => {
      playerState.animation = (playerState.animation + 1) % (playerAnimationLength * 2);
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
  player.jump = () => {
    {
      if (player.jumps < player.maxJumps) {
        player.v.y = -player.jumpVel;
        player.jumps++;
        player.y -= 1;
        if (player.wallSide === 0) {
          player.v.x = -player.wallPushOffSpeed;
        } else if (player.wallSide === 2) {
          player.v.x = player.wallPushOffSpeed;
        }
      }
    }
  };

  // lock the camera to the player (player st	ays at center of the screen)
  renderer.camera.lock(player, { minXSpace: 0, minYSpace: 100 });

  // create a body for the player to land / jump on
  renderer.add(
    new StaticBody({
      x: 0,
      y: window.innerHeight / 2,
      width: window.innerWidth,
      height: 100,
      color: "black",
    })
  );
  // walls on the sides
  renderer.add(
    new StaticBody({
      x: -window.innerWidth / 2,
      y: 0,
      height: 10 ** 6,
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

  renderer.beforeRender(() => {
    renderer.camera.pos.x = 0;
    renderer.camera.pos.y = Math.min(0, renderer.camera.pos.y);

    // draw range of grey to white background based on camera y
    const maxHeight = 1500;
    const minHeight = 0;
    const minColor = 100;
    const maxColor = 255;
    const cameraY =
      Math.min(maxHeight, Math.max(minHeight, -renderer.camera.pos.y)) - minHeight;
    const color = Math.floor(
      (cameraY / (maxHeight - minHeight)) * (maxColor - minColor) + minColor
    );

    renderer.ctx.fillStyle = `rgb(${color}, ${color}, ${color})`;
    renderer.ctx.fillRect(0, 0, renderer.width, renderer.height);
  });

  let pauseRender = false;
  const restartRender = () => {
    pauseRender = false;
    const pointer = document.querySelector("#pointer");
    if (pointer) pointer.remove();

    requestAnimationFrame(animationLoop);
  };

  const map = genMap(
    sources,
    images,
    player,
    () => {
      pauseRender = true;
    },
    restartRender,
    renderer
  );
  map.objects.forEach((obj) => renderer.add(obj));
  map.doors.forEach((door) => renderer.beforeRender(door.update));
  map.doors[0].open(renderer);
  map.stairs.forEach((stair) => renderer.add(stair));

  const portal = map.portal;
  let portalAdded = false;

  if (window.innerWidth < 1200) {
    alert(
      "Your screen is too small! Switch to a larger device, or try zooming out with ctrl -"
    );
  }

  function detectKonamiCode(callback: () => void) {
    const konamiCode = [
      "ArrowUp",
      "ArrowUp",
      "ArrowDown",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "ArrowLeft",
      "ArrowRight",
      "KeyB",
      "KeyA",
      "Enter",
    ];
    let index = 0;

    function keydownHandler(event: KeyboardEvent) {
      if (event.code === konamiCode[index]) {
        index++;
        if (index === konamiCode.length) {
          callback();
          index = 0;
        }
      } else {
        index = 0;
      }
    }

    document.addEventListener("keydown", keydownHandler);
  }

  detectKonamiCode(async () => {
    if (!portalAdded) {
      portalAdded = true;
      renderer.add(portal.object);
      openTypewriter();
      await writeTypewriter({
        text: "why are you hecker just play normaly plz",
      });
      closeTypewriter();
      (document.querySelector("#object-bg") as HTMLDivElement).style.opacity = "1";
      map.keys.forEach(async (key) => {
        await key.start();
        await key.middle();
        await key.end();
      });
    }
  });

  openTypewriter();
  writeTypewriter({
    text: "Welcome to my English Capstone project! This year, my essential question was: How do stories involving important decisions help us define how we should make our choices as individuals? To answer this question, I read/watched 12 different media sources, and then compiled them all into a single answer, drawing connections from 6 of them that I carefully selected.",
  })
    .then(() =>
      writeTypewriter({
        text: "After answering the question, I chose to make a game to guide the player to the answer, because I thought it would explain the answer well and would be interactive and engaging. In this game, you will navigate through different rooms of a tower. In each room, the main character from each source will explain their story and how it connects to the essential question. Each room also has a image I made that represents the source and the theme it portrays.",
      })
    )
    .then(() =>
      writeTypewriter({
        text: "To get started, us the WASD or arrow keys to navigate! The start is on the right, and after that, continue up the tower. Each room unlocks the next, and all build toward the final answer at the end. Have fun!",
      })
    )
    .then(() => {
      closeTypewriter();
      (document.querySelector("#pointer") as HTMLElement).style.display = "block";
    });
  // rendering loop
  const animationLoop = () => {
    if (pauseRender) return;
    // update physics
    // player.y -= 1;
    renderer.update();
    // player.y += 1;

    // respawn player if needed
    if (player.y - player.height / 2 > renderer.height) {
      player.v.y = 0;
      player.v.x = 0;
      player.x = 30;
      player.y = 30;
    }

    if (portalAdded) {
      portal.update(portal.object, player);
      if (portal.object.collides(player)) {
        pauseRender = true;
        doPortal(
          map.keys,
          images,
          () => {
            pauseRender = true;
          },
          restartRender
        );
      }
    } else {
      if (map.keys.filter((key) => !key.isCollected()).length === 0) {
        portalAdded = true;
        renderer.add(portal.object);
      }
    }

    // draw everything
    renderer.render();
    requestAnimationFrame(animationLoop);
  };

  requestAnimationFrame(animationLoop);
});
