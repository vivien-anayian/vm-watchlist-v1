import React, { useState } from 'react';
import { ChevronDown, Upload, X } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';
import MultiSelectDropdown from '../components/MultiSelectDropdown';
import SentEmailsList from '../components/SentEmailsList';
import WatchlistRulesManager from '../components/WatchlistRulesManager';

const VisitorConfiguration: React.FC = () => {
  const { visitorConfiguration, updateVisitorConfiguration, clearSentEmails } = useWatchlist();
  const { toast, showToast, hideToast } = useToast();
  const [activeTab, setActiveTab] = useState<'general' | 'scheduling' | 'notifications' | 'email' | 'watchlistLevels' | 'watchlistRules'>('general');
  const [localConfig, setLocalConfig] = useState(visitorConfiguration);
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleConfigChange = (updates: any) => {
    const newConfig = {
      ...localConfig,
      ...updates,
      watchlistLevels: updates.watchlistLevels || localConfig.watchlistLevels,
      notificationRecipients: updates.notificationRecipients || localConfig.notificationRecipients,
      emailTemplate: {
        ...localConfig.emailTemplate,
        ...updates.emailTemplate
      }
    };
    setLocalConfig(newConfig);
    setHasChanges(true);
    
    // Validate watchlist levels if they were updated
    if (updates.watchlistLevels) {
      validateWatchlistLevels(updates.watchlistLevels);
    }
  };

  const validateWatchlistLevels = (levels: any[]) => {
    const newErrors: Record<string, string> = {};
    const names = levels.map(level => level.name.trim().toLowerCase());
    
    levels.forEach((level, index) => {
      const key = `level-${level.id}`;
      
      // Check if name is empty
      if (!level.name.trim()) {
        newErrors[key] = 'Level name is required';
      }
      // Check if name is too long
      else if (level.name.length > 64) {
        newErrors[key] = 'Level name must be 64 characters or less';
      }
      // Check for duplicates
      else if (names.filter(name => name === level.name.trim().toLowerCase()).length > 1) {
        newErrors[key] = 'Level name must be unique';
      }
    });
    
    setErrors(newErrors);
  };

  const handleSave = () => {
    // Validate before saving
    validateWatchlistLevels(localConfig.watchlistLevels);
    
    if (Object.keys(errors).length > 0) {
      showToast('Please fix the errors before saving', 'error');
      return;
    }
    
    updateVisitorConfiguration(localConfig);
    setHasChanges(false);
    showToast('Configuration saved successfully', 'success');
  };

  const handleUndo = () => {
    setLocalConfig(visitorConfiguration);
    setHasChanges(false);
    setErrors({});
    showToast('Changes reset to default', 'info');
  };

  const handleResetAll = () => {
    if (window.confirm('Are you sure you want to reset all changes? This action cannot be undone.')) {
      handleUndo();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      handleConfigChange({
        emailTemplate: {
          bannerImage: imageUrl
        }
      });
    }
  };

  const removeBannerImage = () => {
    handleConfigChange({
      emailTemplate: {
        bannerImage: undefined
      }
    });
  };

  const handleWatchlistLevelChange = (levelId: string, field: string, value: any) => {
    const updatedLevels = localConfig.watchlistLevels.map(level => 
      level.id === levelId ? { ...level, [field]: value } : level
    );
    handleConfigChange({ watchlistLevels: updatedLevels });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Configuration</h1>
        <div className="flex items-center space-x-3">
          {hasChanges && (
            <button
              onClick={handleResetAll}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Reset all
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              hasChanges
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Save all
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'general'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            General setup
          </button>
          <button
            onClick={() => setActiveTab('scheduling')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'scheduling'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Scheduling
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'notifications'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'email'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Email template
          </button>
          <button
            onClick={() => setActiveTab('watchlistLevels')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'watchlistLevels'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Watchlist levels
          </button>
          <button
            onClick={() => setActiveTab('watchlistRules')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'watchlistRules'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Watchlist rules
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <div className="space-y-8">
          {/* Visit Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Visit information</h3>
            <p className="text-sm text-gray-600 mb-6">
              Set requirements for visitor passes created at this property. This helps ensure that only authorized individuals enter the property, to provide a more efficient overall visitor experience.
            </p>

            <div className="space-y-6">
              {/* Manual Visitor Validation */}
              <div className="flex items-start space-x-3">
                <div className="flex items-center h-5">
                  <input
                    id="manual-validation"
                    type="checkbox"
                    checked={localConfig.manualValidation}
                    onChange={(e) => handleConfigChange({ manualValidation: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="manual-validation" className="text-sm font-medium text-gray-900">
                    Manual visitor validation
                  </label>
                  <p className="text-sm text-gray-500 mt-1">
                    When this option is enabled, all visitors must first pass a manual check through security, before issuing an access. When this option is disabled, all visitors would be able to enter the property automatically.
                  </p>
                </div>
              </div>

              {/* Early Check-in */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Early check-in
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Control if/when a visitor can check-in before the start time of their visitor pass.
                </p>
                <div className="relative w-48">
                  <select
                    value={localConfig.earlyCheckinMinutes}
                    onChange={(e) => handleConfigChange({ earlyCheckinMinutes: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                  >
                    <option value={5}>5 mins</option>
                    <option value={10}>10 mins</option>
                    <option value={15}>15 mins</option>
                    <option value={30}>30 mins</option>
                    <option value={60}>1 hour</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'scheduling' && (
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Scheduling</h3>
            <p className="text-sm text-gray-600">
              Configure scheduling settings for visitor management.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Notifications</h3>
            <p className="text-sm text-gray-600">
              Configure notification settings for visitor management.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'watchlistLevels' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Watchlist levels</h3>
            <p className="text-sm text-gray-600">
              Set up the watchlist levels below to control how the system reacts when a visitor matches a watchlisted individual. You can customize each level to fit your security protocols.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {localConfig.watchlistLevels.map((level) => (
              <div key={level.id} className="bg-white border border-gray-200 rounded-lg p-6">
                {/* Level Header with Color Indicator */}
                <div className="flex items-center space-x-2 mb-4">
                  <div className={`w-3 h-3 rounded-full ${
                    level.color === 'red' ? 'bg-red-500' :
                    level.color === 'yellow' ? 'bg-yellow-500' :
                    'bg-gray-500'
                  }`}></div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    level.color === 'red' ? 'bg-red-100 text-red-800' :
                    level.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {level.name}
                  </span>
                </div>

                {/* Watchlist Level Name Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Watchlist level
                  </label>
                  <input
                    type="text"
                    value={level.name}
                    onChange={(e) => handleWatchlistLevelChange(level.id, 'name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors[`level-${level.id}`] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter level name"
                    maxLength={64}
                  />
                  <p className="text-xs text-gray-500 mt-1">Give a relevant name to show the purpose</p>
                  {errors[`level-${level.id}`] && (
                    <p className="text-xs text-red-600 mt-1">{errors[`level-${level.id}`]}</p>
                  )}
                </div>

                {/* Send Email Notifications */}
                <div className="mb-4">
                  <div className="flex items-center space-x-2">
                    <input
                      id={`email-${level.id}`}
                      type="checkbox"
                      checked={level.sendEmailNotifications}
                      onChange={(e) => handleWatchlistLevelChange(level.id, 'sendEmailNotifications', e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor={`email-${level.id}`} className="text-sm font-medium text-gray-900">
                      Send email notifications
                    </label>
                  </div>
                </div>

                {/* Notification Recipients Dropdown */}
                {level.sendEmailNotifications && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select who needs to be notified
                    </label>
                    <MultiSelectDropdown
                      options={localConfig.notificationRecipients}
                      selectedIds={level.notificationRecipients}
                      onChange={(selectedIds) => handleWatchlistLevelChange(level.id, 'notificationRecipients', selectedIds)}
                      placeholder="Select recipients"
                    />
                  </div>
                )}

                {/* System Logging */}
                <div className="mb-4">
                  <div className="flex items-center space-x-2">
                    <input
                      id={`logging-${level.id}`}
                      type="checkbox"
                      checked={level.systemLogging}
                      onChange={(e) => handleWatchlistLevelChange(level.id, 'systemLogging', e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor={`logging-${level.id}`} className="text-sm font-medium text-gray-900">
                      System logging
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-6">
                    Automatically logs all watchlist matches and security actions for audit trails and compliance reporting
                  </p>
                </div>

                {/* Requires Manual Approval */}
                <div>
                  <div className="flex items-center space-x-2">
                    <input
                      id={`approval-${level.id}`}
                      type="checkbox"
                      checked={level.requiresManualApproval}
                      onChange={(e) => handleWatchlistLevelChange(level.id, 'requiresManualApproval', e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor={`approval-${level.id}`} className="text-sm font-medium text-gray-900">
                      Requires manual approval
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-6">
                    via Admin portal - text TBD
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'watchlistRules' && (
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Watchlist rules</h3>
            <p className="text-sm text-gray-600">
              Configure how visitors are matched against watchlist entries. Rules within a group use AND logic, while different groups use OR logic.
            </p>
          </div>
          <WatchlistRulesManager />
        </div>
      )}

      {activeTab === 'email' && (
        <div className="grid grid-cols-2 gap-8">
          {/* Left Column - Configuration */}
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Email templates</h3>
              <p className="text-sm text-gray-600">
                Customize your emails to to keep the communication consistent with visitors to the property.
              </p>
            </div>

            {/* Branding */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Branding</h4>
              <p className="text-sm text-gray-500 mb-4">
                Add your background image to meet your branding guidelines.
              </p>

              {localConfig.emailTemplate.bannerImage ? (
                <div className="relative">
                  <img
                    src={localConfig.emailTemplate.bannerImage}
                    alt="Banner"
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    onClick={removeBannerImage}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-50"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <div className="mt-2">
                    <label className="cursor-pointer">
                      <span className="text-sm text-indigo-600 hover:text-indigo-500">Upload a file</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    We recommend 800-1200px wide, 16:9 image ratio, JPG, PNG, 1MB max.
                  </p>
                </div>
              )}
            </div>

            {/* Entry Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Entry instructions
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Add specific instructions or travel directions that will be displayed at the top of the visitor pass.
              </p>
              <textarea
                value={localConfig.emailTemplate.entryInstructions}
                onChange={(e) => handleConfigChange({
                  emailTemplate: { entryInstructions: e.target.value }
                })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter instructions..."
              />
              <div className="flex justify-end mt-1">
                <span className="text-xs text-gray-500">
                  {localConfig.emailTemplate.entryInstructions.length}/500
                </span>
              </div>
            </div>

            {/* Building Guidelines */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Building guidelines and policies
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Add specific building guidelines or security policies that will be displayed at the bottom of the visitor pass.
              </p>
              <textarea
                value={localConfig.emailTemplate.buildingGuidelines}
                onChange={(e) => handleConfigChange({
                  emailTemplate: { buildingGuidelines: e.target.value }
                })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter guidelines..."
              />
              <div className="flex justify-end mt-1">
                <span className="text-xs text-gray-500">
                  {localConfig.emailTemplate.buildingGuidelines.length}/500
                </span>
              </div>
            </div>

            {/* QR Code */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">QR code</h4>
              {localConfig.manualValidation ? (
                <p className="text-sm text-gray-500">
                  When validation is enabled, the QR code is always sent after the visitor has been manually validated on premise. They can use this QR code to check-in.
                </p>
              ) : (
                <div>
                  <p className="text-sm text-gray-500 mb-4">
                    Include a QR code in the email invitation to the visitor. They can use this QR code to check-in.
                  </p>
                  <div className="flex items-start space-x-3">
                    <div className="flex items-center h-5">
                      <input
                        id="send-qr-code"
                        type="checkbox"
                        checked={localConfig.sendQRCode}
                        onChange={(e) => handleConfigChange({ sendQRCode: e.target.checked })}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label htmlFor="send-qr-code" className="text-sm font-medium text-gray-900">
                        Send a QR code with every visitor pass
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Preview */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4">Preview</h4>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Banner Image */}
              {localConfig.emailTemplate.bannerImage ? (
                <img
                  src={localConfig.emailTemplate.bannerImage}
                  alt="Email banner"
                  className="w-full h-32 object-cover"
                />
              ) : (
                <div className="w-full h-32 bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-lg font-semibold">Your Company</div>
                    <div className="text-sm opacity-90">Building Name</div>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Hello [Visitor name],</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    [Host name] has invited you to the [Company name] location at [Property name]. See the visit details below, scan the QR code in the email or from the attached file.
                  </p>
                </div>

                <div className="text-center py-4">
                  <div className="inline-block bg-gray-100 px-4 py-2 rounded">
                    <div className="font-medium text-gray-900">[Property name] Visitor Pass for [Visitor name]</div>
                    <div className="text-sm text-gray-600 mt-1">This pass is valid</div>
                    <div className="text-sm text-gray-600">[Duration of the visit]</div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-sm font-medium text-gray-900">Your host</div>
                  <div className="text-sm text-gray-600">[Host name]</div>
                  <div className="text-sm text-gray-600">[Company name]</div>
                </div>

                <div className="text-center">
                  <div className="text-sm font-medium text-gray-900">Access floor</div>
                  <div className="text-sm text-gray-600">Floor: 3</div>
                </div>

                <div className="text-center">
                  <div className="text-sm font-medium text-gray-900">Message from your host</div>
                  <div className="text-sm text-gray-600">[Unique messages to your guests will display here]</div>
                </div>

                {/* QR Code Section in Preview */}
                {!localConfig.manualValidation && localConfig.sendQRCode ? (
                  <div className="text-center py-4">
                    <div className="inline-block w-24 h-24 bg-gray-200 border-2 border-dashed border-gray-400 rounded flex items-center justify-center">
                      <div className="text-xs text-gray-500 text-center">
                        QR<br/>Code
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 mt-2">
                      This pass is valid<br/>
                      [Duration of the visit]
                    </div>
                  </div>
                ) : null}

                <div className="border-t pt-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-gray-300 rounded-full mt-0.5"></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">[Property's address]</div>
                      <div className="text-sm text-blue-600">(View on map)</div>
                    </div>
                  </div>
                </div>

                {localConfig.emailTemplate.entryInstructions && (
                  <div className="border-t pt-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-5 h-5 bg-gray-300 rounded-full mt-0.5"></div>
                      <div className="text-sm text-gray-600">
                        {localConfig.emailTemplate.entryInstructions}
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="border-t pt-4 text-center">
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>Do not share this pass with anyone.</div>
                    <div className="mt-4">
                      <div>Sent by [Visitor label name]</div>
                      <div>123 W 42th St 17th Floor New York, NY 10036</div>
                      <div className="text-blue-600 underline">Contact Us</div>
                    </div>
                    <div className="mt-4 text-gray-400">
                      Powered by VTS Activate ©2023 VTS Activate. All rights reserved.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sent Emails Demo Section */}
      {activeTab === 'email' && (
        <div className="mt-12 border-t border-gray-200 pt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-medium text-gray-900">Sent Emails (Demo)</h4>
              <p className="text-sm text-gray-600 mt-1">
                View email notifications sent during the approval workflow for demonstration purposes.
              </p>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Clear all sent emails from demo log?')) {
                  clearSentEmails();
                  showToast('Sent emails cleared', 'info');
                }
              }}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Clear all
            </button>
          </div>
          <SentEmailsList />
        </div>
      )}
      
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
};

export default VisitorConfiguration;