"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const patientController_1 = require("../controllers/patientController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticateToken); // Apply authentication middleware to all patient routes
router.get('/', patientController_1.getPatients);
router.get('/:id', patientController_1.getPatientById);
router.post('/', patientController_1.createPatient);
router.put('/:id', patientController_1.updatePatient);
router.delete('/:id', patientController_1.deletePatient);
exports.default = router;
