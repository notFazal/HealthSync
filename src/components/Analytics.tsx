import { Appointment, Patient, Billing } from '../types';
import {
  getAppointmentTrends,
  getRevenueAnalytics,
  calculateNoShowProbability,
} from '../utils/analytics';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Users,
  AlertTriangle,
} from 'lucide-react';

interface AnalyticsProps {
  appointments: Appointment[];
  patients: Patient[];
  billing: Billing[];
}

export default function Analytics({ appointments, patients, billing }: AnalyticsProps) {
  const trends = getAppointmentTrends(appointments);
  const revenue = getRevenueAnalytics(billing);

  const scheduledAppointments = appointments.filter((apt) => apt.status === 'scheduled');

  const upcomingRisks = scheduledAppointments
    .map((apt) => {
      const patient = patients.find((p) => p.id === apt.patientId);
      if (!patient) return null;
      const prediction = calculateNoShowProbability(apt, patient, appointments);
      return { appointment: apt, patient, prediction };
    })
    .filter((item) => item && item.prediction.riskLevel !== 'low')
    .sort((a, b) => b!.prediction.probability - a!.prediction.probability);

  const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    trendValue,
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: any;
    trend?: 'up' | 'down';
    trendValue?: string;
  }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          {trend && trendValue && (
            <div className="flex items-center mt-2">
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span
                className={`text-sm ${
                  trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className="bg-blue-100 p-3 rounded-full">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Patients"
          value={patients.length}
          icon={Users}
          subtitle="Active in system"
        />
        <StatCard
          title="Appointments (30d)"
          value={trends.totalAppointments}
          icon={Calendar}
          subtitle={`${(trends.completionRate * 100).toFixed(0)}% completion rate`}
        />
        <StatCard
          title="No-Show Rate"
          value={`${(trends.noShowRate * 100).toFixed(1)}%`}
          icon={AlertTriangle}
          trend={trends.noShowRateChange < 0 ? 'down' : 'up'}
          trendValue={`${Math.abs(trends.noShowRateChange * 100).toFixed(1)}% vs last period`}
        />
        <StatCard
          title="Revenue (30d)"
          value={`$${revenue.totalRevenue.toFixed(0)}`}
          icon={DollarSign}
          subtitle={`${(revenue.collectionRate * 100).toFixed(0)}% collection rate`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Appointment Distribution
          </h3>
          <div className="space-y-3">
            {Object.entries(trends.appointmentsByType).map(([type, count]) => {
              const percentage =
                (count / trends.totalAppointments) * 100;
              return (
                <div key={type}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{type}</span>
                    <span className="text-gray-900 font-medium">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Collected</span>
              <span className="text-2xl font-bold text-green-600">
                ${revenue.totalRevenue.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Pending</span>
              <span className="text-2xl font-bold text-yellow-600">
                ${revenue.pendingRevenue.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Overdue</span>
              <span className="text-2xl font-bold text-red-600">
                ${revenue.overdueRevenue.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            No-Show Risk Predictions
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Upcoming appointments with medium or high risk of no-show
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Appointment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Probability
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Key Factors
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {upcomingRisks.slice(0, 10).map((item) => {
                if (!item) return null;
                const { appointment, patient, prediction } = item;
                return (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {patient.firstName} {patient.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {appointment.appointmentType}
                      <br />
                      <span className="text-gray-500">
                        {new Date(appointment.appointmentDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          prediction.riskLevel === 'high'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {prediction.riskLevel.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(prediction.probability * 100).toFixed(0)}%
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <ul className="list-disc list-inside">
                        {prediction.factors.slice(0, 2).map((factor, idx) => (
                          <li key={idx} className="truncate">
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {upcomingRisks.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            No high-risk appointments found. All upcoming appointments look good!
          </div>
        )}
      </div>
    </div>
  );
}
