import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru";

export default class ColumnChart {
  element;
  subElements = {};
  chartHeight = 50;

  constructor({
    label = "",
    link = "",
    formatHeading = (data) => data,
    url = "",
    range = {
      from: new Date(),
      to: new Date(),
    },
  } = {}) {
    this.url = new URL(url, BACKEND_URL);
    this.range = range;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;
    this.render();
    this.update(this.range.from, this.range.to);
  }

  render() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();
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
        </div>
        <div data-element="body" class="column-chart__chart">
        </div>

      </div>

    </div>
  `;
  }
  getLink() {
    return this.link
      ? `<a class="column-chart__link" href="${this.link}">View all</a>`
      : "";
  }

  async update(from, to) {
    this.element.classList.add("column-chart_loading");

    const data = await this.loadData(from, to);

    this.setNewRange(from, to);

    if (data && Object.values(data).length) {
      this.subElements.header.textContent = this.getHeaderValue(data);
      this.subElements.body.innerHTML = this.getColumnBody(data);
      this.element.classList.remove("column-chart_loading");
    }

    this.data = data;

    return this.data;
  }

  setNewRange(from, to) {
    this.range.from = from;
    this.range.to = to;
  }

  async loadData(from, to) {
    this.url.searchParams.set("from", from.toISOString());
    this.url.searchParams.set("to", to.toISOString());

    return await fetchJson(this.url);
  }

  getHeaderValue(data) {
    return this.formatHeading(
      Object.values(data).reduce((accum, item) => accum + item, 0)
    );
  }

  getColumnBody(data) {
    const maxValue = Math.max(...Object.values(data));

    return Object.entries(data)
      .map(([key, value]) => {
        const scale = this.chartHeight / maxValue;
        const percent = ((value / maxValue) * 100).toFixed(0);

        const tooltip = `<span>
        <small>${key.toLocaleString("default", { dateStyle: "medium" })}</small>
        <br>
        <strong>${percent}%</strong>
      </span>`;

        return `<div style="--value: ${Math.floor(
          value * scale
        )}" data-tooltip="${tooltip}"></div>`;
      })
      .join("");
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }
    return result;
  }

  destroy() {
    this.element.remove();
  }
}
