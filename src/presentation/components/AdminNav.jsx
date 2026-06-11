import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../domain/context/AuthContext";

import { LogOut, Bell, ChevronDown, User as UserIcon } from "lucide-react";

function AdminNav() {
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const { user, logout } = useAuth();

    const location = useLocation();

    // =========================
    // PAGE TITLE
    // =========================
    const getPageTitle = () => {
        const path = location.pathname.split("/").pop();

        if (!path || path === "admin") {
            return "Dashboard";
        }

        return path.charAt(0).toUpperCase() + path.slice(1);
    };

    // USER INITIAL
    const userInitial =
        user?.email?.charAt(0)?.toUpperCase() || "U";

    return (
        <nav className="bg-white border-b border-gray-200 fixed top-0 right-0 left-64 z-30 h-16">
            <div className="h-full px-6 flex items-center justify-between">

                {/* ================= LEFT SIDE ================= */}
                <div className="flex items-center">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {getPageTitle()}
                    </h2>
                </div>

                {/* ================= RIGHT SIDE ================= */}
                <div className="flex items-center gap-6">

                    {/* NOTIFICATION */}
                    <button className="relative p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <Bell size={20} />

                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>

                    {/* DIVIDER */}
                    <div className="h-8 w-[1px] bg-gray-200"></div>

                    {/* PROFILE DROPDOWN */}
                    <div className="relative">

                        {/* PROFILE BUTTON */}
                        <button
                            onClick={() =>
                                setIsProfileOpen(!isProfileOpen)
                            }
                            className="flex items-center gap-3 group focus:outline-none"
                        >
                            {/* USER INFO */}
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-gray-900 leading-none capitalize">
                                    {user?.role || "Administrator"}
                                </p>

                                <p className="text-xs text-gray-500 mt-1 truncate max-w-[150px]">
                                    {user?.email || "loading..."}
                                </p>
                            </div>

                            {/* AVATAR */}
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm group-hover:bg-blue-700 transition-colors">
                                {userInitial}
                            </div>

                            {/* ICON */}
                            <ChevronDown
                                size={16}
                                className={`text-gray-400 transition-transform ${
                                    isProfileOpen
                                        ? "rotate-180"
                                        : ""
                                }`}
                            />
                        </button>

                        {/* ================= DROPDOWN ================= */}
                        {isProfileOpen && (
                            <>
                                {/* BACKDROP */}
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() =>
                                        setIsProfileOpen(false)
                                    }
                                ></div>

                                {/* MENU */}
                                <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 z-20 overflow-hidden">

                                    {/* HEADER */}
                                    <div className="px-4 py-4 bg-gray-50 border-b border-gray-100">
                                        <div className="flex items-center gap-3">

                                            {/* BIG AVATAR */}
                                            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold">
                                                {userInitial}
                                            </div>

                                            {/* USER DETAILS */}
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="text-sm font-semibold text-gray-900 truncate capitalize">
                                                    {user?.role ||
                                                        "Administrator"}
                                                </span>

                                                <span className="text-xs text-gray-500 truncate">
                                                    {user?.email ||
                                                        "No email found"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ACTIONS */}
                                    <div className="py-2">

                                        {/* PROFILE */}
                                        <Link
                                            to="/profile"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex w-full items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors group"
                                        >
                                            <UserIcon
                                                size={18}
                                                className="mr-3 text-gray-400 group-hover:text-blue-600"
                                            />

                                            My Profile
                                        </Link>
                                    </div>

                                    {/* LOGOUT */}
                                    <div className="border-t border-gray-50 py-2">
                                        <button onClick={logout} className="flex w-full items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                                            <LogOut size={18} className="mr-3"/> Sign out</button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default AdminNav;
