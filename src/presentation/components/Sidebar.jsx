import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Map, 
  CreditCard, 
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", path: "dashboard", icon: LayoutDashboard },
  { name: "User Management", path: "users", icon: Users },
  { name: "Trip Management", path: "trips", icon: Map },
  { name: "Payments", path: "payments", icon: CreditCard },
];

function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-gray-50">
        <h1 className="text-2xl font-bold text-blue-600 tracking-tight">TripAdmin</h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-blue-50 text-blue-600 font-semibold"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              }`
            }
          >
            <item.icon size={20} />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
