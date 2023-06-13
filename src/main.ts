import "./style.css";
import { ControlledBody, StaticBody, Renderer, loadImages } from "platjs";
import { closeTypewriter, openTypewriter, writeTypewriter } from "./typewriter";
import { door, room } from "./room";
import genMap from "./genMap";
import sources from "./sources";

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
  playerLeftStandstill: "/assets/player/player_left_standstill.png",
  playerRightStandstill: "/assets/player/player_right_standstill.png",
  playerLeftWalk1: "/assets/player/player_left_walk_1.png",
  playerLeftWalk2: "/assets/player/player_left_walk_2.png",
  playerRightWalk1: "/assets/player/player_right_walk_1.png",
  playerRightWalk2: "/assets/player/player_right_walk_2.png",
  doorFull: "/assets/door/door_full.png",
  doorUnlockedLeft: "/assets/door/door_unlocked_left.png",
  doorUnlockedRight: "/assets/door/door_unlocked_right.png",
  doorFullReversed: "/assets/door/door_full_reversed.png",
  avatarCharacter: "/assets/characters/avatar_character.png",
  avatarIcon: "/assets/characters/avatar_icon.png",
};

// load images
loadImages(imageUrls, (loaded, total) => {
  (document.querySelector("progress") as HTMLProgressElement).value =
    (loaded / total) * 100;
}).then((images) => {
  const player = new ControlledBody({
    x: 0,
    y: 0,
    width: 30,
    height: 90,
    layer: 1,
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
    // console.log(renderer.camera.pos.x);
    renderer.camera.pos.y = Math.min(0, renderer.camera.pos.y);
  });

  let pauseRender = false;
  const restartRender = () => {
    pauseRender = false;
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

  openTypewriter();
  writeTypewriter(
    "Hi mom! i love you lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. yay",
    50
  ).then(closeTypewriter);
  // rendering loop
  const animationLoop = () => {
    if (pauseRender) return;
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
});
