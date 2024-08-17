const address = require("../controllers/addressController");
const { isCustomer } = require("../middlewares/auth");

const router = require("express").Router();

router.get("/address/:id", address.getAddressById);
router.get("/address", address.getAddressByTokenId);
router.get("/addresses/check", isCustomer, address.checkAddress);
router.post("/add-address", isCustomer, address.createNewAddress);
router.put("/address/:id", isCustomer, address.updateAddress);
router.delete("/address/:id", isCustomer, address.deleteAddress);

module.exports = router;
