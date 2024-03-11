export default class MoveAble extends HTMLElement {
  static tag = "move-able";

  static register(tag = this.tag) {
    const ce = customElements.get(tag);
    if (ce === this) return;
    else if (ce) return console.warn(`<${tag}> already registered!`);

    customElements.define(tag, this);
  }

  #grid = 1;

  /** @type {DOMRect | null} */
  #rect = null;
  /** @type {Point | null} */
  #origin = null;
  /** @type {Point | null} */
  #prev = null;

  constructor() {
    super();
    this.addEventListener("pointerdown", this);
    this.addEventListener("pointerup", this);
    this.addEventListener("pointercancel", this);
    this.addEventListener("pointermove", this);
    this.addEventListener("touchstart", this);
    this.addEventListener("dragstart", this);
  }

  /** @param {Event} evt */
  handleEvent(evt) {
    switch (evt.type) {
      case "pointerdown":
        this.#onpointerdown(/** @type {PointerEvent} */ (evt));
        break;
      case "pointerup":
        this.#onpointerup(/** @type {PointerEvent} */ (evt));
        break;
      case "pointermove":
        this.#onpointermove(/** @type {PointerEvent} */ (evt));
        break;
      case "pointercancel":
        this.#onpointercancel(/** @type {PointerEvent} */ (evt));
        break;
      case "touchstart":
      case "dragstart":
        evt.preventDefault();
    }
  }

  connectedCallback() {
    this.#grid = Number(this.getAttribute("grid")) || 1;
  }

  /**
   * @param {string} name
   * @param {string} prev
   * @param {string} next
   */
  attributeChangedCallback(name, prev, next) {
    if (name === "grid") this.#grid = Number(next) || 1;
  }

  /** @param {PointerEvent} evt */
  #onpointerdown(evt) {
    this.#start(evt);
  }

  /** @param {PointerEvent} evt */
  #onpointermove(evt) {
    this.#move(evt);
  }

  /** @param {PointerEvent} evt */
  #onpointerup(evt) {
    this.#end(evt);
  }

  /** @param {PointerEvent} evt */
  #onpointercancel(evt) {
    this.#end(evt);
  }

  /** @param {PointerEvent} evt */
  #start(evt) {
    if (evt.button !== 0) return;
    // evt.stopPropagation();
    this.setPointerCapture(evt.pointerId);
    this.dispatchEvent(new CustomEvent("movestart"));

    this.#rect = this.getBoundingClientRect();
    this.#origin = this.#prev = this.#project({ x: evt.clientX, y: evt.clientY });

    document.documentElement.style.userSelect = "none";
    document.documentElement.style.webkitUserSelect = "none";
  }

  /** @param {PointerEvent} evt */
  #move(evt) {
    if (!this.#origin || !this.#prev || !this.hasPointerCapture(evt.pointerId)) return;
    evt.stopPropagation();

    const coords = this.#project({ x: evt.clientX, y: evt.clientY });
    const detail = {
      origin: this.#snap(this.#origin),
      distance: this.#snap({ x: coords.x - this.#origin.x, y: coords.y - this.#origin.y }),
      delta: this.#snap({ x: coords.x - this.#prev.x, y: coords.y - this.#prev.y })
    };

    this.dispatchEvent(new CustomEvent("move", { detail }));
    this.#prev = { x: this.#prev.x + detail.delta.x, y: this.#prev.y + detail.delta.y };
  }

  /** @param {PointerEvent} evt */
  #end(evt) {
    if (!this.#origin || !this.#prev || !this.hasPointerCapture(evt.pointerId)) return;
    evt.stopPropagation();

    const coords = this.#project({ x: evt.clientX, y: evt.clientY });
    const detail = {
      origin: this.#snap(this.#origin),
      distance: this.#snap({ x: coords.x - this.#origin.x, y: coords.y - this.#origin.y }),
      delta: this.#snap({ x: coords.x - this.#prev.x, y: coords.y - this.#prev.y })
    };

    this.dispatchEvent(new CustomEvent("moveend", { detail }));
    this.#rect = null;
    this.#origin = null;
    this.#prev = null;
    document.documentElement.style.userSelect = "";
    document.documentElement.style.webkitUserSelect = "";
    this.releasePointerCapture(evt.pointerId);
  }

  /** @param {Point} coords */
  #snap({ x, y }) {
    return {
      x: Math.round(x / this.#grid) * this.#grid,
      y: Math.round(y / this.#grid) * this.#grid
    };
  }

  /** @param {Point} coords */
  #project({ x, y }) {
    const { top, left } = this.#rect ?? this.getBoundingClientRect();
    return { x: x - left, y: y - top };
  }
}
