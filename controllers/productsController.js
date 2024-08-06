const ProductModel = require("../models/ProductModel");
const ProductImage = require("../models/ProductImage");
const { Op } = require("sequelize");
const sequelize = require("../config/database");

//CUSTOMER

//Menampilkan semua product
const findAllProducts = async (req, res) => {
  try {
    const dataProducts = await ProductModel.findAll();

    const result = {
      status: "ok",
      data: dataProducts,
    };
    res.json(result);
  } catch (error) {
    console.log(error, "<<<-- Error find all products");
  }
};

//Menampilkan product berdasarkan ID
const getProductById = async (req, res) => {
  try {
    //mendapatkan req params
    const { id } = req.params;

    const dataProduct = await ProductModel.findByPk(id);
    if (dataProduct === null) {
      return res.status(404).json({
        status: "failed",
        message: `data product with id ${id} is not found`,
      });
    }
    res.json({
      status: "ok",
      data: dataProduct,
    });
  } catch (error) {
    console.log(error, "<<<- error get product by id");
  }
};

//Menampilkan product berdasarkan kategory
const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const products = await ProductModel.findAll({
      where: {
        category_product: {
          [Op.like]: `%${category}%`,
        },
      },
    });

    res.json({
      status: "success",
      data: products,
    });
  } catch (error) {
    console.error("Error retrieving products by category:", error);
    res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
    });
  }
};

// Controller to get product by ID within a specific category
const getProductByIdInCategory = async (req, res) => {
  try {
    const { category, id } = req.params;

    // You may want to validate the category and id inputs here

    const dataProduct = await ProductModel.findOne({
      where: {
        id: {
          [Op.like]: `%${id}%`,
        },
        category_product: {
          [Op.like]: `%${category}%`,
        },
      },
    });

    if (!dataProduct) {
      return res.status(404).json({
        status: "failed",
        message: `Product with id ${id} in category ${category} not found`,
      });
    }

    res.json({
      status: "ok",
      data: dataProduct,
    });
  } catch (error) {
    console.error("Error retrieving product by id in category:", error);
    res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
    });
  }
};

//ADMIN//

//Menambahkan Product Baru
// const createNewProduct = async (req, res) => {
//   try {
//     const {
//       name,
//       description,
//       category,
//       color,
//       image,
//       price,
//       stock,
//       discount,
//     } = req.body;

//     const newProduct = await ProductModel.create({
//       name,
//       description,
//       category,
//       color,
//       image,
//       price,
//       stock,
//       discount,
//     });

//     res.status(201).json({
//       status: "ok",
//       data: newProduct,
//     });
//   } catch (error) {
//     console.log(error, "<<<- Error create new product");
//     res.status(500).json({
//       status: "failed",
//       message: "Internal Server Error",
//     });
//   }
// };

//Menambahkan Product Baru dengan gambar tambahan
const addProductWithImages = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      name,
      description,
      category,
      color,
      image,
      price,
      stock,
      discount,
      images,
    } = req.body;

    // Membuat produk
    const product = await ProductModel.create(
      {
        name,
        description,
        category,
        color,
        image,
        price,
        stock,
        discount,
      },
      { transaction }
    );

    // Membuat gambar produk
    if (images && images.length > 0) {
      const productImages = images.map((imageUrl) => ({
        product_id: product.id,
        image_url: imageUrl,
      }));
      await ProductImage.bulkCreate(productImages, { transaction });
    }

    await transaction.commit();
    res.status(201).json(product);
  } catch (error) {
    await transaction.rollback();
    res
      .status(500)
      .json({ message: "Error creating product with images", error });
  }
};

// Update Product with images
const updateProductWithImages = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const productId = req.params.id;

    // Memeriksa apakah ID produk valid
    if (!productId) {
      await transaction.rollback();
      return res.status(400).json({
        status: "failed",
        message: "ID produk tidak valid",
      });
    }

    // Mengambil data produk yang ada
    const existingProduct = await ProductModel.findByPk(productId);

    // Memeriksa apakah produk ada
    if (!existingProduct) {
      await transaction.rollback();
      return res.status(404).json({
        status: "failed",
        message: `Produk dengan ID ${productId} tidak ditemukan`,
      });
    }

    const {
      name,
      description,
      category,
      color,
      image,
      price,
      stock,
      discount,
      images,
    } = req.body;

    // Memperbarui produk dengan data baru dari body request
    const updatedProduct = await existingProduct.update(
      {
        name,
        description,
        category,
        color,
        image,
        price,
        stock,
        discount,
      },
      { transaction }
    );

    // Memperbarui gambar produk
    if (images && images.length > 0) {
      // Hapus gambar produk lama
      await ProductImage.destroy({
        where: { product_id: productId },
        transaction,
      });

      // Tambahkan gambar produk baru
      const productImages = images.map((imageUrl) => ({
        product_id: productId,
        image_url: imageUrl,
      }));
      await ProductImage.bulkCreate(productImages, { transaction });
    }

    await transaction.commit();
    res.json({
      status: "success",
      message: "Produk berhasil diperbarui",
      productBeforeUpdate: existingProduct,
      productUpdated: updatedProduct,
    });
  } catch (error) {
    await transaction.rollback();
    console.error(error, "<< Error updating product");
    next(error); // Pass the error to the next middleware (error handler)
  }
};

// Menghapus product berdasarkan ID
const deleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;

    // Check if productId is valid
    if (!productId) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid product ID",
      });
    }

    const productDataDeleted = await ProductModel.findByPk(productId);

    // Use ProductModel.destroy with a where clause to delete the product
    const productDeleted = await ProductModel.destroy({
      where: { id: productId },
    });

    // Check if any rows were affected (product deleted)
    if (productDeleted === 0) {
      return res.status(404).json({
        status: "failed",
        message: `Product with ID ${productId} not found`,
      });
    }

    res.json({
      status: "success",
      message: "Product deleted successfully",
      productDeleted: productDataDeleted,
    });
  } catch (error) {
    console.error(error, "<< Error deleting product");
    next(error); // Pass the error to the next middleware (error handler)
  }
};

module.exports = {
  findAllProducts,
  getProductById,
  getProductsByCategory,
  getProductByIdInCategory,
  // createNewProduct,
  deleteProduct,
  // updateProduct,
  updateProductWithImages,
  addProductWithImages,
};
