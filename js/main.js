/* CHOCO Content Lab — mini site
   Header state, mobile menu, and the quote form (sent via FormSubmit). */
(function () {
  "use strict";

  var header = document.getElementById("siteHeader");
  var toggle = document.getElementById("navToggle");

  function onScroll() {
    header.classList.toggle("scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  toggle.addEventListener("click", function () {
    var open = header.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });

  document.querySelectorAll(".main-nav a").forEach(function (link) {
    link.addEventListener("click", function () {
      header.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  /* Quote form: sends straight to the contact inbox via FormSubmit
     (formsubmit.co). The first submission triggers a one-time
     activation email to ryan.ding@chocoent.com; after he confirms,
     every submission arrives as a normal email. No mail app needed. */
  var FORM_ENDPOINT = "https://formsubmit.co/ajax/ryan.ding@chocoent.com";
  var form = document.getElementById("quoteForm");
  var note = document.getElementById("formNote");
  var sendBtn = form.querySelector(".btn-send");
  function showNote(text) { note.textContent = text; note.hidden = false; }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var data = new FormData(form);
    var name = (data.get("name") || "").trim();
    var company = (data.get("company") || "").trim();
    var payload = {
      "Name": name,
      "Company / brand": company,
      "Email or WeChat": (data.get("contact") || "").trim(),
      "Where do you want the brand to land?": (data.get("destination") || "").trim(),
      "_subject": "Quote request — " + (company || name),
      "_template": "table",
      "_cc": "calvin.fu@chocoent.com"
    };
    sendBtn.disabled = true;
    showNote("Sending…");
    fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (res) { return res.json().then(function (j) { return { ok: res.ok, j: j }; }); })
      .then(function (r) {
        if (r.ok && String(r.j.success) === "true") {
          form.reset();
          showNote("Thank you — your request has been sent. We will be in touch soon.");
        } else if (/activat/i.test(String(r.j.message || ""))) {
          showNote("This form is waiting for activation. Please email ryan.ding@chocoent.com directly for now.");
        } else {
          throw new Error("not sent");
        }
      })
      .catch(function () {
        showNote("Sorry, the request could not be sent. Please email ryan.ding@chocoent.com directly.");
      })
      .then(function () { sendBtn.disabled = false; });
  });
})();
