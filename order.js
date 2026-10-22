const products = {
  "happy-burger": "The Happy Burger",
  "garden-bowl": "Garden Party Bowl",
  "berry-shake": "Berry Good Shake"
};
const cartItems = document.querySelector(".cart-items");
const emptyMessage = document.querySelector(".cart-empty");
const cartCount = document.querySelector(".cart-count");
const orderButton = document.querySelector(".place-order");
const orderForm = document.querySelector(".order-form");
const confirmation = document.querySelector(".order-confirmation");
const deliveryAddressField = document.querySelector(".delivery-address-field");
const deliveryAddress = document.querySelector("#delivery-address");
const cart = JSON.parse(localStorage.getItem("aptech-cart") || "{}");

function updateFulfilmentFields() {
  const isDelivery = orderForm.elements.fulfilment.value === "delivery";
  deliveryAddressField.hidden = !isDelivery;
  deliveryAddress.required = isDelivery;
}

// jjjjjjj

function saveCart() {
  localStorage.setItem("aptech-cart", JSON.stringify(cart));
}

function renderCart() {
  cartItems.replaceChildren();
  const entries = Object.entries(cart).filter(([id, quantity]) =>
    Object.hasOwn(products, id) && Number.isInteger(quantity) && quantity > 0
  );
  entries.forEach(([id, quantity]) => {
    const row = document.createElement("div");
    row.className = "cart-item";
    const name = document.createElement("strong");
    name.textContent = products[id];
    const controls = document.createElement("div");
    controls.className = "quantity-controls";

    const decrease = document.createElement("button");
    decrease.type = "button";
    decrease.textContent = "−";
    decrease.setAttribute("aria-label", `Remove one ${products[id]}`);
    decrease.addEventListener("click", () => updateQuantity(id, -1));

    const count = document.createElement("span");
    count.textContent = String(quantity);
    count.setAttribute("aria-label", `Quantity: ${quantity}`);

    const increase = document.createElement("button");
    increase.type = "button";
    increase.textContent = "+";
    increase.setAttribute("aria-label", `Add one ${products[id]}`);
    increase.addEventListener("click", () => updateQuantity(id, 1));

    controls.append(decrease, count, increase);
    row.append(name, controls);
    cartItems.append(row);
  });

  const itemCount = entries.reduce((total, [, quantity]) => total + quantity, 0);
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

orderForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!orderForm.reportValidity()) return;

  const customerName = document.querySelector("#customer-name").value.trim();
  const summary = Object.entries(cart)
    .filter(([id, quantity]) => Object.hasOwn(products, id) && quantity > 0)
    .map(([id, quantity]) => `${quantity} × ${products[id]}`);
  if (summary.length === 0) return;
  const fulfilment = orderForm.elements.fulfilment.value;
  const deliveryDetails = fulfilment === "delivery"
    ? `Delivery by dispatch rider to ${deliveryAddress.value.trim()}`
    : "You’ll pick up your order at the restaurant";

  confirmation.replaceChildren();
  const heading = document.createElement("h2");
  heading.textContent = `Thanks, ${customerName}!`;
  const message = document.createElement("p");
  message.textContent = `Your order request is ready: ${summary.join(", ")}. ${deliveryDetails}. This demo has not sent your order or contacted a rider.`;
  confirmation.append(heading, message);
  confirmation.hidden = false;
  confirmation.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

document.querySelector("#year").textContent = new Date().getFullYear();
updateFulfilmentFields();
renderCart();
