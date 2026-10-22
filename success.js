const ORDER_KEY = "aptech-order";
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" });

const successView = document.querySelector("[data-success-view]");
const emptyView = document.querySelector("[data-empty-view]");

function readOrder() {
  try {
    const raw = localStorage.getItem(ORDER_KEY);
    if (!raw) return null;
    const order = JSON.parse(raw);
    if (!order || !Array.isArray(order.items) || order.items.length === 0) return null;
    return order;
  } catch (error) {
    return null;
  }
}

function setText(selector, value) {
  const node = document.querySelector(selector);
  if (node) node.textContent = value;
}

function setAllText(selector, value) {
  document.querySelectorAll(selector).forEach((node) => {
    node.textContent = value;
  });
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateFormat.format(date);
}

function formatMoney(value) {
  return money.format(Number(value) || 0);
}

function renderItems(items) {
  const list = document.querySelector("[data-receipt-items]");
  list.replaceChildren();

  items.forEach((item) => {
    const row = document.createElement("li");
    row.className = "receipt-item";

    const name = document.createElement("span");
    name.className = "receipt-item-name";
    name.textContent = item.name;

    const quantity = document.createElement("span");
    quantity.className = "receipt-item-qty";
    quantity.textContent = `${item.quantity} × ${formatMoney(item.price)}`;

    const price = document.createElement("span");
    price.className = "receipt-item-price";
    price.textContent = formatMoney(item.price * item.quantity);

    row.append(name, quantity, price);
    list.append(row);
  });
}

function renderOrder(order) {
  const isPaid = order.paymentStatus === "paid";

  setAllText("[data-order-number]", order.id);
  setAllText("[data-customer-name]", order.name || "Friend");
  setAllText("[data-customer-phone]", order.phone || "—");
  setAllText("[data-order-date]", formatDate(order.createdAt));
  setText("[data-order-type]", order.fulfilment === "delivery" ? "Delivery" : "Pickup");
  setText("[data-subtotal]", formatMoney(order.subtotal));
  setText("[data-tax]", formatMoney(order.tax));
  setText("[data-total]", formatMoney(order.total));
  setText("[data-payment-method]", order.paymentLabel || "—");
  setText("[data-payment-status]", isPaid ? "Paid in full" : "Due at the counter");
  const deliveryDetails = document.querySelector("[data-delivery-details]");
  deliveryDetails.hidden = order.fulfilment !== "delivery";
  setText("[data-delivery-address]", order.address || "—");

  const pill = document.querySelector("[data-status-pill]");
  pill.textContent = isPaid ? "Paid" : "Payment due at counter";
  pill.classList.toggle("is-paid", isPaid);
  pill.classList.toggle("is-due", !isPaid);

  renderItems(order.items);

  successView.hidden = false;
  emptyView.hidden = true;
}

const order = readOrder();
if (order) {
  renderOrder(order);
} else {
  successView.hidden = true;
  emptyView.hidden = false;
}

document.querySelector("[data-print]").addEventListener("click", () => window.print());
document.querySelector("#year").textContent = new Date().getFullYear();
