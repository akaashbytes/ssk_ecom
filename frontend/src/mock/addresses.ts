import { CustomerAddress } from '../types';

export const MOCK_ADDRESSES: CustomerAddress[] = [
  {
    id: 'addr-default-1',
    fullName: 'Muthuraj K.',
    phone: '9840123456',
    pincode: '627811',
    addressLine1: 'Door 14/B, Sannathi Street',
    addressLine2: 'Near Sri Kasi Viswanathar Temple Arch',
    landmark: 'Opposite Government Library',
    city: 'Tenkasi',
    state: 'Tamil Nadu',
    isDefault: true,
    addressType: 'HOME',
  },
  {
    id: 'addr-secondary-2',
    fullName: 'Muthuraj K. (Office)',
    phone: '9840123456',
    pincode: '600040',
    addressLine1: 'Flat 302, Green Meadows Apartment',
    addressLine2: '2nd Avenue, Anna Nagar West',
    landmark: 'Behind Millennium Tower',
    city: 'Chennai',
    state: 'Tamil Nadu',
    isDefault: false,
    addressType: 'WORK',
  },
];
