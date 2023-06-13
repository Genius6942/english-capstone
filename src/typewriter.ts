const $ = <T = HTMLElement>(query: string) =>
  document.querySelector(query) as T;

export const openTypewriter = ({
  image = "/assets/player/player_left_standstill.png",
  title = null,
  name = null,
}: {
  image?: string;
  title?: string | null;
  name?: string | null;
} = {}) => {
  $("#typewriter").style.display = "block";
  $<HTMLImageElement>("#speaking").src = image;
  if (title) {
    $("#title").innerHTML = title + '\n';
  }
  if (name) {
    $("#name").innerHTML = name;
  }
};

export const writeTypewriter = ({
  text,
  speed = 50,
}: {
  text: string;
  speed?: number;
}) =>
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
  $("#name").innerHTML = "";
  $("#title").innerHTML = "";
};
