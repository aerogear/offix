import TweenLite from 'gsap';

export const animations = {
  logo({ logo }) {
    TweenLite.to(logo, 2, {
      opacity: 1,
      y: 0,
      ease: "elastic.out(1, 0.3)"
    });
  },
  title({ title }) {
    TweenLite.to(title, 1, {
      opacity: 1,
      x: 0,
      delay: 1
    });
  },
  tagline({ tagline }) {
    TweenLite.to(tagline, 1, {
      opacity: 1,
      x: 0,
      delay: 1.5
    });
  },
  cta({ cta }) {
    TweenLite.to(cta, .5, {
      opacity: 1,
      y: 0,
      delay: 2
    });
  }
}