export interface Patient {
  id?: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  gender?: string;
  phone_number?: string;
  email: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Appointment {
  id?: string;
  patient_id: string;
  doctor_name: string;
  appointment_date: string;
  reason?: string;
  status?: 'scheduled' | 'completed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}

export interface MedicalRecord {
  id?: string;
  patient_id: string;
  record_date?: string;
  diagnosis?: string;
  prescription?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}
