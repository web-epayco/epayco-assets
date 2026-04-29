(function () {
  var BASE_URL = "https://web-epayco.github.io/epayco-assets/carousel/";

  function buildIframeCode(options) {
    var view = options.view || "both";
    var width = options.width || "100%";
    var height = options.height || "120";

    var src = BASE_URL + "?view=" + encodeURIComponent(view);
    return (
      '<iframe src="' +
      src +
      '" width="' +
      width +
      '" height="' +
      height +
      '" style="border:0;overflow:hidden" loading="lazy" referrerpolicy="no-referrer"></iframe>'
    );
  }

  function detectViewByClass(element) {
    if (element.classList.contains("epayco-copy-light")) return "light";
    if (element.classList.contains("epayco-copy-dark")) return "dark";
    if (element.classList.contains("epayco-copy-both")) return "both";
    return null;
  }

  async function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    var textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    var ok = document.execCommand("copy");
    document.body.removeChild(textArea);
    return ok;
  }

  function bindCopyButtons() {
    var buttons = document.querySelectorAll(
      ".epayco-copy-light, .epayco-copy-dark, .epayco-copy-both, [data-epayco-copy-iframe]"
    );
    buttons.forEach(function (button) {
      button.addEventListener("click", async function () {
        var classView = detectViewByClass(button);
        var iframeCode = buildIframeCode({
          view: classView || button.getAttribute("data-view") || "both",
          width: button.getAttribute("data-width") || "100%",
          height: button.getAttribute("data-height") || "120",
        });

        var label = button.getAttribute("data-copy-label") || "Copiar codigo iframe";
        var successLabel = button.getAttribute("data-success-label") || "Copiado";
        var errorLabel = button.getAttribute("data-error-label") || "No se pudo copiar";

        try {
          var ok = await copyText(iframeCode);
          button.textContent = ok ? successLabel : errorLabel;
        } catch (err) {
          button.textContent = errorLabel;
        }

        setTimeout(function () {
          button.textContent = label;
        }, 1400);
      });
    });
  }

  window.EpaycoIframeCopy = {
    buildIframeCode: buildIframeCode,
    bindCopyButtons: bindCopyButtons,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindCopyButtons);
  } else {
    bindCopyButtons();
  }
})();
