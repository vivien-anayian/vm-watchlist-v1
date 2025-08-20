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
  level: 'High risk' | 'Medium priority' | 'Low priority';
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
  hostCompany: string;
  floor: string;
  watchlistMatch?: boolean;
  watchlistLevel?: string;
  wasWatchlistFlagged?: boolean; // Track if visitor was ever flagged
}

export interface VisitorConfiguration {
  manualValidation: boolean;
  earlyCheckinMinutes: number;
  sendQRCode: boolean;
  emailTemplate: {
    bannerImage?: string;
    entryInstructions: string;
    buildingGuidelines: string;
  };
}

interface WatchlistContextType {
  watchlistEntries: WatchlistEntry[];
  visitorEntries: VisitorEntry[];
  visitorConfiguration: VisitorConfiguration;
  addVisitor: (visitor: Omit<VisitorEntry, 'id'>) => VisitorEntry;
  addToWatchlist: (entry: Omit<WatchlistEntry, 'id' | 'lastUpdated'>) => WatchlistEntry;
  updateWatchlistEntry: (id: string, entry: Partial<WatchlistEntry>) => void;
  removeFromWatchlist: (id: string) => void;
  getVisitorById: (id: string) => VisitorEntry | undefined;
  getWatchlistEntryById: (id: string) => WatchlistEntry | undefined;
  searchVisitors: (query: string) => VisitorEntry[];
  searchWatchlist: (query: string) => WatchlistEntry[];
  updateVisitorWatchlistStatus: (id: string, isOnWatchlist: boolean, level?: string) => void;
  updateVisitorStatus: (id: string, status: VisitorEntry['status']) => void;
  updateVisitorConfiguration: (config: Partial<VisitorConfiguration>) => void;
  checkWatchlistMatch: (firstName: string, lastName: string) => WatchlistEntry | null;
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
      level: 'High risk',
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
      level: 'High risk',
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
      level: 'High risk',
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
      level: 'High risk',
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
      level: 'High risk',
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
      level: 'High risk',
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
      level: 'High risk',
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
      level: 'High risk',
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
      level: 'High risk',
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
      level: 'High risk',
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
      level: 'High risk',
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
      level: 'High risk',
      notes: 'Freelance consultant who violated building access policies and was found in secure areas without proper authorization. Refused to cooperate with security investigation and made false statements about her purpose for being in restricted zones.',
      reportedBy: 'Mark Johnson',
      lastUpdated: 'Jul 15, 2025',
      attachments: []
    }
  ]);

  const [visitorEntries, setVisitorEntries] = useState<VisitorEntry[]>([
    {
      id: '1',
      name: 'Benjamin Baker',
      email: 'benjamin.baker@company.com',
      phone: '555-0123',
      status: 'Upcoming',
      date: 'June 17, 2025',
      arrival: '9:00 AM CDT',
      departure: '5:00 PM CDT',
      host: 'Liz Tenant',
      hostCompany: '30 East McDonald',
      floor: 'Floor 11',
      watchlistMatch: true,
      watchlistLevel: 'High risk'
    },
    {
      id: '2',
      name: 'Isabella Adams',
      email: 'isabella.adams@company.com',
      phone: '555-0124',
      status: 'Checked in',
      date: 'June 17, 2025',
      arrival: '9:00 AM CDT',
      departure: '5:00 PM CDT',
      host: 'Liz Tenant',
      hostCompany: '30 East McDonald',
      floor: 'Floor 11, Floor 12',
      watchlistMatch: true,
      watchlistLevel: 'Medium risk'
    },
    {
      id: '3',
      name: 'Debby Clark',
      email: 'debby.clark@company.com',
      phone: '555-0126',
      status: 'Upcoming',
      date: 'June 17, 2025',
      arrival: '9:30 AM CDT',
      departure: '5:00 PM CDT',
      host: 'Liz Tenant',
      hostCompany: '30 East McDonald',
      floor: 'Floor 11',
      watchlistMatch: false
    },
    {
      id: '4',
      name: 'Sophia Scott',
      email: 'sophia.scott@company.com',
      phone: '555-0127',
      status: 'No show',
      date: 'June 17, 2025',
      arrival: '9:00 AM CDT',
      departure: '5:00 PM CDT',
      host: 'Chelsea Chan',
      hostCompany: 'Crown Properties',
      floor: 'Floor 24',
      watchlistMatch: true,
      watchlistLevel: 'Low risk'
    },
    {
      id: '5',
      name: 'Joshua Lewis',
      email: 'joshua.lewis@company.com',
      phone: '555-0128',
      status: 'Upcoming',
      date: 'June 17, 2025',
      arrival: '9:00 AM CDT',
      departure: '5:00 PM CDT',
      host: 'Chelsea Chan',
      hostCompany: 'Crown Properties',
      floor: 'Floor 24',
      watchlistMatch: true,
      watchlistLevel: 'VIP'
    },
    {
      id: '6',
      name: 'Anna Clark',
      email: 'anna.clark@company.com',
      phone: '555-0129',
      status: 'Upcoming',
      date: 'June 17, 2025',
      arrival: '9:30 AM CDT',
      departure: '5:00 PM CDT',
      host: 'Liz Tenant',
      hostCompany: '30 East McDonald',
      floor: 'Floor 11',
      watchlistMatch: false
    },
    {
      id: '7',
      name: 'James Black',
      email: 'james.black@company.com',
      phone: '555-0130',
      status: 'Upcoming',
      date: 'June 17, 2025',
      arrival: '9:30 AM CDT',
      departure: '5:00 PM CDT',
      host: 'Liz Tenant',
      hostCompany: '30 East McDonald',
      floor: 'Floor 11',
      watchlistMatch: true,
      watchlistLevel: 'High risk'
    },
    {
      id: '8',
      name: 'Emma Fox',
      email: 'emma.fox@company.com',
      phone: '555-0131',
      status: 'Checked in',
      date: 'June 17, 2025',
      arrival: '8:30 AM CDT',
      departure: '4:00 PM CDT',
      host: 'Michael Davis',
      hostCompany: 'TechCorp Industries',
      floor: 'Floor 15',
      watchlistMatch: false
    },
    {
      id: '9',
      name: 'Oliver Martinez',
      email: 'oliver.martinez@company.com',
      phone: '555-0132',
      status: 'Validated',
      date: 'June 17, 2025',
      arrival: '10:00 AM CDT',
      departure: '3:00 PM CDT',
      host: 'Sarah Johnson',
      hostCompany: 'Global Enterprises',
      floor: 'Floor 8',
      watchlistMatch: false,
      wasWatchlistFlagged: true
    },
    {
      id: '10',
      name: 'Maya Patel',
      email: 'maya.patel@company.com',
      phone: '555-0133',
      status: 'Upcoming',
      date: 'June 17, 2025',
      arrival: '2:00 PM CDT',
      departure: '6:00 PM CDT',
      host: 'Robert Chen',
      hostCompany: 'Innovation Labs',
      floor: 'Floor 22',
      watchlistMatch: true,
      watchlistLevel: 'Medium risk'
    },
    {
      id: '11',
      name: 'Alex Thompson',
      email: 'alex.thompson@company.com',
      phone: '555-0134',
      status: 'Canceled',
      date: 'June 17, 2025',
      arrival: '1:00 PM CDT',
      departure: '5:00 PM CDT',
      host: 'Lisa Wang',
      hostCompany: 'Design Studio',
      floor: 'Floor 5',
      watchlistMatch: false
    },
    {
      id: '12',
      name: 'Ryan Foster',
      email: 'ryan.foster@company.com',
      phone: '555-0135',
      status: 'Checked in',
      date: 'June 17, 2025',
      arrival: '9:15 AM CDT',
      departure: '4:30 PM CDT',
      host: 'Amanda Rodriguez',
      hostCompany: 'Marketing Plus',
      floor: 'Floor 18',
      watchlistMatch: true,
      watchlistLevel: 'High risk'
    }
  ]);

  const [visitorConfiguration, setVisitorConfiguration] = useState<VisitorConfiguration>({
    manualValidation: true,
    earlyCheckinMinutes: 15,
    sendQRCode: true,
    emailTemplate: {
      entryInstructions: 'Entrance on King is under construction, use alternate entrance to the south.\nUse the Kiosk for quick check-in with security. Adding one more line to test.',
      buildingGuidelines: 'Do not share this pass with anyone.'
    }
  });

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

  const updateVisitorWatchlistStatus = (id: string, isOnWatchlist: boolean, level?: string) => {
    setVisitorEntries(prev => 
      prev.map(visitor => 
        visitor.id === id 
          ? { 
              ...visitor, 
              watchlistMatch: isOnWatchlist,
              watchlistLevel: level
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

  return (
    <WatchlistContext.Provider value={{
      watchlistEntries,
      visitorEntries,
      visitorConfiguration,
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
      checkWatchlistMatch
    }}>
      {children}
    </WatchlistContext.Provider>
  );
};