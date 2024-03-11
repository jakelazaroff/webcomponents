export default class AnimatedStroke extends HTMLElement {
  static tag = "animated-stroke";

  static register(tag = this.tag) {
    const ce = customElements.get(tag);
    if (ce === this) return;
    else if (ce) return console.warn(`<${tag}> already registered!`);

    customElements.define(tag, this);
  }

  connectedCallback() {
    let i = 0;
    for (const path of this.querySelectorAll("[stroke]")) {
      const length = path.getTotalLength();

      const duration =
        Number(path.dataset.duration) || Number(this.getAttribute("duration")) || 1000;
      const delay = Number(this.getAttribute("delay")) || 0;
      const stagger = i++ * Number(this.getAttribute("stagger")) || 0;
      const easing = this.getAttribute("easing") || "ease";

      path.style.transition = `stroke-dashoffset ${duration}ms ${easing} ${delay + stagger}ms`;
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;
    }
  }

  async animate() {
    for (const path of this.querySelectorAll("[stroke]")) {
      path.style.strokeDashoffset = 0;
    }
  }
}
