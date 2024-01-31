export default class ClickOutside extends HTMLElement {
  static register(tag = "click-outside") {
    const ce = customElements.get(tag);
    if (ce === ClickOutside) return;
    else if (ce) return console.warn(`<${tag}> already registered!`);

    customElements.define(tag, ClickOutside);
  }

  /** @param {MouseEvent} evt */
  handleEvent(evt) {
    if (evt.composedPath().includes(this)) return;

    this.dispatchEvent(new CustomEvent(evt.type + "-outside", evt));
  }

  connectedCallback() {
    document.addEventListener("click", this);
    document.addEventListener("mousedown", this);
    document.addEventListener("mouseup", this);
    document.addEventListener("pointerdown", this);
    document.addEventListener("pointerup", this);
  }

  disconnectedCallback() {
    document.removeEventListener("click", this);
    document.removeEventListener("mousedown", this);
    document.removeEventListener("mouseup", this);
    document.removeEventListener("pointerdown", this);
    document.removeEventListener("pointerup", this);
  }
}
