import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface WatchlistEntry {
  id: string;
  firstName: string;
  lastName: string;
  alternativeFirstNames: string[];
  alternativeLastNames: string[];
  primaryEmail: string;
  primaryPhone: string;
  additionalEmails: string[];
  additionalPhones: string[];
  levelId: 'high-risk' | 'medium-risk' | 'low-risk';
  notes: string;
  reportedBy: string;
  lastUpdated: string;
  attachments: Array<{
    id: string;
    name: string;
    url: string;
    uploadedAt: string;
  }>;
}

export interface VisitorEntry {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'Checked in' | 'Upcoming' | 'No show' | 'Validated' | 'Canceled';
  date: string;
  arrival: string;
  departure: string;
  host: string;
  hostEmail: string;
  hostPhone: string;
  hostCompany: string;
  hostCompanyLocation: string;
  floor: string;
  watchlistMatch?: boolean;
  watchlistLevelId?: 'high-risk' | 'medium-risk' | 'low-risk';
  wasWatchlistFlagged?: boolean; // Track if visitor was ever flagged
  requiresApproval?: boolean;
  approvalStatus?: 'pending' | 'approved' | 'denied';
  approvedBy?: string;
  approvedAt?: string;
  deniedBy?: string;
  deniedAt?: string;
}

export interface WatchlistLevel {
  id: 'high-risk' | 'medium-risk' | 'low-risk';
  name: string;
  color: 'red' | 'yellow' | 'gray';
  sendEmailNotifications: boolean;
  notificationRecipients: string[];
  systemLogging: boolean;
  requiresManualApproval: boolean;
}

export interface NotificationRecipient {
  id: string;
  name: string;
  type: 'security' | 'member' | 'team';
}

export interface VisitorConfiguration {
  manualValidation: boolean;
  earlyCheckinMinutes: number;
  sendQRCode: boolean;
  watchlistLevels: WatchlistLevel[];
  notificationRecipients: NotificationRecipient[];
  emailTemplate: {
    bannerImage?: string;
    entryInstructions: string;
    buildingGuidelines: string;
  };
}

export interface SentEmail {
  id: string;
  visitorId: string;
  hostEmail: string;
  hostName: string;
  visitorName: string;
  action: 'approved' | 'denied' | 'security-action-required' | 'security-fyi';
  subject: string;
  body: string;
  sentAt: string;
}

interface WatchlistContextType {
  watchlistEntries: WatchlistEntry[];
  visitorEntries: VisitorEntry[];
  visitorConfiguration: VisitorConfiguration;
  pendingApprovalCount: number;
  sentEmails: SentEmail[];
  getWatchlistLevelById: (id: string) => WatchlistLevel | undefined;
  getWatchlistLevelName: (id: string) => string;
  getWatchlistLevelColor: (id: string) => string;
  addVisitor: (visitor: Omit<VisitorEntry, 'id'>) => VisitorEntry;
  addToWatchlist: (entry: Omit<WatchlistEntry, 'id' | 'lastUpdated'>) => WatchlistEntry;
  updateWatchlistEntry: (id: string, entry: Partial<WatchlistEntry>) => void;
  removeFromWatchlist: (id: string) => void;
  getVisitorById: (id: string) => VisitorEntry | undefined;
  getWatchlistEntryById: (id: string) => WatchlistEntry | undefined;
  searchVisitors: (query: string) => VisitorEntry[];
  searchWatchlist: (query: string) => WatchlistEntry[];
  updateVisitorWatchlistStatus: (id: string, isOnWatchlist: boolean, levelId?: string) => void;
  updateVisitorStatus: (id: string, status: VisitorEntry['status']) => void;
  updateVisitorConfiguration: (config: Partial<VisitorConfiguration>) => void;
  checkWatchlistMatch: (firstName: string, lastName: string) => WatchlistEntry | null;
  getMatchedFields: (visitorName: string, visitorEmail: string, watchlistEntry: WatchlistEntry) => string[];
  getWatchlistEntryForVisitor: (visitorId: string) => WatchlistEntry | null;
  getPendingApprovalVisitors: () => VisitorEntry[];
  approveVisitor: (visitorId: string, approvedBy: string) => void;
  denyVisitor: (visitorId: string, deniedBy: string) => void;
  getSentEmails: () => SentEmail[];
  clearSentEmails: () => void;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};

export const WatchlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [watchlistEntries, setWatchlistEntries] = useState<WatchlistEntry[]>([
    {
      id: '1',
      firstName: 'Marcus',
      lastName: 'Rodriguez',
      alternativeFirstNames: ['Mark', 'M.'],
      alternativeLastNames: ['Rodriguez', 'R.'],
      primaryEmail: 'marcus.rodriguez@techcorp.com',
      primaryPhone: '1.555.234.5678',
      additionalEmails: ['mark.rodriguez@gmail.com', 'm.rodriguez@outlook.com'],
      additionalPhones: ['1.555.987.6543'],
      levelId: 'high-risk',
      notes: 'Former employee terminated for security violations and unauthorized access to confidential client data. Attempted to access building after termination using expired credentials. Has made threatening statements toward management team. Physical description: 6\'2", brown hair, hazel eyes, distinctive scar on left cheek. Known to drive a black Honda Civic, license plate ABC-1234. Security should be notified immediately if spotted on premises.',
      reportedBy: 'Sarah Chen',
      lastUpdated: 'Jun 15, 2025',
      attachments: [
        {
          id: 'att1',
          name: 'marcus_rodriguez_id.jpeg',
          url: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
          uploadedAt: '4:12 PM Jun 15, 2025'
        },
        {
          id: 'att1b',
          name: 'marcus_rodriguez_security.jpeg',
          url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
          uploadedAt: '4:15 PM Jun 15, 2025'
        }
      ]
    },
    {
      id: '2',
      firstName: 'Jennifer',
      lastName: 'Thompson',
      alternativeFirstNames: ['Jen', 'Jenny', 'J.'],
      alternativeLastNames: ['Thompson'],
      primaryEmail: 'jennifer.thompson@contractor.com',
      primaryPhone: '1.555.345.6789',
      additionalEmails: ['jen.thompson@personal.com'],
      additionalPhones: [],
      levelId: 'high-risk',
      notes: 'Contractor who was involved in a verbal altercation with security staff and made inappropriate comments toward female employees. Refused to follow building safety protocols and became aggressive when asked to comply. Has been banned from all company premises. Known to work for multiple contracting companies in the area.',
      reportedBy: 'Michael Davis',
      lastUpdated: 'May 28, 2025',
      attachments: [
        {
          id: 'att2',
          name: 'jennifer_thompson_photo.jpeg',
          url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
          uploadedAt: '2:30 PM May 28, 2025'
        },
        {
          id: 'att2b',
          name: 'jennifer_thompson_incident.jpeg',
          url: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
          uploadedAt: '2:35 PM May 28, 2025'
        }
      ]
    },
    {
      id: '3',
      firstName: 'David',
      lastName: 'Kim',
      alternativeFirstNames: ['Dave', 'D.'],
      alternativeLastNames: ['Kim'],
      primaryEmail: 'david.kim@supplier.net',
      primaryPhone: '1.555.456.7890',
      additionalEmails: ['dave.kim@gmail.com'],
      additionalPhones: ['1.555.123.4567'],
      levelId: 'high-risk',
      notes: 'Vendor representative who attempted to gain unauthorized access to restricted areas during a routine delivery. Found taking photographs of sensitive equipment and floor layouts without permission. Investigation revealed potential corporate espionage activities. All future deliveries from this vendor must be supervised.',
      reportedBy: 'Lisa Wang',
      lastUpdated: 'Apr 22, 2025',
      attachments: [
        {
          id: 'att3',
          name: 'david_kim_security_footage.jpeg',
          url: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150',
          uploadedAt: '2:30 PM Apr 22, 2025'
        },
        {
          id: 'att3b',
          name: 'david_kim_badge.jpeg',
          url: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
          uploadedAt: '2:45 PM Apr 22, 2025'
        }
      ]
    },
    {
      id: '4',
      firstName: 'Amanda',
      lastName: 'Foster',
      alternativeFirstNames: ['Amy', 'A.', 'Mandy'],
      alternativeLastNames: ['Foster'],
      primaryEmail: 'amanda.foster@consulting.com',
      primaryPhone: '1.555.567.8901',
      additionalEmails: ['amy.foster@hotmail.com', 'a.foster@freelance.net'],
      additionalPhones: [],
      levelId: 'high-risk',
      notes: 'Former consultant who violated confidentiality agreements by sharing proprietary information with competitors. Attempted to access building systems after contract termination. Has been seen loitering in the building lobby on multiple occasions. Legal action is pending.',
      reportedBy: 'Robert Johnson',
      lastUpdated: 'Mar 18, 2025',
      attachments: [
        {
          id: 'att4',
          name: 'amanda_foster_profile.jpeg',
          url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
          uploadedAt: '3:20 PM Mar 18, 2025'
        }
      ]
    },
    {
      id: '5',
      firstName: 'Christopher',
      lastName: 'Martinez',
      alternativeFirstNames: ['Chris', 'C.', 'Christopher'],
      alternativeLastNames: ['Martinez', 'M.'],
      primaryEmail: 'christopher.martinez@delivery.com',
      primaryPhone: '1.555.678.9012',
      additionalEmails: [],
      additionalPhones: ['1.555.234.5678'],
      levelId: 'high-risk',
      notes: 'Delivery driver who became hostile when asked to provide identification and follow standard security procedures. Made threatening gestures toward reception staff and refused to leave when requested. Has been banned from making deliveries to this location.',
      reportedBy: 'Emily Rodriguez',
      lastUpdated: 'Feb 14, 2025',
      attachments: [
        {
          id: 'att5',
          name: 'christopher_martinez_id.jpeg',
          url: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
          uploadedAt: '1:15 PM Feb 14, 2025'
        },
        {
          id: 'att5b',
          name: 'christopher_martinez_vehicle.jpeg',
          url: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150',
          uploadedAt: '1:20 PM Feb 14, 2025'
        }
      ]
    },
    {
      id: '6',
      firstName: 'Rachel',
      lastName: 'Anderson',
      alternativeFirstNames: ['Rach', 'R.'],
      alternativeLastNames: ['Anderson'],
      primaryEmail: 'rachel.anderson@maintenance.com',
      primaryPhone: '1.555.789.0123',
      additionalEmails: ['rachel.a@personal.com'],
      additionalPhones: [],
      levelId: 'high-risk',
      notes: 'Maintenance worker who was found in unauthorized areas after hours and could not provide adequate explanation for presence. Security cameras showed suspicious behavior around IT equipment. Background check revealed discrepancies in employment history.',
      reportedBy: 'James Wilson',
      lastUpdated: 'Jan 25, 2025',
      attachments: [
        {
          id: 'att6',
          name: 'rachel_anderson_badge.jpeg',
          url: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150',
          uploadedAt: '6:45 PM Jan 25, 2025'
        },
        {
          id: 'att6b',
          name: 'rachel_anderson_equipment.jpeg',
          url: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=150',
          uploadedAt: '6:50 PM Jan 25, 2025'
        }
      ]
    },
    {
      id: '7',
      firstName: 'Brian',
      lastName: 'Taylor',
      alternativeFirstNames: ['B.', 'Brian'],
      alternativeLastNames: ['Taylor', 'T.'],
      primaryEmail: 'brian.taylor@visitor.com',
      primaryPhone: '1.555.890.1234',
      additionalEmails: [],
      additionalPhones: [],
      levelId: 'high-risk',
      notes: 'Visitor who became disruptive during a business meeting and had to be escorted from the premises by security. Made inappropriate comments and showed signs of intoxication. Host company has been notified and future visits are prohibited.',
      reportedBy: 'Nicole Brown',
      lastUpdated: 'May 10, 2025',
      attachments: [
        {
          id: 'att7',
          name: 'brian_taylor_incident.jpeg',
          url: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=150',
          uploadedAt: '4:30 PM May 10, 2025'
        }
      ]
    },
    {
      id: '8',
      firstName: 'Stephanie',
      lastName: 'Clark',
      alternativeFirstNames: ['Steph', 'S.', 'Stephanie'],
      alternativeLastNames: ['Clark', 'C.'],
      primaryEmail: 'stephanie.clark@temp.com',
      primaryPhone: '1.555.901.2345',
      additionalEmails: ['steph.clark@gmail.com'],
      additionalPhones: ['1.555.345.6789'],
      levelId: 'medium-risk',
      notes: 'Temporary employee who was terminated for theft of office supplies and equipment. Attempted to return to building multiple times after termination. Has been seen taking photographs of the building exterior and employee parking areas.',
      reportedBy: 'Kevin Lee',
      lastUpdated: 'Sep 10, 2025',
      attachments: []
    },
    {
      id: '9',
      firstName: 'Gregory',
      lastName: 'White',
      alternativeFirstNames: ['Greg', 'G.', 'Gregory'],
      alternativeLastNames: ['White', 'W.'],
      primaryEmail: 'gregory.white@contractor.net',
      primaryPhone: '1.555.012.3456',
      additionalEmails: [],
      additionalPhones: [],
      levelId: 'medium-risk',
      notes: 'Independent contractor who violated safety protocols and became argumentative with supervisory staff. Refused to wear required safety equipment and ignored building evacuation procedures during a drill. Contract has been terminated.',
      reportedBy: 'Patricia Garcia',
      lastUpdated: 'Aug 28, 2025',
      attachments: []
    },
    {
      id: '10',
      firstName: 'Michelle',
      lastName: 'Lewis',
      alternativeFirstNames: ['Mich', 'M.', 'Michelle'],
      alternativeLastNames: ['Lewis', 'L.'],
      primaryEmail: 'michelle.lewis@vendor.com',
      primaryPhone: '1.555.123.4567',
      additionalEmails: ['michelle.l@personal.net'],
      additionalPhones: [],
      levelId: 'medium-risk',
      notes: 'Vendor representative who attempted to bribe security personnel to gain access to restricted areas. Investigation revealed connections to competitors seeking proprietary information. All vendor relationships have been severed.',
      reportedBy: 'Daniel Martinez',
      lastUpdated: 'Aug 15, 2025',
      attachments: [
        {
          id: 'att4',
          name: 'michelle_lewis_incident.jpeg',
          url: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
          uploadedAt: '3:20 PM Aug 15, 2025'
        }
      ]
    },
    {
      id: '11',
      firstName: 'Thomas',
      lastName: 'Wilson',
      alternativeFirstNames: ['Tom', 'T.', 'Tommy'],
      alternativeLastNames: ['Wilson'],
      primaryEmail: 'thomas.wilson@service.com',
      primaryPhone: '1.555.234.5678',
      additionalEmails: [],
      additionalPhones: ['1.555.567.8901'],
      levelId: 'low-risk',
      notes: 'Service technician who was found accessing computer systems without authorization during a routine maintenance call. Attempted to install unauthorized software and copy sensitive files. Criminal charges are pending.',
      reportedBy: 'Angela Thompson',
      lastUpdated: 'Jul 30, 2025',
      attachments: []
    },
    {
      id: '12',
      firstName: 'Laura',
      lastName: 'Davis',
      alternativeFirstNames: ['L.', 'Laura'],
      alternativeLastNames: ['Davis', 'D.'],
      primaryEmail: 'laura.davis@freelance.com',
      primaryPhone: '1.555.345.6789',
      additionalEmails: ['laura.davis@consultant.net'],
      additionalPhones: [],
      levelId: 'low-risk',
      notes: 'Freelance consultant who violated building access policies and was found in secure areas without proper authorization. Refused to cooperate with security investigation and made false statements about her purpose for being in restricted zones.',
      reportedBy: 'Mark Johnson',
      lastUpdated: 'Jul 15, 2025',
      attachments: []
    }
  ]);

  const [visitorEntries, setVisitorEntries] = useState<VisitorEntry[]>([
    {
      id: '1',
      name: 'Marcus Rodriguez',
      email: 'marcus.rodriguez@techcorp.com',
      phone: '555-0123',
      status: 'Upcoming',
      date: 'June 17, 2025',
      arrival: '9:00 AM CDT',
      departure: '5:00 PM CDT',
      host: 'Sarah Chen',
      hostEmail: 'sarah.chen@techcorp.com',
      hostPhone: '555-0201 ex. 1001',
      hostCompany: 'TechCorp Industries',
      hostCompanyLocation: '1500 Technology Drive, 15 Fl, Austin, TX',
      floor: 'Floor 15',
      watchlistMatch: true,
      watchlistLevelId: 'high-risk',
    },
    {
      id: '2',
      name: 'Jennifer Thompson',
      email: 'jennifer.thompson@contractor.com',
      phone: '555-0124',
      status: 'Checked in',
      date: 'June 17, 2025',
      arrival: '9:00 AM CDT',
      departure: '5:00 PM CDT',
      host: 'Michael Davis',
      hostEmail: 'michael.davis@techcorp.com',
      hostPhone: '555-0202 ex. 2001',
      hostCompany: 'TechCorp Industries',
      hostCompanyLocation: '1500 Technology Drive, 15 Fl, Austin, TX',
      floor: 'Floor 15',
      watchlistMatch: true,
      watchlistLevelId: 'high-risk',
    },
    {
      id: '3',
      name: 'Dave Kim',
      email: 'dave.kim@supplier.net',
      phone: '555-0126',
      status: 'Upcoming',
      date: 'June 17, 2025',
      arrival: '9:30 AM CDT',
      departure: '5:00 PM CDT',
      host: 'Lisa Wang',
      hostEmail: 'lisa.wang@techcorp.com',
      hostPhone: '555-0203 ex. 3001',
      hostCompany: 'TechCorp Industries',
      hostCompanyLocation: '1500 Technology Drive, 15 Fl, Austin, TX',
      floor: 'Floor 15',
      watchlistMatch: true,
      watchlistLevelId: 'high-risk',
    },
    {
      id: '4',
      name: 'Amanda Foster',
      email: 'amanda.foster@consulting.com',
      phone: '555-0127',
      status: 'No show',
      date: 'June 17, 2025',
      arrival: '9:00 AM CDT',
      departure: '5:00 PM CDT',
      host: 'Robert Johnson',
      hostEmail: 'robert.johnson@techcorp.com',
      hostPhone: '555-0204 ex. 4001',
      hostCompany: 'TechCorp Industries',
      hostCompanyLocation: '1500 Technology Drive, 15 Fl, Austin, TX',
      floor: 'Floor 15',
      watchlistMatch: true,
      watchlistLevelId: 'high-risk'
    },
    {
      id: '5',
      name: 'Steph Clark',
      email: 'steph.clark@temp.com',
      phone: '555-0128',
      status: 'Upcoming',
      date: 'June 17, 2025',
      arrival: '9:00 AM CDT',
      departure: '5:00 PM CDT',
      host: 'Kevin Lee',
      hostEmail: 'kevin.lee@techcorp.com',
      hostPhone: '555-0205 ex. 5001',
      hostCompany: 'TechCorp Industries',
      hostCompanyLocation: '1500 Technology Drive, 15 Fl, Austin, TX',
      floor: 'Floor 15',
      watchlistMatch: true,
      watchlistLevelId: 'medium-risk'
    },
    {
      id: '6',
      name: 'Greg White',
      email: 'greg.white@contractor.net',
      phone: '555-0129',
      status: 'Upcoming',
      date: 'June 17, 2025',
      arrival: '9:30 AM CDT',
      departure: '5:00 PM CDT',
      host: 'Patricia Garcia',
      hostEmail: 'patricia.garcia@techcorp.com',
      hostPhone: '555-0206 ex. 6001',
      hostCompany: 'TechCorp Industries',
      hostCompanyLocation: '1500 Technology Drive, 15 Fl, Austin, TX',
      floor: 'Floor 15',
      watchlistMatch: true,
      watchlistLevelId: 'medium-risk'
    },
    {
      id: '7',
      name: 'Tom Wilson',
      email: 'tom.wilson@service.com',
      phone: '555-0130',
      status: 'Upcoming',
      date: 'June 17, 2025',
      arrival: '9:30 AM CDT',
      departure: '5:00 PM CDT',
      host: 'Angela Thompson',
      hostEmail: 'angela.thompson@techcorp.com',
      hostPhone: '555-0207 ex. 7001',
      hostCompany: 'TechCorp Industries',
      hostCompanyLocation: '1500 Technology Drive, 15 Fl, Austin, TX',
      floor: 'Floor 15',
      watchlistMatch: true,
      watchlistLevelId: 'low-risk'
    },
    {
      id: '8',
      name: 'Laura Davis',
      email: 'laura.davis@freelance.com',
      phone: '555-0131',
      status: 'Checked in',
      date: 'June 17, 2025',
      arrival: '8:30 AM CDT',
      departure: '4:00 PM CDT',
      host: 'Mark Johnson',
      hostEmail: 'mark.johnson@techcorp.com',
      hostPhone: '555-0208 ex. 8001',
      hostCompany: 'TechCorp Industries',
      hostCompanyLocation: '1500 Technology Drive, 15 Fl, Austin, TX',
      floor: 'Floor 15',
      watchlistMatch: true,
      watchlistLevelId: 'low-risk'
    },
    {
      id: '9',
      name: 'Benjamin Baker',
      email: 'benjamin.baker@company.com',
      phone: '555-0132',
      status: 'Validated',
      date: 'June 17, 2025',
      arrival: '10:00 AM CDT',
      departure: '3:00 PM CDT',
      host: 'Liz Tenant',
      hostEmail: 'liz.tenant@30eastmcdonald.com',
      hostPhone: '555-0209 ex. 9001',
      hostCompany: '30 East McDonald',
      hostCompanyLocation: '30 East McDonald Street, 11 Fl, Chicago, IL',
      floor: 'Floor 11',
      watchlistMatch: false,
      wasWatchlistFlagged: true
    },
    {
      id: '10',
      name: 'Isabella Adams',
      email: 'isabella.adams@company.com',
      phone: '555-0133',
      status: 'Upcoming',
      date: 'June 17, 2025',
      arrival: '2:00 PM CDT',
      departure: '6:00 PM CDT',
      host: 'Chelsea Chan',
      hostEmail: 'chelsea.chan@crownproperties.com',
      hostPhone: '555-0210 ex. 1001',
      hostCompany: 'Crown Properties',
      hostCompanyLocation: '200 East 41st Street, 24 Fl, New York, NY',
      floor: 'Floor 24',
      watchlistMatch: false
    },
    {
      id: '11',
      name: 'Debby Clark',
      email: 'debby.clark@company.com',
      phone: '555-0134',
      status: 'Canceled',
      date: 'June 17, 2025',
      arrival: '1:00 PM CDT',
      departure: '5:00 PM CDT',
      host: 'Liz Tenant',
      hostEmail: 'liz.tenant@30eastmcdonald.com',
      hostPhone: '555-0211 ex. 1101',
      hostCompany: '30 East McDonald',
      hostCompanyLocation: '30 East McDonald Street, 11 Fl, Chicago, IL',
      floor: 'Floor 11',
      watchlistMatch: false
    },
    {
      id: '12',
      name: 'Sophia Scott',
      email: 'sophia.scott@company.com',
      phone: '555-0135',
      status: 'Checked in',
      date: 'June 17, 2025',
      arrival: '9:15 AM CDT',
      departure: '4:30 PM CDT',
      host: 'Robert Chen',
      hostEmail: 'robert.chen@innovationlabs.com',
      hostPhone: '555-0212 ex. 1201',
      hostCompany: 'Innovation Labs',
      hostCompanyLocation: '2200 Innovation Way, 22 Fl, San Francisco, CA',
      floor: 'Floor 22',
      watchlistMatch: false
    }
  ]);

  const [sentEmails, setSentEmails] = useState<SentEmail[]>(() => {
    const stored = localStorage.getItem('sentEmails');
    return stored ? JSON.parse(stored) : [];
  });

  const [visitorConfiguration, setVisitorConfiguration] = useState<VisitorConfiguration>({
    manualValidation: true,
    earlyCheckinMinutes: 15,
    sendQRCode: true,
    watchlistLevels: [
      {
        id: 'high-risk',
        name: 'High risk',
        color: 'red',
        sendEmailNotifications: true,
        notificationRecipients: ['building-security', 'workplace-member'],
        systemLogging: true,
        requiresManualApproval: true
      },
      {
        id: 'medium-risk',
        name: 'Medium risk',
        color: 'yellow',
        sendEmailNotifications: true,
        notificationRecipients: ['building-security'],
        systemLogging: true,
        requiresManualApproval: false
      },
      {
        id: 'low-risk',
        name: 'Low risk',
        color: 'gray',
        sendEmailNotifications: false,
        notificationRecipients: [],
        systemLogging: true,
        requiresManualApproval: false
      }
    ],
    notificationRecipients: [
      { id: 'building-security', name: 'Building security', type: 'security' },
      { id: 'workplace-member', name: 'Workplace member', type: 'member' },
      { id: 'security-team-alpha', name: '{Security Team Alpha}', type: 'team' },
      { id: 'management-team', name: '{Management Team}', type: 'team' },
      { id: 'reception-staff', name: '{Reception Staff}', type: 'team' }
    ],
    emailTemplate: {
      entryInstructions: 'Entrance on King is under construction, use alternate entrance to the south.\nUse the Kiosk for quick check-in with security. Adding one more line to test.',
      buildingGuidelines: 'Do not share this pass with anyone.'
    }
  });

  const getWatchlistLevelById = (id: string): WatchlistLevel | undefined => {
    return visitorConfiguration.watchlistLevels.find(level => level.id === id);
  };

  const getWatchlistLevelName = (id: string): string => {
    const level = getWatchlistLevelById(id);
    return level ? level.name : id; // Fallback to ID if level not found
  };

  // Calculate pending approval count based on watchlist configuration
  const pendingApprovalCount = React.useMemo(() => {
    return visitorEntries.filter(visitor => {
      // Check if visitor has watchlist match and level
      if (!visitor.watchlistMatch && !visitor.watchlistLevelId) return false;
      
      // Get the watchlist level - either from visitor or by checking match
      let level;
      if (visitor.watchlistLevelId) {
        level = getWatchlistLevelById(visitor.watchlistLevelId);
      } else if (visitor.watchlistMatch) {
        // If visitor has watchlist match but no levelId, check the actual match
        const [firstName, ...lastNameParts] = visitor.name.split(' ');
        const lastName = lastNameParts.join(' ');
        const watchlistEntry = checkWatchlistMatch(firstName, lastName);
        if (watchlistEntry) {
          level = getWatchlistLevelById(watchlistEntry.levelId);
        }
      }
      
      const requiresApproval = level?.requiresManualApproval || false;
      
      // Check if visitor needs approval and is still pending
      return requiresApproval && 
             visitor.status === 'Upcoming' && 
             (!visitor.approvalStatus || visitor.approvalStatus === 'pending');
    }).length;
  }, [visitorEntries, visitorConfiguration.watchlistLevels]);

  const getWatchlistLevelColor = (id: string): string => {
    const level = getWatchlistLevelById(id);
    if (!level) return 'bg-gray-100 text-gray-800';
    
    switch (level.color) {
      case 'red':
        return 'bg-red-100 text-red-800';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800';
      case 'gray':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const addToWatchlist = (entry: Omit<WatchlistEntry, 'id' | 'lastUpdated'>) => {
    const newEntry: WatchlistEntry = {
      ...entry,
      id: Date.now().toString(),
      lastUpdated: new Date().toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
    };
    // Add to the beginning of the array to show at top
    setWatchlistEntries(prev => [newEntry, ...prev]);
    return newEntry;
  };

  const addVisitor = (visitor: Omit<VisitorEntry, 'id'>) => {
    const newVisitor: VisitorEntry = {
      ...visitor,
      id: Date.now().toString()
    };
    
    // Check if visitor requires approval
    if (newVisitor.watchlistMatch && newVisitor.watchlistLevelId) {
      const level = getWatchlistLevelById(newVisitor.watchlistLevelId);
      if (level?.requiresManualApproval) {
        newVisitor.requiresApproval = true;
        newVisitor.approvalStatus = 'pending';
      }
      
      // Send watchlist match notification if email notifications are enabled
      if (level?.sendEmailNotifications) {
        const [firstName, ...lastNameParts] = newVisitor.name.split(' ');
        const lastName = lastNameParts.join(' ');
        const watchlistEntry = checkWatchlistMatch(firstName, lastName);
        
        if (watchlistEntry) {
          sendWatchlistMatchNotification(newVisitor, level, watchlistEntry);
        }
      }
    }
    
    // Add to the beginning of the array to show at top
    setVisitorEntries(prev => [newVisitor, ...prev]);
    return newVisitor;
  };

  const updateWatchlistEntry = (id: string, updates: Partial<WatchlistEntry>) => {
    setWatchlistEntries(prev => 
      prev.map(entry => 
        entry.id === id 
          ? { 
              ...entry, 
              ...updates, 
              lastUpdated: new Date().toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })
            }
          : entry
      )
    );
  };

  const updateVisitorWatchlistStatus = (id: string, isOnWatchlist: boolean, levelId?: string) => {
    setVisitorEntries(prev => 
      prev.map(visitor => 
        visitor.id === id 
          ? { 
              ...visitor, 
              watchlistMatch: isOnWatchlist,
              watchlistLevelId: levelId as any
            }
          : visitor
      )
    );
  };

  const updateVisitorStatus = (id: string, status: VisitorEntry['status']) => {
    setVisitorEntries(prev => 
      prev.map(visitor => {
        if (visitor.id === id) {
          const updatedVisitor = { ...visitor, status };
          
          // If status is being changed to Validated, remove watchlist flag but remember it was flagged
          if (status === 'Validated' && visitor.watchlistMatch) {
            updatedVisitor.watchlistMatch = false;
            updatedVisitor.wasWatchlistFlagged = true;
          }
          
          return updatedVisitor;
        }
        return visitor;
      })
    );
  };

  const updateVisitorConfiguration = (config: Partial<VisitorConfiguration>) => {
    setVisitorConfiguration(prev => ({
      ...prev,
      ...config,
      watchlistLevels: config.watchlistLevels || prev.watchlistLevels,
      notificationRecipients: config.notificationRecipients || prev.notificationRecipients,
      emailTemplate: {
        ...prev.emailTemplate,
        ...config.emailTemplate
      }
    }));
  };

  const removeFromWatchlist = (id: string) => {
    setWatchlistEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const getVisitorById = (id: string) => {
    return visitorEntries.find(visitor => visitor.id === id);
  };

  const getWatchlistEntryById = (id: string) => {
    return watchlistEntries.find(entry => entry.id === id);
  };

  const searchVisitors = (query: string) => {
    if (!query.trim()) return visitorEntries;
    
    const lowercaseQuery = query.toLowerCase();
    return visitorEntries.filter(visitor => 
      visitor.name.toLowerCase().includes(lowercaseQuery) ||
      visitor.host.toLowerCase().includes(lowercaseQuery) ||
      visitor.hostCompany.toLowerCase().includes(lowercaseQuery)
    );
  };

  const searchWatchlist = (query: string) => {
    if (!query.trim()) return watchlistEntries;
    
    const lowercaseQuery = query.toLowerCase();
    return watchlistEntries.filter(entry => 
      `${entry.firstName} ${entry.lastName}`.toLowerCase().includes(lowercaseQuery) ||
      entry.primaryEmail.toLowerCase().includes(lowercaseQuery) ||
      entry.alternativeFirstNames.some(name => name.toLowerCase().includes(lowercaseQuery)) ||
      entry.alternativeLastNames.some(name => name.toLowerCase().includes(lowercaseQuery))
    );
  };

  const checkWatchlistMatch = (firstName: string, lastName: string): WatchlistEntry | null => {
    if (!firstName.trim() || !lastName.trim()) return null;
    
    const firstNameLower = firstName.trim().toLowerCase();
    const lastNameLower = lastName.trim().toLowerCase();
    
    return watchlistEntries.find(entry => {
      // Check primary first name and alternatives
      const firstNameMatch = entry.firstName.toLowerCase() === firstNameLower ||
        entry.alternativeFirstNames.some(alt => alt.toLowerCase() === firstNameLower);
      
      // Check primary last name and alternatives  
      const lastNameMatch = entry.lastName.toLowerCase() === lastNameLower ||
        entry.alternativeLastNames.some(alt => alt.toLowerCase() === lastNameLower);
      
      // Both first and last name must match
      return firstNameMatch && lastNameMatch;
    }) || null;
  };

  const getMatchedFields = (visitorName: string, visitorEmail: string, watchlistEntry: WatchlistEntry): string[] => {
    const matchedFields: string[] = [];
    const [visitorFirstName, ...visitorLastNameParts] = visitorName.split(' ');
    const visitorLastName = visitorLastNameParts.join(' ');
    
    // Check first name match
    if (watchlistEntry.firstName.toLowerCase() === visitorFirstName.toLowerCase() ||
        watchlistEntry.alternativeFirstNames.some(alt => alt.toLowerCase() === visitorFirstName.toLowerCase())) {
      matchedFields.push(`First Name (${visitorFirstName})`);
    }
    
    // Check last name match
    if (watchlistEntry.lastName.toLowerCase() === visitorLastName.toLowerCase() ||
        watchlistEntry.alternativeLastNames.some(alt => alt.toLowerCase() === visitorLastName.toLowerCase())) {
      matchedFields.push(`Last Name (${visitorLastName})`);
    }
    
    // Check email match
    if (watchlistEntry.primaryEmail.toLowerCase() === visitorEmail.toLowerCase() ||
        watchlistEntry.additionalEmails.some(email => email.toLowerCase() === visitorEmail.toLowerCase())) {
      matchedFields.push(`Email (${visitorEmail})`);
    }
    
    return matchedFields;
  };

  const getWatchlistEntryForVisitor = (visitorId: string): WatchlistEntry | null => {
    const visitor = getVisitorById(visitorId);
    if (!visitor || !visitor.watchlistMatch) return null;
    
    const [firstName, ...lastNameParts] = visitor.name.split(' ');
    const lastName = lastNameParts.join(' ');
    
    return checkWatchlistMatch(firstName, lastName);
  };

  // Email content generators for watchlist notifications
  const generateSecurityActionRequiredEmail = (visitor: VisitorEntry, watchlistEntry: WatchlistEntry, level: WatchlistLevel): { subject: string; body: string } => ({
    subject: `SECURITY ALERT - Watchlist Match Requires Approval`,
    body: `A visitor registration has matched an individual on the security watchlist and requires your immediate review.

VISITOR DETAILS:
Name: ${visitor.name}
Email: ${visitor.email}
Phone: ${visitor.phone}
Visit Date: ${visitor.date}
Time: ${visitor.arrival} - ${visitor.departure}
Host: ${visitor.host} - ${visitor.hostCompany}
Floor: ${visitor.floor}

WATCHLIST MATCH:
Risk Level: ${getWatchlistLevelName(level.id)}
Matched Fields: ${getMatchedFields(visitor.name, visitor.email, watchlistEntry).join(', ') || 'Name, Email'}
Notes: ${watchlistEntry.notes}

ACTION REQUIRED:
Please review this match and approve or deny entry through the security portal.

This visitor cannot proceed until security approval is granted.`
  });

  const generateSecurityFYIEmail = (visitor: VisitorEntry, watchlistEntry: WatchlistEntry, level: WatchlistLevel): { subject: string; body: string } => ({
    subject: `Security Alert - Watchlist Match Detected (FYI)`,
    body: `A visitor registration has matched an individual on the security watchlist. Per current security settings, this has been automatically processed.

VISITOR DETAILS:
Name: ${visitor.name}
Email: ${visitor.email}
Phone: ${visitor.phone}
Visit Date: ${visitor.date}
Time: ${visitor.arrival} - ${visitor.departure}
Host: ${visitor.host} - ${visitor.hostCompany}
Floor: ${visitor.floor}

WATCHLIST MATCH:
Risk Level: ${getWatchlistLevelName(level.id)}
Matched Fields: ${getMatchedFields(visitor.name, visitor.email, watchlistEntry).join(', ') || 'Name, Email'}
Notes: ${watchlistEntry.notes}

STATUS: Automatically processed per security configuration
No action required - for informational purposes only.`
  });

  const generateHostDecisionEmail = (visitor: VisitorEntry, action: 'approved' | 'denied'): { subject: string; body: string } => ({
    subject: action === 'approved' ? `Visitor Approved - ${visitor.name}` : `Visitor Access Denied - ${visitor.name}`,
    body: action === 'approved' 
      ? `Dear ${visitor.host},

Your visitor ${visitor.name} has been approved for entry after security review.

Visit Details:
• Date: ${visitor.date}
• Time: ${visitor.arrival} - ${visitor.departure}
• Floor: ${visitor.floor}
• Company: ${visitor.hostCompany}

The visitor can now proceed with their scheduled visit.

Best regards,
Building Security Team`
      : `Dear ${visitor.host},

Unfortunately, your visitor ${visitor.name} has been denied entry due to security concerns.

Visit Details:
• Date: ${visitor.date}
• Time: ${visitor.arrival} - ${visitor.departure}
• Visitor: ${visitor.name}

Please contact building security for more information if you have questions about this decision.

Best regards,
Building Security Team`
  });

  // Email content generators
  const generateApprovalEmailContent = (visitor: VisitorEntry): { subject: string; body: string } => ({
    subject: `Visitor Approved - ${visitor.name}`,
    body: `Dear ${visitor.host},

Your visitor ${visitor.name} has been approved for entry.

Visit Details:
• Date: ${visitor.date}
• Time: ${visitor.arrival} - ${visitor.departure}
• Floor: ${visitor.floor}
• Company: ${visitor.hostCompany}

The visitor can now proceed with their scheduled visit.

Best regards,
Building Security Team`
  });

  const generateDenialEmailContent = (visitor: VisitorEntry): { subject: string; body: string } => ({
    subject: `Visitor Access Denied - ${visitor.name}`,
    body: `Dear ${visitor.host},

Unfortunately, your visitor ${visitor.name} has been denied entry due to security concerns.

Visit Details:
• Date: ${visitor.date}
• Time: ${visitor.arrival} - ${visitor.departure}
• Visitor: ${visitor.name}

Please contact building security for more information if you have questions about this decision.

Best regards,
Building Security Team`
  });

  // Send watchlist match notification to security team
  const sendWatchlistMatchNotification = (visitor: VisitorEntry, level: WatchlistLevel, watchlistEntry: WatchlistEntry) => {
    const emailContent = level.requiresManualApproval
      ? generateSecurityActionRequiredEmail(visitor, watchlistEntry, level)
      : generateSecurityFYIEmail(visitor, watchlistEntry, level);
    
    // Get notification recipients
    const recipients = level.notificationRecipients.map(recipientId => {
      const recipient = visitorConfiguration.notificationRecipients.find(r => r.id === recipientId);
      return recipient ? recipient.name : recipientId;
    });
    
    // Create email record for each recipient (or combined)
    const email: SentEmail = {
      id: Date.now().toString(),
      visitorId: visitor.id,
      hostEmail: recipients.join(', '), // Show all recipients
      hostName: 'Security Team',
      visitorName: visitor.name,
      action: level.requiresManualApproval ? 'security-action-required' : 'security-fyi',
      subject: emailContent.subject,
      body: emailContent.body,
      sentAt: new Date().toISOString()
    };
    
    // Store email in localStorage for demo
    const updatedEmails = [...sentEmails, email];
    setSentEmails(updatedEmails);
    localStorage.setItem('sentEmails', JSON.stringify(updatedEmails));
    
    // Log for debugging
    console.log(`[WATCHLIST EMAIL SENT]`, {
      to: recipients,
      subject: emailContent.subject,
      body: emailContent.body
    });
  };

  // Send host decision notification email (simulated)
  const sendHostDecisionNotification = (visitor: VisitorEntry, action: 'approved' | 'denied') => {
    const emailContent = generateHostDecisionEmail(visitor, action);
    
    // Create email record
    const email: SentEmail = {
      id: Date.now().toString(),
      visitorId: visitor.id,
      hostEmail: visitor.hostEmail,
      hostName: visitor.host,
      visitorName: visitor.name,
      action,
      subject: emailContent.subject,
      body: emailContent.body,
      sentAt: new Date().toISOString()
    };
    
    // Store email in localStorage for demo
    const updatedEmails = [...sentEmails, email];
    setSentEmails(updatedEmails);
    localStorage.setItem('sentEmails', JSON.stringify(updatedEmails));
    
    // Log for debugging
    console.log(`[EMAIL SENT]`, {
      to: visitor.hostEmail,
      subject: emailContent.subject,
      body: emailContent.body
    });
  };

  const getPendingApprovalVisitors = (): VisitorEntry[] => {
    return visitorEntries.filter(visitor => {
      // Check if visitor has watchlist match
      if (!visitor.watchlistMatch && !visitor.watchlistLevelId) return false;
      
      // Get the watchlist level - either from visitor or by checking match
      let level;
      if (visitor.watchlistLevelId) {
        level = getWatchlistLevelById(visitor.watchlistLevelId);
      } else if (visitor.watchlistMatch) {
        // If visitor has watchlist match but no levelId, check the actual match
        const [firstName, ...lastNameParts] = visitor.name.split(' ');
        const lastName = lastNameParts.join(' ');
        const watchlistEntry = checkWatchlistMatch(firstName, lastName);
        if (watchlistEntry) {
          level = getWatchlistLevelById(watchlistEntry.levelId);
        }
      }
      
      const requiresApproval = level?.requiresManualApproval || false;
      
      // Check if visitor needs approval and is still pending
      return requiresApproval && 
             visitor.status === 'Upcoming' && 
             (!visitor.approvalStatus || visitor.approvalStatus === 'pending');
    });
  };

  const approveVisitor = (visitorId: string, approvedBy: string) => {
    setVisitorEntries(prev => 
      prev.map(visitor => {
        if (visitor.id === visitorId) {
          const updatedVisitor = {
            ...visitor,
            approvalStatus: 'approved' as const,
            approvedBy,
            approvedAt: new Date().toISOString(),
            watchlistMatch: false, // Remove watchlist flag after approval
            requiresApproval: false
          };
          
          // Send host decision notification if manual approval was required
          let level;
          if (visitor.watchlistLevelId) {
            level = getWatchlistLevelById(visitor.watchlistLevelId);
          } else if (visitor.watchlistMatch) {
            // Check the actual watchlist match
            const [firstName, ...lastNameParts] = visitor.name.split(' ');
            const lastName = lastNameParts.join(' ');
            const watchlistEntry = checkWatchlistMatch(firstName, lastName);
            if (watchlistEntry) {
              level = getWatchlistLevelById(watchlistEntry.levelId);
            }
          }
          
          if (level) {
            if (level?.requiresManualApproval) {
              sendHostDecisionNotification(updatedVisitor, 'approved');
            }
          }
          
          return updatedVisitor;
        }
        return visitor;
      })
    );
  };

  const denyVisitor = (visitorId: string, deniedBy: string) => {
    setVisitorEntries(prev => 
      prev.map(visitor => {
        if (visitor.id === visitorId) {
          const updatedVisitor = {
            ...visitor,
            status: 'Canceled' as const,
            approvalStatus: 'denied' as const,
            deniedBy,
            deniedAt: new Date().toISOString(),
            requiresApproval: false
          };
          
          // Send host decision notification if manual approval was required
          let level;
          if (visitor.watchlistLevelId) {
            level = getWatchlistLevelById(visitor.watchlistLevelId);
          } else if (visitor.watchlistMatch) {
            // Check the actual watchlist match
            const [firstName, ...lastNameParts] = visitor.name.split(' ');
            const lastName = lastNameParts.join(' ');
            const watchlistEntry = checkWatchlistMatch(firstName, lastName);
            if (watchlistEntry) {
              level = getWatchlistLevelById(watchlistEntry.levelId);
            }
          }
          
          if (level) {
            if (level?.requiresManualApproval) {
              sendHostDecisionNotification(updatedVisitor, 'denied');
            }
          }
          
          return updatedVisitor;
        }
        return visitor;
      })
    );
  };

  const getSentEmails = (): SentEmail[] => {
    return sentEmails.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  };

  const clearSentEmails = () => {
    setSentEmails([]);
    localStorage.removeItem('sentEmails');
  };

  return (
    <WatchlistContext.Provider value={{
      watchlistEntries,
      visitorEntries,
      visitorConfiguration,
      pendingApprovalCount,
      sentEmails,
      getWatchlistLevelById,
      getWatchlistLevelName,
      getWatchlistLevelColor,
      addVisitor,
      addToWatchlist,
      updateWatchlistEntry,
      removeFromWatchlist,
      getVisitorById,
      getWatchlistEntryById,
      searchVisitors,
      searchWatchlist,
      updateVisitorWatchlistStatus,
      updateVisitorStatus,
      updateVisitorConfiguration,
      checkWatchlistMatch,
      getMatchedFields,
      getWatchlistEntryForVisitor,
      getPendingApprovalVisitors,
      approveVisitor,
      denyVisitor,
      getSentEmails,
      clearSentEmails
    }}>
      {children}
    </WatchlistContext.Provider>
  );
};