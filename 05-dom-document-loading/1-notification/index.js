export default class NotificationMessage {
  static activeNotification;

  element;
  timerId;

  constructor(message = "Hello", { duration = 3000, type = "success" } = {}) {
    this.message = message + " " + Math.random().toFixed(2);
    this.durationPerSec = duration / 1000;
    this.type = type;
    this.duration = duration;

    this.render();
  }

  getTemplate() {
    return `
    <div class="notification ${this.type}" style="--value:${this.durationPerSec}s">
    <div class="timer"></div>
    <div class="inner-wrapper">
      <div class="notification-header">${this.type}</div>
      <div class="notification-body">${this.message}</div>
    </div>
  </div>
  `;
  }

  render() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
  }

  show(parent = document.body) {
    if (NotificationMessage.activeNotification) {
      NotificationMessage.activeNotification.remove();
    }

    parent.append(this.element);
    this.timerId = setTimeout(() => this.remove(), this.duration);
    NotificationMessage.activeNotification = this;
  }

  remove() {
    clearTimeout(this.timerId);
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    NotificationMessage.activeNotification = null;
  }
}
