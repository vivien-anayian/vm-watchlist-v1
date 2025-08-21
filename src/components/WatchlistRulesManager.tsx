import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, AlertCircle } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import type { WatchlistRule, WatchlistRuleGroup } from '../context/WatchlistContext';

interface WatchlistRulesManagerProps {
  onRulesChange: (hasChanges: boolean) => void;
}

const WatchlistRulesManager: React.FC<WatchlistRulesManagerProps> = ({ onRulesChange }) => {
  const {
    visitorConfiguration: { watchlistRules },
    addWatchlistRuleGroup,
    removeWatchlistRuleGroup,
    addRuleToGroup,
    removeRuleFromGroup,
    updateRule
  } = useWatchlist();

  const [localRules, setLocalRules] = useState<WatchlistRuleGroup[]>(watchlistRules);
  const [showDefaultGroupWarning, setShowDefaultGroupWarning] = useState(false);

  // Sync with context when watchlistRules change
  useEffect(() => {
    setLocalRules(watchlistRules);
  }, [watchlistRules]);

  // Notify parent of changes
  useEffect(() => {
    const hasChanges = JSON.stringify(localRules) !== JSON.stringify(watchlistRules);
    onRulesChange(hasChanges);
  }, [localRules, watchlistRules, onRulesChange]);

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
      case 'exact': return 'is exactly';
      case 'contains': return 'contains';
      case 'partial': return 'is';
      default: return type;
    }
  };

  const getAvailableParameters = (groupId: string, currentRuleId?: string) => {
    const group = localRules.find(g => g.id === groupId);
    if (!group) return ['firstName', 'lastName', 'email', 'phone'];
    
    const usedParameters = group.rules
      .filter(rule => rule.id !== currentRuleId)
      .map(rule => rule.parameter);
    
    return ['firstName', 'lastName', 'email', 'phone'].filter(
      param => !usedParameters.includes(param as any)
    );
  };

  const handleRuleUpdate = (groupId: string, ruleId: string, updates: Partial<WatchlistRule>) => {
    // If changing type away from 'contains', clear the value
    if (updates.type && updates.type !== 'contains') {
      updates.value = '';
    }
    
    setLocalRules(prev => prev.map(group => 
      group.id === groupId 
        ? {
            ...group,
            rules: group.rules.map(rule => 
              rule.id === ruleId ? { ...rule, ...updates } : rule
            )
          }
        : group
    ));
  };

  const handleAddRule = (groupId: string) => {
    const availableParams = getAvailableParameters(groupId);
    if (availableParams.length > 0) {
      const newRule: WatchlistRule = {
        id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        parameter: availableParams[0] as WatchlistRule['parameter'],
        type: 'exact',
        value: ''
      };
      
      setLocalRules(prev => prev.map(group => 
        group.id === groupId 
          ? { ...group, rules: [...group.rules, newRule] }
          : group
      ));
    }
  };

  const handleRemoveRule = (groupId: string, ruleId: string) => {
    const group = localRules.find(g => g.id === groupId);
    
    // Check if this is the default group and would become empty
    if (groupId === 'default-group' && group && group.rules.length === 1) {
      setShowDefaultGroupWarning(true);
      return;
    }
    
    setLocalRules(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, rules: group.rules.filter(rule => rule.id !== ruleId) }
        : group
    ).filter(group => {
      // Remove empty groups (except default group)
      if (group.id === 'default-group') return true;
      return group.rules.length > 0 || group.id === groupId; // Keep the group we're removing from temporarily
    }).map(group => {
      // Clean up the group we just removed a rule from
      if (group.id === groupId && group.id !== 'default-group' && group.rules.filter(r => r.id !== ruleId).length === 0) {
        return null;
      }
      return group.id === groupId 
        ? { ...group, rules: group.rules.filter(rule => rule.id !== ruleId) }
        : group;
    }).filter(Boolean) as WatchlistRuleGroup[]);
  };

  const handleAddGroup = () => {
    const newGroup: WatchlistRuleGroup = {
      id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `Rule Group ${localRules.length}`,
      rules: []
    };
    
    setLocalRules(prev => [...prev, newGroup]);
  };

  const handleRemoveGroup = (groupId: string) => {
    if (groupId === 'default-group') return; // Prevent removing default group
    
    setLocalRules(prev => prev.filter(group => group.id !== groupId));
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
      <div className="space-y-6">
        {localRules.map((group, groupIndex) => {
          const isDefaultGroup = group.id === 'default-group';
          
          return (
            <div key={group.id} className="bg-white border border-gray-200 rounded-lg">
              {/* Group Header */}
              <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${isDefaultGroup ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {isDefaultGroup ? 'Where' : 'Or'}
                    </h3>
                    <span className="text-xs text-gray-500">
                      All of the following are true...
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleAddRule(group.id)}
                      disabled={getAvailableParameters(group.id).length === 0}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-indigo-600 bg-white border border-indigo-200 rounded-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Rule
                    </button>
                    {!isDefaultGroup && (
                      <button
                        onClick={() => handleRemoveGroup(group.id)}
                        className="inline-flex items-center p-1.5 text-red-600 hover:bg-red-50 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        title="Remove group"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Group Content */}
              <div className="p-4">
                {group.rules.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="font-medium">No conditions set</p>
                    <p className="text-sm mt-1">Click "Add Rule" to create matching criteria</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {group.rules.map((rule, ruleIndex) => {
                      const availableParams = getAvailableParameters(group.id, rule.id);
                      const selectableParams = [...availableParams, rule.parameter];
                      
                      return (
                        <div key={rule.id} className="flex items-center space-x-3">
                          {/* AND Indicator */}
                          {ruleIndex > 0 && (
                            <div className="flex items-center justify-center w-10 h-6 bg-blue-100 text-blue-700 text-xs font-semibold rounded border border-blue-200">
                              And
                            </div>
                          )}
                          
                          {/* Where Label */}
                          <div className="text-sm font-medium text-gray-700 min-w-[50px]">
                            Where
                          </div>

                          {/* Parameter Selection */}
                          <div className="min-w-[120px]">
                            <div className="relative">
                              <select
                                value={rule.parameter}
                                onChange={(e) => handleRuleUpdate(group.id, rule.id, { 
                                  parameter: e.target.value as WatchlistRule['parameter'] 
                                })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                              >
                                {selectableParams.map(param => (
                                  <option key={param} value={param}>
                                    {getParameterLabel(param)}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                          </div>

                          {/* Type Selection */}
                          <div className="min-w-[100px]">
                            <div className="relative">
                              <select
                                value={rule.type}
                                onChange={(e) => handleRuleUpdate(group.id, rule.id, { 
                                  type: e.target.value as WatchlistRule['type'] 
                                })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                              >
                                <option value="exact">is exactly</option>
                                <option value="contains">contains</option>
                                <option value="partial">is</option>
                              </select>
                              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                          </div>

                          {/* Value Input */}
                          <div className="flex-1 min-w-[150px]">
                            {rule.type === 'contains' ? (
                              <input
                                type="text"
                                value={rule.value || ''}
                                onChange={(e) => handleRuleUpdate(group.id, rule.id, { value: e.target.value })}
                                placeholder="Enter text to search for..."
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              />
                            ) : (
                              <div className="w-full px-3 py-2 text-sm text-gray-500 bg-gray-100 border border-gray-200 rounded-md">
                                Auto-matched
                              </div>
                            )}
                          </div>

                          {/* Remove Rule Button */}
                          <button
                            onClick={() => handleRemoveRule(group.id, rule.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            title="Remove rule"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Group Button */}
      <div className="flex justify-start">
        <button
          onClick={handleAddGroup}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add condition group
        </button>
      </div>

      {/* OR Logic Indicator */}
      {localRules.length > 1 && (
        <div className="text-center">
          <div className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-700 text-sm font-semibold rounded-full border border-orange-200">
            Groups connected with OR logic
          </div>
          <p className="text-xs text-gray-500 mt-2">
            A visitor matches if they satisfy ANY rule group above
          </p>
        </div>
      )}

      {/* Default Group Warning Modal */}
      {showDefaultGroupWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Cannot Remove Last Rule
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              The default group must contain at least one rule. Please add another rule before removing this one.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowDefaultGroupWarning(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchlistRulesManager;