import { Appointment, Patient, NoShowPrediction } from '../types';

export function calculateNoShowProbability(
  appointment: Appointment,
  patient: Patient,
  historicalAppointments: Appointment[]
): NoShowPrediction {
  const factors: string[] = [];
  let score = 0;

  const patientHistory = historicalAppointments.filter(
    (apt) => apt.patientId === patient.id && apt.id !== appointment.id
  );

  const noShowCount = patientHistory.filter((apt) => apt.status === 'no-show').length;
  const totalCompleted = patientHistory.filter((apt) => apt.status === 'completed').length;
  const totalPast = patientHistory.length;

  if (totalPast > 0) {
    const noShowRate = noShowCount / totalPast;
    score += noShowRate * 40;
    if (noShowRate > 0.3) {
      factors.push(`High historical no-show rate (${(noShowRate * 100).toFixed(0)}%)`);
    }
  }

  const appointmentDate = new Date(appointment.appointmentDate);
  const dayOfWeek = appointmentDate.getDay();
  if (dayOfWeek === 1) {
    score += 10;
    factors.push('Monday appointment (higher no-show risk)');
  }

  const hour = appointmentDate.getHours();
  if (hour < 9 || hour > 16) {
    score += 15;
    factors.push('Early morning or late afternoon appointment');
  }

  const daysUntilAppointment = Math.floor(
    (appointmentDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (daysUntilAppointment > 30) {
    score += 20;
    factors.push('Appointment scheduled far in advance');
  }

  if (appointment.appointmentType === 'Follow-up') {
    score -= 10;
    if (score < 0) score = 0;
  } else if (appointment.appointmentType === 'Consultation') {
    score += 5;
  }

  const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
  if (age < 30) {
    score += 10;
    factors.push('Younger patient demographic');
  } else if (age > 60) {
    score -= 5;
    if (score < 0) score = 0;
  }

  const probability = Math.min(Math.max(score / 100, 0), 0.95);

  let riskLevel: 'low' | 'medium' | 'high';
  if (probability < 0.3) {
    riskLevel = 'low';
  } else if (probability < 0.6) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'high';
  }

  return {
    appointmentId: appointment.id,
    probability,
    riskLevel,
    factors: factors.length > 0 ? factors : ['No significant risk factors identified'],
  };
}

export function getAppointmentTrends(appointments: Appointment[]) {
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const sixtyDaysAgo = now - 60 * 24 * 60 * 60 * 1000;

  const recentAppointments = appointments.filter(
    (apt) => new Date(apt.appointmentDate).getTime() > thirtyDaysAgo
  );

  const previousPeriod = appointments.filter(
    (apt) =>
      new Date(apt.appointmentDate).getTime() > sixtyDaysAgo &&
      new Date(apt.appointmentDate).getTime() <= thirtyDaysAgo
  );

  const noShowRate =
    recentAppointments.length > 0
      ? recentAppointments.filter((apt) => apt.status === 'no-show').length /
        recentAppointments.length
      : 0;

  const previousNoShowRate =
    previousPeriod.length > 0
      ? previousPeriod.filter((apt) => apt.status === 'no-show').length / previousPeriod.length
      : 0;

  const completionRate =
    recentAppointments.length > 0
      ? recentAppointments.filter((apt) => apt.status === 'completed').length /
        recentAppointments.length
      : 0;

  const appointmentsByType = recentAppointments.reduce((acc, apt) => {
    acc[apt.appointmentType] = (acc[apt.appointmentType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalAppointments: recentAppointments.length,
    noShowRate,
    noShowRateChange: noShowRate - previousNoShowRate,
    completionRate,
    appointmentsByType,
  };
}

export function getRevenueAnalytics(billing: any[]) {
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  const recentBilling = billing.filter(
    (bill) => new Date(bill.createdAt).getTime() > thirtyDaysAgo
  );

  const totalRevenue = recentBilling
    .filter((bill) => bill.status === 'paid')
    .reduce((sum, bill) => sum + bill.amount, 0);

  const pendingRevenue = recentBilling
    .filter((bill) => bill.status === 'pending')
    .reduce((sum, bill) => sum + bill.amount, 0);

  const overdueRevenue = recentBilling
    .filter((bill) => bill.status === 'overdue')
    .reduce((sum, bill) => sum + bill.amount, 0);

  return {
    totalRevenue,
    pendingRevenue,
    overdueRevenue,
    collectionRate:
      totalRevenue + pendingRevenue + overdueRevenue > 0
        ? totalRevenue / (totalRevenue + pendingRevenue + overdueRevenue)
        : 0,
  };
}
