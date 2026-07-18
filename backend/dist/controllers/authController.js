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
exports.signOut = exports.signIn = exports.signUp = void 0;
const supabase_1 = require("../config/supabase");
const signUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const { data, error } = yield supabase_1.supabase.auth.signUp({ email, password });
    if (error) {
        return res.status(500).json({ error: error.message });
    }
    res.status(200).json(data);
});
exports.signUp = signUp;
const signIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const { data, error } = yield supabase_1.supabase.auth.signInWithPassword({ email, password });
    if (error) {
        return res.status(500).json({ error: error.message });
    }
    res.status(200).json(data);
});
exports.signIn = signIn;
const signOut = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { error } = yield supabase_1.supabase.auth.signOut();
    if (error) {
        return res.status(500).json({ error: error.message });
    }
    res.status(200).json({ message: 'Signed out successfully' });
});
exports.signOut = signOut;
