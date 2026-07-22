export interface Patient {
  id: string;
  name: string;
  phone: string;
  age: number | string;
  gender: 'Mume' | 'Mke' | string;
  residence: string;
  condition: string;
  cardNumber: string;
  registrationDate: string;
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  role: string;
  roleDisplay: string;
  bioId: string;
}

export interface SmsLog {
  id: string;
  recipient: string;
  phone: string;
  message: string;
  gateway: 'OASIS_SMS' | 'WHATSAPP_DIRECT';
  status: 'SENT' | 'FAILED' | 'DELIVERED';
  timestamp: string;
}
