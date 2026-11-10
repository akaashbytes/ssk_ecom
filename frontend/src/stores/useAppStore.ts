import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, CustomerAddress, GuestCustomerDetails, PaymentPreference } from '../types';
import { MOCK_ADDRESSES } from '../mock';

interface AppState {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  addresses: CustomerAddress[];
  selectedAddressId: string | null;
  addAddress: (address: Omit<CustomerAddress, 'id'>) => void;
  setSelectedAddressId: (id: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  // Guest checkout state
  guestCustomerDetails: GuestCustomerDetails | null;
  setGuestCustomerDetails: (details: GuestCustomerDetails | null) => void;
  paymentPreference: PaymentPreference;
  setPaymentPreference: (pref: PaymentPreference) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      // Guest by default (no mandatory login)
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),
      addresses: [...MOCK_ADDRESSES],
      selectedAddressId: MOCK_ADDRESSES[0]?.id || null,
      addAddress: (newAddr) => {
        const id = `addr-${Date.now()}`;
        const created: CustomerAddress = { ...newAddr, id };
        const updated = newAddr.isDefault
          ? [created, ...get().addresses.map((a) => ({ ...a, isDefault: false }))]
          : [...get().addresses, created];
        set({ addresses: updated, selectedAddressId: id });
      },
      setSelectedAddressId: (id) => set({ selectedAddressId: id }),
      isSearchOpen: false,
      setIsSearchOpen: (open) => set({ isSearchOpen: open }),
      // Guest state defaults
      guestCustomerDetails: null,
      setGuestCustomerDetails: (details) => set({ guestCustomerDetails: details }),
      paymentPreference: 'UPI',
      setPaymentPreference: (paymentPreference) => set({ paymentPreference }),
    }),
    {
      name: 'ssk_app_storage',
    }
  )
);
