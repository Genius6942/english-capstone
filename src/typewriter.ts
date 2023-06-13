const $ = <T = HTMLElement>(query: string) => document.querySelector(query) as T;

export const openTypewriter = (image = "/assets/player/player_left_standstill.png") => {
  $("#typewriter").style.display = "block";
  $<HTMLImageElement>("#speaking").src = image;
};

export const writeTypewriter = (text: string, speed = 50) =>
  new Promise<void>((resolve) => {
    let done = false;
    const box = $("#text");
    $("#text").innerHTML = "";
    $("#text-hidden").innerHTML = text;

    let displayed = "";
    let i = 0;

    const awaitSpacebar = () =>
      new Promise<void>((resolve) => {
        const listener = (e: KeyboardEvent) => {
          if (e.key === " ") {
            document.removeEventListener("keydown", listener);
            resolve();
          }
        };
        document.addEventListener("keydown", listener);
      });

    const interval = setInterval(() => {
      if (done) {
        clearInterval(interval);
        awaitSpacebar().then(resolve);
      }
      if (i >= text.length) {
        done = true;
        return;
      }
      displayed += text[i];
      i++;
      box.innerHTML = displayed;
    }, 1000 / speed);

    awaitSpacebar().then(() => {
      displayed = text;
      i = text.length;
      box.innerHTML = displayed;
      done = true;
    });
  });

export const closeTypewriter = () => {
  $("#typewriter").style.display = "none";
  $("#text").innerHTML = "";
  $("#text-hidden").innerHTML = "";
};
