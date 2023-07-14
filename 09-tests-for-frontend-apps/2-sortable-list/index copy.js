export default class SortableList {
  onPointerUp = () => {
    this.dragStop();
  };

  onPointerMove = ({ clientX, clientY }) => {
    this.moveDraggingAt(clientX, clientY);
    // на каждое движение с зажатой клавишей мыши мы тащим
    // нажатый li за собой путем вычетания из текущих координат
    // курсора координаты смещения из объекта shift

    const prevElem = this.placeholderElement.previousElementSibling;
    console.log(prevElem);
    const nextElem = this.placeholderElement.nextElementSibling;
    console.log(nextElem);

    const { firstElementChild, lastElementChild } = this.element;
    console.log(firstElementChild);
    console.log(lastElementChild);

    const { top: firstElementTop } = firstElementChild.getBoundingClientRect();
    const { bottom } = this.element.getBoundingClientRect();

    // описание крайних положений ----------- начало
    if (clientY < firstElementTop) {
      return firstElementChild.before(this.placeholderElement);
      // как только курсор мыши поднялся в нажатом состоянии выше верхней границы по оси 'y' первого li из всего списка, то placeholderElement вставляется перед ним
    }

    if (clientY > bottom) {
      return lastElementChild.after(this.placeholderElement);
      // как только курсор мыши опустился в нажатом состоянии ниже нижней границы по оси 'y' последнего li из всего списка, то placeholderElement вставляется перед ним (т.е. встает он после, но срабатывает позиционирование и он залезает наверх)
    }
    // описание крайних положений ------------------- конец

    // перемещение плейсхолдера между крайними точками(внутри ul) НАЧАЛО
    if (prevElem) {
      //как только курсор зажатой мыши поднимется выше средней линии вышестоящего элемента, мы вставим перед плейсхолдер
      const { top, height } = prevElem.getBoundingClientRect();
      const middlePrevElem = top + height / 2;

      if (clientY < middlePrevElem) {
        return prevElem.before(this.placeholderElement);
      }
    }

    if (nextElem) {
      // ситуация зеркальная вышестоящей
      const { top, height } = nextElem.getBoundingClientRect();
      const middleNextElem = top + height / 2;

      if (clientY > middleNextElem) {
        return nextElem.after(this.placeholderElement);
      }
    }
    // перемещение плейсхолдера между крайними точками(внутри ul) КОНЕЦ

    // если элементов на странице будет много и клиент кликнул, мышкой не двигает, а только скролит вниз
    this.scrollIfCloseToWindowEdge(clientY);
  };

  constructor({ items = [] } = {}) {
    this.items = items;
    console.log(this.items);
    this.render();
  }

  render() {
    this.element = document.createElement("ul");
    this.element.className = "sortable-list";

    console.log(this.element);

    this.addItems();
    this.initEventListeners();
  }

  addItems() {
    for (const item of this.items) {
      item.classList.add("sortable-list__item");
    }

    this.element.append(...this.items);
  }

  initEventListeners() {
    this.element.addEventListener("pointerdown", (event) => {
      this.onPointerDown(event);
    });
  }

  onPointerDown(event) {
    const element = event.target.closest(".sortable-list__item");
    console.log(event.target);

    if (element) {
      console.log(element);
      if (event.target.closest("[data-grab-handle]")) {
        event.preventDefault();
        console.log(event);
        this.dragStart(element, event);
      }

      if (event.target.closest("[data-delete-handle]")) {
        event.preventDefault();

        element.remove();
      }
    }
  }

  dragStart(element, { clientX, clientY }) {
    console.log(element);

    this.draggingElem = element; // li

    console.log(this.draggingElem);

    //event - клик на спане

    this.elementInitialIndex = [...this.element.children].indexOf(element);

    console.log(element.getBoundingClientRect());

    const { x, y } = element.getBoundingClientRect();
    //x, y - координаты начала прямоугольника, где включен элемент
    //т.е. верхнего левого угла
    // clientX и clientY - координаты кусора в момент клика

    const { offsetWidth, offsetHeight } = element;
    // полная ширина и высота, включая рамки

    this.pointerShift = {
      x: clientX - x,
      y: clientY - y,
    };
    console.log(this.pointerShift);
    // разница смещения между 'x' и 'у'  начала верхнего
    // левого угла элемента 'li' и точкой клика курсора (от большего отнимаем меньшее)

    this.draggingElem.style.width = `${offsetWidth}px`;
    this.draggingElem.style.height = `${offsetHeight}px`;
    // создаем копию li и навешиваем класс sortable-list__item_dragging
    this.draggingElem.classList.add("sortable-list__item_dragging");

    // создаем копию li бе наполнения (пустую) и навешиваем класс sortable-list__placeholder
    this.placeholderElement = this.createPlaceholderElement(
      offsetWidth,
      offsetHeight
    );

    this.draggingElem.after(this.placeholderElement);
    // вставляем placeholderElement сразу после того li-элемента, на который нажали. Но, у этого ли position: fixed, то placeholderElement залезает под последний li

    this.element.append(this.draggingElem);
    // перемещаем нажатый li в конец списка ul

    this.moveDraggingAt(clientX, clientY);
    this.addDocumentEventListeners();
  }

  createPlaceholderElement(width, height) {
    const element = document.createElement("li");

    element.className = "sortable-list__placeholder";
    element.style.width = `${width}px`;
    element.style.height = `${height}px`;

    return element;
  }

  moveDraggingAt(clientX, clientY) {
    // возвращаем draggingElem на прежнее место (над плейсхолдером)
    this.draggingElem.style.left = `${clientX - this.pointerShift.x}px`;
    this.draggingElem.style.top = `${clientY - this.pointerShift.y}px`;

    /* this.draggingElem.style.left = `${clientX}px`;
    this.draggingElem.style.top = `${clientY}px`; */
    // если так оставить, то верхний левый угол draggingElem встанет на точку клика. поэтому надо вычесть смещение из объекта shift

    console.log(this.draggingElem);
  }

  scrollIfCloseToWindowEdge(clientY) {
    const scrollingValue = 10;
    const threshold = 20;

    if (clientY < threshold) {
      // крутим вверх на 10 пикселей, если мышь перемещается вверх
      window.scrollBy(0, -scrollingValue);
    } else if (clientY > document.documentElement.clientHeight - threshold) {
      // крутим вниз на 10 пикселей, если мышь перемещается вниз и достигла нижнеего порогового значения
      window.scrollBy(0, scrollingValue);
    }
  }

  dragStop() {
    const placeholderIndex = [...this.element.children].indexOf(
      this.placeholderElement
    );

    this.draggingElem.style.cssText = "";
    this.draggingElem.classList.remove("sortable-list__item_dragging");
    this.placeholderElement.replaceWith(this.draggingElem);

    this.draggingElem = null;

    console.log(this);

    this.removeDocumentEventListeners();

    if (placeholderIndex !== this.elementInitialIndex) {
      this.dispatch("sortable-list-reorder", {
        from: this.elementInitialIndex,
        to: placeholderIndex,
      });
    }
  }

  dispatch(type, details) {
    this.element.dispatchEvent(
      new CustomEvent(type, {
        bubbles: true,
        details,
      })
    );
  }

  addDocumentEventListeners() {
    document.addEventListener("pointermove", this.onPointerMove);
    document.addEventListener("pointerup", this.onPointerUp);
  }

  removeDocumentEventListeners() {
    document.removeEventListener("pointermove", this.onPointerMove);
    document.removeEventListener("pointerup", this.onPointerUp);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.removeDocumentEventListeners();
    this.element = null;
  }
}
