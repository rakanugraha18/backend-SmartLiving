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

const getProductWithImages = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the product along with associated images
    const product = await ProductModel.findOne({
      where: { id },
      include: [
        {
          model: ProductImage,
          as: "images", // Assuming you have an alias set in the association
          attributes: ["image_url"],
        },
      ],
    });

    // If the product is not found, return a 404 response
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching product with images", error });
  }
};

//Menampilkan product berdasarkan kategory
const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const products = await ProductModel.findAll({
      where: {
        category: {
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
        category: {
          [Op.like]: `%${category}%`,
        },
      },
      include: [
        {
          model: ProductImage,
          as: "images", // Assuming you have an alias set in the association
          attributes: ["image_url"],
        },
      ],
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

const getProductsByColor = async (req, res) => {
  try {
    const { color } = req.params;

    const products = await ProductModel.findAll({
      where: {
        color: {
          [Op.like]: `%${color}%`,
        },
      },
      include: [
        {
          model: ProductImage,
          as: "images", // Assuming you have an alias set in the association
          attributes: ["image_url"],
        },
      ],
    });

    if (products.length === 0) {
      return res.status(404).json({
        status: "failed",
        message: `No products found with color ${color}`,
      });
    }

    res.json({
      status: "success",
      data: products,
    });
  } catch (error) {
    console.error("Error retrieving products by color:", error);
    res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
    });
  }
};

const getProductByIdInColor = async (req, res) => {
  try {
    const { color, id } = req.params;

    // You may want to validate the color and id inputs here

    const dataProduct = await ProductModel.findOne({
      where: {
        id: {
          [Op.like]: `%${id}%`,
        },
        color: {
          [Op.like]: `%${color}%`,
        },
      },
      include: [
        {
          model: ProductImage,
          as: "images", // Assuming you have an alias set in the association
          attributes: ["image_url"],
        },
      ],
    });

    if (!dataProduct) {
      return res.status(404).json({
        status: "failed",
        message: `Product with id ${id} in color ${color} not found`,
      });
    }

    res.json({
      status: "ok",
      data: dataProduct,
    });
  } catch (error) {
    console.error("Error retrieving product by id in color:", error);
    res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
    });
  }
};

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

    // Mengambil produk dengan gambar-gambarnya
    const productWithImages = await ProductModel.findOne({
      where: { id: product.id },
      include: [
        {
          model: ProductImage,
          as: "images", // Pastikan ini sesuai dengan alias yang Anda gunakan
          attributes: ["image_url"],
        },
      ],
      transaction,
    });

    await transaction.commit();
    res.status(201).json(productWithImages);
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
        images,
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

    // Ambil gambar produk yang terbaru
    const updatedProductImages = await ProductImage.findAll({
      where: { product_id: productId },
    });

    await transaction.commit();
    res.json({
      id: updatedProduct.id,
      name: updatedProduct.name,
      description: updatedProduct.description,
      category: updatedProduct.category,
      color: updatedProduct.color,
      image: updatedProduct.image,
      price: updatedProduct.price,
      stock: updatedProduct.stock,
      discount: updatedProduct.discount,
      created_at: updatedProduct.createdAt,
      updated_at: updatedProduct.updatedAt,
      images: updatedProductImages.map((img) => ({
        image_url: img.image_url,
      })), // Format gambar sesuai dengan yang diinginkan
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

const deleteProductImage = async (req, res) => {
  try {
    const { imageId } = req.params;

    // Memeriksa apakah ID gambar valid
    if (!imageId) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid image ID",
      });
    }

    // Mencari gambar produk berdasarkan ID
    const imageToDelete = await ProductImage.findByPk(imageId);

    // Memeriksa apakah gambar ada
    if (!imageToDelete) {
      return res.status(404).json({
        status: "failed",
        message: `Image with ID ${imageId} not found`,
      });
    }

    // Menghapus gambar produk
    await ProductImage.destroy({
      where: { id: imageId },
    });

    res.json({
      status: "success",
      message: "Product image deleted successfully",
    });
  } catch (error) {
    console.error(error, "<< Error deleting product image");
    res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
      error,
    });
  }
};

const updateProduct = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const productId = req.params.id;
    const { name, description, price, images } = req.body;

    // Update product details
    const updatedProduct = await ProductModel.update(
      { name, description, price },
      { where: { id: productId }, returning: true, transaction }
    );

    // Handle images
    if (images && images.length > 0) {
      await ProductImage.destroy({
        where: { product_id: productId },
        transaction,
      });

      const productImages = images.map((imageUrl) => ({
        product_id: productId,
        image_url: imageUrl,
      }));
      await ProductImage.bulkCreate(productImages, { transaction });
    }

    await transaction.commit();
    res.json({ status: "success", data: updatedProduct });
  } catch (error) {
    await transaction.rollback();
    console.error(error, "<< Error updating product");
    res
      .status(500)
      .json({ status: "failed", message: "Internal Server Error" });
  }
};

module.exports = {
  findAllProducts,
  getProductWithImages,
  getProductsByCategory,
  getProductByIdInCategory,
  deleteProduct,
  updateProductWithImages,
  addProductWithImages,
  getProductsByColor,
  getProductByIdInColor,
  deleteProductImage,
  updateProduct,
};
