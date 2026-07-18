import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { Patient } from '../types';

export const getPatients = async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('patients').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
};

export const getPatientById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('patients').select('*').eq('id', id).single();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ message: 'Patient not found' });
  res.status(200).json(data);
};

export const createPatient = async (req: Request, res: Response) => {
  const { first_name, last_name, email } = req.body;

  if (!first_name || !last_name || !email) {
    return res.status(400).json({ message: 'First name, last name, and email are required' });
  }

  const newPatient: Patient = req.body;
  const { data, error } = await supabase.from('patients').insert([newPatient]).select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
};

export const updatePatient = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedPatient: Partial<Patient> = req.body;
  const { data, error } = await supabase.from('patients').update(updatedPatient).eq('id', id).select();
  if (error) return res.status(500).json({ error: error.message });
  if (!data || data.length === 0) return res.status(404).json({ message: 'Patient not found or no changes made' });
  res.status(200).json(data);
};

export const deletePatient = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { error } = await supabase.from('patients').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
};
