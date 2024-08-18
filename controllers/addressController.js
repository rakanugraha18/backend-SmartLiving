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

    const user_id = req.user?.id; // Ambil ID pengguna dari token

    // Validasi input
    if (!user_id) {
      return res.status(401).json({
        status: "failed",
        message: "User ID tidak ditemukan dalam token",
      });
    }

    if (
      !address_name ||
      !province ||
      !city ||
      !subdistrict ||
      !villages ||
      !full_address ||
      !postal_code ||
      !phone_number
    ) {
      return res.status(400).json({
        status: "failed",
        message: "Semua field harus diisi",
      });
    }

    // Buat alamat baru
    const newAddress = await AddressModel.create({
      user_id,
      address_name,
      province,
      city,
      subdistrict,
      villages,
      full_address,
      postal_code,
      phone_number,
    });

    res.status(201).json({
      status: "ok",
      data: newAddress,
    });
  } catch (error) {
    console.error(error, "<<<- Error creating new address");
    res.status(500).json({
      status: "failed",
      message: "Terjadi kesalahan pada server",
    });
  }
};

// Update address
const updateAddress = async (req, res, next) => {
  try {
    const addressId = req.params.id;

    if (!addressId) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid address ID",
      });
    }

    const existingAddress = await AddressModel.findByPk(addressId);

    if (!existingAddress) {
      return res.status(404).json({
        status: "failed",
        message: `Address with ID ${addressId} not found`,
      });
    }

    const updatedAddress = await existingAddress.update(req.body);

    res.json({
      status: "success",
      message: "Address updated successfully",
      addressBeforeUpdate: existingAddress,
      addressUpdated: updatedAddress,
    });
  } catch (error) {
    console.error(error, "<< Error updating address");
    next(error); // Pass the error to the next middleware
  }
};

// Menghapus address berdasarkan ID
const deleteAddress = async (req, res, next) => {
  try {
    const addressId = req.params.id;

    if (!addressId) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid Address ID",
      });
    }

    const addressDataDeleted = await AddressModel.findByPk(addressId);

    if (!addressDataDeleted) {
      return res.status(404).json({
        status: "failed",
        message: `Address with ID ${addressId} not found`,
      });
    }

    await AddressModel.destroy({ where: { id: addressId } });

    res.json({
      status: "success",
      message: "Address deleted successfully",
      addressDeleted: addressDataDeleted,
    });
  } catch (error) {
    console.error(error, "<< Error deleting address");
    next(error); // Pass the error to the next middleware
  }
};

// Menampilkan semua Address
const findAllAddresses = async (req, res) => {
  try {
    const dataAddresses = await AddressModel.findAll();

    res.json({
      status: "ok",
      data: dataAddresses,
    });
  } catch (error) {
    console.error(error, "<<<-- Error finding all addresses");
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
    console.error(error, "<<<- Error getting address by ID");
    res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
    });
  }
};

// Menampilkan Address berdasarkan ID pengguna (token)
const getAddressByTokenId = async (req, res) => {
  try {
    const userId = req.user?.id; // Akses ID dari req.user

    if (!userId) {
      return res.status(401).json({
        status: "failed",
        message: "User ID not found in the token",
      });
    }

    const dataAddresses = await AddressModel.findAll({
      where: { user_id: userId },
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
        message: `No addresses found for user with ID ${userId}`,
      });
    }

    res.json({
      status: "ok",
      data: dataAddresses,
    });
  } catch (error) {
    console.error(error, "<<<- Error getting address by user ID");
    res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
    });
  }
};

// Mengecek alamat berdasarkan ID pengguna
const checkAddress = async (req, res) => {
  try {
    const userId = req.user?.id; // Akses ID dari req.user

    if (!userId) {
      return res.status(401).json({
        status: "failed",
        message: "User ID not found in the token",
      });
    }

    // Fetch user addresses from the database
    const userAddresses = await AddressModel.findAll({
      where: { user_id: userId },
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
