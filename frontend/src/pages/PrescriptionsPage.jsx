import React, { useState, useEffect } from 'react';
import api from '../services/api';
import NotificationService from '../utils/notifications';

const PrescriptionsPage = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    fetchPrescriptions();
  }, [activeTab]);

  const fetchPrescriptions = async () => {
    try {
      let statusFilter = '';
      if (activeTab === 'active') statusFilter = 'active';
      else if (activeTab === 'refilled') statusFilter = 'refilled';
      else if (activeTab === 'expired') statusFilter = 'expired';
      else if (activeTab === 'cancelled') statusFilter = 'cancelled';

      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);

      const response = await api.get(`/prescriptions/my-prescriptions?${params}`);
      setPrescriptions(response.data.prescriptions);
    } catch (error) {
      NotificationService.error('Failed to load prescriptions');
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefillRequest = async (prescriptionId) => {
    if (!window.confirm('Are you sure you want to request a refill for this prescription?')) {
      return;
    }

    try {
      await api.put(`/prescriptions/${prescriptionId}/refill`);
      NotificationService.success('Refill request submitted successfully');
      fetchPrescriptions(); // Refresh the list
    } catch (error) {
      NotificationService.error('Failed to request refill');
    }
  };

  const handleDownload = async (prescriptionId) => {
    try {
      const response = await api.get(`/prescriptions/${prescriptionId}/download`, {
        responseType: 'blob'
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prescription-${prescriptionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      NotificationService.error('Failed to download prescription');
    }
  };

  const getPrescriptionStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'refilled': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">My Prescriptions</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('active')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'active'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveTab('refilled')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'refilled'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Refilled
            </button>
            <button
              onClick={() => setActiveTab('expired')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'expired'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Expired
            </button>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'cancelled'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Cancelled
            </button>
          </nav>
        </div>

        {/* Prescriptions List */}
        <div className="space-y-6">
          {prescriptions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">💊</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeTab === 'active' ? 'No Active Prescriptions' : 
                 activeTab === 'refilled' ? 'No Refilled Prescriptions' : 
                 activeTab === 'expired' ? 'No Expired Prescriptions' : 
                 'No Cancelled Prescriptions'}
              </h3>
              <p className="text-gray-500">
                {activeTab === 'active' 
                  ? 'You don\'t have any active prescriptions. They will appear here after your consultation.' 
                  : 'You don\'t have any prescriptions in this category.'}
              </p>
            </div>
          ) : (
            prescriptions.map(prescription => (
              <div key={prescription._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{prescription.diagnosis}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPrescriptionStatusColor(prescription.status)}`}>
                        {prescription.status}
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Medications:</h4>
                      <div className="space-y-2">
                        {prescription.medications.map((med, index) => (
                          <div key={index} className="border-l-4 border-blue-500 pl-4 py-1">
                            <div className="font-medium text-gray-900">{med.name}</div>
                            <div className="text-sm text-gray-600">
                              {med.dosage}, {med.frequency}, {med.duration} | Qty: {med.quantity}
                            </div>
                            {med.instructions && (
                              <div className="text-sm text-gray-600 mt-1">Instructions: {med.instructions}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Issued</p>
                        <p className="font-medium">
                          {new Date(prescription.issuedDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Expires</p>
                        <p className="font-medium">
                          {prescription.expiresDate ? new Date(prescription.expiresDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Doctor</p>
                        <p className="font-medium">
                          Dr. {prescription.doctorId.userId.firstName} {prescription.doctorId.userId.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Refills</p>
                        <p className="font-medium">{prescription.refillsRemaining} remaining</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0 md:ml-6 flex flex-col space-y-2 min-w-[150px]">
                    <button
                      onClick={() => handleDownload(prescription._id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition duration-300 text-sm"
                    >
                      Download PDF
                    </button>
                    
                    {prescription.status === 'active' && prescription.refillsRemaining > 0 && (
                      <button
                        onClick={() => handleRefillRequest(prescription._id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition duration-300 text-sm"
                      >
                        Request Refill
                      </button>
                    )}
                    
                    <button
                      onClick={() => window.open('https://www.walgreens.com/', '_blank')}
                      className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition duration-300 text-sm"
                    >
                      Find Pharmacy
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default PrescriptionsPage;