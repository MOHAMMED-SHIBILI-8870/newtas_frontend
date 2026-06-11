import { useState } from "react";
import Navbar from "../../components/Navbar";

const TripPlanner = () => {
  const [selectedPreferences, setSelectedPreferences] = useState([]);

  const preferences = ["Adventure", "Nature", "Luxury", "Food", "History"];

  const togglePreference = (pref) => {
    setSelectedPreferences((current) =>
      current.includes(pref)
        ? current.filter((item) => item !== pref)
        : [...current, pref]
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div className="hidden lg:block relative rounded-[3rem] overflow-hidden h-[600px] shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828"
            className="w-full h-full object-cover"
            alt="Travel Planning"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent flex items-end p-12">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Let AI curate your <br />{" "}
              <span className="text-orange-400">Perfect Itinerary.</span>
            </h2>
          </div>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-slate-100">
          <h3 className="text-2xl font-bold mb-8 text-slate-800">
            Plan Your Trip
          </h3>

          <form className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">
                  From
                </label>
                <input
                  type="text"
                  placeholder="Starting City"
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 ring-blue-500/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">
                  To
                </label>
                <input
                  type="text"
                  placeholder="Destination"
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 ring-blue-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">
                  Budget Range
                </label>
                <input type="range" className="w-full accent-orange-500" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">
                  Travelers
                </label>
                <select className="w-full p-4 bg-slate-50 rounded-2xl outline-none">
                  <option>Solo</option>
                  <option>Couple</option>
                  <option>Family</option>
                  <option>Friends</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-400 uppercase block">
                Preferences
              </label>
              <div className="flex flex-wrap gap-3">
                {preferences.map((pref) => (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => togglePreference(pref)}
                    className={`px-5 py-2 rounded-full border text-sm font-medium transition ${
                      selectedPreferences.includes(pref)
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-200 hover:bg-blue-600 hover:text-white"
                    }`}
                  >
                    {pref}
                  </button>
                ))}
              </div>
            </div>

            <button className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/30 hover:opacity-90 transition">
              Generate Trip Plan
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TripPlanner;
