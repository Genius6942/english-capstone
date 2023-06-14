export const createObject = (imgUrl: string, index: number) => {
  const obj = document.createElement("img");
  obj.src = imgUrl;
  obj.style.position = "fixed";
  document.body.appendChild(obj);
  const transitionMs = 500;
  obj.style.transition = `all ${transitionMs / 1000}s ease-in-out`;
  obj.style.transform = "translate(-50%, -50%)";
  obj.style.display = "none";
  obj.style.zIndex = (10 ** 3).toString();

  const resize = (size: number) => {
    obj.style.width = obj.style.height = `${size}px`;
  };

  const moveTo = (x: number, y: number) => {
    obj.style.left = `${x}px`;
    obj.style.top = `${y}px`;
  };

  const show = () => {
    obj.style.display = "block";
  };
  // @ts-ignore
  const hide = () => {
    obj.style.display = "none";
  };

  const defautSize = 50;
  const enlargedSize = 400;
  const objectGap = 20;

  const locations = {
    start: {
      x: window.innerWidth - 50 - 50,
      y: window.innerHeight - 50 - 250,
      size: defautSize,
    },
    middle: {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      size: enlargedSize,
    },
    end: {
      x: window.innerWidth - 50 - 50,
      y: 50 + (objectGap + defautSize) * index,
      size: defautSize,
    },
  };

  return {
    start: async () => {
      resize(locations.start.size);
      moveTo(locations.start.x, locations.start.y);
      show();
      await new Promise((resolve) => setTimeout(resolve, transitionMs));
    },
    middle: async () => {
      resize(locations.middle.size);
      moveTo(locations.middle.x, locations.middle.y);
      await new Promise((resolve) => setTimeout(resolve, transitionMs));
    },
    end: async () => {
      resize(locations.end.size);
      moveTo(locations.end.x, locations.end.y);
      await new Promise((resolve) => setTimeout(resolve, transitionMs));
    },
  };
};
