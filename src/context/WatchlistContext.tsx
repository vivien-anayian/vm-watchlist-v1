import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
export interface WatchlistEntry {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  reason: string;
  dateAdded: string;
  addedBy: string;
  status: 'active' | 'inactive';
  notes?: string;
}

export interface VisitorEntry {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  purpose: string;
  host: string;
  hostEmail: string;
  hostPhone: string;
  hostCompany: string;
  checkInTime: string;
  checkOutTime?: string;
  status: 'checked-in' | 'checked-out' | 'pending-approval' | 'approved' | 'denied';
  watchlistMatch?: boolean;
  matchedEntries?: string[];
  approvedBy?: string;
  approvalTime?: string;
  deniedBy?: string;
  denialTime?: string;
  denialReason?: string;
}

export interface WatchlistRule {
  id: string;
  field: 'firstName' | 'lastName' | 'email' | 'phone';
  operator: 'exact' | 'contains' | 'partial';
  value?: string;
}

export interface WatchlistRuleGroup {
  id: string;
  name: string;
  rules: WatchlistRule[];
  logic: 'AND' | 'OR';
}

interface WatchlistContextType {
  // Watchlist state
  watchlistEntries: WatchlistEntry[];
  setWatchlistEntries: React.Dispatch<React.SetStateAction<WatchlistEntry[]>>;
  
  // Visitor state
  visitorEntries: VisitorEntry[];
  setVisitorEntries: React.Dispatch<React.SetStateAction<VisitorEntry[]>>;
  
  // Rules state
  watchlistRules: WatchlistRuleGroup[];
  setWatchlistRules: React.Dispatch<React.SetStateAction<WatchlistRuleGroup[]>>;
  
  // Configuration state
  hasChanges: boolean;
  setHasChanges: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Watchlist functions
  addWatchlistEntry: (entry: Omit<WatchlistEntry, 'id' | 'dateAdded'>) => void;
  updateWatchlistEntry: (id: string, updates: Partial<WatchlistEntry>) => void;
  deleteWatchlistEntry: (id: string) => void;
  searchWatchlist: (query: string) => WatchlistEntry[];
  
  // Visitor functions
  addVisitor: (visitor: Omit<VisitorEntry, 'id' | 'checkInTime' | 'status'>) => void;
  updateVisitor: (id: string, updates: Partial<VisitorEntry>) => void;
  searchVisitors: (query: string) => VisitorEntry[];
  approveVisitor: (id: string, approvedBy: string) => void;
  denyVisitor: (id: string, deniedBy: string, reason: string) => void;
  checkOutVisitor: (id: string) => void;
  
  // Rules functions
  updateWatchlistRules: (rules: WatchlistRuleGroup[]) => void;
  checkWatchlistMatch: (visitor: Partial<VisitorEntry>) => { isMatch: boolean; matchedEntries: string[] };
  
  // Save function
  saveConfiguration: () => Promise<void>;
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
  // State
  const [watchlistEntries, setWatchlistEntries] = useState<WatchlistEntry[]>([
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '555-0123',
      reason: 'Security concern',
      dateAdded: '2024-01-15',
      addedBy: 'Security Team',
      status: 'active',
      notes: 'Attempted unauthorized access'
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '555-0456',
      reason: 'Harassment complaint',
      dateAdded: '2024-01-20',
      addedBy: 'HR Department',
      status: 'active',
      notes: 'Multiple complaints filed'
    }
  ]);

  const [visitorEntries, setVisitorEntries] = useState<VisitorEntry[]>([
    {
      id: '1',
      name: 'Marcus Rodriguez',
      email: 'marcus.rodriguez@techcorp.com',
      phone: '555-0101',
      company: 'TechCorp Solutions',
      purpose: 'Business meeting',
      host: 'Alex Smith',
      hostEmail: 'alex.smith@30eastmcdonald.com',
      hostPhone: '555-0202 ex. 1001',
      hostCompany: '30 East McDonald',
      checkInTime: '2024-01-25T09:00:00Z',
      status: 'checked-in',
      watchlistMatch: false
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@designstudio.com',
      phone: '555-0303',
      company: 'Creative Design Studio',
      purpose: 'Project consultation',
      host: 'Liz Tenant',
      hostEmail: 'liz.tenant@30eastmcdonald.com',
      hostPhone: '555-0209 ex. 9001',
      hostCompany: '30 East McDonald',
      checkInTime: '2024-01-25T10:30:00Z',
      status: 'pending-approval',
      watchlistMatch: true,
      matchedEntries: ['2']
    }
  ]);

  const [watchlistRules, setWatchlistRules] = useState<WatchlistRuleGroup[]>([
    {
      id: 'default',
      name: 'Default Group',
      logic: 'AND',
      rules: [
        {
          id: '1',
          field: 'firstName',
          operator: 'partial',
          value: ''
        },
        {
          id: '2',
          field: 'lastName',
          operator: 'exact',
          value: ''
        },
        {
          id: '3',
          field: 'phone',
          operator: 'exact',
          value: ''
        }
      ]
    }
  ]);

  const [hasChanges, setHasChanges] = useState(false);

  // Watchlist functions
  const addWatchlistEntry = (entry: Omit<WatchlistEntry, 'id' | 'dateAdded'>) => {
    const newEntry: WatchlistEntry = {
      ...entry,
      id: Date.now().toString(),
      dateAdded: new Date().toISOString().split('T')[0]
    };
    setWatchlistEntries(prev => [...prev, newEntry]);
    setHasChanges(true);
  };

  const updateWatchlistEntry = (id: string, updates: Partial<WatchlistEntry>) => {
    setWatchlistEntries(prev => 
      prev.map(entry => entry.id === id ? { ...entry, ...updates } : entry)
    );
    setHasChanges(true);
  };

  const deleteWatchlistEntry = (id: string) => {
    setWatchlistEntries(prev => prev.filter(entry => entry.id !== id));
    setHasChanges(true);
  };

  const searchWatchlist = (query: string): WatchlistEntry[] => {
    if (!query.trim()) return watchlistEntries;
    
    const lowercaseQuery = query.toLowerCase();
    return watchlistEntries.filter(entry =>
      entry.firstName.toLowerCase().includes(lowercaseQuery) ||
      entry.lastName.toLowerCase().includes(lowercaseQuery) ||
      entry.email.toLowerCase().includes(lowercaseQuery) ||
      entry.phone.includes(query) ||
      entry.reason.toLowerCase().includes(lowercaseQuery)
    );
  };

  // Visitor functions
  const addVisitor = (visitor: Omit<VisitorEntry, 'id' | 'checkInTime' | 'status'>) => {
    const matchResult = checkWatchlistMatch(visitor);
    
    const newVisitor: VisitorEntry = {
      ...visitor,
      id: Date.now().toString(),
      checkInTime: new Date().toISOString(),
      status: matchResult.isMatch ? 'pending-approval' : 'checked-in',
      watchlistMatch: matchResult.isMatch,
      matchedEntries: matchResult.matchedEntries
    };
    
    setVisitorEntries(prev => [...prev, newVisitor]);
    setHasChanges(true);
  };

  const updateVisitor = (id: string, updates: Partial<VisitorEntry>) => {
    setVisitorEntries(prev =>
      prev.map(visitor => visitor.id === id ? { ...visitor, ...updates } : visitor)
    );
    setHasChanges(true);
  };

  const searchVisitors = (query: string): VisitorEntry[] => {
    if (!query.trim()) return visitorEntries;
    
    const lowercaseQuery = query.toLowerCase();
    return visitorEntries.filter(visitor =>
      visitor.name.toLowerCase().includes(lowercaseQuery) ||
      visitor.email.toLowerCase().includes(lowercaseQuery) ||
      visitor.company.toLowerCase().includes(lowercaseQuery) ||
      visitor.host.toLowerCase().includes(lowercaseQuery) ||
      visitor.hostCompany.toLowerCase().includes(lowercaseQuery) ||
      visitor.phone.includes(query)
    );
  };

  const approveVisitor = (id: string, approvedBy: string) => {
    setVisitorEntries(prev =>
      prev.map(visitor =>
        visitor.id === id
          ? {
              ...visitor,
              status: 'approved' as const,
              approvedBy,
              approvalTime: new Date().toISOString()
            }
          : visitor
      )
    );
    setHasChanges(true);
  };

  const denyVisitor = (id: string, deniedBy: string, reason: string) => {
    setVisitorEntries(prev =>
      prev.map(visitor =>
        visitor.id === id
          ? {
              ...visitor,
              status: 'denied' as const,
              deniedBy,
              denialTime: new Date().toISOString(),
              denialReason: reason
            }
          : visitor
      )
    );
    setHasChanges(true);
  };

  const checkOutVisitor = (id: string) => {
    setVisitorEntries(prev =>
      prev.map(visitor =>
        visitor.id === id
          ? {
              ...visitor,
              status: 'checked-out' as const,
              checkOutTime: new Date().toISOString()
            }
          : visitor
      )
    );
    setHasChanges(true);
  };

  // Rules functions
  const updateWatchlistRules = (rules: WatchlistRuleGroup[]) => {
    setWatchlistRules(rules);
    setHasChanges(true);
  };

  const checkWatchlistMatch = (visitor: Partial<VisitorEntry>): { isMatch: boolean; matchedEntries: string[] } => {
    const matchedEntries: string[] = [];
    
    for (const entry of watchlistEntries) {
      if (entry.status !== 'active') continue;
      
      // Check each rule group
      for (const group of watchlistRules) {
        if (group.rules.length === 0) continue;
        
        let groupMatch = group.logic === 'AND';
        
        for (const rule of group.rules) {
          let ruleMatch = false;
          
          const visitorValue = visitor[rule.field as keyof VisitorEntry]?.toString().toLowerCase() || '';
          const entryValue = entry[rule.field]?.toLowerCase() || '';
          
          switch (rule.operator) {
            case 'exact':
              ruleMatch = visitorValue === entryValue;
              break;
            case 'contains':
              ruleMatch = rule.value ? visitorValue.includes(rule.value.toLowerCase()) : false;
              break;
            case 'partial':
              ruleMatch = visitorValue.includes(entryValue) || entryValue.includes(visitorValue);
              break;
          }
          
          if (group.logic === 'AND') {
            groupMatch = groupMatch && ruleMatch;
          } else {
            groupMatch = groupMatch || ruleMatch;
          }
        }
        
        if (groupMatch) {
          matchedEntries.push(entry.id);
          break;
        }
      }
    }
    
    return {
      isMatch: matchedEntries.length > 0,
      matchedEntries
    };
  };

  // Save function
  const saveConfiguration = async (): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setHasChanges(false);
  };

  const value: WatchlistContextType = {
    // State
    watchlistEntries,
    setWatchlistEntries,
    visitorEntries,
    setVisitorEntries,
    watchlistRules,
    setWatchlistRules,
    hasChanges,
    setHasChanges,
    
    // Functions
    addWatchlistEntry,
    updateWatchlistEntry,
    deleteWatchlistEntry,
    searchWatchlist,
    addVisitor,
    updateVisitor,
    searchVisitors,
    approveVisitor,
    denyVisitor,
    checkOutVisitor,
    updateWatchlistRules,
    checkWatchlistMatch,
    saveConfiguration
  };

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
};