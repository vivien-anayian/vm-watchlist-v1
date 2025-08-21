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
      case 'exact': return 'is exactly';
      case 'contains': return 'contains';
      case 'partial': return 'is';
      default: return type;
    }
  };

  const getRuleDescription = (rule: WatchlistRule) => {
    const param = getParameterLabel(rule.parameter);
    const type = getTypeLabel(rule.type);
    
    if (rule.type === 'contains' && rule.value) {
      return `${param} ${type} "${rule.value}"`;
    }
    return `${param} ${type} match`;
  };

  const getGroupDescription = (group: WatchlistRuleGroup) => {
    if (group.rules.length === 0) return 'No conditions set';
    return group.rules.map(rule => getRuleDescription(rule)).join(' AND ');
  };

  const getAvailableParameters = (groupId: string, currentRuleId?: string) => {
    const group = watchlistRules.find(g => g.id === groupId);
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
    updateRule(groupId, ruleId, updates);
  };

  const handleAddRule = (groupId: string) => {
    const availableParams = getAvailableParameters(groupId);
    if (availableParams.length > 0) {
      addRuleToGroup(groupId);
    }
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
        {watchlistRules.map((group, groupIndex) => {
          const isExpanded = expandedGroups.has(group.id);
          const isDefaultGroup = group.id === 'default-group';
          
          return (
            <div key={group.id} className="bg-white border border-gray-200 rounded-lg">
              {/* Group Header */}
              <div className="border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between p-4">
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className="flex items-center space-x-3 flex-1 text-left"
                  >
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`} />
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${isDefaultGroup ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {isDefaultGroup ? 'Where' : `Or`}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {getGroupDescription(group)}
                        </p>
                      </div>
                    </div>
                  </button>
                  
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
                        onClick={() => removeWatchlistRuleGroup(group.id)}
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
              {isExpanded && (
                <div className="p-4">
                  {group.rules.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="font-medium">No conditions set</p>
                      <p className="text-sm mt-1">Click "Add Rule" to create matching criteria</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                        All of the following are true...
                      </div>
                      
                      {group.rules.map((rule, ruleIndex) => {
                        const availableParams = getAvailableParameters(group.id, rule.id);
                        const allParams = ['firstName', 'lastName', 'email', 'phone'];
                        const selectableParams = [...availableParams, rule.parameter];
                        
                        return (
                          <div key={rule.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center space-x-3">
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
                                onClick={() => removeRuleFromGroup(group.id, rule.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                title="Remove rule"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Rule Preview */}
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="text-xs text-gray-600">
                                <span className="font-medium">Rule:</span> {getRuleDescription(rule)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Group Button */}
      <div className="flex justify-start">
        <button
          onClick={addWatchlistRuleGroup}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add condition group
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