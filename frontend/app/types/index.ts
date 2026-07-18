export interface Patient {
  id: string;
  fullName: string;
  studentPhoneNumber: number | undefined;
  parentPhoneNumber: number | undefined;
  academicYear: string;
  section?: string; // New optional field
  institutionName: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  date: string;
  time: string;
  reason: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  date: string;
  doctor: string;
  diagnosis: string;
  treatment: string;
}
