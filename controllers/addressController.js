const { Op } = require("sequelize");
const { AddressModel } = require("../models");

// Menambahkan Alamat Baru
const createNewAddress = async (req, res) => {
  try {
    const {
      address_name,
      province,
      city,
      subdistrict,
      villages,
      full_address,
      postal_code,
      phone_number,
    } = req.body;

    // Ambil ID pengguna dari token
    const user_id = req.user.id; // Menggunakan id_user sebagai user ID

    // Pastikan ID pengguna ada
    if (!user_id) {
      return res.status(401).json({
        status: "failed",
        message: "User ID not found in the token",
      });
    }

    const details = {
      user_id,
      address_name,
      province,
      city,
      subdistrict,
      villages,
      full_address,
      postal_code,
      phone_number,
    };

    const newAddress = await AddressModel.create(details);

    res.status(201).json({
      status: "ok",
      data: newAddress,
    });
  } catch (error) {
    console.log(error, "<<<- Error create new address");
    res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
    });
  }
};

// Update address
const updateAddress = async (req, res, next) => {
  try {
    const addressId = req.params.id;

    // Check if addressId is valid
    if (!addressId) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid address ID",
      });
    }

    // Retrieve the existing address data
    const existingAddress = await AddressModel.findByPk(addressId);

    // Check if the address exists
    if (!existingAddress) {
      return res.status(404).json({
        status: "failed",
        message: `Address with ID ${addressId} not found`,
      });
    }

    // Update the Address with the new data from the request body
    const updatedAddress = await existingAddress.update(req.body);

    res.json({
      status: "success",
      message: "Address updated successfully",
      addressBeforeUpdate: existingAddress,
      addressUpdated: updatedAddress,
    });
  } catch (error) {
    console.error(error, "<< Error updating Address");
    next(error); // Pass the error to the next middleware (error handler)
  }
};

// Menghapus address berdasarkan ID
const deleteAddress = async (req, res, next) => {
  try {
    const addressId = req.params.id;

    // Check if AddressId is valid
    if (!addressId) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid Address ID",
      });
    }

    const addressDataDeleted = await AddressModel.findByPk(addressId);

    // Use AddressModel.destroy with a where clause to delete the Address
    const addressDeleted = await AddressModel.destroy({
      where: { id: addressId },
    });

    // Check if any rows were affected (Address deleted)
    if (addressDeleted === 0) {
      return res.status(404).json({
        status: "failed",
        message: `Address with ID ${addressId} not found`,
      });
    }

    res.json({
      status: "success",
      message: "Address deleted successfully",
      addressDeleted: addressDataDeleted,
    });
  } catch (error) {
    console.error(error, "<< Error deleting address");
    next(error); // Pass the error to the next middleware (error handler)
  }
};

// Menampilkan semua Address
const findAllAddresses = async (req, res) => {
  try {
    const dataAddresses = await AddressModel.findAll();

    const result = {
      status: "ok",
      data: dataAddresses,
    };
    res.json(result);
  } catch (error) {
    console.log(error, "<<<-- Error find all Addresses");
    res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
    });
  }
};

// Menampilkan Address berdasarkan ID
const getAddressById = async (req, res) => {
  try {
    const { id } = req.params;

    const dataAddress = await AddressModel.findByPk(id);
    if (!dataAddress) {
      return res.status(404).json({
        status: "failed",
        message: `Address with ID ${id} not found`,
      });
    }
    res.json({
      status: "ok",
      data: dataAddress,
    });
  } catch (error) {
    console.log(error, "<<<- Error get Address by ID");
    res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
    });
  }
};

// Menampilkan Address berdasarkan ID pengguna (token)
const getAddressByTokenId = async (req, res) => {
  try {
    const id_user = req.id_user; // Diambil dari token di middleware

    const dataAddresses = await AddressModel.findAll({
      where: { id_user },
      attributes: [
        "address_name",
        "province",
        "city",
        "subdistrict",
        "villages",
        "full_address",
        "postal_code",
        "phone_number",
      ],
    });

    if (dataAddresses.length === 0) {
      return res.status(404).json({
        status: "failed",
        message: `No addresses found for user with ID ${id_user}`,
      });
    }

    res.json({
      status: "ok",
      data: dataAddresses,
    });
  } catch (error) {
    console.log(error, "<<<- Error get Address by user ID");
    res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
    });
  }
};

// Mengecek alamat berdasarkan ID pengguna
const checkAddress = async (req, res) => {
  try {
    const id_user = req.id_user;

    if (!id_user) {
      return res.status(401).json({
        status: "failed",
        message: "User ID not found in the token",
      });
    }

    const userAddresses = await AddressModel.findAll({
      where: { id_user },
    });

    res.json({
      status: "ok",
      data: userAddresses,
    });
  } catch (error) {
    console.error(error, "<< Error getting addresses by user");
    res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  createNewAddress,
  updateAddress,
  deleteAddress,
  findAllAddresses,
  getAddressById,
  checkAddress,
  getAddressByTokenId,
};
