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
exports.deleteAppointment = exports.updateAppointment = exports.createAppointment = exports.getAppointmentById = exports.getAppointments = void 0;
const supabase_1 = require("../config/supabase");
const getAppointments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabase_1.supabase.from('appointments').select('*');
    if (error)
        return res.status(500).json({ error: error.message });
    res.status(200).json(data);
});
exports.getAppointments = getAppointments;
const getAppointmentById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { data, error } = yield supabase_1.supabase.from('appointments').select('*').eq('id', id).single();
    if (error)
        return res.status(500).json({ error: error.message });
    if (!data)
        return res.status(404).json({ message: 'Appointment not found' });
    res.status(200).json(data);
});
exports.getAppointmentById = getAppointmentById;
const createAppointment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const newAppointment = req.body;
    const { data, error } = yield supabase_1.supabase.from('appointments').insert([newAppointment]).select();
    if (error)
        return res.status(500).json({ error: error.message });
    res.status(201).json(data);
});
exports.createAppointment = createAppointment;
const updateAppointment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const updatedAppointment = req.body;
    const { data, error } = yield supabase_1.supabase.from('appointments').update(updatedAppointment).eq('id', id).select();
    if (error)
        return res.status(500).json({ error: error.message });
    if (!data || data.length === 0)
        return res.status(404).json({ message: 'Appointment not found or no changes made' });
    res.status(200).json(data);
});
exports.updateAppointment = updateAppointment;
const deleteAppointment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { error } = yield supabase_1.supabase.from('appointments').delete().eq('id', id);
    if (error)
        return res.status(500).json({ error: error.message });
    res.status(204).send();
});
exports.deleteAppointment = deleteAppointment;
