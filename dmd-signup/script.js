(function () {
  var form = document.getElementById("signup-form");
  var status = document.getElementById("form-status");
  var consent = document.getElementById("marketing-consent");
  var frame = document.querySelector(".submit-frame");
  var button = form ? form.querySelector(".signup-button") : null;
  var hasSubmitted = false;

  if (!form || !status || !consent || !frame || !button) {
    return;
  }

  function setStatus(message, isError) {
    status.textContent = message;
    status.dataset.state = isError ? "error" : "ok";
  }

  function setButtonState(state) {
    var label = "Sign Up";
    var visualLabel = "Sign Up";

    if (state === "loading") {
      label = "Sending";
      visualLabel = "Sending";
    }

    if (state === "success") {
      label = "Sent";
      visualLabel = "Sent";
    }

    button.dataset.state = state;
    button.disabled = state === "loading" || state === "success";
    button.setAttribute("aria-busy", state === "loading" ? "true" : "false");
    button.setAttribute("aria-label", label);
    button.querySelector(".button-text").textContent = visualLabel;
  }

  function resetSubmitState() {
    setButtonState("idle");
  }

  form.addEventListener("submit", function (event) {
    var action = form.getAttribute("action") || "";
    var email = form.elements.EMAIL;
    var name = form.elements.FIRSTNAME;
    var honeypot = form.elements.email_address_check;

    if (honeypot && honeypot.value) {
      event.preventDefault();
      return;
    }

    if (!action || action.indexOf("sibforms.com/serve/") === -1) {
      event.preventDefault();
      setStatus("Email signup is not configured yet.", true);
      return;
    }

    if (!name || !name.validity.valid) {
      event.preventDefault();
      setStatus("Enter your name to join the update list.", true);
      resetSubmitState();
      if (name) {
        name.focus();
      }
      return;
    }

    if (!email || !email.validity.valid) {
      event.preventDefault();
      setStatus("Enter a valid email address.", true);
      resetSubmitState();
      if (email) {
        email.focus();
      }
      return;
    }

    if (!consent.checked) {
      event.preventDefault();
      setStatus("Confirm email consent to join the update list.", true);
      resetSubmitState();
      consent.focus();
      return;
    }

    hasSubmitted = true;
    setButtonState("loading");
    setStatus("Sending...", false);
  });

  frame.addEventListener("load", function () {
    if (!hasSubmitted) {
      return;
    }

    form.reset();
    hasSubmitted = false;
    setButtonState("success");
    setStatus("Success. Check your inbox to confirm your subscription.", false);

    window.setTimeout(function () {
      setButtonState("idle");
    }, 3600);
  });
})();
