import SortableList from "../2-sortable-list/index.js";
import escapeHtml from "./utils/escape-html.js";
import fetchJson from "./utils/fetch-json.js";

const IMGUR_CLIENT_ID = "28aaa2e823b03b1";
const BACKEND_URL = "https://course-js.javascript.ru";

export default class ProductForm {
  element;
  subElements = {};
  defaultFormData = {
    title: "",
    description: "",
    quantity: 1,
    subcategory: "",
    status: 1,
    images: [],
    price: 100,
    discount: 0,
  };
  onSubmit = (event) => {
    event.preventDefault();
    this.save();
  };
  uploadImage = () => {
    const fileInput = document.createElement("input");

    fileInput.type = "file";
    fileInput.accept = "image/*";

    fileInput.addEventListener("change", async () => {
      const [file] = fileInput.files;

      if (file) {
        const formData = new FormData();
        const { uploadImage, imageListContainer } = this.subElements;
        formData.append("image", file);

        uploadImage.classList.add("is-loading");
        uploadImage.disabled = true;

        const result = await fetchJson("https://api.imgur.com/3/image", {
          method: "POST",
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
          },
          body: formData,
          referrer: "",
        });

        const wrapperImage = document.createElement("div");

        wrapperImage.innerHTML = this.getImagesListItem(
          result.data.link,
          file.name
        );

        const image = wrapperImage.firstElementChild;

        imageListContainer.append(image);

        uploadImage.classList.remove("is-loading");
        uploadImage.disabled = false;

        fileInput.remove();
      }
    });

    fileInput.hidden = true;
    document.body.append(fileInput);

    fileInput.click();
  };

  constructor(productId = "") {
    this.productId = productId;
  }

  async render() {
    const categoriesPromise = this.loadCategories();

    const productsPromise = this.productId
      ? this.loadProductData(this.productId)
      : Promise.resolve(this.defaultFormData);

    const [categoriesData, productResponse] = await Promise.all([
      categoriesPromise,
      productsPromise,
    ]);
    this.formData = Array.isArray(productResponse)
      ? productResponse.at(0)
      : productResponse;

    this.categories = categoriesData;
    this.renderForm();
    this.createImagesList();
    this.initEventListeners();

    return this.element;
  }

  loadProductData(productId) {
    return fetchJson(`${BACKEND_URL}/api/rest/products?id=${productId}`);
  }
  loadCategories() {
    return fetchJson(
      `${BACKEND_URL}/api/rest/categories?_sort=weight&_refs=subcategory`
    );
  }

  renderForm() {
    const wrapper = document.createElement("div");

    wrapper.innerHTML = this.formData
      ? this.getTemplate(this.formData)
      : this.getEmptyTemplate();

    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements(this.element);
  }

  getTemplate(data) {
    return `
    <div class="product-form">

    <form data-element="productForm" class="form-grid">
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input required="" type="text" name="title" id="title" class="form-control" value='${
            data.title
          }' placeholder="Название товара">
        </fieldset>
      </div>
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea required="" class="form-control" name="description" id="description" data-element="productDescription"  placeholder="Описание товара">${
          data.description
        }</textarea>
      </div>

      <div class="form-group form-group__wide" data-element="sortable-list-container">
        <label class="form-label">${this.productId ? "Фото" : ""}</label>
        <div data-element="imageListContainer">
        </div>

        <button type="button" name="uploadImage" id="uploadImage" data-element='uploadImage' class="button-primary-outline">
          <span>Загрузить</span>
        </button>
      </div>

      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        ${this.createCategoriesSelect()}
      </div>

      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input required="" type="number" name="price" id="price" class="form-control" placeholder="100" value='${
            data.price
          }'>
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input required="" type="number" name="discount" id="discount" class="form-control" placeholder="0" value='${
            data.discount
          }'>
        </fieldset>
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input required="" type="number" class="form-control" id="quantity" name="quantity"  value='${
          data.quantity
        }' placeholder="1">
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Статус</label>
        <select class="form-control" name="status" id="status">
          <option value="1">Активен</option>
          <option value="0">Неактивен</option>
        </select>
      </div>
      <div class="form-buttons">
        <button type="submit" name="save" id="save" class="button-primary-outline">
          ${this.productId ? "Сохранить" : "Добавить"} товар
        </button>
      </div>
    </form>
  </div>
    
    `;
  }

  getEmptyTemplate() {
    return `
      <div>
      <h1 class="page-title"> Страница не найдена </h1>
        <p> Данный товар не существет! </p>
      </div>
    `;
  }

  createCategoriesSelect() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML =
      '<select class="form-control" name="subcategory" id="subcategory"></select>';
    const select = wrapper.firstElementChild;

    for (const category of this.categories) {
      for (const subcategory of category.subcategories) {
        select.append(
          new Option(`${category.title} > ${subcategory.title}`, subcategory.id)
        );
      }
    }
    return select.outerHTML;
  }

  createImagesList() {
    const { imageListContainer } = this.subElements;
    const images = this.formData.images.map((item) => {
      return this.getImagesListItem(item.url, item.source);
    });

    const sortableList = new SortableList({
      items: images,
    });
    imageListContainer.append(sortableList.element);
  }
  getImagesListItem(url, source) {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `<li class="products-edit__imagelist-item sortable-list__item" style="">
          <span>
            <img src="icon-grab.svg" data-grab-handle="" alt="grab">
            <img class="sortable-table__cell-img" alt="${escapeHtml(
              source
            )}" src="${escapeHtml(url)}">
            <span>${escapeHtml(source)}</span>
          </span>
          <button type="button">
            <img src="icon-trash.svg" data-delete-handle="" alt="delete">
          </button>
      </li>`;
    return wrapper.firstElementChild;
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

  async save() {
    const product = this.getFormData();

    try {
      const result = await fetchJson(`${BACKEND_URL}/api/rest/products`, {
        method: this.productId ? "PATCH" : "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      });
      this.dispatch(result.id);
    } catch (error) {
      console.error("something went wrong", error);
    }
  }

  getFormData() {
    const { productForm, imageListContainer } = this.subElements;
    const excludedFields = ["images"];
    const formatToNumber = ["price", "quantity", "discount", "status"];
    const fields = Object.keys(this.defaultFormData).filter(
      (item) => !excludedFields.includes(item)
    );
    const getValue = (field) =>
      productForm.querySelector(`[name=${field}]`).value;
    const values = {};

    for (const field of fields) {
      const value = getValue(field);

      values[field] = formatToNumber.includes(field) ? parseInt(value) : value;
    }

    const imagesHTMLCollection = imageListContainer.querySelectorAll(
      ".sortable-table__cell-img"
    );

    values.images = [];
    values.id = this.productId;

    for (const image of imagesHTMLCollection) {
      values.images.push({
        url: image.src,
        source: image.alt,
      });
    }
    return values;
  }

  initEventListeners() {
    const { productForm, uploadImage } = this.subElements;

    productForm.addEventListener("submit", this.onSubmit);
    uploadImage.addEventListener("click", this.uploadImage);
  }

  dispatch(id) {
    const event = this.productId
      ? new CustomEvent("product-updated", { detail: id })
      : new CustomEvent("product-saved");

    this.element.dispatchEvent(event);
  }

  destroy() {
    this.remove();
    this.subElements = null;
    this.element = null;
  }
  remove() {
    this.element.remove();
  }
}
