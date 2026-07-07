(function () {
  var form = document.getElementById("signup-form");
  var status = document.getElementById("form-status");
  var consent = document.getElementById("marketing-consent");
  var frame = document.querySelector(".submit-frame");
  var hasSubmitted = false;

  if (!form || !status || !consent || !frame) {
    return;
  }

  function setStatus(message, isError) {
    status.textContent = message;
    status.dataset.state = isError ? "error" : "ok";
  }

  form.addEventListener("submit", function (event) {
    var action = form.getAttribute("action") || "";
    var email = form.elements.EMAIL;
    var honeypot = form.elements.website;

    if (honeypot && honeypot.value) {
      event.preventDefault();
      return;
    }

    if (!action || action.indexOf("YOUR-BREVO-FORM-ACTION-URL") !== -1) {
      event.preventDefault();
      setStatus("Connect the Brevo form action URL before launch.", true);
      return;
    }

    if (!email || !email.validity.valid) {
      event.preventDefault();
      setStatus("Enter a valid email address.", true);
      if (email) {
        email.focus();
      }
      return;
    }

    if (!consent.checked) {
      event.preventDefault();
      setStatus("Confirm email consent to join the update list.", true);
      consent.focus();
      return;
    }

    hasSubmitted = true;
    setStatus("Submitting...", false);
  });

  frame.addEventListener("load", function () {
    if (!hasSubmitted) {
      return;
    }

    form.reset();
    hasSubmitted = false;
    setStatus("Thank you. Check your inbox to confirm your subscription.", false);
  });
})();
