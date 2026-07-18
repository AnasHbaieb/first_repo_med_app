import { Router } from 'express';
import { getMedicalRecords, getMedicalRecordById, createMedicalRecord, updateMedicalRecord, deleteMedicalRecord } from '../controllers/medicalRecordController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken); // Apply authentication middleware to all medical record routes

router.get('/', getMedicalRecords);
router.get('/:id', getMedicalRecordById);
router.post('/', createMedicalRecord);
router.put('/:id', updateMedicalRecord);
router.delete('/:id', deleteMedicalRecord);

export default router;
