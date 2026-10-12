import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, ShippingAddress } from '../types';
import { tokenStore, type AuthRole } from '../api/client';
import * as authApi from '../api/auth';
import type { AddressIn, AddressOut, AddressUpdate, UserOut } from '../api/types';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loginCustomer: (email: string, pass: string) => Promise<void>;
  registerCustomer: (name: string, email: string, phone: string, pass: string) => Promise<void>;
  loginAdmin: (username: string, pass: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  addAddress: (address: Omit<ShippingAddress, 'id'>) => Promise<ShippingAddress>;
  updateAddress: (id: string, address: Partial<ShippingAddress>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  // Guest-to-login interceptor trigger
  showLoginPromptModal: boolean;
  loginPromptMessage: string;
  triggerLoginRequirement: (message?: string) => void;
  closeLoginPromptModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_AUTH = 'glowcard_auth_user';

// ---------- chuyển đổi dữ liệu API <-> kiểu của frontend ----------

const toShippingAddress = (a: AddressOut): ShippingAddress => ({
  id: String(a.id),
  fullName: a.recipient_name,
  phone: a.phone,
  province: a.province,
  district: a.district ?? '',
  ward: a.ward,
  streetAddress: a.address_line,
  isDefault: a.is_default,
});

const toAddressBody = (a: Omit<ShippingAddress, 'id'>): AddressIn => ({
  recipient_name: a.fullName.trim(),
  phone: a.phone.trim(),
  province: a.province.trim(),
  district: a.district.trim() || null,
  ward: a.ward.trim(),
  address_line: a.streetAddress.trim(),
  is_default: a.isDefault,
});

const toAddressPatch = (f: Partial<ShippingAddress>): AddressUpdate => {
  const body: AddressUpdate = {};
  if (f.fullName !== undefined) body.recipient_name = f.fullName.trim();
  if (f.phone !== undefined) body.phone = f.phone.trim();
  if (f.province !== undefined) body.province = f.province.trim();
  if (f.district !== undefined) body.district = f.district.trim() || null;
  if (f.ward !== undefined) body.ward = f.ward.trim();
  if (f.streetAddress !== undefined) body.address_line = f.streetAddress.trim();
  if (f.isDefault !== undefined) body.is_default = f.isDefault;
  return body;
};

const toUserProfile = (me: UserOut, addresses: AddressOut[]): UserProfile => ({
  id: String(me.id),
  fullName: me.full_name,
  email: me.email,
  phone: me.phone ?? '',
  role: 'customer',
  addresses: addresses.map(toShippingAddress),
});

const fetchCustomer = async (): Promise<UserProfile> => {
  const [me, addresses] = await Promise.all([authApi.getMe(), authApi.listAddresses()]);
  return toUserProfile(me, addresses);
};

const fetchAdmin = async (): Promise<UserProfile> => {
  const me = await authApi.getAdminMe();
  return {
    id: `admin-${me.id}`,
    fullName: 'Quản trị viên Glowcard',
    email: me.username, // admin không có email, hiển thị username
    phone: '',
    role: 'admin',
    addresses: [],
  };
};

// ---------- provider ----------

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Hồ sơ cache để tải lại trang không bị nháy; luôn được kiểm tra lại với server bên dưới
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUTH);
      if (!saved) return null;
      const cached = JSON.parse(saved) as UserProfile;
      return tokenStore.get(cached.role === 'admin' ? 'admin' : 'customer') ? cached : null;
    } catch {
      return null;
    }
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

  // Kiểm tra lại phiên đăng nhập với server lúc mở trang
  useEffect(() => {
    let cancelled = false;
    const sessionRole: AuthRole | null = tokenStore.get('customer')
      ? 'customer'
      : tokenStore.get('admin')
      ? 'admin'
      : null;

    if (!sessionRole) {
      setUser(null);
      return;
    }

    (sessionRole === 'admin' ? fetchAdmin() : fetchCustomer())
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch(() => {
        // 401: client đã xóa token và phát sự kiện bên dưới. Lỗi mạng: giữ nguyên.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Token hết hạn hoặc bị từ chối: đăng xuất khỏi giao diện
  useEffect(() => {
    const onUnauthorized = (e: Event) => {
      const failedRole = (e as CustomEvent<AuthRole>).detail;
      setUser((prev) =>
        prev && (failedRole === 'admin') === (prev.role === 'admin') ? null : prev
      );
    };
    window.addEventListener('glowcard:unauthorized', onUnauthorized);
    return () => window.removeEventListener('glowcard:unauthorized', onUnauthorized);
  }, []);

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

  // Chỉ một phiên tại một thời điểm: đăng nhập vai trò này thì xóa token vai trò kia
  const startSession = async (
    sessionRole: AuthRole,
    token: string,
    load: () => Promise<UserProfile>
  ) => {
    tokenStore.clear(sessionRole === 'admin' ? 'customer' : 'admin');
    tokenStore.set(sessionRole, token);
    try {
      setUser(await load());
      setShowLoginPromptModal(false);
    } catch (e) {
      tokenStore.clear(sessionRole);
      throw e;
    }
  };

  const loginCustomer = async (email: string, pass: string): Promise<void> => {
    const { access_token } = await authApi.login({ email, password: pass });
    await startSession('customer', access_token, fetchCustomer);
  };

  const registerCustomer = async (
    name: string,
    email: string,
    phone: string,
    pass: string
  ): Promise<void> => {
    const { access_token } = await authApi.register({
      email,
      password: pass,
      full_name: name,
      phone: phone.trim() || null,
    });
    await startSession('customer', access_token, fetchCustomer);
  };

  const loginAdmin = async (username: string, pass: string): Promise<void> => {
    const { access_token } = await authApi.adminLogin({ username, password: pass });
    await startSession('admin', access_token, fetchAdmin);
  };

  const logout = () => {
    tokenStore.clear('customer');
    tokenStore.clear('admin');
    setUser(null);
  };

  const updateProfile = async (data: Partial<UserProfile>): Promise<void> => {
    if (!user) return;
    const me = await authApi.updateMe({
      full_name: data.fullName?.trim(),
      phone: data.phone !== undefined ? data.phone.trim() || null : undefined,
    });
    setUser((prev) =>
      prev ? { ...prev, fullName: me.full_name, phone: me.phone ?? '' } : prev
    );
  };

  // Sau mỗi thay đổi địa chỉ, tải lại danh sách để cờ "mặc định" luôn khớp với server
  const refreshAddresses = async () => {
    const list = (await authApi.listAddresses()).map(toShippingAddress);
    setUser((prev) => (prev ? { ...prev, addresses: list } : prev));
  };

  const addAddress = async (
    addressData: Omit<ShippingAddress, 'id'>
  ): Promise<ShippingAddress> => {
    const created = await authApi.createAddress(toAddressBody(addressData));
    await refreshAddresses();
    return toShippingAddress(created);
  };

  const updateAddress = async (
    id: string,
    updatedFields: Partial<ShippingAddress>
  ): Promise<void> => {
    await authApi.updateAddress(Number(id), toAddressPatch(updatedFields));
    await refreshAddresses();
  };

  const deleteAddress = async (id: string): Promise<void> => {
    await authApi.deleteAddress(Number(id));
    await refreshAddresses();
  };

  const setDefaultAddress = async (id: string): Promise<void> => {
    await authApi.updateAddress(Number(id), { is_default: true });
    await refreshAddresses();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isAdmin,
        loginCustomer,
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