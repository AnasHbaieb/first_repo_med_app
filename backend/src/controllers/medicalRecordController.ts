import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { MedicalRecord } from '../types';

export const getMedicalRecords = async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('medical_records').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
};

export const getMedicalRecordById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('medical_records').select('*').eq('id', id).single();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ message: 'Medical record not found' });
  res.status(200).json(data);
};

export const createMedicalRecord = async (req: Request, res: Response) => {
  const newMedicalRecord: MedicalRecord = req.body;
  const { data, error } = await supabase.from('medical_records').insert([newMedicalRecord]).select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
};

export const updateMedicalRecord = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedMedicalRecord: Partial<MedicalRecord> = req.body;
  const { data, error } = await supabase.from('medical_records').update(updatedMedicalRecord).eq('id', id).select();
  if (error) return res.status(500).json({ error: error.message });
  if (!data || data.length === 0) return res.status(404).json({ message: 'Medical record not found or no changes made' });
  res.status(200).json(data);
};

export const deleteMedicalRecord = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { error } = await supabase.from('medical_records').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
};
