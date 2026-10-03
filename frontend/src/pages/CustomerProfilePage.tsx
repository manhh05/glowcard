import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShippingAddress } from '../types';
import { 
  User, 
  MapPin, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  ShieldCheck,
  Save,
  X
} from 'lucide-react';

export const CustomerProfilePage: React.FC = () => {
  const { user, updateProfile, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAuth();

  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [name, setName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);

  // Address modal/form state
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrProvince, setAddrProvince] = useState('TP. Hồ Chí Minh');
  const [addrDistrict, setAddrDistrict] = useState('Quận 1');
  const [addrWard, setAddrWard] = useState('Phường Bến Nghé');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrIsDefault, setAddrIsDefault] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      fullName: name,
      phone: phone,
    });
    setIsEditingProfile(false);
    setProfileSavedMsg(true);
    setTimeout(() => setProfileSavedMsg(false), 3000);
  };

  const openNewAddressModal = () => {
    setEditingAddressId(null);
    setAddrName(user?.fullName || '');
    setAddrPhone(user?.phone || '');
    setAddrProvince('TP. Hồ Chí Minh');
    setAddrDistrict('Quận 1');
    setAddrWard('Phường Bến Nghé');
    setAddrStreet('');
    setAddrIsDefault(false);
    setAddressModalOpen(true);
  };

  const openEditAddressModal = (addr: ShippingAddress) => {
    setEditingAddressId(addr.id);
    setAddrName(addr.fullName);
    setAddrPhone(addr.phone);
    setAddrProvince(addr.province);
    setAddrDistrict(addr.district);
    setAddrWard(addr.ward);
    setAddrStreet(addr.streetAddress);
    setAddrIsDefault(addr.isDefault);
    setAddressModalOpen(true);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrStreet.trim()) return;

    if (editingAddressId) {
      updateAddress(editingAddressId, {
        fullName: addrName,
        phone: addrPhone,
        province: addrProvince,
        district: addrDistrict,
        ward: addrWard,
        streetAddress: addrStreet,
        isDefault: addrIsDefault,
      });
    } else {
      addAddress({
        fullName: addrName,
        phone: addrPhone,
        province: addrProvince,
        district: addrDistrict,
        ward: addrWard,
        streetAddress: addrStreet,
        isDefault: addrIsDefault,
      });
    }

    setAddressModalOpen(false);
  };

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl text-stone-900">Vui lòng đăng nhập</h2>
        <p className="text-xs text-stone-500">Bạn cần đăng nhập tài khoản để quản lý hồ sơ và sổ địa chỉ.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 font-normal">
          Hồ Sơ & Sổ Địa Chỉ
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Cập nhật thông tin liên hệ và quản lý các địa chỉ nhận hàng của bạn
        </p>
      </div>

      {profileSavedMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Đã lưu cập nhật thông tin cá nhân thành công!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Personal Info Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-[#EADBCE] p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="font-serif text-lg text-stone-900 font-normal flex items-center gap-2">
                <User className="w-4 h-4 text-stone-600" />
                Thông Tin Cá Nhân
              </h2>
              {!isEditingProfile && (
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(true)}
                  className="text-xs text-amber-800 hover:text-amber-900 font-semibold"
                >
                  Chỉnh sửa
                </button>
              )}
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div>
                  <label className="block text-stone-600 mb-1">Họ và tên</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-stone-500"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-stone-500"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 mb-1">Email (Cố định)</label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full p-2.5 rounded-lg border border-stone-200 bg-stone-100 text-stone-500"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-lg bg-stone-900 text-white font-medium hover:bg-stone-800"
                  >
                    Lưu thay đổi
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="py-2 px-3 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-50"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-stone-400 block mb-0.5">Họ và tên:</span>
                  <p className="font-semibold text-stone-900 text-sm">{user.fullName}</p>
                </div>
                <div>
                  <span className="text-stone-400 block mb-0.5">Email tài khoản:</span>
                  <p className="font-semibold text-stone-900">{user.email}</p>
                </div>
                <div>
                  <span className="text-stone-400 block mb-0.5">Số điện thoại:</span>
                  <p className="font-semibold text-stone-900">{user.phone}</p>
                </div>
                <div>
                  <span className="text-stone-400 block mb-0.5">Loại tài khoản:</span>
                  <span className="inline-block px-2 py-0.5 rounded text-[11px] bg-stone-100 text-stone-800 font-medium">
                    Khách hàng thành viên
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Multiple Saved Shipping Addresses */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-[#EADBCE] p-6 shadow-2xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h2 className="font-serif text-xl text-stone-900 font-normal flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-stone-600" />
                  Sổ Địa Chỉ Giao Hàng
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Lưu nhiều địa chỉ để thuận tiện nhận quà hoặc gửi tặng người thân
                </p>
              </div>

              <button
                type="button"
                onClick={openNewAddressModal}
                className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-stone-900 text-stone-50 text-xs font-semibold hover:bg-stone-800 transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm địa chỉ mới
              </button>
            </div>

            {/* List of addresses */}
            <div className="space-y-3">
              {user.addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-4 rounded-xl border transition-all ${
                    addr.isDefault
                      ? 'border-amber-800 bg-[#FAF7F2] ring-1 ring-amber-800/40'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="font-semibold text-stone-900 text-sm">
                          {addr.fullName}
                        </strong>
                        <span className="text-stone-400">·</span>
                        <span className="text-stone-700">{addr.phone}</span>
                        {addr.isDefault && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-900">
                            Địa chỉ mặc định
                          </span>
                        )}
                      </div>
                      <p className="text-stone-600 leading-relaxed">
                        {addr.streetAddress}, {addr.ward}, {addr.district}, {addr.province}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                      {!addr.isDefault && (
                        <button
                          type="button"
                          onClick={() => setDefaultAddress(addr.id)}
                          className="text-[11px] text-stone-600 hover:text-stone-900 font-medium px-2 py-1 rounded hover:bg-stone-100"
                        >
                          Đặt làm mặc định
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => openEditAddressModal(addr)}
                        className="p-1.5 text-stone-500 hover:text-stone-900 rounded hover:bg-stone-100"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {user.addresses.length > 1 && (
                        <button
                          type="button"
                          onClick={() => deleteAddress(addr.id)}
                          className="p-1.5 text-stone-400 hover:text-red-600 rounded hover:bg-red-50"
                          title="Xóa địa chỉ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>

      {/* Address Modal (Add / Edit) */}
      {addressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-stone-200 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif text-xl text-stone-900 font-normal">
                {editingAddressId ? 'Chỉnh Sửa Địa Chỉ' : 'Thêm Địa Chỉ Giao Hàng'}
              </h3>
              <button
                type="button"
                onClick={() => setAddressModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 mb-1">Họ tên người nhận:</label>
                  <input
                    type="text"
                    required
                    value={addrName}
                    onChange={(e) => setAddrName(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-stone-500"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 mb-1">Số điện thoại:</label>
                  <input
                    type="text"
                    required
                    value={addrPhone}
                    onChange={(e) => setAddrPhone(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-stone-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-600 mb-1">Tỉnh / Thành phố:</label>
                  <input
                    type="text"
                    required
                    value={addrProvince}
                    onChange={(e) => setAddrProvince(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-stone-500"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 mb-1">Quận / Huyện:</label>
                  <input
                    type="text"
                    required
                    value={addrDistrict}
                    onChange={(e) => setAddrDistrict(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-stone-500"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 mb-1">Phường / Xã:</label>
                  <input
                    type="text"
                    required
                    value={addrWard}
                    onChange={(e) => setAddrWard(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-stone-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-600 mb-1">Địa chỉ chi tiết (Số nhà, đường phố):</label>
                <input
                  type="text"
                  required
                  value={addrStreet}
                  onChange={(e) => setAddrStreet(e.target.value)}
                  placeholder="Ví dụ: 123 Đường Nam Kỳ Khởi Nghĩa..."
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-stone-500"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addrIsDefault}
                    onChange={(e) => setAddrIsDefault(e.target.checked)}
                    className="accent-stone-900"
                  />
                  <span className="text-stone-700">Đặt làm địa chỉ nhận hàng mặc định</span>
                </label>
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddressModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-stone-900 text-white font-medium hover:bg-stone-800"
                >
                  Lưu địa chỉ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
