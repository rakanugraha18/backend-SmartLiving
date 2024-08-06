const product = require("../controllers/productsController");
const router = require("express").Router();

router.get("/products", product.findAllProducts);
router.get("/products/:id", product.getProductById);
router.get("/products/category/:category", product.getProductsByCategory);
router.get(
  "/products/category/:category/:id",
  product.getProductByIdInCategory
);
router.delete("/products/:id", product.deleteProduct);
router.put("/products/:id", product.updateProductWithImages);
router.post("/new-product", product.addProductWithImages);

module.exports = router;
