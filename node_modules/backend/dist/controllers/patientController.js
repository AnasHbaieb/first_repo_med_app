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
exports.deletePatient = exports.updatePatient = exports.createPatient = exports.getPatientById = exports.getPatients = void 0;
const supabase_1 = require("../config/supabase");
const getPatients = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabase_1.supabase.from('patients').select('*');
    if (error)
        return res.status(500).json({ error: error.message });
    res.status(200).json(data);
});
exports.getPatients = getPatients;
const getPatientById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { data, error } = yield supabase_1.supabase.from('patients').select('*').eq('id', id).single();
    if (error)
        return res.status(500).json({ error: error.message });
    if (!data)
        return res.status(404).json({ message: 'Patient not found' });
    res.status(200).json(data);
});
exports.getPatientById = getPatientById;
const createPatient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { first_name, last_name, email } = req.body;
    if (!first_name || !last_name || !email) {
        return res.status(400).json({ message: 'First name, last name, and email are required' });
    }
    const newPatient = req.body;
    const { data, error } = yield supabase_1.supabase.from('patients').insert([newPatient]).select();
    if (error)
        return res.status(500).json({ error: error.message });
    res.status(201).json(data);
});
exports.createPatient = createPatient;
const updatePatient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const updatedPatient = req.body;
    const { data, error } = yield supabase_1.supabase.from('patients').update(updatedPatient).eq('id', id).select();
    if (error)
        return res.status(500).json({ error: error.message });
    if (!data || data.length === 0)
        return res.status(404).json({ message: 'Patient not found or no changes made' });
    res.status(200).json(data);
});
exports.updatePatient = updatePatient;
const deletePatient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { error } = yield supabase_1.supabase.from('patients').delete().eq('id', id);
    if (error)
        return res.status(500).json({ error: error.message });
    res.status(204).send();
});
exports.deletePatient = deletePatient;
