const { Router } = require("express");
const { listPrescriptions, getPrescription, createPrescription } = require("../controllers/prescriptionController");

const router = Router();

router.get("/", listPrescriptions);
router.get("/:id", getPrescription);
router.post("/", createPrescription);

module.exports = router;
