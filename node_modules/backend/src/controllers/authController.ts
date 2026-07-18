import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const signUp = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(200).json(data);
};

export const signIn = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(200).json(data);
};

export const signOut = async (req: Request, res: Response) => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(200).json({ message: 'Signed out successfully' });
};
