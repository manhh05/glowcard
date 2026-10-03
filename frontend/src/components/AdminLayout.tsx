import React from 'react';
import { NavLink, Link, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Sparkles, 
  Store, 
  LogOut, 
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Guard: if not admin, show warning / redirect button
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-red-50 text-red-700 flex items-center justify-center">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="font-serif text-2xl text-stone-900">Yêu Cầu Quyền Quản Trị</h2>
        <p className="text-xs text-stone-500">
          Bạn cần đăng nhập bằng tài khoản quản trị viên (Admin) để truy cập trang này.
        </p>
        <div className="pt-2 flex flex-col gap-2">
          <Link
            to="/admin/login"
            className="py-2.5 px-4 rounded-xl bg-stone-900 text-stone-50 text-xs font-semibold"
          >
            Đến trang đăng nhập Admin
          </Link>
          <Link to="/" className="text-xs text-stone-500 hover:text-stone-800">
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { to: '/admin', label: 'Tổng quan & Thống kê', icon: LayoutDashboard, end: true },
    { to: '/admin/products', label: 'Quản lý sản phẩm', icon: Package, end: false },
    { to: '/admin/orders', label: 'Quản lý đơn hàng', icon: ShoppingBag, end: false },
    { to: '/admin/custom-scent', label: 'Yêu cầu mùi hương riêng', icon: Sparkles, end: false },
  ];

  return (
    <div className="min-h-screen bg-[#F7F4F0] flex flex-col md:flex-row">
      
      {/* Mobile Header Bar */}
      <header className="md:hidden bg-stone-900 text-stone-100 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-400" />
          <span className="font-serif font-bold">Glowcard Admin</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 text-stone-300 hover:text-white"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Admin Sidebar Navigation */}
      <aside
        className={`${
          sidebarOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-stone-900 text-stone-300 flex flex-col justify-between shrink-0 p-6 md:min-h-screen`}
      >
        <div className="space-y-8">
          
          {/* Brand & Admin Badge */}
          <div className="space-y-1">
            <Link to="/admin" className="font-serif text-2xl text-stone-100 font-medium tracking-tight block">
              Glowcard
            </Link>
            <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Bảng Điều Khiển Quản Trị</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-3 rounded-xl transition-colors font-medium ${
                    isActive
                      ? 'bg-amber-800 text-white shadow-xs'
                      : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800/80'
                  }`
                }
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-8 border-t border-stone-800 space-y-3 text-xs">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800/60 rounded-xl transition-colors"
          >
            <Store className="w-4 h-4" />
            <span>Xem cửa hàng bán lẻ</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-stone-800/60 rounded-xl transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-7xl">
        <Outlet />
      </main>

    </div>
  );
};
