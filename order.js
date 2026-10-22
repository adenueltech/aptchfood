const products = {
  "happy-burger": { name: "The Happy Burger", price: 8.5 },
  "garden-bowl": { name: "Garden Party Bowl", price: 7.25 },
  "berry-shake": { name: "Berry Good Shake", price: 4.75 }
};
const TAX_RATE = 0.085;
const CART_KEY = "aptech-cart";
const ORDER_KEY = "aptech-order";

const cartItems = document.querySelector(".cart-items");
const emptyMessage = document.querySelector(".cart-empty");
const cartCount = document.querySelector(".cart-count");
const orderButton = document.querySelector(".place-order");
const orderButtonLabel = document.querySelector("[data-order-button-label]");
const orderForm = document.querySelector(".order-form");
const deliveryAddressField = document.querySelector(".delivery-address-field");
const deliveryAddress = document.querySelector("#delivery-address");
const cart = JSON.parse(localStorage.getItem(CART_KEY) || "{}");

const paymentOptions = Array.from(document.querySelectorAll('input[name="payment"]'));
const cardFields = document.querySelector("[data-card-fields]");
const cardInputs = Array.from(cardFields.querySelectorAll("input"));
const cardNumber = document.querySelector("#card-number");
const cardExpiry = document.querySelector("#card-expiry");
const cardCvc = document.querySelector("#card-cvc");

function updateFulfilmentFields() {
  const isDelivery = orderForm.elements.fulfilment.value === "delivery";
  deliveryAddressField.hidden = !isDelivery;
  deliveryAddress.required = isDelivery;
}

// jjjjjjj

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function cartEntries() {
  return Object.entries(cart).filter(([id, quantity]) =>
    Object.hasOwn(products, id) && Number.isInteger(quantity) && quantity > 0
  );
}

function renderCart() {
  cartItems.replaceChildren();
  cartEntries().forEach(([id, quantity]) => {
    const row = document.createElement("div");
    row.className = "cart-item";
    const name = document.createElement("strong");
    name.textContent = products[id].name;
    const controls = document.createElement("div");
    controls.className = "quantity-controls";

    const decrease = document.createElement("button");
    decrease.type = "button";
    decrease.textContent = "−";
    decrease.setAttribute("aria-label", `Remove one ${products[id].name}`);
    decrease.addEventListener("click", () => updateQuantity(id, -1));

    const count = document.createElement("span");
    count.textContent = String(quantity);
    count.setAttribute("aria-label", `Quantity: ${quantity}`);

    const increase = document.createElement("button");
    increase.type = "button";
    increase.textContent = "+";
    increase.setAttribute("aria-label", `Add one ${products[id].name}`);
    increase.addEventListener("click", () => updateQuantity(id, 1));

    controls.append(decrease, count, increase);
    row.append(name, controls);
    cartItems.append(row);
  });

  const itemCount = cartEntries().reduce((total, [, quantity]) => total + quantity, 0);
  cartCount.textContent = `${itemCount} ${itemCount === 1 ? "item" : "items"}`;
  emptyMessage.hidden = itemCount > 0;
  orderButton.disabled = itemCount === 0;
}

function updateQuantity(id, change) {
  cart[id] = (cart[id] || 0) + change;
  if (cart[id] <= 0) delete cart[id];
  saveCart();
  renderCart();
}

document.querySelectorAll("[data-add]").forEach((button) => {
  button.addEventListener("click", () => updateQuantity(button.dataset.add, 1));
});

orderForm.querySelectorAll('input[name="fulfilment"]').forEach((option) => {
  option.addEventListener("change", updateFulfilmentFields);
});

function selectedPaymentMethod() {
  const checked = paymentOptions.find((option) => option.checked);
  return checked ? checked.value : "card";
}

function applyPaymentMethod() {
  const method = selectedPaymentMethod();
  const isCard = method === "card";
  cardFields.hidden = !isCard;
  cardInputs.forEach((input) => {
    input.required = isCard;
  });
  orderButtonLabel.textContent = isCard ? "Pay & place order" : "Place order";
  paymentOptions.forEach((option) => {
    option.closest(".payment-option").classList.toggle("is-selected", option.checked);
  });
}

paymentOptions.forEach((option) => {
  option.addEventListener("change", applyPaymentMethod);
});

cardNumber.addEventListener("input", () => {
  const digits = cardNumber.value.replace(/\D/g, "").slice(0, 16);
  cardNumber.value = digits.replace(/(.{4})/g, "$1 ").trim();
});

cardExpiry.addEventListener("input", () => {
  const digits = cardExpiry.value.replace(/\D/g, "").slice(0, 4);
  cardExpiry.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
});

cardCvc.addEventListener("input", () => {
  cardCvc.value = cardCvc.value.replace(/\D/g, "").slice(0, 4);
});

function roundToCents(value) {
  return Math.round(value * 100) / 100;
}

function createOrderNumber() {
  return `APT-${10000 + Math.floor(Math.random() * 89999)}`;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

orderForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!orderForm.reportValidity()) return;

  const entries = cartEntries();
  if (entries.length === 0) return;

  const customerName = document.querySelector("#customer-name").value.trim();
  const customerPhone = document.querySelector("#customer-phone").value.trim();
  const fulfilment = orderForm.elements.fulfilment.value;
  const method = selectedPaymentMethod();
  const isCard = method === "card";

  const items = entries.map(([id, quantity]) => ({
    id,
    name: products[id].name,
    price: products[id].price,
    quantity
  }));
  const subtotal = roundToCents(items.reduce((sum, item) => sum + item.price * item.quantity, 0));
  const tax = roundToCents(subtotal * TAX_RATE);
  const total = roundToCents(subtotal + tax);

  const order = {
    id: createOrderNumber(),
    createdAt: new Date().toISOString(),
    name: customerName,
    phone: customerPhone,
    fulfilment,
    address: fulfilment === "delivery" ? deliveryAddress.value.trim() : "",
    paymentMethod: method,
    paymentStatus: isCard ? "paid" : "due",
    paymentLabel: isCard
      ? `Card ending ${cardNumber.value.replace(/\D/g, "").slice(-4)}`
      : "Pay at counter (cash or card)",
    items,
    subtotal,
    tax,
    total
  };

  if (isCard) {
    orderButton.disabled = true;
    orderButtonLabel.textContent = "Processing payment…";
    await wait(1100);
  }

  localStorage.setItem(ORDER_KEY, JSON.stringify(order));
  localStorage.removeItem(CART_KEY);
  window.location.href = "success.html";
});

document.querySelector("#year").textContent = new Date().getFullYear();
updateFulfilmentFields();
applyPaymentMethod();
renderCart();
