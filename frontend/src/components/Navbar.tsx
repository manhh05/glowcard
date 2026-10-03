import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  ShoppingBag, 
  User, 
  Menu, 
  X, 
  LogOut, 
  Package, 
  ShieldCheck, 
  ChevronDown,
  Sparkles
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout, loginCustomer, loginAdmin } = useAuth();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [policyDropdownOpen, setPolicyDropdownOpen] = useState(false);
  const [mobilePolicyOpen, setMobilePolicyOpen] = useState(false);

  const policyCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const isPolicyActive = location.pathname === '/shipping-policy' || location.pathname === '/return-policy';

  const handlePolicyMouseEnter = () => {
    if (policyCloseTimeoutRef.current) {
      clearTimeout(policyCloseTimeoutRef.current);
      policyCloseTimeoutRef.current = null;
    }
    setPolicyDropdownOpen(true);
  };

  const handlePolicyMouseLeave = () => {
    if (policyCloseTimeoutRef.current) {
      clearTimeout(policyCloseTimeoutRef.current);
    }
    policyCloseTimeoutRef.current = setTimeout(() => {
      setPolicyDropdownOpen(false);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (policyCloseTimeoutRef.current) {
        clearTimeout(policyCloseTimeoutRef.current);
      }
    };
  }, []);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <>
      {/* Top Demo State Switcher Helper (Aesthetic banner to easily switch roles for testing) */}
      <aside aria-label="Bộ chuyển đổi vai trò thử nghiệm" className="bg-stone-900 text-stone-300 text-xs py-1.5 px-4 border-b border-stone-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Trạng thái thử nghiệm:</span>
            <strong className="text-white font-medium">
              {isAdmin ? 'Quản trị viên (Admin)' : isAuthenticated ? 'Khách hàng đăng nhập' : 'Khách vãng lai (Guest)'}
            </strong>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-stone-400 hidden sm:inline">Chuyển nhanh:</span>
            <button
              onClick={() => {
                logout();
                setUserDropdownOpen(false);
              }}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                !isAuthenticated ? 'bg-amber-600 text-white font-medium' : 'hover:text-white hover:bg-stone-800'
              }`}
            >
              Khách vãng lai
            </button>
            <button
              onClick={() => {
                loginCustomer('customer@glowcard.vn', '123456');
                setUserDropdownOpen(false);
              }}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                isAuthenticated && !isAdmin ? 'bg-amber-600 text-white font-medium' : 'hover:text-white hover:bg-stone-800'
              }`}
            >
              Khách hàng
            </button>
            <button
              onClick={() => {
                loginAdmin('admin', 'glowcard123');
                setUserDropdownOpen(false);
              }}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                isAdmin ? 'bg-amber-600 text-white font-medium' : 'hover:text-white hover:bg-stone-800'
              }`}
            >
              Admin
            </button>
          </div>
        </div>
      </aside>

      {/* Main Top Navigation Bar (Strict 3-zone contract) */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#EADBCE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Zone 1: Single text element wordmark */}
          <Link 
            to="/" 
            className="font-serif text-2xl md:text-3xl font-medium tracking-tight text-stone-900 hover:text-amber-900 transition-colors shrink-0"
          >
            Glowcard
          </Link>

          {/* Zone 2: 4-6 clean text navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
            <NavLink 
              to="/" 
              end
              className={({ isActive }) => 
                `transition-colors hover:text-stone-950 py-1 ${isActive ? 'text-amber-900 font-semibold border-b-2 border-amber-800' : ''}`
              }
            >
              Trang chủ
            </NavLink>
            <NavLink 
              to="/products" 
              className={({ isActive }) => 
                `transition-colors hover:text-stone-950 py-1 ${isActive ? 'text-amber-900 font-semibold border-b-2 border-amber-800' : ''}`
              }
            >
              Sản phẩm
            </NavLink>
            <NavLink 
              to="/about" 
              className={({ isActive }) => 
                `transition-colors hover:text-stone-950 py-1 ${isActive ? 'text-amber-900 font-semibold border-b-2 border-amber-800' : ''}`
              }
            >
              Giới thiệu
            </NavLink>

            {/* Policies Dropdown (Seamless hover bridge and grace period) */}
            <div 
              className="relative py-2"
              onMouseEnter={handlePolicyMouseEnter}
              onMouseLeave={handlePolicyMouseLeave}
            >
              <button
                type="button"
                onClick={() => setPolicyDropdownOpen(!policyDropdownOpen)}
                className={`flex items-center gap-1.5 transition-colors hover:text-stone-950 py-1 cursor-pointer ${
                  isPolicyActive ? 'text-amber-900 font-semibold border-b-2 border-amber-800' : ''
                }`}
                aria-expanded={policyDropdownOpen}
              >
                <span>Chính sách</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${policyDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {policyDropdownOpen && (
                <div 
                  className="absolute left-0 top-full pt-1.5 w-56 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                  onMouseEnter={handlePolicyMouseEnter}
                  onMouseLeave={handlePolicyMouseLeave}
                >
                  {/* Invisible hit bridge to prevent any gap between nav button and menu */}
                  <div className="absolute -top-3.5 left-0 right-0 h-4" />

                  <div className="bg-white rounded-xl shadow-lg border border-stone-200 py-1.5 overflow-hidden">
                    <NavLink
                      to="/shipping-policy"
                      onClick={() => setPolicyDropdownOpen(false)}
                      className={({ isActive }) =>
                        `block px-4 py-2.5 text-xs transition-colors ${
                          isActive
                            ? 'bg-amber-50 font-semibold text-amber-900'
                            : 'text-stone-700 hover:bg-stone-50 hover:text-stone-900'
                        }`
                      }
                    >
                      Chính sách vận chuyển
                    </NavLink>
                    <NavLink
                      to="/return-policy"
                      onClick={() => setPolicyDropdownOpen(false)}
                      className={({ isActive }) =>
                        `block px-4 py-2.5 text-xs transition-colors ${
                          isActive
                            ? 'bg-amber-50 font-semibold text-amber-900'
                            : 'text-stone-700 hover:bg-stone-50 hover:text-stone-900'
                        }`
                      }
                    >
                      Chính sách đổi trả
                    </NavLink>
                  </div>
                </div>
              )}
            </div>

            {isAdmin && (
              <NavLink 
                to="/admin" 
                className="text-amber-800 font-medium flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200"
              >
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                Quản trị Glowcard
              </NavLink>
            )}
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-3">
            {/* Cart Link / Action */}
            <Link
              to="/cart"
              className="relative p-2.5 text-stone-700 hover:text-stone-950 hover:bg-stone-100 rounded-full transition-colors flex items-center justify-center"
              aria-label="Giỏ hàng"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-amber-800 text-white text-[11px] font-semibold rounded-full flex items-center justify-center tabular-nums shadow-xs">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Account / Login */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 py-1.5 px-3 rounded-full border border-stone-300 hover:border-stone-400 bg-white text-stone-800 text-xs font-medium transition-all"
                  aria-expanded={userDropdownOpen}
                >
                  <User className="w-3.5 h-3.5 text-stone-600" />
                  <span className="max-w-[110px] truncate hidden sm:inline">{user?.fullName || 'Tài khoản'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-stone-200 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="px-4 py-2 border-b border-stone-100 text-xs text-stone-500">
                      <p className="font-semibold text-stone-900 truncate">{user?.fullName}</p>
                      <p className="truncate text-stone-500">{user?.email}</p>
                    </div>

                    {isAdmin ? (
                      <>
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-700" />
                          Trang Quản Trị
                        </Link>
                        <Link
                          to="/admin/products"
                          onClick={() => setUserDropdownOpen(false)}
                          className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                        >
                          Quản lý sản phẩm
                        </Link>
                        <Link
                          to="/admin/orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                        >
                          Quản lý đơn hàng
                        </Link>
                        <Link
                          to="/admin/custom-scent"
                          onClick={() => setUserDropdownOpen(false)}
                          className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                        >
                          Yêu cầu mùi hương riêng
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                        >
                          <User className="w-4 h-4 text-stone-500" />
                          Hồ sơ & Sổ địa chỉ
                        </Link>
                        <Link
                          to="/orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                        >
                          <Package className="w-4 h-4 text-stone-500" />
                          Lịch sử đơn hàng
                        </Link>
                      </>
                    )}

                    <div className="border-t border-stone-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="py-2 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-medium transition-colors whitespace-nowrap shadow-xs"
              >
                Đăng nhập
              </Link>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
              aria-label="Mở menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#EADBCE] bg-[#FAF8F5] px-4 pt-3 pb-6 space-y-3">
            <NavLink
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-stone-800 hover:text-amber-900"
            >
              Trang chủ
            </NavLink>
            <NavLink
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-stone-800 hover:text-amber-900"
            >
              Sản phẩm
            </NavLink>
            <NavLink
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-stone-800 hover:text-amber-900"
            >
              Giới thiệu
            </NavLink>

            {/* Mobile Policies (ONE navigation item with dropdown consistent with desktop) */}
            <div>
              <button
                type="button"
                onClick={() => setMobilePolicyOpen(!mobilePolicyOpen)}
                className={`w-full flex items-center justify-between py-2 text-sm font-medium transition-colors ${
                  isPolicyActive ? 'text-amber-900 font-semibold' : 'text-stone-800 hover:text-amber-900'
                }`}
              >
                <span>Chính sách</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobilePolicyOpen ? 'rotate-180 text-amber-900' : 'text-stone-500'}`} />
              </button>

              {mobilePolicyOpen && (
                <div className="pl-4 pb-1 space-y-1 text-xs border-l-2 border-amber-300 ml-2 mt-1 animate-in fade-in duration-150">
                  <NavLink
                    to="/shipping-policy"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setMobilePolicyOpen(false);
                    }}
                    className={({ isActive }) =>
                      `block py-2 transition-colors ${
                        isActive ? 'text-amber-900 font-semibold' : 'text-stone-600 hover:text-stone-900'
                      }`
                    }
                  >
                    Chính sách vận chuyển
                  </NavLink>
                  <NavLink
                    to="/return-policy"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setMobilePolicyOpen(false);
                    }}
                    className={({ isActive }) =>
                      `block py-2 transition-colors ${
                        isActive ? 'text-amber-900 font-semibold' : 'text-stone-600 hover:text-stone-900'
                      }`
                    }
                  >
                    Chính sách đổi trả
                  </NavLink>
                </div>
              )}
            </div>

            {isAdmin && (
              <NavLink
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-semibold text-amber-900"
              >
                Bảng quản trị Admin
              </NavLink>
            )}

            <div className="border-t border-stone-200 pt-3">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <p className="text-xs text-stone-500 font-medium">Đã đăng nhập: {user?.fullName}</p>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm text-stone-700 py-1"
                  >
                    Tài khoản cá nhân
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm text-stone-700 py-1"
                  >
                    Lịch sử đơn hàng
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="text-sm text-red-600 py-1 block"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 pt-1">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2 text-center text-xs font-medium rounded-lg bg-stone-900 text-white"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2 text-center text-xs font-medium rounded-lg border border-stone-300 text-stone-800"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
