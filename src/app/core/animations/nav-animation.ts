import { AnimationController, Animation } from '@ionic/angular';

export const enterAnimation = (baseEl: HTMLElement, opts?: any): Animation => {
  const DURATION = 300;
  const animationCtrl = new AnimationController();

  if (opts.direction === 'forward') {
    return animationCtrl
      .create()
      .addElement(opts.enteringEl)
      .duration(DURATION)
      .easing('ease-in')
      .fromTo('opacity', 0, 1);
  } else {
    return animationCtrl
      .create()
      .addElement(opts.leavingEl)
      .duration(DURATION)
      .easing('ease-out')
      .fromTo('opacity', 1, 0);
  }
};
