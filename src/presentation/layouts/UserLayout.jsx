import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function UserLayout() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(6,182,212,0.08),_transparent_35%),linear-gradient(to_bottom,_#f8fafc,_#eef2ff)] text-slate-900">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}

