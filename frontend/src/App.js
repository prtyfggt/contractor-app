import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [message, setMessage] = useState("Connecting...");
  const [clients, setClients] = useState([]); 
  
  // Toggles for our UI sections
  const [showClients, setShowClients] = useState(false); 
  const [showForm, setShowForm] = useState(false);

  // This "State" holds exactly what Ryan types into the boxes
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    street_address: '',
    city_state_zip: ''
  });

  // 1. Check Server Connection
  useEffect(() => {
    axios.get('http://localhost:3000/')
      .then(res => setMessage(res.data))
      .catch(err => setMessage("Backend is offline."));
  }, []);

  // 2. GET: Fetch the Clients
  const fetchClients = () => {
    axios.get('http://localhost:3000/api/clients')
      .then(res => {
        setClients(res.data);
        setShowClients(true);
        setShowForm(false); // Hide form if we are looking at the list
      })
      .catch(err => console.error("Error fetching clients", err));
  };

  // 3. Handle Typing in the Form
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 4. POST: Save the New Client
  const submitNewClient = (e) => {
    e.preventDefault(); // Stops the page from refreshing
    
    // We send userId: 1 because Ryan is our main user
    axios.post('http://localhost:3000/api/clients', {
      userId: 1, 
      ...formData
    })
    .then(res => {
      alert("Success! Client Added.");
      setFormData({ name: '', email: '', street_address: '', city_state_zip: '' }); // Clear the form
      fetchClients(); // Automatically refresh the list to show the new client!
    })
    .catch(err => alert("Error saving client."));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">CONTRACTOR<span className="text-blue-600">PRO</span></h1>
            <p className="text-slate-500 text-sm">Welcome back, Ryan</p>
          </div>
          <div className="flex items-center gap-3">
             <span className={`h-3 w-3 rounded-full ${message === "Connecting..." ? "bg-amber-400 animate-pulse" : "bg-emerald-500"}`}></span>
             <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">{message === "Connecting..." ? "System Booting" : "System Live"}</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            
            {/* Action Card */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Project Overview</h2>
              <div className="flex gap-4">
                <button 
                  onClick={() => { setShowForm(true); setShowClients(false); }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all active:scale-95"
                >
                  + Add New Client
                </button>
                <button 
                  onClick={fetchClients}
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3 px-8 rounded-xl transition-all"
                >
                  View Clients
                </button>
              </div>
            </div>

            {/* NEW: The Input Form */}
            {showForm && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Client Details</h3>
                <form onSubmit={submitNewClient} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="john@example.com" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Street Address</label>
                      <input type="text" name="street_address" value={formData.street_address} onChange={handleInputChange} required className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="123 Main St" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">City, State, Zip</label>
                      <input type="text" name="city_state_zip" value={formData.city_state_zip} onChange={handleInputChange} required className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Palm Springs, CA 92262" />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl mt-4 transition-colors">
                    Save Client to Database
                  </button>
                </form>
              </div>
            )}

            {/* Client List */}
            {showClients && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Client Directory</h3>
                <div className="grid gap-4">
                  {clients.length > 0 ? clients.map(client => (
                    <div key={client.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <p className="font-bold text-slate-800">{client.name}</p>
                        <p className="text-sm text-slate-500">{client.street_address}</p>
                      </div>
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">Active</span>
                    </div>
                  )) : (
                    <p className="text-slate-500">No clients found. Add your first one!</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Stats Sidebar */}
          <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl h-fit">
            <h3 className="text-blue-400 font-bold uppercase text-xs tracking-widest mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div>
                <p className="text-slate-400 text-sm">Active Clients</p>
                <p className="text-2xl font-bold">{clients.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;