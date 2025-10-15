import { supabase } from '../lib/supabase';
import { Patient, Appointment, Billing } from '../types';

export const patientService = {
  async getAll(): Promise<Patient[]> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((p) => ({
      id: p.id,
      firstName: p.first_name,
      lastName: p.last_name,
      email: p.email,
      phone: p.phone,
      dateOfBirth: p.date_of_birth,
      address: p.address,
      medicalHistory: p.medical_history,
      createdAt: p.created_at,
    }));
  },

  async create(patient: Omit<Patient, 'id' | 'createdAt'>): Promise<Patient> {
    const { data, error } = await supabase
      .from('patients')
      .insert({
        first_name: patient.firstName,
        last_name: patient.lastName,
        email: patient.email,
        phone: patient.phone,
        date_of_birth: patient.dateOfBirth,
        address: patient.address,
        medical_history: patient.medicalHistory,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      phone: data.phone,
      dateOfBirth: data.date_of_birth,
      address: data.address,
      medicalHistory: data.medical_history,
      createdAt: data.created_at,
    };
  },

  async update(id: string, patient: Omit<Patient, 'id' | 'createdAt'>): Promise<Patient> {
    const { data, error } = await supabase
      .from('patients')
      .update({
        first_name: patient.firstName,
        last_name: patient.lastName,
        email: patient.email,
        phone: patient.phone,
        date_of_birth: patient.dateOfBirth,
        address: patient.address,
        medical_history: patient.medicalHistory,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      phone: data.phone,
      dateOfBirth: data.date_of_birth,
      address: data.address,
      medicalHistory: data.medical_history,
      createdAt: data.created_at,
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('patients').delete().eq('id', id);
    if (error) throw error;
  },
};

export const appointmentService = {
  async getAll(): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('appointment_date', { ascending: false });

    if (error) throw error;

    return (data || []).map((a) => ({
      id: a.id,
      patientId: a.patient_id,
      appointmentDate: a.appointment_date,
      durationMinutes: a.duration_minutes,
      appointmentType: a.appointment_type,
      status: a.status as 'scheduled' | 'completed' | 'cancelled' | 'no-show',
      notes: a.notes,
      createdAt: a.created_at,
    }));
  },

  async create(appointment: Omit<Appointment, 'id' | 'createdAt'>): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        patient_id: appointment.patientId,
        appointment_date: appointment.appointmentDate,
        duration_minutes: appointment.durationMinutes,
        appointment_type: appointment.appointmentType,
        status: appointment.status,
        notes: appointment.notes,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      patientId: data.patient_id,
      appointmentDate: data.appointment_date,
      durationMinutes: data.duration_minutes,
      appointmentType: data.appointment_type,
      status: data.status,
      notes: data.notes,
      createdAt: data.created_at,
    };
  },

  async update(
    id: string,
    appointment: Omit<Appointment, 'id' | 'createdAt'>
  ): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .update({
        patient_id: appointment.patientId,
        appointment_date: appointment.appointmentDate,
        duration_minutes: appointment.durationMinutes,
        appointment_type: appointment.appointmentType,
        status: appointment.status,
        notes: appointment.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      patientId: data.patient_id,
      appointmentDate: data.appointment_date,
      durationMinutes: data.duration_minutes,
      appointmentType: data.appointment_type,
      status: data.status,
      notes: data.notes,
      createdAt: data.created_at,
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (error) throw error;
  },
};

export const billingService = {
  async getAll(): Promise<Billing[]> {
    const { data, error } = await supabase
      .from('billing')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((b) => ({
      id: b.id,
      patientId: b.patient_id,
      appointmentId: b.appointment_id,
      amount: parseFloat(b.amount),
      description: b.description,
      status: b.status as 'pending' | 'paid' | 'overdue',
      dueDate: b.due_date,
      paidDate: b.paid_date,
      createdAt: b.created_at,
    }));
  },

  async create(billing: Omit<Billing, 'id' | 'createdAt'>): Promise<Billing> {
    const { data, error } = await supabase
      .from('billing')
      .insert({
        patient_id: billing.patientId,
        appointment_id: billing.appointmentId || null,
        amount: billing.amount,
        description: billing.description,
        status: billing.status,
        due_date: billing.dueDate,
        paid_date: billing.paidDate || null,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      patientId: data.patient_id,
      appointmentId: data.appointment_id,
      amount: parseFloat(data.amount),
      description: data.description,
      status: data.status,
      dueDate: data.due_date,
      paidDate: data.paid_date,
      createdAt: data.created_at,
    };
  },

  async update(id: string, billing: Omit<Billing, 'id' | 'createdAt'>): Promise<Billing> {
    const { data, error } = await supabase
      .from('billing')
      .update({
        patient_id: billing.patientId,
        appointment_id: billing.appointmentId || null,
        amount: billing.amount,
        description: billing.description,
        status: billing.status,
        due_date: billing.dueDate,
        paid_date: billing.paidDate || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      patientId: data.patient_id,
      appointmentId: data.appointment_id,
      amount: parseFloat(data.amount),
      description: data.description,
      status: data.status,
      dueDate: data.due_date,
      paidDate: data.paid_date,
      createdAt: data.created_at,
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('billing').delete().eq('id', id);
    if (error) throw error;
  },
};
