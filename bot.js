(function () {
  var SHOP = "https://shop.gbar.ua/advent";
  var SALON = "https://gbar.com.ua";
  var log = document.getElementById("log");
  var controls = document.getElementById("controls");
  var lead = {};

  function pushEvent(name, extra) {
    var row = { event: name };
    if (extra) {
      Object.keys(extra).forEach(function (key) { row[key] = extra[key]; });
    }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(row);
  }

  function bubble(text, who) {
    var p = document.createElement("p");
    p.className = who === "user" ? "bubble me" : "bubble";
    p.textContent = text;
    log.appendChild(p);
    log.scrollTop = log.scrollHeight;
  }

  function clearControls() {
    controls.innerHTML = "";
  }

  function buttons(items) {
    clearControls();
    items.forEach(function (item) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = item.label;
      b.addEventListener("click", function () {
        bubble(item.label, "user");
        clearControls();
        item.go();
      });
      controls.appendChild(b);
    });
  }

  function field(label, placeholder, next) {
    clearControls();
    var lab = document.createElement("label");
    lab.textContent = label;
    var input = document.createElement("input");
    input.type = "text";
    input.placeholder = placeholder;
    input.autocomplete = "on";
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = "Далі";
    b.addEventListener("click", function () {
      var value = input.value.trim();
      if (!value) {
        input.focus();
        return;
      }
      bubble(value, "user");
      clearControls();
      next(value);
    });
    controls.appendChild(lab);
    controls.appendChild(input);
    controls.appendChild(b);
    input.focus();
  }

  function linkLine(href, text) {
    var p = document.createElement("p");
    p.className = "bubble";
    var a = document.createElement("a");
    a.href = href;
    a.textContent = text;
    a.target = "_blank";
    a.rel = "noopener";
    p.appendChild(a);
    log.appendChild(p);
  }

  function start() {
    bubble("Вітаю. Я навчальний бот про G×Advent 2026. Склад комірок не вигадую. Що шукаєте?");
    buttons([
      { label: "Коробку адвенту", go: askForWhom },
      { label: "Запис у салон", go: salon },
      { label: "Питання про шкіру", go: doctor }
    ]);
  }

  function salon() {
    lead.intent = "salon";
    bubble("Манікюр, мейк, укладка і брови живуть на сайті салону. Запис: ім’я і телефон, далі дзвонить адміністратор. Це не миттєвий слот і не покупка коробки.");
    linkLine(SALON, "Відкрити gbar.com.ua");
    bubble("Гілку магазину тут закриваю.");
  }

  function doctor() {
    lead.intent = "doctor";
    bubble("Висипання, дерматит і псоріаз я не дивлюся і товар під це не пропоную. З таким питанням зверніться до лікаря.");
  }

  function askForWhom() {
    lead.intent = "advent";
    bubble("Для кого набір?");
    buttons([
      { label: "Собі", go: function () { lead.forWhom = "собі"; askCountry(); } },
      { label: "У подарунок", go: function () { lead.forWhom = "подарунок"; askCountry(); } }
    ]);
  }

  function askCountry() {
    bubble("Куди веземо? Доставка лише Україною.");
    buttons([
      { label: "Україна", go: function () { lead.country = "Україна"; askCity(); } },
      { label: "Інша країна", go: abroad }
    ]);
  }

  function abroad() {
    lead.country = "інша";
    bubble("За кордон набір не їде. Форму не продовжую і коробку не тримаю.");
  }

  function askCity() {
    bubble("Напишіть місто в Україні. Нову пошту навмання не обіцяю.");
    field("Місто", "Наприклад, Львів", function (value) {
      lead.city = value;
      askName();
    });
  }

  function askName() {
    bubble("Як до вас звертатися?");
    field("Ім’я", "Ім’я", function (value) {
      lead.name = value;
      askContact();
    });
  }

  function askContact() {
    bubble("Телефон або пошта. Оплата зараз не потрібна: на магазині кнопка ще «Скоро буде».");
    field("Телефон або пошта", "+380 або name@poshta", function (value) {
      var phone = value.replace(/[^\d]/g, "");
      var email = value.indexOf("@") > 0 && value.indexOf(".") > value.indexOf("@");
      if (phone.length < 10 && !email) {
        bubble("Схоже, контакту не вистачає. Потрібен телефон від 10 цифр або пошта з @.");
        askContact();
        return;
      }
      lead.contact = value;
      askConsent();
    });
  }

  function askConsent() {
    bubble("Окремий клік. Галка наперед не стоїть. Погоджуєтесь, щоб це ім’я і контакт лишились у листі очікування на екрані? На пошту заявка не вирушає.");
    buttons([
      { label: "Погоджуюсь", go: finish },
      { label: "Не погоджуюсь", go: refuse }
    ]);
  }

  function refuse() {
    lead.consent = false;
    bubble("Без згоди заявку не зберігаю. Дякую, що зайшли.");
  }

  function finish() {
    lead.consent = true;
    pushEvent("generate_lead", { forWhom: lead.forWhom, city: lead.city });
    bubble(lead.name + ", заявку прийнято як лист очікування. Це не оплата і не входить у план 93 покупок.");
    bubble("Набір: G×Advent 2026, 7 900 грн, 20 коробочок догляду. Для кого: " + lead.forWhom + ". Місто: " + lead.city + ". Контакт лишається лише в цьому вікні.");
    bubble("Коли на shop.gbar.ua з’явиться кнопка «Купити», замовлення робиться там. Склад комірок я як і раніше не називаю.");
    linkLine(SHOP, "Відкрити картку shop.gbar.ua/advent");
  }

  start();
})();
