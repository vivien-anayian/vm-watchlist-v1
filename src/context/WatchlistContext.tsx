import React, { createContext, useContext, useState, ReactNode } from 'react';

// Types
export interface WatchlistLevel {
  id: string;
  name: string;
  color: 'red' | 'yellow' | 'gray';
  sendEmailNotifications: boolean;
  notificationRecipients: string[];
  systemLogging: boolean;
  requiresManualApproval: boolean;
}

export interface WatchlistRule {
  id: string;
  parameter: 'firstName' | 'lastName' | 'email' | 'phone';
  type: 'exact' | 'contains' | 'partial';
  value?: string;
}

export interface WatchlistRuleGroup {
  id: string;
  name: string;
  rules: WatchlistRule[];
}

export interface WatchlistEntry {
  id: string;
  firstName: string;
  lastName: string;
  alternativeFirstNames: string[];
  alternativeLastNames: string[];
  primaryEmail: string;
  additionalEmails: string[];
  primaryPhone: string;
  additionalPhones: string[];
  levelId: string;
  notes: string;
  reportedBy: string;
  lastUpdated: string;
  attachments: Array<{
    id: string;
    name: string;
    url: string;
    uploadedAt: string;
  }>;
  aliases: string[];
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
  watchlistLevelId?: string;
  approvalStatus?: 'pending' | 'approved' | 'denied';
  approvedBy?: string;
  deniedBy?: string;
}

export interface MultiSelectOption {
  id: string;
  name: string;
  type: 'security' | 'member' | 'team';
}

export interface SentEmail {
  id: string;
  visitorName: string;
  hostName: string;
  hostEmail: string;
  subject: string;
  body: string;
  action: 'approved' | 'denied' | 'security-action-required' | 'security-fyi';
  sentAt: string;
}

export interface VisitorConfigurationType {
  manualValidation: boolean;
  earlyCheckinMinutes: number;
  sendQRCode: boolean;
  watchlistLevels: WatchlistLevel[];
  watchlistRules: WatchlistRuleGroup[];
  notificationRecipients: MultiSelectOption[];
  emailTemplate: {
    bannerImage?: string;
    entryInstructions: string;
    buildingGuidelines: string;
  };
}

interface WatchlistContextType {
  // State
  watchlistEntries: WatchlistEntry[];
  visitorEntries: VisitorEntry[];
  visitorConfiguration: VisitorConfigurationType;
  sentEmails: SentEmail[];
  pendingApprovalCount: number;
  
  // Watchlist functions
  searchWatchlist: (query: string) => WatchlistEntry[];
  addToWatchlist: (entry: any) => WatchlistEntry;
  updateWatchlistEntry: (id: string, updates: any) => void;
  removeFromWatchlist: (id: string) => void;
  getWatchlistEntryById: (id: string) => WatchlistEntry | undefined;
  getWatchlistLevelName: (levelId: string) => string;
  getWatchlistLevelColor: (levelId: string) => string;
  getWatchlistLevelById: (levelId: string) => WatchlistLevel | undefined;
  
  // Visitor functions
  searchVisitors: (query: string) => VisitorEntry[];
  addVisitor: (visitor: any) => VisitorEntry;
  updateVisitorStatus: (id: string, status: string) => void;
  getVisitorById: (id: string) => VisitorEntry | undefined;
  getPendingApprovalVisitors: () => VisitorEntry[];
  approveVisitor: (id: string, approvedBy: string) => void;
  denyVisitor: (id: string, deniedBy: string) => void;
  updateVisitorWatchlistStatus: (id: string, hasMatch: boolean, levelId?: string) => void;
  
  // Watchlist matching
  checkWatchlistMatch: (firstName: string, lastName: string) => WatchlistEntry | null;
  checkWatchlistMatchWithRules: (visitor: any) => WatchlistEntry | null;
  getWatchlistEntryForVisitor: (visitorId: string) => WatchlistEntry | null;
  getMatchedFields: (visitorName: string, visitorEmail: string, entry: WatchlistEntry) => string[];
  
  // Configuration
  updateVisitorConfiguration: (config: Partial<VisitorConfigurationType>) => void;
  
  // Email functions
  getSentEmails: () => SentEmail[];
  clearSentEmails: () => void;
  
  // Rule management
  addWatchlistRuleGroup: () => void;
  removeWatchlistRuleGroup: (groupId: string) => void;
  addRuleToGroup: (groupId: string) => void;
  removeRuleFromGroup: (groupId: string, ruleId: string) => void;
  updateRule: (groupId: string, ruleId: string, updates: Partial<WatchlistRule>) => void;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};

interface WatchlistProviderProps {
  children: ReactNode;
}

export const WatchlistProvider: React.FC<WatchlistProviderProps> = ({ children }) => {
  // Initial data
  const [watchlistEntries, setWatchlistEntries] = useState<WatchlistEntry[]>([
    {
      id: '1',
      firstName: 'Willy',
      lastName: 'Wonka',
      alternativeFirstNames: ['William'],
      alternativeLastNames: [],
      primaryEmail: 'willy.wonka@chocolate.com',
      additionalEmails: [],
      primaryPhone: '555-0123',
      additionalPhones: [],
      levelId: 'high-risk',
      notes: 'Known security risk. Previous incidents of unauthorized access attempts.',
      reportedBy: 'Security Steve',
      lastUpdated: 'Apr 9, 2024',
      attachments: [
        {
          id: 'att1',
          name: 'security-photo.jpg',
          url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
          uploadedAt: 'Apr 9, 2024 - 2:19 PM CDT'
        }
      ],
      aliases: ['William']
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      alternativeFirstNames: [],
      alternativeLastNames: ['Johnson'],
      primaryEmail: 'jane.smith@example.com',
      additionalEmails: ['j.smith@company.com'],
      primaryPhone: '555-0456',
      additionalPhones: [],
      levelId: 'high-risk',
      notes: 'Multiple harassment complaints filed. Do not allow entry without escort.',
      reportedBy: 'HR Department',
      lastUpdated: 'Mar 15, 2024',
      attachments: [],
      aliases: []
    }
    },
    {
      id: '3',
      firstName: 'Robert',
      lastName: 'Anderson',
      alternativeFirstNames: ['Bob', 'Bobby'],
      alternativeLastNames: [],
      primaryEmail: 'robert.anderson@suspicious.com',
      additionalEmails: ['bob.anderson@gmail.com'],
      primaryPhone: '555-0789',
      additionalPhones: ['555-0790'],
      levelId: 'high-risk',
      notes: 'Attempted to access restricted areas during previous visit. Security footage available.',
      reportedBy: 'Security Team',
      lastUpdated: 'May 2, 2024',
      attachments: [
        {
          id: 'att3',
          name: 'security-footage.jpg',
          url: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
          uploadedAt: 'May 2, 2024 - 3:45 PM CDT'
        }
      ],
      aliases: ['Bob', 'Bobby']
    },
    {
      id: '4',
      firstName: 'Maria',
      lastName: 'Garcia',
      alternativeFirstNames: [],
      alternativeLastNames: ['Rodriguez'],
      primaryEmail: 'maria.garcia@company.com',
      additionalEmails: [],
      primaryPhone: '555-0234',
      additionalPhones: [],
      levelId: 'medium-priority',
      notes: 'Former employee terminated for policy violations. Monitor closely.',
      reportedBy: 'HR Manager',
      lastUpdated: 'Apr 20, 2024',
      attachments: [],
      aliases: []
    },
    {
      id: '5',
      firstName: 'David',
      lastName: 'Thompson',
      alternativeFirstNames: ['Dave'],
      alternativeLastNames: [],
      primaryEmail: 'david.thompson@external.com',
      additionalEmails: [],
      primaryPhone: '555-0345',
      additionalPhones: [],
      levelId: 'medium-priority',
      notes: 'Aggressive behavior reported during meetings. Requires escort.',
      reportedBy: 'Office Manager',
      lastUpdated: 'Mar 28, 2024',
      attachments: [],
      aliases: ['Dave']
    },
    {
      id: '6',
      firstName: 'Sarah',
      lastName: 'Wilson',
      alternativeFirstNames: [],
      alternativeLastNames: ['Williams'],
      primaryEmail: 'sarah.wilson@contractor.com',
      additionalEmails: ['s.wilson@personal.com'],
      primaryPhone: '555-0567',
      additionalPhones: [],
      levelId: 'low-priority',
      notes: 'Minor incident with badge access. Monitor for compliance.',
      reportedBy: 'Facilities Team',
      lastUpdated: 'May 10, 2024',
      attachments: [],
      aliases: []
    },
    {
      id: '7',
      firstName: 'Michael',
      lastName: 'Brown',
      alternativeFirstNames: ['Mike', 'Mickey'],
      alternativeLastNames: [],
      primaryEmail: 'michael.brown@vendor.com',
      additionalEmails: [],
      primaryPhone: '555-0678',
      additionalPhones: [],
      levelId: 'high-risk',
      notes: 'Attempted to photograph sensitive areas. Security concern.',
      reportedBy: 'Security Steve',
      lastUpdated: 'Apr 15, 2024',
      attachments: [
        {
          id: 'att7',
          name: 'incident-report.jpg',
          url: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
          uploadedAt: 'Apr 15, 2024 - 1:30 PM CDT'
        }
      ],
      aliases: ['Mike', 'Mickey']
    },
    {
      id: '8',
      firstName: 'Lisa',
      lastName: 'Davis',
      alternativeFirstNames: [],
      alternativeLastNames: [],
      primaryEmail: 'lisa.davis@client.com',
      additionalEmails: [],
      primaryPhone: '555-0789',
      additionalPhones: [],
      levelId: 'medium-priority',
      notes: 'Verbal altercation with staff. Requires supervision.',
      reportedBy: 'Reception Team',
      lastUpdated: 'May 5, 2024',
      attachments: [],
      aliases: []
    },
    {
      id: '9',
      firstName: 'James',
      lastName: 'Miller',
      alternativeFirstNames: ['Jim', 'Jimmy'],
      alternativeLastNames: [],
      primaryEmail: 'james.miller@partner.com',
      additionalEmails: ['jim.miller@gmail.com'],
      primaryPhone: '555-0890',
      additionalPhones: [],
      levelId: 'low-priority',
      notes: 'Late arrivals and extended stays beyond scheduled time.',
      reportedBy: 'Front Desk',
      lastUpdated: 'May 8, 2024',
      attachments: [],
      aliases: ['Jim', 'Jimmy']
    },
    {
      id: '10',
      firstName: 'Jennifer',
      lastName: 'Taylor',
      alternativeFirstNames: ['Jen', 'Jenny'],
      alternativeLastNames: [],
      primaryEmail: 'jennifer.taylor@consultant.com',
      additionalEmails: [],
      primaryPhone: '555-0901',
      additionalPhones: [],
      levelId: 'high-risk',
      notes: 'Attempted to access server room without authorization.',
      reportedBy: 'IT Security',
      lastUpdated: 'Apr 25, 2024',
      attachments: [],
      aliases: ['Jen', 'Jenny']
    },
    {
      id: '11',
      firstName: 'Christopher',
      lastName: 'Moore',
      alternativeFirstNames: ['Chris'],
      alternativeLastNames: [],
      primaryEmail: 'christopher.moore@vendor.com',
      additionalEmails: [],
      primaryPhone: '555-1012',
      additionalPhones: [],
      levelId: 'medium-priority',
      notes: 'Inappropriate comments to female staff members.',
      reportedBy: 'HR Department',
      lastUpdated: 'May 1, 2024',
      attachments: [],
      aliases: ['Chris']
    },
    {
      id: '12',
      firstName: 'Amanda',
      lastName: 'Jackson',
      alternativeFirstNames: [],
      alternativeLastNames: ['Johnson'],
      primaryEmail: 'amanda.jackson@external.com',
      additionalEmails: [],
      primaryPhone: '555-1123',
      additionalPhones: [],
      levelId: 'low-priority',
      notes: 'Frequent visitor with minor policy infractions.',
      reportedBy: 'Security Team',
      lastUpdated: 'May 12, 2024',
      attachments: [],
      aliases: []
    },
    {
      id: '13',
      firstName: 'Daniel',
      lastName: 'White',
      alternativeFirstNames: ['Dan', 'Danny'],
      alternativeLastNames: [],
      primaryEmail: 'daniel.white@contractor.com',
      additionalEmails: ['dan.white@personal.com'],
      primaryPhone: '555-1234',
      additionalPhones: [],
      levelId: 'high-risk',
      notes: 'Caught attempting to install unauthorized software on company computers.',
      reportedBy: 'IT Security',
      lastUpdated: 'Apr 30, 2024',
      attachments: [
        {
          id: 'att13',
          name: 'security-alert.jpg',
          url: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
          uploadedAt: 'Apr 30, 2024 - 4:15 PM CDT'
        }
      ],
      aliases: ['Dan', 'Danny']
    },
    {
      id: '14',
      firstName: 'Michelle',
      lastName: 'Lee',
      alternativeFirstNames: [],
      alternativeLastNames: [],
      primaryEmail: 'michelle.lee@client.com',
      additionalEmails: [],
      primaryPhone: '555-1345',
      additionalPhones: [],
      levelId: 'medium-priority',
      notes: 'Disruptive behavior during meetings. Monitor interactions.',
      reportedBy: 'Meeting Coordinator',
      lastUpdated: 'May 6, 2024',
      attachments: [],
      aliases: []
    },
    {
      id: '15',
      firstName: 'Kevin',
      lastName: 'Clark',
      alternativeFirstNames: [],
      alternativeLastNames: [],
      primaryEmail: 'kevin.clark@partner.com',
      additionalEmails: [],
      primaryPhone: '555-1456',
      additionalPhones: [],
      levelId: 'low-priority',
      notes: 'Occasional tardiness and dress code violations.',
      reportedBy: 'Office Manager',
      lastUpdated: 'May 11, 2024',
      attachments: [],
      aliases: []
    }
  ]);

  const [visitorEntries, setVisitorEntries] = useState<VisitorEntry[]>([
    {
      id: '1',
      name: 'Marcus Rodriguez',
      email: 'marcus.rodriguez@techcorp.com',
      phone: '555-0101',
      status: 'Checked in',
      date: '2024-06-17',
      arrival: '9:00 AM EST',
      departure: '5:00 PM EST',
      host: 'Alex Smith',
      hostEmail: 'alex.smith@company.com',
      hostPhone: '555-0200',
      hostCompany: 'TechCorp Industries',
      hostCompanyLocation: '1500 Technology Drive, 15th Floor, Austin, TX',
      floor: 'Floor 15',
      watchlistMatch: false
    },
    {
      id: '2',
      name: 'Willy Wonka',
      email: 'willy.wonka@chocolate.com',
      phone: '555-0123',
      status: 'Upcoming',
      date: '2024-06-17',
      arrival: '10:00 AM EST',
      departure: '2:00 PM EST',
      host: 'Sarah Johnson',
      hostEmail: 'sarah.johnson@company.com',
      hostPhone: '555-0300',
      hostCompany: 'Design Studio',
      hostCompanyLocation: '1500 Technology Drive, 12th Floor, Austin, TX',
      floor: 'Floor 12',
      watchlistMatch: true,
      watchlistLevelId: 'high-risk',
      approvalStatus: 'pending'
    }
    },
    {
      id: '3',
      name: 'Emily Chen',
      email: 'emily.chen@consulting.com',
      phone: '555-0234',
      status: 'Validated',
      date: '2024-06-17',
      arrival: '8:30 AM EST',
      departure: '12:00 PM EST',
      host: 'Michael Davis',
      hostEmail: 'michael.davis@company.com',
      hostPhone: '555-0400',
      hostCompany: 'Global Consulting',
      hostCompanyLocation: '1500 Technology Drive, 8th Floor, Austin, TX',
      floor: 'Floor 8',
      watchlistMatch: false
    },
    {
      id: '4',
      name: 'Robert Anderson',
      email: 'robert.anderson@suspicious.com',
      phone: '555-0789',
      status: 'Upcoming',
      date: '2024-06-17',
      arrival: '2:00 PM EST',
      departure: '4:00 PM EST',
      host: 'Lisa Thompson',
      hostEmail: 'lisa.thompson@company.com',
      hostPhone: '555-0500',
      hostCompany: 'Security Consulting',
      hostCompanyLocation: '1500 Technology Drive, 5th Floor, Austin, TX',
      floor: 'Floor 5',
      watchlis
    }
  ]
  )
}tMatch: true,
      watchlistLevelId: 'high-risk',
      approvalStatus: 'pending'
    },
    {
      id: '5',
      name: 'Jessica Williams',
      email: 'jessica.williams@marketing.com',
      phone: '555-0345',
      status: 'Checked in',
      date: '2024-06-17',
      arrival: '9:30 AM EST',
      departure: '3:30 PM EST',
      host: 'David Brown',
      hostEmail: 'david.brown@company.com',
      hostPhone: '555-0600',
      hostCompany: 'Marketing Solutions',
      hostCompanyLocation: '1500 Technology Drive, 10th Floor, Austin, TX',
      floor: 'Floor 10',
      watchlistMatch: false
    },
    {
      id: '6',
      name: 'Thomas Wilson',
      email: 'thomas.wilson@legal.com',
      phone: '555-0456',
      status: 'No show',
      date: '2024-06-17',
      arrival: '11:00 AM EST',
      departure: '1:00 PM EST',
      host: 'Jennifer Lee',
      hostEmail: 'jennifer.lee@company.com',
      hostPhone: '555-0700',
      hostCompany: 'Legal Associates',
      hostCompanyLocation: '1500 Technology Drive, 20th Floor, Austin, TX',
      floor: 'Floor 20',
      watchlistMatch: false
    },
    {
      id: '7',
      name: 'Maria Garcia',
      email: 'maria.garcia@company.com',
      phone: '555-0234',
      status: 'Canceled',
      date: '2024-06-17',
      arrival: '1:00 PM EST',
      departure: '5:00 PM EST',
      host: 'Robert Kim',
      hostEmail: 'robert.kim@company.com',
      hostPhone: '555-0800',
      hostCompany: 'Tech Innovations',
      hostCompanyLocation: '1500 Technology Drive, 18th Floor, Austin, TX',
      floor: 'Floor 18',
      watchlistMatch: true,
      watchlistLevelId: 'medium-priority'
    },
    {
      id: '8',
      name: 'Andrew Taylor',
      email: 'andrew.taylor@finance.com',
      phone: '555-0567',
      status: 'Upcoming',
      date: '2024-06-18',
      arrival: '9:00 AM EST',
      departure: '11:00 AM EST',
      host: 'Amanda White',
      hostEmail: 'amanda.white@company.com',
      hostPhone: '555-0900',
      hostCompany: 'Financial Services',
      hostCompanyLocation: '1500 Technology Drive, 22nd Floor, Austin, TX',
      floor: 'Floor 22',
      watchlistMatch: false
    },
    {
      id: '9',
      name: 'Rachel Martinez',
      email: 'rachel.martinez@design.com',
      phone: '555-0678',
      status: 'Validated',
      date: '2024-06-18',
      arrival: '10:30 AM EST',
      departure: '2:30 PM EST',
      host: 'Kevin Johnson',
      hostEmail: 'kevin.johnson@company.com',
      hostPhone: '555-1000',
      hostCompany: 'Creative Design',
      hostCompanyLocation: '1500 Technology Drive, 7th Floor, Austin, TX',
      floor: 'Floor 7',
      watchlistMatch: false
    },
    {
      id: '10',
      name: 'Christopher Moore',
      email: 'christopher.moore@vendor.com',
      phone: '555-1012',
      status: 'Upcoming',
      date: '2024-06-18',
      arrival: '3:00 PM EST',
      departure: '5:00 PM EST',
      host: 'Michelle Clark',
      hostEmail: 'michelle.clark@company.com',
      hostPhone: '555-1100',
      hostCompany: 'Vendor Solutions',
      hostCompanyLocation: '1500 Technology Drive, 14th Floor, Austin, TX',
      floor: 'Floor 14',
      watchlistMatch: true,
      watchlistLevelId: 'medium-priority',
      approvalStatus: 'pending'
    },
    {
      id: '11',
      name: 'Stephanie Davis',
      email: 'stephanie.davis@client.com',
      phone: '555-0789',
      status: 'Checked in',
      date: '2024-06-18',
      arrival: '8:00 AM EST',
      departure: '12:00 PM EST',
      host: 'Daniel Rodriguez',
      hostEmail: 'daniel.rodriguez@company.com',
      hostPhone: '555-1200',
      hostCompany: 'Client Services',
      hostCompanyLocation: '1500 Technology Drive, 16th Floor, Austin, TX',
      floor: 'Floor 16',
      watchlistMatch: false
    },
    {
      id: '12',
      name: 'Brian Thompson',
      email: 'brian.thompson@contractor.com',
      phone: '555-0890',
      status: 'Upcoming',
      date: '2024-06-19',
      arrival: '9:15 AM EST',
      departure: '4:15 PM EST',
      host: 'Laura Wilson',
      hostEmail: 'laura.wilson@company.com',
      hostPhone: '555-1300',
      hostCompany: 'Construction Corp',
      hostCompanyLocation: '1500 Technology Drive, 3rd Floor, Austin, TX',
      floor: 'Floor 3',
      watchlistMatch: false
    },
    {
      id: '13',
      name: 'Daniel White',
      email: 'daniel.white@contractor.com',
      phone: '555-1234',
      status: 'Upcoming',
      date: '2024-06-19',
      arrival: '11:00 AM EST',
      departure: '3:00 PM EST',
      host: 'Sarah Miller',
      hostEmail: 'sarah.miller@company.com',
      hostPhone: '555-1400',
      hostCompany: 'IT Solutions',
      hostCompanyLocation: '1500 Technology Drive, 25th Floor, Austin, TX',
      floor: 'Floor 25',
      watchlistMatch: true,
      watchlistLevelId: 'high-risk',
      approvalStatus: 'pending'
    },
    {
      id: '14',
      name: 'Nicole Brown',
      email: 'nicole.brown@partner.com',
      phone: '555-0901',
      status: 'Validated',
      date: '2024-06-19',
      arrival: '2:00 PM EST',
      departure: '6:00 PM EST',
      host: 'James Anderson',
      hostEmail: 'james.anderson@company.com',
      hostPhone: '555-1500',
      hostCompany: 'Business Partners',
      hostCompanyLocation: '1500 Technology Drive, 11th Floor, Austin, TX',
      floor: 'Floor 11',
      watchlistMatch: false
    },
    {
      id: '15',
      name: 'Gregory Jackson',
      email: 'gregory.jackson@external.com',
      phone: '555-1123',
      status: 'No show',
      date: '2024-06-16',
      arrival: '10:00 AM EST',
      departure: '2:00 PM EST',
      host: 'Patricia Taylor',
      hostEmail: 'patricia.taylor@company.com',
      hostPhone: '555-1600',
      hostCompany: 'External Consulting',
      hostCompanyLocation: '1500 Technology Drive, 13th Floor, Austin, TX',
      floor: 'Floor 13',
      watchlistMatch: false
    }
  ]);

  const [sentEmails, setSentEmails] = useState<SentEmail[]>([]);

  const [visitorConfiguration, setVisitorConfiguration] = useState<VisitorConfigurationType>({
    manualValidation: false,
    earlyCheckinMinutes: 15,
    sendQRCode: true,
    watchlistLevels: [
      {
        id: 'high-risk',
        name: 'High risk',
        color: 'red',
        sendEmailNotifications: true,
        notificationRecipients: ['security-team', 'management'],
        systemLogging: true,
        requiresManualApproval: true
      },
      {
        id: 'medium-priority',
        name: 'Medium priority',
        color: 'yellow',
        sendEmailNotifications: true,
        notificationRecipients: ['security-team'],
        systemLogging: true,
        requiresManualApproval: false
      },
      {
        id: 'low-priority',
        name: 'Low priority',
        color: 'gray',
        sendEmailNotifications: false,
        notificationRecipients: [],
        systemLogging: true,
        requiresManualApproval: false
      }
    ],
    watchlistRules: [
      {
        id: 'default-group',
        name: 'Default Group',
        rules: [
          {
            id: 'rule-1',
            parameter: 'firstName',
            type: 'partial'
          },
          {
            id: 'rule-2',
            parameter: 'lastName',
            type: 'exact'
          }
        ]
      }
    ],
    notificationRecipients: [
      { id: 'security-team', name: 'Security Team', type: 'security' },
      { id: 'management', name: 'Management', type: 'team' },
      { id: 'front-desk', name: 'Front Desk', type: 'member' }
    ],
    emailTemplate: {
      entryInstructions: 'Please check in at the front desk and present a valid ID.',
      buildingGuidelines: 'All visitors must be escorted at all times. No photography allowed.'
    }
  });

  // Computed values
  const pendingApprovalCount = visitorEntries.filter(v => 
    v.watchlistMatch && v.approvalStatus === 'pending'
  ).length;

  // Watchlist functions
  const searchWatchlist = (query: string): WatchlistEntry[] => {
    if (!query.trim()) return watchlistEntries;
    
    const lowercaseQuery = query.toLowerCase();
    return watchlistEntries.filter(entry =>
      entry.firstName.toLowerCase().includes(lowercaseQuery) ||
      entry.lastName.toLowerCase().includes(lowercaseQuery) ||
      entry.primaryEmail.toLowerCase().includes(lowercaseQuery) ||
      entry.notes.toLowerCase().includes(lowercaseQuery)
    );
  };

  const addToWatchlist = (entry: any): WatchlistEntry => {
    const newEntry: WatchlistEntry = {
      id: Date.now().toString(),
      firstName: entry.firstName,
      lastName: entry.lastName,
      alternativeFirstNames: entry.alternativeFirstNames || [],
      alternativeLastNames: entry.alternativeLastNames || [],
      primaryEmail: entry.primaryEmail,
      additionalEmails: entry.additionalEmails || [],
      primaryPhone: entry.primaryPhone,
      additionalPhones: entry.additionalPhones || [],
      levelId: entry.levelId,
      notes: entry.notes,
      reportedBy: entry.reportedBy,
      lastUpdated: new Date().toLocaleDateString(),
      attachments: entry.attachments || [],
      aliases: [...(entry.alternativeFirstNames || []), ...(entry.alternativeLastNames || [])]
    };
    
    setWatchlistEntries(prev => [...prev, newEntry]);
    return newEntry;
  };

  const updateWatchlistEntry = (id: string, updates: any) => {
    setWatchlistEntries(prev => 
      prev.map(entry => entry.id === id ? { ...entry, ...updates } : entry)
    );
  };

  const removeFromWatchlist = (id: string) => {
    setWatchlistEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const getWatchlistEntryById = (id: string): WatchlistEntry | undefined => {
    return watchlistEntries.find(entry => entry.id === id);
  };

  const getWatchlistLevelName = (levelId: string): string => {
    const level = visitorConfiguration.watchlistLevels.find(l => l.id === levelId);
    return level ? level.name : 'Unknown';
  };

  const getWatchlistLevelColor = (levelId: string): string => {
    const level = visitorConfiguration.watchlistLevels.find(l => l.id === levelId);
    if (!level) return 'bg-gray-100 text-gray-800';
    
    switch (level.color) {
      case 'red':
        return 'bg-red-100 text-red-800';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getWatchlistLevelById = (levelId: string): WatchlistLevel | undefined => {
    return visitorConfiguration.watchlistLevels.find(l => l.id === levelId);
  };

  // Visitor functions
  const searchVisitors = (query: string): VisitorEntry[] => {
    if (!query.trim()) return visitorEntries;
    
    const lowercaseQuery = query.toLowerCase();
    return visitorEntries.filter(visitor =>
      visitor.name.toLowerCase().includes(lowercaseQuery) ||
      visitor.email.toLowerCase().includes(lowercaseQuery) ||
      visitor.host.toLowerCase().includes(lowercaseQuery) ||
      visitor.hostCompany.toLowerCase().includes(lowercaseQuery)
    );
  };

  const addVisitor = (visitor: any): VisitorEntry => {
    const newVisitor: VisitorEntry = {
      id: Date.now().toString(),
      ...visitor
    };
    
    setVisitorEntries(prev => [...prev, newVisitor]);
    return newVisitor;
  };

  const updateVisitorStatus = (id: string, status: string) => {
    setVisitorEntries(prev =>
      prev.map(visitor => visitor.id === id ? { ...visitor, status: status as any } : visitor)
    );
  };

  const getVisitorById = (id: string): VisitorEntry | undefined => {
    return visitorEntries.find(visitor => visitor.id === id);
  };

  const getPendingApprovalVisitors = (): VisitorEntry[] => {
    return visitorEntries.filter(v => v.watchlistMatch && v.approvalStatus === 'pending');
  };

  const approveVisitor = (id: string, approvedBy: string) => {
    setVisitorEntries(prev =>
      prev.map(visitor =>
        visitor.id === id
          ? { ...visitor, approvalStatus: 'approved' as const, approvedBy, status: 'Validated' }
          : visitor
      )
    );

    // Send email notification
    const visitor = getVisitorById(id);
    if (visitor) {
      const email: SentEmail = {
        id: Date.now().toString(),
        visitorName: visitor.name,
        hostName: visitor.host,
        hostEmail: visitor.hostEmail,
        subject: `Visitor Approved: ${visitor.name}`,
        body: `Dear ${visitor.host},\n\nYour visitor ${visitor.name} has been approved for entry. They may now proceed with their scheduled visit.\n\nBest regards,\nSecurity Team`,
        action: 'approved',
        sentAt: new Date().toISOString()
      };
      setSentEmails(prev => [...prev, email]);
    }
  };

  const denyVisitor = (id: string, deniedBy: string) => {
    setVisitorEntries(prev =>
      prev.map(visitor =>
        visitor.id === id
          ? { ...visitor, approvalStatus: 'denied' as const, deniedBy, status: 'Canceled' }
          : visitor
      )
    );

    // Send email notification
    const visitor = getVisitorById(id);
    if (visitor) {
      const email: SentEmail = {
        id: Date.now().toString(),
        visitorName: visitor.name,
        hostName: visitor.host,
        hostEmail: visitor.hostEmail,
        subject: `Visitor Denied: ${visitor.name}`,
        body: `Dear ${visitor.host},\n\nYour visitor ${visitor.name} has been denied entry due to security concerns. Please contact security for more information.\n\nBest regards,\nSecurity Team`,
        action: 'denied',
        sentAt: new Date().toISOString()
      };
      setSentEmails(prev => [...prev, email]);
    }
  };

  const updateVisitorWatchlistStatus = (id: string, hasMatch: boolean, levelId?: string) => {
    setVisitorEntries(prev =>
      prev.map(visitor =>
        visitor.id === id
          ? { ...visitor, watchlistMatch: hasMatch, watchlistLevelId: levelId }
          : visitor
      )
    );
  };

  // Watchlist matching functions
  const checkWatchlistMatch = (firstName: string, lastName: string): WatchlistEntry | null => {
    return watchlistEntries.find(entry => 
      entry.firstName.toLowerCase() === firstName.toLowerCase() &&
      entry.lastName.toLowerCase() === lastName.toLowerCase()
    ) || null;
  };

  const checkWatchlistMatchWithRules = (visitor: any): WatchlistEntry | null => {
    // Simple implementation - check by name
    const [firstName, ...lastNameParts] = visitor.name?.split(' ') || [];
    const lastName = lastNameParts.join(' ');
    
    return checkWatchlistMatch(firstName || '', lastName || '');
  };

  const getWatchlistEntryForVisitor = (visitorId: string): WatchlistEntry | null => {
    const visitor = getVisitorById(visitorId);
    if (!visitor || !visitor.watchlistMatch) return null;
    
    return checkWatchlistMatchWithRules(visitor);
  };

  const getMatchedFields = (visitorName: string, visitorEmail: string, entry: WatchlistEntry): string[] => {
    const fields: string[] = [];
    
    const [firstName, ...lastNameParts] = visitorName.split(' ');
    const lastName = lastNameParts.join(' ');
    
    if (entry.firstName.toLowerCase() === firstName?.toLowerCase()) {
      fields.push('firstName');
    }
    if (entry.lastName.toLowerCase() === lastName?.toLowerCase()) {
      fields.push('lastName');
    }
    if (entry.primaryEmail.toLowerCase() === visitorEmail?.toLowerCase()) {
      fields.push('email');
    }
    
    return fields;
  };

  // Configuration functions
  const updateVisitorConfiguration = (config: Partial<VisitorConfigurationType>) => {
    setVisitorConfiguration(prev => ({ ...prev, ...config }));
  };

  // Email functions
  const getSentEmails = (): SentEmail[] => {
    return sentEmails;
  };

  const clearSentEmails = () => {
    setSentEmails([]);
  };

  // Rule management functions
  const addWatchlistRuleGroup = () => {
    const newGroup: WatchlistRuleGroup = {
      id: `group-${Date.now()}`,
      name: `Rule Group ${visitorConfiguration.watchlistRules.length + 1}`,
      rules: []
    };
    
    setVisitorConfiguration(prev => ({
      ...prev,
      watchlistRules: [...prev.watchlistRules, newGroup]
    }));
  };

  const removeWatchlistRuleGroup = (groupId: string) => {
    if (groupId === 'default-group') return;
    
    setVisitorConfiguration(prev => ({
      ...prev,
      watchlistRules: prev.watchlistRules.filter(group => group.id !== groupId)
    }));
  };

  const addRuleToGroup = (groupId: string) => {
    const newRule: WatchlistRule = {
      id: `rule-${Date.now()}`,
      parameter: 'firstName',
      type: 'exact'
    };
    
    setVisitorConfiguration(prev => ({
      ...prev,
      watchlistRules: prev.watchlistRules.map(group =>
        group.id === groupId
          ? { ...group, rules: [...group.rules, newRule] }
          : group
      )
    }));
  };

  const removeRuleFromGroup = (groupId: string, ruleId: string) => {
    setVisitorConfiguration(prev => ({
      ...prev,
      watchlistRules: prev.watchlistRules.map(group =>
        group.id === groupId
          ? { ...group, rules: group.rules.filter(rule => rule.id !== ruleId) }
          : group
      )
    }));
  };

  const updateRule = (groupId: string, ruleId: string, updates: Partial<WatchlistRule>) => {
    setVisitorConfiguration(prev => ({
      ...prev,
      watchlistRules: prev.watchlistRules.map(group =>
        group.id === groupId
          ? {
              ...group,
              rules: group.rules.map(rule =>
                rule.id === ruleId ? { ...rule, ...updates } : rule
              )
            }
          : group
      )
    }));
  };

  const value: WatchlistContextType = {
    // State
    watchlistEntries,
    visitorEntries,
    visitorConfiguration,
    sentEmails,
    pendingApprovalCount,
    
    // Watchlist functions
    searchWatchlist,
    addToWatchlist,
    updateWatchlistEntry,
    removeFromWatchlist,
    getWatchlistEntryById,
    getWatchlistLevelName,
    getWatchlistLevelColor,
    getWatchlistLevelById,
    
    // Visitor functions
    searchVisitors,
    addVisitor,
    updateVisitorStatus,
    getVisitorById,
    getPendingApprovalVisitors,
    approveVisitor,
    denyVisitor,
    updateVisitorWatchlistStatus,
    
    // Watchlist matching
    checkWatchlistMatch,
    checkWatchlistMatchWithRules,
    getWatchlistEntryForVisitor,
    getMatchedFields,
    
    // Configuration
    updateVisitorConfiguration,
    
    // Email functions
    getSentEmails,
    clearSentEmails,
    
    // Rule management
    addWatchlistRuleGroup,
    removeWatchlistRuleGroup,
    addRuleToGroup,
    removeRuleFromGroup,
    updateRule
  };

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
};