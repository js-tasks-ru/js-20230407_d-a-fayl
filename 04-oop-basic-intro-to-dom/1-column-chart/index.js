export default class ColumnChart {
  chartHeight = 50;
  subElements = {};

  constructor({
    data = [],
    label = "",
    link = "",
    value = 0,
    formatHeading = (x) => x,
  } = {}) {
    this.data = data;
    this.label = label;
    this.value = formatHeading(value);
    this.link = link;

    this.render();
  }

  getTemplate() {
    return `
    <div class="column-chart column-chart_loading"  
      style="--chart-height:${this.chartHeight}"
    >

      <div class="column-chart__title">
        Total ${this.label}
        ${this.getLink()}
      </div>

      <div class="column-chart__container">

        <div data-element="header" class="column-chart__header"> 
          ${this.value} 
        </div>

        <div data-element="body" class="column-chart__chart">
          ${this.getColumnBody()}
        </div>

      </div>

    </div>
  `;
  }

  render() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;

    if (this.data.length) {
      this.element.classList.remove("column-chart_loading");
    }

    this.subElements = this.getSubElements();
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
      //console.dir(subElement);
    }
    //console.log(result);

    return result;
  }

  getColumnBody() {
    const maxValue = Math.max(...this.data);
    const scale = this.chartHeight / maxValue;

    return this.data
      .map((item) => {
        const percent = ((item / maxValue) * 100).toFixed(0);

        return `<div style="--value: ${Math.floor(
          item * scale
        )}" data-tooltip="${percent}%"></div>`;
      })
      .join("");
  }

  getLink() {
    return this.link
      ? `<a class="column-chart__link" href="${this.link}">View all</a>`
      : "";
  }

  update(data = []) {
    if (!data.length) {
      this.element.classList.add("column-chart_loading");
    }
    this.data = data;
    this.subElements.body.innerHTML = this.getColumnBody();
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = {};
    this.subElements = {};
  }
}

{
  class BaseComponent {
    static color = "red";
    constructor() {
      this.bar = "title";
    }

    render() {
      console.log("parent render");
    }
    destroy() {}
    foo() {
      console.log("parent foo");
    }
  }

  class ComponentChild extends BaseComponent {
    constructor() {
      super();
      this.title = "title";
    }

    foo() {
      console.log("child foo");
    }
    render() {
      console.log("child render");
      super.render();
    }
  }

  const obj2 = new ComponentChild();
  const obj1 = new BaseComponent();
  console.log(obj1);
  console.log(obj2);

  console.log(BaseComponent.color);
  console.log(ComponentChild.color);

  obj2.foo();
  obj2.render();
}
