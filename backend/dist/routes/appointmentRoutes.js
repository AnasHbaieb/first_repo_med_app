"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const appointmentController_1 = require("../controllers/appointmentController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticateToken); // Apply authentication middleware to all appointment routes
router.get('/', appointmentController_1.getAppointments);
router.get('/:id', appointmentController_1.getAppointmentById);
router.post('/', appointmentController_1.createAppointment);
router.put('/:id', appointmentController_1.updateAppointment);
router.delete('/:id', appointmentController_1.deleteAppointment);
exports.default = router;
