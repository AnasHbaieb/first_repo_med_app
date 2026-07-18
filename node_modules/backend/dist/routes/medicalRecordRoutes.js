"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const medicalRecordController_1 = require("../controllers/medicalRecordController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticateToken); // Apply authentication middleware to all medical record routes
router.get('/', medicalRecordController_1.getMedicalRecords);
router.get('/:id', medicalRecordController_1.getMedicalRecordById);
router.post('/', medicalRecordController_1.createMedicalRecord);
router.put('/:id', medicalRecordController_1.updateMedicalRecord);
router.delete('/:id', medicalRecordController_1.deleteMedicalRecord);
exports.default = router;
