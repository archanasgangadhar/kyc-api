const express = require("express");
const router = express.Router();

const upload = require("../middlewares/upload.middleware");
const controller = require("../controllers/employee.controller");
const downloadController = require("../controllers/download.controller");
const exportController = require("../controllers/export.controller");


router.post("/join", upload.any(), controller.submitForm);
router.get("/employee/:employeeId/zip", downloadController.downloadEmployeeZip);
// Add alternate download route for HR UI compatibility
router.get("/api/download/employee/:employeeId/zip", downloadController.downloadEmployeeZip);
router.get("/hr/export/excel", exportController.exportAllEmployeesExcel);




module.exports = router;
