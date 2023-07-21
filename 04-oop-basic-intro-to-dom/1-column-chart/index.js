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

// потренируюсь с прототипным наследованием и прочей ботвой
{
  class MyComponent {
    firstProp = 50;

    constructor() {
      // this = {} неявно
      // this.title = 'title'
      // ... и дальнейшая модификация this
      // return this неявно

      this.title = "title"; //запишется на инстанс (экземпляр класса). Т.е. это собственные свойства объекта myObject
    }

    render() {
      console.log("parent render");
    }
    destroy() {}
    //эти методы записываются на прототип myObject, т.е. на класс MyCmponent
  }
  const myObject = new MyComponent();
  /* 
    
    При создании экземпляра класса мы получаем цепочку из ДВУХ прототипов: 
      1йы - это прототип, созданный при вызове new MyComponent(). 
      Т.е. сам класс при объявлении создает функцию MyComponent(). Она возвращает объект myObject при помощи new.
      Создается прототип, куда складываются методы класса в св-во prototype: MyComponent.prototype = render;
      2ой - это глобальный объект Object
  
  */

  console.log(myObject);
  console.log(myObject.constructor);

  // юзай исключительно для отладки (не все браузеры поймут)
  // свойство не стандартизировано. Не все среды его поймут
  console.log(myObject.__proto__); //строка ниже идентична

  console.log(MyComponent.prototype); //строка ниже идентична
  console.log(myObject.constructor.prototype);
  console.log(Object.getPrototypeOf(myObject));
  console.log(myObject.constructor === MyComponent); //true

  class MyComponentChild extends MyComponent {
    constructor() {
      super(); //дает доступ к this в данном классе
      this.newTitle = "one more title";
    }

    foo() {
      console.log("child foo");
    }
  }
  const myChildObject = new MyComponentChild();
  console.log(myChildObject);
  myChildObject.render();

  //это антипаттерн. НЕЛЬЗЯ мутировать самый главный прототип, т.к. это свойство будет доступно для ВСЕХ потомков
  /* Object.prototype.foo = "foo";
  console.log(myObject); */
}

/* {
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

{
  //если функция принимает в качестве параметров более трех аргументов,
  // то лучше передавать эти агрументы объектом
  // будет очень элегантно сделать сразу деструктуризацию
  function sum({ a = 1, d = 4, c = 1, b = 0 }) {
    //return a + b
    return c + b;
    return a + d;
  }

  console.log(sum({ a: 5, c: 8, d: 11 }));
} */

// Object.hasOwn предпочтительнее, нежели object.hasOwnProperty.
{
  /* 
     Вдруг объект был создан без прототипа. Хотя, конечно, вряд ли такое будет на практике)
  */
  const obj = {
    name: "dima",
    surname: "fail",
  };

  console.log(obj);
  console.log(obj.constructor);

  console.log(Object.getPrototypeOf(obj));
  console.log(Object.prototype);
  console.log(Object.getPrototypeOf(obj) === Object.prototype); //true
  console.log(obj.__proto__ === Object.prototype); //true

  console.log(obj.hasOwnProperty("name")); //true
  console.log(Object.hasOwn(obj, "name")); //true

  const object = Object.create(null); // создал объект без прототипа
  console.log(object);

  console.log(Object.hasOwn(object, "name")); //false
  //console.log(object.hasOwnProperty("name")); //Uncaught TypeError: object.hasOwnProperty is not a function
}
