const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
  navLinks.classList.toggle("is-open", !isOpen);
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
    navLinks.classList.remove("is-open");
  });
});

document.querySelectorAll(".menu-order").forEach((button) => {
  button.addEventListener("click", () => {
    const cart = JSON.parse(localStorage.getItem("aptech-cart") || "{}");
    cart[button.dataset.item] = (cart[button.dataset.item] || 0) + 1;
    localStorage.setItem("aptech-cart", JSON.stringify(cart));
    window.location.href = "order.html";
  });
});

const contactForm = document.querySelector("#contact-form");
const contactSuccess = document.querySelector("#contact-success");

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!contactForm.reportValidity()) return;

  const name = document.querySelector("#contact-name").value.trim();
  contactSuccess.textContent = `Thanks, ${name}! Your message is ready. Connect this form to your inbox to send it for real.`;
  contactSuccess.hidden = false;
  contactForm.reset();
});

document.querySelector("#year").textContent = new Date().getFullYear();
