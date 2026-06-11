// ============================================
// src/pages/TripPlannerPage.jsx
// ============================================

import { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown"; // Run: npm i react-markdown
import { Compass, Calendar, Users, MapPin, DollarSign, Car } from "lucide-react"; // Run: npm i lucide-react

export default function TripPlannerPage() {
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    days: 1,
    trip_type: "Family",
    budget_level: "Medium",
    members: 1,
    children: 0,
    hotel_type: "3 Star",
    transport: "Car",
    created_by: "user",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.type === "number"
          ? Number(e.target.value)
          : e.target.value,
    });
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResult("");

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:8997/ai/chat", 
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResult(response.data.result);
    } catch (err) {
      console.error(err);

      if (err?.response?.status === 401) {
        setError("Session expired or unauthorized. Please log in again.");
      } else {
        setError(
          err?.response?.data?.error || "Failed to generate trip plan"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 antialiased">
      {/* Items-start prevents the shorter form card from expanding alongside the itinerary */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-12 gap-6 items-start">

        {/* ================= COLUMN 1: FORM (Fixed Size Style) ================= */}
        <div className="md:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-6">
          <div className="flex items-center gap-2 mb-4">
            <Compass className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900">AI Trip Planner</h1>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-semibold text-slate-600 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> From
              </label>
              <input
                type="text"
                name="from"
                value={formData.from}
                onChange={handleChange}
                placeholder="Manjeri"
                className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-semibold text-slate-600 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-500" /> To
              </label>
              <input
                type="text"
                name="to"
                value={formData.to}
                onChange={handleChange}
                placeholder="Kozhikode"
                className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 text-sm font-semibold text-slate-600 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Days
                </label>
                <input
                  type="number"
                  name="days"
                  min="1"
                  value={formData.days}
                  onChange={handleChange}
                  className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-semibold text-slate-600 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> Members
                </label>
                <input
                  type="number"
                  name="members"
                  min="1"
                  value={formData.members}
                  onChange={handleChange}
                  className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 text-sm font-semibold text-slate-600">Children</label>
                <input
                  type="number"
                  name="children"
                  min="0"
                  value={formData.children}
                  onChange={handleChange}
                  className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-semibold text-slate-600">Trip Type</label>
                <select
                  name="trip_type"
                  value={formData.trip_type}
                  onChange={handleChange}
                  className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl outline-none"
                >
                  <option>Family</option>
                  <option>Adventure</option>
                  <option>Solo</option>
                  <option>Couple</option>
                  <option>Friends</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 text-sm font-semibold text-slate-600 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" /> Budget
                </label>
                <select
                  name="budget_level"
                  value={formData.budget_level}
                  onChange={handleChange}
                  className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl outline-none"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm font-semibold text-slate-600">Hotel Type</label>
                <select
                  name="hotel_type"
                  value={formData.hotel_type}
                  onChange={handleChange}
                  className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl outline-none"
                >
                  <option>Budget</option>
                  <option>3 Star</option>
                  <option>4 Star</option>
                  <option>5 Star</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-semibold text-slate-600 flex items-center gap-1">
                <Car className="w-3.5 h-3.5" /> Transport
              </label>
              <select
                name="transport"
                value={formData.transport}
                onChange={handleChange}
                className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl outline-none"
              >
                <option>Car</option>
                <option>Bus</option>
                <option>Train</option>
                <option>Flight</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-bold shadow-md transition-all disabled:opacity-50 mt-2"
            >
              {loading ? "Generating Plan..." : "Generate Trip"}
            </button>
          </form>
        </div>

        {/* ================= COLUMN 2: ITINERARY RESULT RESULT ================= */}
        <div className="md:col-span-7 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 min-h-[450px]">
          <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
            Generated Travel Itinerary
          </h2>

          {error && (
            <div className="bg-red-50 text-red-600 border border-red-100 p-3.5 rounded-xl mb-4 text-sm font-medium">
              {error}
            </div>
          )}

          {loading && (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="space-y-2">
                <div className="h-3 bg-slate-200 rounded"></div>
                <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                <div className="h-3 bg-slate-200 rounded w-2/3"></div>
              </div>
              <div className="h-4 bg-slate-200 rounded w-1/4 mt-6"></div>
              <div className="space-y-2">
                <div className="h-3 bg-slate-200 rounded"></div>
                <div className="h-3 bg-slate-200 rounded w-4/5"></div>
              </div>
            </div>
          )}

          {result ? (
            <div className="prose prose-slate max-w-none text-slate-700 markdown-content">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          ) : (
            !loading && (
              <div className="flex flex-col items-center justify-center text-slate-400 h-64 text-center">
                <Compass className="w-10 h-10 mb-2 stroke-[1.5]" />
                <p className="text-sm">Your formatted day-to-day guide will show here.</p>
              </div>
            )
          )}
        </div>

      </div>
    </div>
  );
}