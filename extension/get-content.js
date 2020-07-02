(function () {
  if (window["loaded get-content.js"]) {
    return;
  }
  window["loaded get-content.js"] = true;
  browser.runtime.onMessage.addListener(() => {
    return Promise.resolve(document.body.innerText);
  });
})();
