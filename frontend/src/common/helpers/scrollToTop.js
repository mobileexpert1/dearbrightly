/* Animation helper function */
export const scrollToTop = () => {
  let i = 300;
  const int = setInterval(() => {
    window.scrollTo(0, i);
    i -= 10;
    if (i === 0) clearInterval(int);
  }, 20);
};
