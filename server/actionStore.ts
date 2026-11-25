import { ActionItem } from '../src/types';

// Seeded realistic action items grounded in NovaTech reviews
const INITIAL_ACTIONS: ActionItem[] = [
  {
    id: 'act-101',
    title: 'Audit NovaBook Ultra 16 Trackpad & Hinge Torque',
    description: 'Multiple customers report mechanical pre-travel wobble on the glass trackpad and excessive resistance on the display hinge causing cracking after 2-3 weeks.',
    affectedProduct: 'NovaBook Ultra 16',
    supportingEvidence: [
      '"Hinge cracked after two weeks and the trackpad has an awful rattle." - David Reynolds',
      '"Trackpad has severe pre-travel wobble before clicking." - Tom Higgins',
    ],
    suggestedAction: 'Deploy updated assembly tolerances at the manufacturing facility and issue warranty service advisory for affected batches.',
    department: 'Quality Assurance',
    priority: 'High',
    status: 'In Progress',
    createdAt: '2026-10-24T10:00:00Z',
    updatedAt: '2026-10-28T14:30:00Z',
  },
  {
    id: 'act-102',
    title: 'Revamp Tier-1 Customer Support & RMA Response Times',
    description: 'Negative reviews cite a 5-6 day delay in customer service replies regarding warranty claims and boilerplate rejection responses.',
    affectedProduct: 'NovaTech AudioPro ANC Headphones',
    supportingEvidence: [
      '"Customer support took 6 days to reply with a template refusing warranty coverage." - David Reynolds',
      '"Software driver freezes repeatedly and support took 5 days to respond." - Clara Oswald',
    ],
    suggestedAction: 'Implement automated RMA ticket triage, set a 24-hour SLA guarantee for hardware warranty claims, and retrain support tier 1.',
    department: 'Customer Support',
    priority: 'High',
    status: 'Open',
    createdAt: '2026-10-25T11:15:00Z',
    updatedAt: '2026-10-25T11:15:00Z',
  },
  {
    id: 'act-103',
    title: 'Deploy Firmware v2.1 Adaptive GPS Polling for NovaPulse Smartwatch',
    description: 'High-accuracy GNSS/GPS tracking causes excessive battery drain during sustained outdoor trail running sessions.',
    affectedProduct: 'NovaPulse Smartwatch v2',
    supportingEvidence: [
      '"GPS tracking drains battery from 100% to dead in under 4 hours on trail runs." - Kevin Chen',
      '"Battery lasts 4 days normally but drops rapidly whenever outdoor sports tracking is on." - Priya Sharma',
    ],
    suggestedAction: 'Roll out firmware patch with dynamic satellite polling that scales back refresh rate during steady velocity.',
    department: 'Engineering',
    priority: 'Medium',
    status: 'In Progress',
    createdAt: '2026-10-26T09:00:00Z',
    updatedAt: '2026-10-29T16:00:00Z',
  },
  {
    id: 'act-104',
    title: 'Review NovaCharge Duo 100W Thermal Dissipation Profile',
    description: 'Users report the GaN adapter gets noticeably hot to the touch during concurrent dual-port 65W+35W charging draws.',
    affectedProduct: 'NovaCharge Duo 100W',
    supportingEvidence: [
      '"Charging speeds are rapid, but adapter gets uncomfortably hot to touch during sustained dual draws." - Alex Morneau',
      '"Very small and charges fast, warms up during simultaneous laptop charging." - Chloe Zhao',
    ],
    suggestedAction: 'Evaluate silicone thermal potting compound density for the upcoming hardware revision and include clear thermal safety guidelines in the box.',
    department: 'Product Design',
    priority: 'Low',
    status: 'Open',
    createdAt: '2026-10-27T13:45:00Z',
    updatedAt: '2026-10-27T13:45:00Z',
  },
  {
    id: 'act-105',
    title: 'Fix NovaCam 4K Stream USB Hub Driver Lockups',
    description: 'Software driver hangs when connected via unpowered USB 3.0 passive hubs on Windows 11 machines.',
    affectedProduct: 'NovaCam 4K Stream',
    supportingEvidence: [
      '"Software driver freezes repeatedly on Windows 11 until computer reboot." - Clara Oswald',
      '"Camera disconnects randomly on USB-C hub." - Liam Vance',
    ],
    suggestedAction: 'Release Windows 11 signed UVC patch addressing USB power handshake timeouts.',
    department: 'Engineering',
    priority: 'High',
    status: 'Resolved',
    createdAt: '2026-10-20T08:30:00Z',
    updatedAt: '2026-10-31T17:00:00Z',
  },
];

class ActionStore {
  private actions: ActionItem[] = [...INITIAL_ACTIONS];

  getAll(): ActionItem[] {
    return [...this.actions];
  }

  getById(id: string): ActionItem | undefined {
    return this.actions.find((a) => a.id === id);
  }

  add(action: Omit<ActionItem, 'id' | 'createdAt' | 'updatedAt'>): ActionItem {
    const newItem: ActionItem = {
      ...action,
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.actions.unshift(newItem);
    return newItem;
  }

  update(id: string, updates: Partial<ActionItem>): ActionItem | null {
    const index = this.actions.findIndex((a) => a.id === id);
    if (index === -1) return null;
    this.actions[index] = {
      ...this.actions[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return this.actions[index];
  }

  delete(id: string): boolean {
    const initialLen = this.actions.length;
    this.actions = this.actions.filter((a) => a.id !== id);
    return this.actions.length < initialLen;
  }

  reset(): ActionItem[] {
    this.actions = [...INITIAL_ACTIONS];
    return [...this.actions];
  }
}

export const actionStore = new ActionStore();
