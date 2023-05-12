import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru";

export default class SortableTable {
  element;
  subElements = {};
  data = [];
  loading = false;
  step = 20;
  start = 0;
  end = this.start + this.step;

  onWindowScroll = async () => {
    const { bottom } = this.element.getBoundingClientRect();
    const { id, order } = this.sorted;
    if (bottom < document.documentElement.clientHeight && !this.loading) {
      this.start = this.end;
      this.end = this.start + this.step;

      this.loading = true;

      const data = await this.loadData(id, order, this.start, this.end);

      this.update(data);

      this.loading = false;
    }
  };

  onSortClick = (event) => {
    const column = event.target.closest('[data-sortable="true"]');

    const toggleOrder = (order) => {
      const orders = {
        asc: "desc",
        desc: "asc",
      };

      return orders[order];
    };

    if (column) {
      const { id, order } = column.dataset;
      const newOrder = toggleOrder(order);

      this.sorted = {
        id,
        order: newOrder,
      };

      column.dataset.order = newOrder;
      column.append(this.subElements.arrow);

      if (this.isSortLocally) {
        this.sortOnClient(id, newOrder);
      } else {
        this.sortOnServer(id, newOrder);
      }
    }
  };

  constructor(
    headersConfig = [],
    {
      url = "",
      sorted = {
        id: headersConfig.find((item) => item.sortable).id,
        order: "asc",
      },
      isSortLocally = false,
      step = 20,
      start = 0,
      end = start + step,
    } = {}
  ) {
    this.headerConfig = headersConfig;
    this.url = new URL(url, BACKEND_URL);
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;
    this.step = step;
    this.start = start;
    this.end = end;
    this.render();
  }

  async loadData(...props) {
    this.showLoader();
    const data = await this.load(...props);
    this.hideLoader();
    return data;
  }
  async load(id, order, start = this.start, end = this.end) {
    this.url.searchParams.set("_sort", id);
    this.url.searchParams.set("_order", order);
    this.url.searchParams.set("_start", start);
    this.url.searchParams.set("_end", end);

    return await fetchJson(this.url);
  }
  update(data) {
    const rows = document.createElement("div");

    this.data = [...this.data, ...data];
    rows.innerHTML = this.getTableRows(data);

    this.subElements.body.append(...rows.childNodes);
  }

  async render() {
    const { id, order } = this.sorted;
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.getTable();
    const element = wrapper.firstElementChild;
    this.element = element;

    this.subElements = this.getSubElements(element);

    const data = await this.loadData(id, order, this.start, this.end);

    this.renderRows(data);
    this.initEventListeners();
  }

  getTable() {
    return `
      <div class="sortable-table">
      ${this.getTableHeader()}
      ${this.getTableBody(this.data)}
        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
          No products
        </div>
      </div>
    `;
  }
  getTableHeader() {
    return `
    <div data-element="header" class="sortable-table__header sortable-table__row">
      ${this.headerConfig.map((item) => this.getHeaderRow(item)).join("")}
    </div>
    `;
  }
  getHeaderRow({ id, title, sortable }) {
    const order = this.sorted.id === id ? this.sorted.order : "asc";
    return `
    <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${order}">
      <span>${title}</span>
      ${this.getHeaderSortingArrow(id)}
    </div>`;
  }
  getHeaderSortingArrow(id) {
    const isOrderExist = this.sorted.id === id ? this.sorted.order : "";

    return isOrderExist
      ? `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>`
      : "";
  }
  getTableBody(data) {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getTableRows(data)}
      </div>
    `;
  }
  getTableRows(data) {
    return data
      .map((item) => {
        return `
        <a href="/products/${item.id}" class="sortable-table__row">
          ${this.getTableRow(item)} 
        </a>
      `;
      })
      .join("");
  }
  getTableRow(product) {
    const cells = this.headerConfig.map(({ id, template }) => {
      return { id: id, template: template };
    });
    return cells
      .map(({ id, template }) => {
        return template
          ? template(product[id])
          : `<div class="sortable-table__cell">${product[id]}</div>`;
      })
      .join("");
  }

  sortOnClient(id, order) {
    const sortedData = this.sortData(id, order);
    this.subElements.body.innerHTML = this.getTableRows(sortedData);
  }
  sortData(field, order) {
    const arr = [...this.data];
    const column = this.headerConfig.find((item) => item.id === field);
    const { sortType } = column;
    const direction = order === "asc" ? 1 : -1;

    return arr.sort((a, b) => {
      switch (sortType) {
        case "number":
          return direction * (a[field] - b[field]);
        case "string":
          return direction * a[field].localeCompare(b[field], ["ru", "en"]);
        default:
          throw new Error(`Unknown type ${sortType}`);
      }
    });
  }

  async sortOnServer(id, order) {
    const start = 0;
    const end = start + this.step;
    const data = await this.loadData(id, order, start, end);

    this.renderRows(data);
  }

  renderRows(data) {
    if (data.length) {
      this.element.classList.remove("sortable-table_empty");
      this.addRows(data);
    } else {
      this.element.classList.add("sortable-table_empty");
    }
  }
  addRows(data) {
    this.data = data;
    this.subElements.body.innerHTML = this.getTableRows(data);
  }

  toggleLoader(action = "") {
    const loaderClassname = "sortable-table_loading";

    this.element.classList[action](loaderClassname);
  }
  showLoader() {
    this.toggleLoader("add");
  }
  hideLoader() {
    this.toggleLoader("remove");
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }

  initEventListeners() {
    this.subElements.header.addEventListener("pointerdown", this.onSortClick);

    if (!this.isSortLocally) {
      document.addEventListener("scroll", this.onWindowScroll);
    }
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.subElements = {};
    this.element = null;

    if (!this.isSortLocally) {
      window.removeEventListener("scroll", this.onWindowScroll);
    }
  }
}
