import React, { useState, useEffect } from 'react';
import { X, Plus, Upload, ChevronDown } from 'lucide-react';
import { useWatchlist, WatchlistEntry } from '../context/WatchlistContext';
import { useToast } from '../hooks/useToast';
import Toast from './Toast';

interface AddToWatchlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  visitorId?: string | null;
  editingEntryId?: string | null;
}

const AddToWatchlistModal: React.FC<AddToWatchlistModalProps> = ({
  isOpen,
  onClose,
  visitorId,
  editingEntryId
}) => {
  const { addToWatchlist, updateWatchlistEntry, getVisitorById, watchlistEntries } = useWatchlist();
  const { toast, showToast, hideToast } = useToast();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    alternativeFirstNames: [] as string[],
    alternativeLastNames: [] as string[],
    primaryEmail: '',
    primaryPhone: '',
    additionalEmails: [] as string[],
    additionalPhones: [] as string[],
    levelId: 'high-risk' as const,
    notes: '',
    reportedBy: '',
    attachments: [] as Array<{ id: string; name: string; url: string; uploadedAt: string }>
  });

  const [newAlternativeFirstName, setNewAlternativeFirstName] = useState('');
  const [newAlternativeLastName, setNewAlternativeLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (editingEntryId) {
      const entry = watchlistEntries.find(e => e.id === editingEntryId);
      if (entry) {
        setFormData({
          firstName: entry.firstName,
          lastName: entry.lastName,
          alternativeFirstNames: entry.alternativeFirstNames,
          alternativeLastNames: entry.alternativeLastNames,
          primaryEmail: entry.primaryEmail,
          primaryPhone: entry.primaryPhone,
          additionalEmails: entry.additionalEmails,
          additionalPhones: entry.additionalPhones,
          levelId: entry.levelId,
          notes: entry.notes,
          reportedBy: entry.reportedBy,
          attachments: entry.attachments
        });
      }
    } else if (visitorId) {
      const visitor = getVisitorById(visitorId);
      if (visitor) {
        const nameParts = visitor.name.split(' ');
        setFormData(prev => ({
          ...prev,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          primaryEmail: visitor.email,
          primaryPhone: visitor.phone
        }));
      }
    } else {
      // Reset form for new entry
      setFormData({
        firstName: '',
        lastName: '',
        alternativeFirstNames: [],
        alternativeLastNames: [],
        primaryEmail: '',
        primaryPhone: '',
        additionalEmails: [],
        additionalPhones: [],
        levelId: 'high-risk',
        notes: '',
        reportedBy: '',
        attachments: []
      });
    }
  }, [visitorId, editingEntryId, getVisitorById, watchlistEntries]);

  const validateField = (fieldName: string, value: string, currentFormData = formData) => {
    const newErrors: Record<string, string> = {};
    
    switch (fieldName) {
      case 'firstName':
        if (!value.trim()) {
          newErrors.firstName = 'First name is required';
        }
        break;
      case 'lastName':
        if (!value.trim()) {
          newErrors.lastName = 'Last name is required';
        }
        break;
      case 'primaryEmail':
        // Only validate format if email is provided
        if (value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.primaryEmail = 'Please enter a valid email address';
        }
        break;
      case 'primaryPhone':
        // No validation required for phone
        break;
    }
    
    return newErrors;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    const firstNameErrors = validateField('firstName', formData.firstName);
    const lastNameErrors = validateField('lastName', formData.lastName);
    const emailErrors = validateField('primaryEmail', formData.primaryEmail);
    const phoneErrors = validateField('primaryPhone', formData.primaryPhone);
    
    Object.assign(newErrors, firstNameErrors, lastNameErrors, emailErrors, phoneErrors);
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    const newFormData = { ...formData, [fieldName]: value };
    setFormData(newFormData);
    
    // Mark field as touched
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    // Validate field in real-time if it's been touched, using the new form data
    if (touched[fieldName] || errors[fieldName]) {
      const fieldErrors = validateField(fieldName, value, newFormData);
      setErrors(prev => ({
        ...prev,
        [fieldName]: fieldErrors[fieldName] || ''
      }));
    }
    
    // Cross-validate email/phone fields to clear errors when one is filled
    if (fieldName === 'primaryEmail' || fieldName === 'primaryPhone') {
      const otherField = fieldName === 'primaryEmail' ? 'primaryPhone' : 'primaryEmail';
      const otherValue = newFormData[otherField as keyof typeof newFormData] as string;
      
      if (touched[otherField] || errors[otherField]) {
        const otherFieldErrors = validateField(otherField, otherValue, newFormData);
        setErrors(prev => ({
          ...prev,
          [otherField]: otherFieldErrors[otherField] || ''
        }));
      }
    }
  };

  const handleFieldBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    const fieldErrors = validateField(fieldName, formData[fieldName as keyof typeof formData] as string, formData);
    setErrors(prev => ({
      ...prev,
      [fieldName]: fieldErrors[fieldName] || ''
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      firstName: true,
      lastName: true,
      primaryEmail: true,
      primaryPhone: true
    });
    
    if (!validateForm()) {
      showToast('Please fix the errors below', 'error');
      return;
    }
    
    if (editingEntryId) {
      updateWatchlistEntry(editingEntryId, formData);
      showToast(`${formData.firstName} ${formData.lastName} was successfully updated`, 'success');
    } else {
      // Navigate to the add page with visitor data
      const params = new URLSearchParams();
      if (visitorId) {
        params.set('visitorId', visitorId);
      }
      window.location.href = `/watchlist/add?${params.toString()}`;
      return;
    }
    
    onClose();
  };

  const addAlternativeFirstName = () => {
    if (newAlternativeFirstName.trim()) {
      setFormData(prev => ({
        ...prev,
        alternativeFirstNames: [...prev.alternativeFirstNames, newAlternativeFirstName.trim()]
      }));
      setNewAlternativeFirstName('');
    }
  };

  const removeAlternativeFirstName = (index: number) => {
    setFormData(prev => ({
      ...prev,
      alternativeFirstNames: prev.alternativeFirstNames.filter((_, i) => i !== index)
    }));
  };

  const addAlternativeLastName = () => {
    if (newAlternativeLastName.trim()) {
      setFormData(prev => ({
        ...prev,
        alternativeLastNames: [...prev.alternativeLastNames, newAlternativeLastName.trim()]
      }));
      setNewAlternativeLastName('');
    }
  };

  const removeAlternativeLastName = (index: number) => {
    setFormData(prev => ({
      ...prev,
      alternativeLastNames: prev.alternativeLastNames.filter((_, i) => i !== index)
    }));
  };

  const addEmail = () => {
    if (newEmail.trim()) {
      setFormData(prev => ({
        ...prev,
        additionalEmails: [...prev.additionalEmails, newEmail.trim()]
      }));
      setNewEmail('');
    }
  };

  const removeEmail = (index: number) => {
    setFormData(prev => ({
      ...prev,
      additionalEmails: prev.additionalEmails.filter((_, i) => i !== index)
    }));
  };

  const addPhone = () => {
    if (newPhone.trim()) {
      setFormData(prev => ({
        ...prev,
        additionalPhones: [...prev.additionalPhones, newPhone.trim()]
      }));
      setNewPhone('');
    }
  };

  const removePhone = (index: number) => {
    setFormData(prev => ({
      ...prev,
      additionalPhones: prev.additionalPhones.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newAttachments = Array.from(files).map(file => ({
        id: Date.now().toString() + Math.random().toString(),
        name: file.name,
        url: URL.createObjectURL(file),
        uploadedAt: new Date().toLocaleString()
      }));
      
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...newAttachments]
      }));
    }
  };

  const removeAttachment = (id: string) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(att => att.id !== id)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {editingEntryId ? 'Edit watchlist entry' : 'Add to watchlist'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Enter the individual's full name, email, and phone number. Include their physical description,
              incident details, and reason for inclusion. Specify actions to take if they are encountered.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First name *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => handleFieldChange('firstName', e.target.value)}
                onBlur={() => handleFieldBlur('firstName')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Johnny"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last name *
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => handleFieldChange('lastName', e.target.value)}
                onBlur={() => handleFieldBlur('lastName')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Smith"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Aliases */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Alternative Names</h4>
            
            {/* Alternative First Names */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alternative first names
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.alternativeFirstNames.map((name, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {name}
                    <button
                      type="button"
                      onClick={() => removeAlternativeFirstName(index)}
                      className="ml-1 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newAlternativeFirstName}
                  onChange={(e) => setNewAlternativeFirstName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter alternative first names one at a time"
                />
                <button
                  type="button"
                  onClick={addAlternativeFirstName}
                  className="px-3 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Alternative Last Names */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alternative last names
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.alternativeLastNames.map((name, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {name}
                    <button
                      type="button"
                      onClick={() => removeAlternativeLastName(index)}
                      className="ml-1 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newAlternativeLastName}
                  onChange={(e) => setNewAlternativeLastName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter alternative last names one at a time"
                />
                <button
                  type="button"
                  onClick={addAlternativeLastName}
                  className="px-3 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
              Primary email
            </label>
              <input
                type="email"
                required
                value={formData.primaryEmail}
                onChange={(e) => handleFieldChange('primaryEmail', e.target.value)}
                onBlur={() => handleFieldBlur('primaryEmail')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.primaryEmail ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="name@email.com"
              />
              {errors.primaryEmail && (
                <p className="mt-1 text-sm text-red-600">{errors.primaryEmail}</p>
              )}
            </div>
            <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
              Primary phone
            </label>
              <input
                type="tel"
                value={formData.primaryPhone}
                onChange={(e) => handleFieldChange('primaryPhone', e.target.value)}
                onBlur={() => handleFieldBlur('primaryPhone')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.primaryPhone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="1 (000) 000-0000"
              />
              {errors.primaryPhone && (
                <p className="mt-1 text-sm text-red-600">{errors.primaryPhone}</p>
              )}
            </div>
          </div>

          {/* Additional Emails */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional email(s)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.additionalEmails.map((email, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {email}
                  <button
                    type="button"
                    onClick={() => removeEmail(index)}
                    className="ml-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter alternatives one at a time"
              />
              <button
                type="button"
                onClick={addEmail}
                className="px-3 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Additional Phones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Other phone number(s)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.additionalPhones.map((phone, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {phone}
                  <button
                    type="button"
                    onClick={() => removePhone(index)}
                    className="ml-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter alternatives one at a time"
              />
              <button
                type="button"
                onClick={addPhone}
                className="px-3 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Reported By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reported by (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.reportedBy}
                onChange={(e) => setFormData(prev => ({ ...prev, reportedBy: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="user search auto-complete: Name+email"
              />
              <p className="text-xs text-gray-500 mt-1">The tenant who reported this individual.</p>
            </div>
          </div>

          {/* Watchlist Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Watchlist level *
            </label>
            <div className="relative">
              <select
                value={formData.levelId}
                onChange={(e) => setFormData(prev => ({ ...prev, levelId: e.target.value as 'high-risk' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-gray-50"
                disabled
              >
                <option value="high-risk">High risk</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Assigned watchlist level for this individual.</p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder=""
            />
            <p className="text-xs text-gray-500 mt-1">
              Please include any relevant context, physical descriptions, or reasons for inclusion on the watchlist.
            </p>
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attachments (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label className="cursor-pointer">
                  <span className="text-indigo-600 hover:text-indigo-500">Click to upload</span>
                  <input
                    type="file"
                    multiple
                    accept=".svg,.png,.jpg,.gif,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                SVG, PNG, JPG, GIF or PDF<br />
                Up to 25 attachments and 25 MB per attachment
              </p>
            </div>

            {/* Attachment Previews */}
            {formData.attachments.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                {formData.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                      <img 
                        src={attachment.url} 
                        alt={attachment.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {attachment.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {attachment.uploadedAt}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(attachment.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              Save
            </button>
          </div>
        </form>
        
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={hideToast}
        />
      </div>
    </div>
  );
};

export default AddToWatchlistModal;