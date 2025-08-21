import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, AlertCircle } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import type { WatchlistRule, WatchlistRuleGroup } from '../context/WatchlistContext';

const WatchlistRulesManager: React.FC = () => {
  const {
    visitorConfiguration: { watchlistRules },
    addWatchlistRuleGroup,
    removeWatchlistRuleGroup,
    addRuleToGroup,
    removeRuleFromGroup,
    updateRule
  } = useWatchlist();

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['default-group']));

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const getParameterLabel = (parameter: string) => {
    switch (parameter) {
      case 'firstName': return 'First Name';
      case 'lastName': return 'Last Name';
      case 'email': return 'Email';
      case 'phone': return 'Phone';
      default: return parameter;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'exact': return 'Exact Match';
      case 'contains': return 'Contains';
      case 'partial': return 'Partial Match';
      default: return type;
    }
  };

  const getRuleDescription = (rule: WatchlistRule) => {
    const param = getParameterLabel(rule.parameter);
    const type = getTypeLabel(rule.type);
    
    if (rule.type === 'contains' && rule.value) {
      return `${param} contains "${rule.value}"`;
    }
    return `${param} ${type.toLowerCase()}`;
  };

  const getGroupDescription = (group: WatchlistRuleGroup) => {
    if (group.rules.length === 0) return 'No rules defined';
    if (group.rules.length === 1) return getRuleDescription(group.rules[0]);
    return group.rules.map(rule => getRuleDescription(rule)).join(' AND ');
  };

  const getGroupTitle = (group: WatchlistRuleGroup, index: number) => {
    if (group.id === 'default-group') return 'Default Group';
    return `Rule Group ${index}`;
  };

  const handleRuleUpdate = (groupId: string, ruleId: string, updates: Partial<WatchlistRule>) => {
    // If changing type away from 'contains', clear the value
    if (updates.type && updates.type !== 'contains') {
      updates.value = '';
    }
    updateRule(groupId, ruleId, updates);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-2">How Watchlist Rules Work</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Within a group:</strong> All rules must match (AND logic)</p>
              <p><strong>Between groups:</strong> Any group can match (OR logic)</p>
              <p><strong>Match types:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
                <li><strong>Exact:</strong> Values must match exactly (case-insensitive)</li>
                <li><strong>Contains:</strong> Specify text that must be found within the field</li>
                <li><strong>Partial:</strong> Any partial overlap between visitor and watchlist data</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Rule Groups */}
      <div className="space-y-4">
        {watchlistRules.map((group, groupIndex) => {
          const isExpanded = expandedGroups.has(group.id);
          const groupNumber = group.id === 'default-group' ? 0 : groupIndex;
          
          return (
            <div key={group.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
              {/* Group Header */}
              <div className="bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between p-4">
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className="flex items-center space-x-3 flex-1 text-left"
                  >
                    <div className="flex items-center space-x-2">
                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`} />
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${group.id === 'default-group' ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {getGroupTitle(group, groupNumber)}
                        </h3>
                      </div>
                    </div>
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => addRuleToGroup(group.id)}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Rule
                    </button>
                    {group.id !== 'default-group' && (
                      <button
                        onClick={() => removeWatchlistRuleGroup(group.id)}
                        className="inline-flex items-center p-1.5 text-red-600 hover:bg-red-50 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        title="Remove group"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Group Description */}
                <div className="px-4 pb-3">
                  <p className="text-sm text-gray-600">
                    {getGroupDescription(group)}
                  </p>
                </div>
              </div>

              {/* Group Content */}
              {isExpanded && (
                <div className="p-4">
                  {group.rules.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="font-medium">No rules defined</p>
                      <p className="text-sm mt-1">Click "Add Rule" to create matching criteria</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {group.rules.map((rule, ruleIndex) => (
                        <div key={rule.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start space-x-4">
                            {/* AND Indicator */}
                            {ruleIndex > 0 && (
                              <div className="flex items-center justify-center w-12 h-8 bg-blue-100 text-blue-700 text-xs font-semibold rounded-md border border-blue-200">
                                AND
                              </div>
                            )}
                            
                            {/* Rule Configuration */}
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Parameter Selection */}
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Field to Match
                                </label>
                                <div className="relative">
                                  <select
                                    value={rule.parameter}
                                    onChange={(e) => handleRuleUpdate(group.id, rule.id, { 
                                      parameter: e.target.value as WatchlistRule['parameter'] 
                                    })}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                                  >
                                    <option value="firstName">First Name</option>
                                    <option value="lastName">Last Name</option>
                                    <option value="email">Email</option>
                                    <option value="phone">Phone</option>
                                  </select>
                                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                              </div>

                              {/* Type Selection */}
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Match Type
                                </label>
                                <div className="relative">
                                  <select
                                    value={rule.type}
                                    onChange={(e) => handleRuleUpdate(group.id, rule.id, { 
                                      type: e.target.value as WatchlistRule['type'] 
                                    })}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                                  >
                                    <option value="exact">Exact Match</option>
                                    <option value="contains">Contains</option>
                                    <option value="partial">Partial Match</option>
                                  </select>
                                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                              </div>

                              {/* Value Input (for contains type) */}
                              <div>
                                {rule.type === 'contains' ? (
                                  <>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Text to Find
                                    </label>
                                    <input
                                      type="text"
                                      value={rule.value || ''}
                                      onChange={(e) => handleRuleUpdate(group.id, rule.id, { value: e.target.value })}
                                      placeholder="Enter text to search for..."
                                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                  </>
                                ) : (
                                  <>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">
                                      Value
                                    </label>
                                    <div className="w-full px-3 py-2 text-sm text-gray-500 bg-gray-100 border border-gray-200 rounded-md">
                                      Auto-matched
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Remove Rule Button */}
                            <div className="flex items-start pt-6">
                              <button
                                onClick={() => removeRuleFromGroup(group.id, rule.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                title="Remove rule"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Rule Preview */}
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="text-xs text-gray-600">
                              <span className="font-medium">Rule:</span> {getRuleDescription(rule)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Group Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={addWatchlistRuleGroup}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Rule Group
        </button>
      </div>

      {/* OR Logic Indicator */}
      {watchlistRules.length > 1 && (
        <div className="text-center">
          <div className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-700 text-sm font-semibold rounded-full border border-orange-200">
            Groups connected with OR logic
          </div>
          <p className="text-xs text-gray-500 mt-2">
            A visitor matches if they satisfy ANY rule group above
          </p>
        </div>
      )}
    </div>
  );
};

export default WatchlistRulesManager;