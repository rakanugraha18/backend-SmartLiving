// const address = require("../controllers/addressController");
// const { isCustomer } = require("../middlewares/auth");

// const router = require("express").Router();

// router.get("/:id", isCustomer, address.getAddressById);
// router.get("/", isCustomer, address.getAddressByTokenId);
// router.get("/addresses/check", isCustomer, address.checkAddress);
// router.post("/add-address", isCustomer, address.createNewAddress);
// router.put("/:id", isCustomer, address.updateAddress);
// router.delete("/:id", isCustomer, address.deleteAddress);

// module.exports = router;

const address = require("../controllers/addressController");
const { isCustomer, isAdmin } = require("../middlewares/auth");

const router = require("express").Router();

// Mengambil alamat berdasarkan ID
router.get("/:id", isCustomer, address.getAddressById);

// Mengambil alamat berdasarkan token pengguna
router.get("/", isCustomer, address.getAddressByTokenId);

// Mengecek alamat pengguna (jika diperlukan)
router.get("/addresses/check", isCustomer, address.checkAddress);

// Menambahkan alamat baru
router.post("/add-address", isCustomer, address.createNewAddress);

// Memperbarui alamat berdasarkan ID
router.put("/:id", isCustomer, address.updateAddress);

// Menghapus alamat berdasarkan ID
router.delete("/:id", isCustomer, address.deleteAddress);

router.get("/check-all", isAdmin, address.findAllAddresses);

module.exports = router;
