const form = document.querySelector(".signup-form");
const headerCta = document.querySelector(".header-cta");

if (headerCta) {
  headerCta.addEventListener("click", () => {
    window.setTimeout(() => {
      document.querySelector("#FIRSTNAME")?.focus({ preventScroll: true });
    }, 500);
  });
}

if (form) {
  form.addEventListener("submit", () => {
    const button = form.querySelector("button");
    if (button) {
      button.textContent = "Sending";
      button.setAttribute("aria-busy", "true");
    }
  });
}
