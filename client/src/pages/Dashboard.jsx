import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';
import AuthContext from '../context/AuthContext';

const Dashboard = () => {
  const [sweets, setSweets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Admin State: New Sweet Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSweet, setNewSweet] = useState({ name: '', category: '', price: '', quantity: '' });
  
  // Admin State: Restock Inputs (Map of sweetId -> quantity)
  const [restockValues, setRestockValues] = useState({});

  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // --- Initial Load ---
  useEffect(() => {
    fetchSweets();
  }, []);

  const fetchSweets = async () => {
    try {
      const res = await api.get('/sweets');
      setSweets(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  // --- Search Logic ---
  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await api.get(`/sweets/search?query=${searchQuery}`);
      setSweets(res.data);
    } catch (error) {
      toast.error('Search failed');
    }
  };

  // --- User Action: Purchase ---
  const handlePurchase = async (id) => {
    try {
      const res = await api.post(`/sweets/${id}/purchase`);
      toast.success(`Purchased ${res.data.name}!`);
      fetchSweets(); 
    } catch (error) {
      toast.error(error.response?.data?.message || 'Purchase failed');
    }
  };

  // --- Admin Action: Add Sweet ---
  const handleAddSweet = async (e) => {
    e.preventDefault();
    try {
      await api.post('/sweets', newSweet);
      toast.success('Sweet added successfully!');
      setShowAddForm(false);
      setNewSweet({ name: '', category: '', price: '', quantity: '' });
      fetchSweets();
    } catch (error) {
      toast.error('Failed to add sweet');
    }
  };

  // --- Admin Action: Delete Sweet ---
  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this sweet?")) return;
    try {
      await api.delete(`/sweets/${id}`);
      toast.success('Sweet deleted');
      fetchSweets();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  // --- Admin Action: Restock ---
  const handleRestock = async (id) => {
    const amount = restockValues[id];
    if (!amount || amount <= 0) return toast.warning("Enter a valid amount");

    try {
      await api.post(`/sweets/${id}/restock`, { quantity: amount });
      toast.success('Stock updated!');
      setRestockValues({ ...restockValues, [id]: '' }); // Clear input
      fetchSweets();
    } catch (error) {
      toast.error('Restock failed');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-bold text-pink-600 flex items-center gap-2">
          🍬 Sweet Shop <span className="text-xs text-gray-400 font-normal">Manager</span>
        </h1>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-bold text-gray-700">{user?.username}</div>
            <div className="text-xs text-gray-500">{user?.email}</div>
          </div>
          {user?.isAdmin && (
            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded border border-purple-200">
              Admin Access
            </span>
          )}
          <button onClick={handleLogout} className="text-red-500 hover:text-red-700 text-sm font-medium border border-red-200 px-3 py-1 rounded hover:bg-red-50 transition">
            Logout
          </button>
        </div>
      </nav>

      <div className="container mx-auto p-6 max-w-6xl">
        
        {/* Admin Section: Add Sweet Toggle */}
        {user?.isAdmin && (
          <div className="mb-8">
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2 shadow-sm"
            >
              {showAddForm ? 'Close Form' : '+ Add New Sweet'}
            </button>
            
            {showAddForm && (
              <div className="mt-4 bg-white p-6 rounded-xl shadow-md border border-purple-100 animate-fade-in">
                <h3 className="font-bold text-gray-700 mb-4">Add New Item to Inventory</h3>
                <form onSubmit={handleAddSweet} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <input required placeholder="Name" className="border p-2 rounded" value={newSweet.name} onChange={e => setNewSweet({...newSweet, name: e.target.value})} />
                  <input required placeholder="Category" className="border p-2 rounded" value={newSweet.category} onChange={e => setNewSweet({...newSweet, category: e.target.value})} />
                  <input required type="number" placeholder="Price" className="border p-2 rounded" value={newSweet.price} onChange={e => setNewSweet({...newSweet, price: e.target.value})} />
                  <input required type="number" placeholder="Qty" className="border p-2 rounded" value={newSweet.quantity} onChange={e => setNewSweet({...newSweet, quantity: e.target.value})} />
                  <button type="submit" className="bg-green-600 text-white rounded hover:bg-green-700 font-bold">Save</button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-8 flex justify-center">
          <form onSubmit={handleSearch} className="flex w-full max-w-md gap-2 shadow-sm">
            <input
              type="text"
              placeholder="Search sweets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <button type="submit" className="bg-pink-500 text-white px-6 py-2 hover:bg-pink-600 transition">Search</button>
            <button type="button" onClick={() => { setSearchQuery(''); fetchSweets(); }} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-r-lg hover:bg-gray-200 border-l">Clear</button>
          </form>
        </div>

        {/* Sweets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sweets.map((sweet) => (
            <div key={sweet._id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col">
              
              {/* Card Header */}
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-800 truncate">{sweet.name}</h3>
                  <span className="font-bold text-green-600 bg-green-50 px-2 py-1 rounded text-sm">${sweet.price}</span>
                </div>
                <div className="mb-4">
                   <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase tracking-wide">
                    {sweet.category}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <span>Stock Available:</span>
                  <span className={`font-bold text-lg ${sweet.quantity === 0 ? "text-red-500" : "text-gray-800"}`}>
                    {sweet.quantity}
                  </span>
                </div>
              </div>

              {/* Action Area */}
              <div className="p-5 pt-0 bg-white">
                {/* ADMIN ACTIONS */}
                {user?.isAdmin ? (
                  <div className="space-y-3 pt-3 border-t border-dashed">
                    <div className="text-xs font-bold text-gray-400 uppercase">Admin Controls</div>
                    
                    {/* Restock Form */}
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        placeholder="+ Qty" 
                        className="w-20 border rounded px-2 py-1 text-sm"
                        value={restockValues[sweet._id] || ''}
                        onChange={(e) => setRestockValues({ ...restockValues, [sweet._id]: e.target.value })}
                      />
                      <button 
                        onClick={() => handleRestock(sweet._id)}
                        className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 font-bold flex-1"
                      >
                        Restock
                      </button>
                    </div>

                    {/* Delete Button */}
                    <button 
                      onClick={() => handleDelete(sweet._id)}
                      className="w-full text-xs bg-red-50 text-red-600 py-2 rounded hover:bg-red-100 font-bold border border-red-100"
                    >
                      Delete Item
                    </button>
                  </div>
                ) : (
                  // USER ACTIONS
                  <button
                    onClick={() => handlePurchase(sweet._id)}
                    disabled={sweet.quantity === 0}
                    className={`w-full py-3 rounded-lg font-bold shadow-sm transition-transform active:scale-95 ${
                      sweet.quantity > 0 
                        ? "bg-pink-500 text-white hover:bg-pink-600" 
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {sweet.quantity > 0 ? "Purchase Sweet 🛒" : "Out of Stock"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {sweets.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No sweets found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;