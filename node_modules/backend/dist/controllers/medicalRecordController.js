"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMedicalRecord = exports.updateMedicalRecord = exports.createMedicalRecord = exports.getMedicalRecordById = exports.getMedicalRecords = void 0;
const supabase_1 = require("../config/supabase");
const getMedicalRecords = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabase_1.supabase.from('medical_records').select('*');
    if (error)
        return res.status(500).json({ error: error.message });
    res.status(200).json(data);
});
exports.getMedicalRecords = getMedicalRecords;
const getMedicalRecordById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { data, error } = yield supabase_1.supabase.from('medical_records').select('*').eq('id', id).single();
    if (error)
        return res.status(500).json({ error: error.message });
    if (!data)
        return res.status(404).json({ message: 'Medical record not found' });
    res.status(200).json(data);
});
exports.getMedicalRecordById = getMedicalRecordById;
const createMedicalRecord = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const newMedicalRecord = req.body;
    const { data, error } = yield supabase_1.supabase.from('medical_records').insert([newMedicalRecord]).select();
    if (error)
        return res.status(500).json({ error: error.message });
    res.status(201).json(data);
});
exports.createMedicalRecord = createMedicalRecord;
const updateMedicalRecord = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const updatedMedicalRecord = req.body;
    const { data, error } = yield supabase_1.supabase.from('medical_records').update(updatedMedicalRecord).eq('id', id).select();
    if (error)
        return res.status(500).json({ error: error.message });
    if (!data || data.length === 0)
        return res.status(404).json({ message: 'Medical record not found or no changes made' });
    res.status(200).json(data);
});
exports.updateMedicalRecord = updateMedicalRecord;
const deleteMedicalRecord = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { error } = yield supabase_1.supabase.from('medical_records').delete().eq('id', id);
    if (error)
        return res.status(500).json({ error: error.message });
    res.status(204).send();
});
exports.deleteMedicalRecord = deleteMedicalRecord;
