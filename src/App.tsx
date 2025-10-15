import { useState, useEffect } from 'react';
import { Patient, Appointment, Billing } from './types';
import { patientService, appointmentService, billingService } from './services/database';
import PatientList from './components/PatientList';
import PatientForm from './components/PatientForm';
import AppointmentList from './components/AppointmentList';
import AppointmentForm from './components/AppointmentForm';
import BillingList from './components/BillingList';
import BillingForm from './components/BillingForm';
import Analytics from './components/Analytics';
import { Users, Calendar, DollarSign, BarChart3, Plus, Loader2 } from 'lucide-react';

type Tab = 'patients' | 'appointments' | 'billing' | 'analytics';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('analytics');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [billing, setBilling] = useState<Billing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showPatientForm, setShowPatientForm] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showBillingForm, setShowBillingForm] = useState(false);

  const [editingPatient, setEditingPatient] = useState<Patient | undefined>();
  const [editingAppointment, setEditingAppointment] = useState<Appointment | undefined>();
  const [editingBilling, setEditingBilling] = useState<Billing | undefined>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [patientsData, appointmentsData, billingData] = await Promise.all([
        patientService.getAll(),
        appointmentService.getAll(),
        billingService.getAll(),
      ]);
      setPatients(patientsData);
      setAppointments(appointmentsData);
      setBilling(billingData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePatient = async (patientData: Omit<Patient, 'id' | 'createdAt'>) => {
    try {
      const newPatient = await patientService.create(patientData);
      setPatients([newPatient, ...patients]);
      setShowPatientForm(false);
    } catch (err) {
      console.error('Error creating patient:', err);
      alert('Failed to create patient. Please try again.');
    }
  };

  const handleUpdatePatient = async (patientData: Omit<Patient, 'id' | 'createdAt'>) => {
    if (!editingPatient) return;
    try {
      const updatedPatient = await patientService.update(editingPatient.id, patientData);
      setPatients(patients.map((p) => (p.id === updatedPatient.id ? updatedPatient : p)));
      setEditingPatient(undefined);
      setShowPatientForm(false);
    } catch (err) {
      console.error('Error updating patient:', err);
      alert('Failed to update patient. Please try again.');
    }
  };

  const handleDeletePatient = async (id: string) => {
    try {
      await patientService.delete(id);
      setPatients(patients.filter((p) => p.id !== id));
      setAppointments(appointments.filter((a) => a.patientId !== id));
      setBilling(billing.filter((b) => b.patientId !== id));
    } catch (err) {
      console.error('Error deleting patient:', err);
      alert('Failed to delete patient. Please try again.');
    }
  };

  const handleCreateAppointment = async (
    appointmentData: Omit<Appointment, 'id' | 'createdAt'>
  ) => {
    try {
      const newAppointment = await appointmentService.create(appointmentData);
      setAppointments([newAppointment, ...appointments]);
      setShowAppointmentForm(false);
    } catch (err) {
      console.error('Error creating appointment:', err);
      alert('Failed to create appointment. Please try again.');
    }
  };

  const handleUpdateAppointment = async (
    appointmentData: Omit<Appointment, 'id' | 'createdAt'>
  ) => {
    if (!editingAppointment) return;
    try {
      const updatedAppointment = await appointmentService.update(
        editingAppointment.id,
        appointmentData
      );
      setAppointments(
        appointments.map((a) => (a.id === updatedAppointment.id ? updatedAppointment : a))
      );
      setEditingAppointment(undefined);
      setShowAppointmentForm(false);
    } catch (err) {
      console.error('Error updating appointment:', err);
      alert('Failed to update appointment. Please try again.');
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    try {
      await appointmentService.delete(id);
      setAppointments(appointments.filter((a) => a.id !== id));
    } catch (err) {
      console.error('Error deleting appointment:', err);
      alert('Failed to delete appointment. Please try again.');
    }
  };

  const handleCreateBilling = async (billingData: Omit<Billing, 'id' | 'createdAt'>) => {
    try {
      const newBilling = await billingService.create(billingData);
      setBilling([newBilling, ...billing]);
      setShowBillingForm(false);
    } catch (err) {
      console.error('Error creating billing:', err);
      alert('Failed to create billing record. Please try again.');
    }
  };

  const handleUpdateBilling = async (billingData: Omit<Billing, 'id' | 'createdAt'>) => {
    if (!editingBilling) return;
    try {
      const updatedBilling = await billingService.update(editingBilling.id, billingData);
      setBilling(billing.map((b) => (b.id === updatedBilling.id ? updatedBilling : b)));
      setEditingBilling(undefined);
      setShowBillingForm(false);
    } catch (err) {
      console.error('Error updating billing:', err);
      alert('Failed to update billing record. Please try again.');
    }
  };

  const handleDeleteBilling = async (id: string) => {
    try {
      await billingService.delete(id);
      setBilling(billing.filter((b) => b.id !== id));
    } catch (err) {
      console.error('Error deleting billing:', err);
      alert('Failed to delete billing record. Please try again.');
    }
  };

  const tabs = [
    { id: 'analytics' as Tab, label: 'Analytics', icon: BarChart3 },
    { id: 'patients' as Tab, label: 'Patients', icon: Users },
    { id: 'appointments' as Tab, label: 'Appointments', icon: Calendar },
    { id: 'billing' as Tab, label: 'Billing', icon: DollarSign },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading healthcare system...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-2xl font-bold text-gray-900">HealthCare System</h1>
                <p className="text-sm text-gray-600">PostgreSQL Database via Supabase</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <nav className="flex space-x-2 bg-white rounded-lg p-1 shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>

          {activeTab !== 'analytics' && (
            <button
              onClick={() => {
                if (activeTab === 'patients') setShowPatientForm(true);
                if (activeTab === 'appointments') setShowAppointmentForm(true);
                if (activeTab === 'billing') setShowBillingForm(true);
              }}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add {activeTab === 'patients' && 'Patient'}
              {activeTab === 'appointments' && 'Appointment'}
              {activeTab === 'billing' && 'Bill'}
            </button>
          )}
        </div>

        <div>
          {activeTab === 'analytics' && (
            <Analytics
              appointments={appointments}
              patients={patients}
              billing={billing}
            />
          )}

          {activeTab === 'patients' && (
            <PatientList
              patients={patients}
              onEdit={(patient) => {
                setEditingPatient(patient);
                setShowPatientForm(true);
              }}
              onDelete={handleDeletePatient}
            />
          )}

          {activeTab === 'appointments' && (
            <AppointmentList
              appointments={appointments}
              patients={patients}
              onEdit={(appointment) => {
                setEditingAppointment(appointment);
                setShowAppointmentForm(true);
              }}
              onDelete={handleDeleteAppointment}
            />
          )}

          {activeTab === 'billing' && (
            <BillingList
              billing={billing}
              patients={patients}
              onEdit={(bill) => {
                setEditingBilling(bill);
                setShowBillingForm(true);
              }}
              onDelete={handleDeleteBilling}
            />
          )}
        </div>
      </div>

      {showPatientForm && (
        <PatientForm
          patient={editingPatient}
          onSubmit={editingPatient ? handleUpdatePatient : handleCreatePatient}
          onCancel={() => {
            setShowPatientForm(false);
            setEditingPatient(undefined);
          }}
        />
      )}

      {showAppointmentForm && (
        <AppointmentForm
          appointment={editingAppointment}
          patients={patients}
          onSubmit={editingAppointment ? handleUpdateAppointment : handleCreateAppointment}
          onCancel={() => {
            setShowAppointmentForm(false);
            setEditingAppointment(undefined);
          }}
        />
      )}

      {showBillingForm && (
        <BillingForm
          billing={editingBilling}
          patients={patients}
          appointments={appointments}
          onSubmit={editingBilling ? handleUpdateBilling : handleCreateBilling}
          onCancel={() => {
            setShowBillingForm(false);
            setEditingBilling(undefined);
          }}
        />
      )}
    </div>
  );
}

export default App;
