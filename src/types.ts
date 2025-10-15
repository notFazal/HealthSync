export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  medicalHistory: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  appointmentDate: string;
  durationMinutes: number;
  appointmentType: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes: string;
  createdAt: string;
}

export interface Billing {
  id: string;
  patientId: string;
  appointmentId?: string;
  amount: number;
  description: string;
  status: 'pending' | 'paid' | 'overdue';
  dueDate: string;
  paidDate?: string;
  createdAt: string;
}

export interface NoShowPrediction {
  appointmentId: string;
  probability: number;
  riskLevel: 'low' | 'medium' | 'high';
  factors: string[];
}
