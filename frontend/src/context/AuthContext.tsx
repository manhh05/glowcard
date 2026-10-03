import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, ShippingAddress } from '../types';
import { INITIAL_CUSTOMER_USER, INITIAL_SHIPPING_ADDRESSES } from '../data/mockData';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loginCustomer: (email: string, pass: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  registerCustomer: (name: string, email: string, phone: string, pass: string) => Promise<boolean>;
  loginAdmin: (username: string, pass: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  addAddress: (address: Omit<ShippingAddress, 'id'>) => void;
  updateAddress: (id: string, address: Partial<ShippingAddress>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  // Guest-to-login interceptor trigger
  showLoginPromptModal: boolean;
  loginPromptMessage: string;
  triggerLoginRequirement: (message?: string) => void;
  closeLoginPromptModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'glowcard123',
};

const STORAGE_KEY_AUTH = 'glowcard_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUTH);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    // Default to INITIAL_CUSTOMER_USER or null?
    // Requirement: There are 3 user states: Guest, Logged-in Customer, Admin.
    // Let's start with Guest (null user) or allow quick toggle, but let's check localStorage.
    return null;
  });

  const [showLoginPromptModal, setShowLoginPromptModal] = useState<boolean>(false);
  const [loginPromptMessage, setLoginPromptMessage] = useState<string>(
    'Vui lòng đăng nhập tài khoản để thêm sản phẩm vào giỏ hàng và tiến hành thanh toán.'
  );

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY_AUTH);
      }
    } catch {
      // ignore
    }
  }, [user]);

  const role: UserRole = user ? user.role : 'guest';
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  const triggerLoginRequirement = (message?: string) => {
    if (message) setLoginPromptMessage(message);
    setShowLoginPromptModal(true);
  };

  const closeLoginPromptModal = () => {
    setShowLoginPromptModal(false);
  };

  const loginCustomer = async (email: string, pass: string): Promise<boolean> => {
    // Mock customer authentication
    const loggedUser: UserProfile = {
      ...INITIAL_CUSTOMER_USER,
      email: email || INITIAL_CUSTOMER_USER.email,
    };
    setUser(loggedUser);
    setShowLoginPromptModal(false);
    return true;
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    // Mock Google OAuth login
    const googleUser: UserProfile = {
      id: 'google-user-' + Date.now(),
      fullName: 'Dương Minh Anh (Google)',
      email: 'DuongMinhAnh9506@gmail.com',
      phone: '0901234567',
      role: 'customer',
      addresses: INITIAL_SHIPPING_ADDRESSES,
    };
    setUser(googleUser);
    setShowLoginPromptModal(false);
    return true;
  };

  const registerCustomer = async (
    name: string,
    email: string,
    phone: string,
    pass: string
  ): Promise<boolean> => {
    const newUser: UserProfile = {
      id: 'cust-' + Date.now(),
      fullName: name,
      email: email,
      phone: phone,
      role: 'customer',
      addresses: [
        {
          id: 'addr-' + Date.now(),
          fullName: name,
          phone: phone,
          province: 'TP. Hồ Chí Minh',
          district: 'Quận 1',
          ward: 'Phường Bến Nghé',
          streetAddress: 'Địa chỉ nhận hàng mặc định',
          isDefault: true,
        },
      ],
    };
    setUser(newUser);
    setShowLoginPromptModal(false);
    return true;
  };

  const loginAdmin = async (username: string, pass: string): Promise<boolean> => {
    if (
      username.trim().toLowerCase() === ADMIN_CREDENTIALS.username &&
      pass === ADMIN_CREDENTIALS.password
    ) {
      const adminUser: UserProfile = {
        id: 'admin-glowcard',
        fullName: 'Quản Trị Viên Glowcard',
        email: 'admin@glowcard.vn',
        phone: '0988889999',
        role: 'admin',
        addresses: [],
      };
      setUser(adminUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (!user) return;
    setUser({
      ...user,
      ...data,
    });
  };

  const addAddress = (addressData: Omit<ShippingAddress, 'id'>) => {
    if (!user) return;
    const newAddress: ShippingAddress = {
      ...addressData,
      id: 'addr-' + Date.now(),
    };
    const updated = addressData.isDefault
      ? user.addresses.map((a) => ({ ...a, isDefault: false })).concat(newAddress)
      : [...user.addresses, newAddress];

    setUser({
      ...user,
      addresses: updated,
    });
  };

  const updateAddress = (id: string, updatedFields: Partial<ShippingAddress>) => {
    if (!user) return;
    let list = user.addresses.map((addr) => {
      if (addr.id === id) {
        return { ...addr, ...updatedFields };
      }
      return addr;
    });

    if (updatedFields.isDefault) {
      list = list.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }));
    }

    setUser({
      ...user,
      addresses: list,
    });
  };

  const deleteAddress = (id: string) => {
    if (!user) return;
    const filtered = user.addresses.filter((a) => a.id !== id);
    if (filtered.length > 0 && !filtered.some((a) => a.isDefault)) {
      filtered[0].isDefault = true;
    }
    setUser({
      ...user,
      addresses: filtered,
    });
  };

  const setDefaultAddress = (id: string) => {
    if (!user) return;
    const updated = user.addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    setUser({
      ...user,
      addresses: updated,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isAdmin,
        loginCustomer,
        loginWithGoogle,
        registerCustomer,
        loginAdmin,
        logout,
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        showLoginPromptModal,
        loginPromptMessage,
        triggerLoginRequirement,
        closeLoginPromptModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
