const fadeElement = document.querySelector("#fade") as HTMLDivElement;

export const showCover = async ({ duration = 0.7, asyncrounous = true } = {}) => {
  fadeElement.style.transition = `all ${duration}s ease-in-out`;
  fadeElement.style.opacity = "1";
  if (asyncrounous) {
    await new Promise((resolve) => setTimeout(resolve, duration * 1000));
  }
  return;
};

export const hideCover = async ({ duration = 0.7, asyncrounous = true } = {}) => {
  fadeElement.style.transition = `all ${duration}s ease-in-out`;
  fadeElement.style.opacity = "0";
  if (asyncrounous) {
    await new Promise((resolve) => setTimeout(resolve, duration * 1000));
  }
  return;
};

export const transitionAction = async ({
  action = () => null as unknown as void | Promise<void>,
  duration = 0.7,
  asyncrounous = true,
} = {}) => {
  await showCover({ duration, asyncrounous });
  await action();
  await hideCover({ duration, asyncrounous });
  return;
};
