/**
 * Emergency Assistance & University Contacts (Phase 5)
 */

export interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  displayPhone: string;
  availableHours: string;
  category: 'security' | 'medical' | 'helpline';
  location?: string;
  description: string;
}

export const VERIFIED_EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: 'lpu-security-main',
    name: 'LPU Security Main Control Room',
    role: 'Central Campus Security & Patrol',
    phone: '+911824517000',
    displayPhone: '01824-517000',
    availableHours: '24/7 round-the-clock',
    category: 'security',
    location: 'Main Gate 1 Security Complex',
    description: 'Immediate on-campus security assistance, incident response, and gate control.'
  },
  {
    id: 'lpu-hospital-emergency',
    name: 'UniHospital 24/7 Emergency Wing',
    role: 'On-Campus Hospital & Trauma Care',
    phone: '+911824517100',
    displayPhone: '01824-517100',
    availableHours: '24/7 round-the-clock',
    category: 'medical',
    location: 'UniHospital & Health Clinic (Near UniMall)',
    description: 'Emergency doctors, trauma care, ambulance dispatch, and inpatient medical assistance.'
  },
  {
    id: 'lpu-ambulance-dispatch',
    name: 'Campus Rapid Ambulance Dispatch',
    role: 'Emergency Medical Transport',
    phone: '+911824517101',
    displayPhone: '01824-517101',
    availableHours: '24/7 round-the-clock',
    category: 'medical',
    location: 'UniHospital Fleet Bay',
    description: 'On-campus motorized ambulance for immediate hostel and academic block pickup.'
  },
  {
    id: 'lpu-women-helpline',
    name: 'Campus Women Safety Helpline',
    role: 'Proctorial Safety & Support Cell',
    phone: '+911824517002',
    displayPhone: '01824-517002',
    availableHours: '24/7 round-the-clock',
    category: 'helpline',
    location: 'Division of Student Welfare (Block 30)',
    description: 'Confidential safety support, residential escort assistance, and emergency response for women.'
  },
  {
    id: 'lpu-proctor-office',
    name: 'Chief Proctor Office',
    role: 'Campus Discipline & Safety',
    phone: '+911824517005',
    displayPhone: '01824-517005',
    availableHours: '08:00 AM - 08:00 PM',
    category: 'security',
    location: 'Block 30, Ground Floor',
    description: 'Student safety oversight, residential dispute resolution, and campus protocol.'
  }
];
