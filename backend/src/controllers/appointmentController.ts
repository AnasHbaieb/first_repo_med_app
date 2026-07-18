import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { Appointment } from '../types';

export const getAppointments = async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('appointments').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
};

export const getAppointmentById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('appointments').select('*').eq('id', id).single();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ message: 'Appointment not found' });
  res.status(200).json(data);
};

export const createAppointment = async (req: Request, res: Response) => {
  const newAppointment: Appointment = req.body;
  const { data, error } = await supabase.from('appointments').insert([newAppointment]).select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
};

export const updateAppointment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedAppointment: Partial<Appointment> = req.body;
  const { data, error } = await supabase.from('appointments').update(updatedAppointment).eq('id', id).select();
  if (error) return res.status(500).json({ error: error.message });
  if (!data || data.length === 0) return res.status(404).json({ message: 'Appointment not found or no changes made' });
  res.status(200).json(data);
};

export const deleteAppointment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { error } = await supabase.from('appointments').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
};
