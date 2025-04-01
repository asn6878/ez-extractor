// common.js
window.extractImages = function (container) {
  let root;
  if (arguments.length > 0 && container instanceof Element) {
    root = container;
  } else if (this instanceof Element && this !== window) {
    root = this;
  } else {
    root = document;
  }

  const imgs = root.querySelectorAll("img");
  const result = [];
  imgs.forEach((img) => {
    const className = img.getAttribute("class");
    const idName = img.getAttribute("id");
    result.push({
      src: img.src,
      className: className ? className : idName ? idName : "no identifier",
      id: idName ? idName : "no identifier",
    });
  });
  return result;
};
