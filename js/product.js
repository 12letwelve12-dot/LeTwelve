(() => {
  const id = new URLSearchParams(location.search).get("id");
  const products = window.LETWELVE_PRODUCTS;
  const root = document.getElementById("productDetail");
  const message = document.getElementById("detailMessage");

  if (!Array.isArray(products)) {
    if (message) message.textContent = "No se han podido cargar los datos del producto. Comprueba que js/products-data.js está en la carpeta js.";
    return;
  }

  const p = products.find(item => item.id === id);
  if (!p) {
    root.innerHTML = '<p><a href="shop.html">← VOLVER A SHOP ALL</a></p><h1>Producto no encontrado</h1><p>Vuelve a Shop All y selecciona un producto.</p>';
    return;
  }

  document.title = p.name + " — LeTwelve";
  const image = document.getElementById("detailImage");
  image.src = p.image;
  image.alt = p.name;
  image.loading = "eager";
  image.onerror = () => {
    image.alt = "No se ha podido cargar la imagen de " + p.name;
    if (message) message.textContent = "No se encuentra la fotografía: " + p.image + ". Asegúrate de subir la carpeta assets completa.";
  };

  const englishNames = {
    "Sudadera negra": "Black Hoodie",
    "Pantalón negro": "Black Joggers",
    "Sudadera camuflaje": "Camo Hoodie",
    "Pantalón camuflaje": "Camo Joggers"
  };
  const englishDescriptions = {
    "Black Tracksuit": "Complete black LeTwelve tracksuit. An urban outfit designed for comfort and a distinctive identity.",
    "Sudadera negra": "Black LeTwelve hoodie, designed to pair with the matching joggers or wear on its own.",
    "Pantalón negro": "Black LeTwelve joggers. A comfortable and versatile piece to complete your urban outfit.",
    "Camo Tracksuit": "Complete LeTwelve camo tracksuit. A distinctive urban look, designed to be worn together or separately.",
    "Sudadera camuflaje": "LeTwelve camouflage hoodie, available to purchase separately.",
    "Pantalón camuflaje": "LeTwelve camouflage joggers, available to purchase separately."
  };

  const name = document.getElementById("detailName");
  name.textContent = p.name;
  name.dataset.es = p.name;
  name.dataset.en = englishNames[p.name] || p.name;

  const tag = document.getElementById("detailTag");
  tag.textContent = p.tag + " / LETWELVE";
  const price = document.getElementById("detailPrice");
  price.textContent = (p.old ? p.old + " € → " : "") + p.price + " €";

  const description = document.getElementById("detailDescription");
  description.textContent = p.desc;
  description.dataset.es = p.desc;
  description.dataset.en = englishDescriptions[p.name] || p.desc;

  const note = document.getElementById("detailNote");
  note.textContent = p.note || "Prenda disponible para comprar por separado.";
  document.dispatchEvent(new Event("letwelve-product-loaded"));

  document.getElementById("detailAdd").onclick = () => {
    const size = document.getElementById("detailSize").value;
    const qty = Math.max(1, Math.min(10, Number(document.getElementById("detailQty").value) || 1));
    if (!size) {
      message.textContent = "Selecciona una talla antes de añadir el producto.";
      return;
    }
    if (!window.LetwelveCart) {
      message.textContent = "No se ha podido iniciar el carrito. Recarga la página.";
      return;
    }
    window.LetwelveCart.add({ id: p.id, name: p.name, size, price: p.price, sku: p.id + "-" + size, qty });
    message.textContent = "✓ Producto añadido a tu bolsa.";
  };
})();
