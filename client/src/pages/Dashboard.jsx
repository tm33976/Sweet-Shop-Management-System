import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api";
import AuthContext from "../context/AuthContext";

const Dashboard = () => {
  const [sweets, setSweets] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Admin State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSweet, setNewSweet] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
  });
  const [restockValues, setRestockValues] = useState({});

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sweetToDelete, setSweetToDelete] = useState(null);

  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSweets();
  }, []);

  const fetchSweets = async () => {
    try {
      const res = await api.get("/sweets");
      setSweets(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await api.get(`/sweets/search?query=${searchQuery}`);
      setSweets(res.data);
    } catch (error) {
      toast.error("Search failed");
    }
  };

  const handlePurchase = async (id) => {
    try {
      const res = await api.post(`/sweets/${id}/purchase`);
      toast.success(`Purchased ${res.data.name}!`);
      fetchSweets();
    } catch (error) {
      toast.error(error.response?.data?.message || "Purchase failed");
    }
  };

  const handleAddSweet = async (e) => {
    e.preventDefault();
    try {
      await api.post("/sweets", newSweet);
      toast.success("Sweet added successfully!");
      setShowAddForm(false);
      setNewSweet({ name: "", category: "", price: "", quantity: "" });
      fetchSweets();
    } catch (error) {
      toast.error("Failed to add sweet");
    }
  };

  const handleRestock = async (id) => {
    const amount = restockValues[id];
    if (!amount || amount <= 0) return toast.warning("Enter a valid amount");
    try {
      await api.post(`/sweets/${id}/restock`, { quantity: amount });
      toast.success("Stock updated!");
      setRestockValues({ ...restockValues, [id]: "" });
      fetchSweets();
    } catch (error) {
      toast.error("Restock failed");
    }
  };

  const openDeleteModal = (id) => {
    setSweetToDelete(id);
    setShowDeleteModal(true);
  };

  const executeDelete = async () => {
    if (!sweetToDelete) return;
    try {
      await api.delete(`/sweets/${sweetToDelete}`);
      toast.success("Sweet deleted successfully");
      fetchSweets();
      setShowDeleteModal(false);
      setSweetToDelete(null);
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans relative">
      <nav className="bg-white shadow-md p-4 sticky top-0 z-20">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-900 tracking-tight flex items-center gap-2">
            🍬 Sweet Shop{" "}
            <span className="text-xs text-gray-400 font-normal uppercase tracking-widest border-l pl-2 ml-2">
              {user?.isAdmin ? "Manager Portal" : "Store"}
            </span>
          </h1>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <div className="flex items-center justify-end gap-2">
                <div className="text-sm font-bold text-gray-900">
                  {user?.username}
                </div>
                {user?.isAdmin && (
                  <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-blue-200 shadow-sm">
                    Admin
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 font-medium">
                {user?.email}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 transition-all duration-200 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 hover:text-red-700 hover:shadow-sm active:scale-95 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-6 max-w-6xl">
        {user?.isAdmin && (
          <div className="mb-8 flex justify-end">
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-900 text-white px-5 py-2 rounded-lg hover:bg-blue-800 transition shadow-lg flex items-center gap-2 text-sm font-medium cursor-pointer"
            >
              + Add Inventory
            </button>
          </div>
        )}

        <div className="mb-10 flex justify-center">
          <form
            onSubmit={handleSearch}
            className="flex w-full max-w-2xl shadow-lg rounded-full overflow-hidden border border-gray-200"
          >
            <input
              type="text"
              placeholder="Search sweets collection..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-6 py-3 focus:outline-none text-gray-700"
            />
            <button
              type="submit"
              className="bg-blue-900 text-white px-8 py-3 hover:bg-blue-800 transition font-medium cursor-pointer"
            >
              Search
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  fetchSweets();
                }}
                className="bg-gray-100 text-gray-500 px-6 py-3 hover:bg-gray-200 transition border-l cursor-pointer"
              >
                X
              </button>
            )}
          </form>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {sweets.map((sweet) => (
            <div
              key={sweet._id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col group"
            >
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-extrabold text-gray-800 group-hover:text-blue-900 transition-colors">
                    {sweet.name}
                  </h3>
                  <span className="font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full text-sm border border-green-100">
                    ${sweet.price}
                  </span>
                </div>
                <div className="mb-6">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider border border-blue-100">
                    {sweet.category}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span>In Stock</span>
                  <span
                    className={`font-bold text-lg ${
                      sweet.quantity === 0 ? "text-red-500" : "text-gray-800"
                    }`}
                  >
                    {sweet.quantity} units
                  </span>
                </div>
              </div>
              <div className="p-6 pt-0">
                {user?.isAdmin ? (
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="+ Qty"
                        className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                        value={restockValues[sweet._id] || ""}
                        onChange={(e) =>
                          setRestockValues({
                            ...restockValues,
                            [sweet._id]: e.target.value,
                          })
                        }
                      />
                      <button
                        onClick={() => handleRestock(sweet._id)}
                        className="text-xs bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 font-bold flex-1 border border-blue-100 transition-colors cursor-pointer"
                      >
                        Restock
                      </button>
                    </div>
                    <button
                      onClick={() => openDeleteModal(sweet._id)}
                      className="w-full text-xs bg-red-50 text-red-600 py-3 rounded-lg hover:bg-red-100 font-bold border border-red-100 transition-colors cursor-pointer"
                    >
                      Delete Item
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handlePurchase(sweet._id)}
                    disabled={sweet.quantity === 0}
                    className={`w-full py-4 rounded-xl cursor-pointer font-bold text-sm uppercase tracking-wide shadow-md transition-all duration-200 transform active:scale-95 flex justify-center items-center gap-2 ${
                      sweet.quantity > 0
                        ? "bg-blue-900 text-white hover:bg-blue-800 hover:shadow-lg"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                    }`}
                  >
                    {sweet.quantity > 0 ? (
                      <>
                        Purchase Sweet
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                        </svg>
                      </>
                    ) : (
                      "Out of Stock"
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {sweets.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 mt-10">
            <p className="text-gray-400 text-lg">
              No inventory found matching your criteria.
            </p>
          </div>
        )}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 transform transition-all scale-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                Add New Inventory
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form
              onSubmit={handleAddSweet}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  required
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                  value={newSweet.name}
                  onChange={(e) =>
                    setNewSweet({ ...newSweet, name: e.target.value })
                  }
                  placeholder="e.g. Chocolate Bar"
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  required
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                  value={newSweet.category}
                  onChange={(e) =>
                    setNewSweet({ ...newSweet, category: e.target.value })
                  }
                  placeholder="e.g. Candy"
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($)
                </label>
                <input
                  required
                  type="number"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                  value={newSweet.price}
                  onChange={(e) =>
                    setNewSweet({ ...newSweet, price: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Quantity
                </label>
                <input
                  required
                  type="number"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                  value={newSweet.quantity}
                  onChange={(e) =>
                    setNewSweet({ ...newSweet, quantity: e.target.value })
                  }
                  placeholder="0"
                />
              </div>
              <div className="col-span-2 flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 font-bold shadow-md transition-transform active:scale-95 cursor-pointer"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 transform transition-all scale-100">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg leading-6 font-bold text-gray-900">
                Delete Inventory Item?
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Are you sure you want to remove this sweet from the database? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:text-sm transition-colors cursor-pointer"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:text-sm transition-colors cursor-pointer"
                onClick={executeDelete}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;