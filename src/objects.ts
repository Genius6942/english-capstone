export const defaultSize = 50;
export const enlargedSize = 400;
export const objectGap = 20;
export const bottomSpace = 50;

export const createObject = (imgUrl: string, index: number, total: number) => {
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

  const locations = {
    start: {
      x: window.innerWidth - 50 - 50,
      y: window.innerHeight - 50 - 250,
      size: defaultSize,
    },
    middle: {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      size: enlargedSize,
    },
    end: {
      x:
        window.innerWidth / 2 -
        ((total - 1) * (objectGap + defaultSize)) / 2 +
        (defaultSize + objectGap) * index,
      y: window.innerHeight - bottomSpace,
      size: defaultSize,
    },
		final: {
			x: window.innerWidth / 2,
			y: window.innerHeight / 2,
			size: 0,
		}
  };

  return {
    start: async () => {
      resize(locations.start.size);
      moveTo(locations.start.x, locations.start.y);
      show();
      obj.style.opacity = "1";
      await new Promise((resolve) => setTimeout(resolve, transitionMs));
    },
    middle: async () => {
      resize(locations.middle.size);
      moveTo(locations.middle.x, locations.middle.y);
      obj.style.opacity = "0";
      await new Promise((resolve) => setTimeout(resolve, transitionMs));
    },
    end: async () => {
      resize(locations.end.size);
      moveTo(locations.end.x, locations.end.y);
      obj.style.opacity = "1";
      // obj.style.padding = "5px 10px";
      // if (index === 0) {
      // 	obj.style.borderTopLeftRadius = obj.style.borderBottomLeftRadius = "9999px";
      // 	obj.style.backdropFilter = 'blur(10px)';
      // }
      // if (index === total - 1) {
      //   obj.style.borderTopRightRadius = obj.style.borderBottomRightRadius = "9999px";
      //   obj.style.backdropFilter = "blur(10px)";
      // }
      await new Promise((resolve) => setTimeout(resolve, transitionMs));
    },
		final: async () => {
			resize(locations.final.size);
			moveTo(locations.final.x, locations.final.y);
			obj.style.transition = `all ${transitionMs / 1000}s ease, opacity ${
        transitionMs / 1000
      }s cubic-bezier(1,-0.22,1,-0.1)`;
			obj.style.opacity = "0";
			await new Promise((resolve) => setTimeout(resolve, transitionMs));
		},
  };
};

export const createObjectBg = (total: number) => {
  const div = document.createElement("div");
  const padding = 10;
  div.style.background = "rgba(255, 255, 255,.5)";
  div.style.width = `${objectGap * (total - 1) + defaultSize * total + padding * 2}px`;
  div.style.height = `${defaultSize + padding * 2}px`;
  div.style.backdropFilter = "blur(10px)";
  div.style.borderRadius = "9999px";
  div.style.position = "fixed";
  div.style.bottom = `${bottomSpace - padding - defaultSize / 2}px`;
  div.style.left = "50%";
  div.style.transform = "translateX(-50%)";
  div.style.zIndex = (10 ** 3).toString();
	div.id = "object-bg"

  document.body.appendChild(div);
};
