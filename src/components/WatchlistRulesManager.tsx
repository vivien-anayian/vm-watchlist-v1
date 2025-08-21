import React from 'react';
import { Plus, Trash2, ChevronDown } from 'lucide-react';
import { useWatchlist, WatchlistRule, WatchlistRuleGroup } from '../context/WatchlistContext';

const WatchlistRulesManager: React.FC = () => {
  const {
    visitorConfiguration,
    addWatchlistRuleGroup,
    removeWatchlistRuleGroup,
    addRuleToGroup,
    removeRuleFromGroup,
    updateRule
  } = useWatchlist();

  const ruleGroups = visitorConfiguration.watchlistRules;

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
    return `${getParameterLabel(rule.parameter)} ${getTypeLabel(rule.type).toLowerCase()}`;
  };

  const getGroupDescription = (group: WatchlistRuleGroup) => {
    if (group.rules.length === 0) return 'No rules defined';
    return group.rules.map(rule => getRuleDescription(rule)).join(' AND ');
  };

  return (
    <div className="space-y-6">
      {/* Rule Groups */}
      <div className="space-y-4">
        {ruleGroups.map((group, groupIndex) => (
          <div key={group.id} className="border border-gray-200 rounded-lg p-6">
            {/* Group Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-medium text-gray-900">
                  {group.id === 'default-group' ? 'Default Group' : `Group ${groupIndex + 1}`}
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  {getGroupDescription(group)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => addRuleToGroup(group.id)}
                  className="flex items-center space-x-1 px-3 py-2 text-sm border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Rule</span>
                </button>
                {group.id !== 'default-group' && (
                  <button
                    onClick={() => removeWatchlistRuleGroup(group.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Rules */}
            <div className="space-y-3">
              {group.rules.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No rules defined for this group</p>
                  <p className="text-sm">Click "Add Rule" to create matching criteria</p>
                </div>
              ) : (
                group.rules.map((rule, ruleIndex) => (
                  <div key={rule.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    {ruleIndex > 0 && (
                      <div className="text-sm font-medium text-gray-600 px-2">AND</div>
                    )}
                    
                    {/* Parameter Selection */}
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Field
                      </label>
                      <div className="relative">
                        <select
                          value={rule.parameter}
                          onChange={(e) => updateRule(group.id, rule.id, { 
                            parameter: e.target.value as WatchlistRule['parameter'] 
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white text-sm"
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
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Match Type
                      </label>
                      <div className="relative">
                        <select
                          value={rule.type}
                          onChange={(e) => updateRule(group.id, rule.id, { 
                            type: e.target.value as WatchlistRule['type'] 
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white text-sm"
                        >
                          <option value="exact">Exact Match</option>
                          <option value="contains">Contains</option>
                          <option value="partial">Partial Match</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Remove Rule Button */}
                    <div className="flex items-end">
                      <button
                        onClick={() => removeRuleFromGroup(group.id, rule.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Group Button */}
      <div className="flex justify-center">
        <button
          onClick={addWatchlistRuleGroup}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          <Plus className="w-4 h-4" />
          <span>Add Rule Group</span>
        </button>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">How Watchlist Rules Work</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p><strong>Within a group:</strong> All rules must match (AND logic)</p>
          <p><strong>Between groups:</strong> Any group can match (OR logic)</p>
          <p><strong>Match types:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li><strong>Exact:</strong> Values must match exactly (case-insensitive)</li>
            <li><strong>Contains:</strong> One value contains the other</li>
            <li><strong>Partial:</strong> Values share common parts</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WatchlistRulesManager;