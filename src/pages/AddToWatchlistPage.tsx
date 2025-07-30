import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { X, Plus, Upload, ChevronDown } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';

const AddToWatchlistPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToWatchlist, getVisitorById, updateVisitorWatchlistStatus } = useWatchlist();
  const { toast, showToast, hideToast } = useToast();
  
  // Progressive disclosure state
  const [showAlternativeFirstNamesSection, setShowAlternativeFirstNamesSection] = useState(false);
  const [showAlternativeLastNamesSection, setShowAlternativeLastNamesSection] = useState(false);
  const [showAdditionalEmailsSection, setShowAdditionalEmailsSection] = useState(false);
  const [showAdditionalPhonesSection, setShowAdditionalPhonesSection] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    alternativeFirstNames: [] as string[],
    alternativeLastNames: [] as string[],
    primaryEmail: '',
    primaryPhone: '',
    additionalEmails: [] as string[],
    additionalPhones: [] as string[],
    level: 'High risk' as const,
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
    const visitorId = searchParams.get('visitorId');
    if (visitorId) {
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
    }
  }, [searchParams, getVisitorById]);

  // Auto-show sections if they have data (for edit mode)
  useEffect(() => {
    setShowAlternativeFirstNamesSection(formData.alternativeFirstNames.length > 0);
    setShowAlternativeLastNamesSection(formData.alternativeLastNames.length > 0);
    setShowAdditionalEmailsSection(formData.additionalEmails.length > 0);
    setShowAdditionalPhonesSection(formData.additionalPhones.length > 0);
  }, [formData.alternativeFirstNames.length, formData.alternativeLastNames.length, formData.additionalEmails.length, formData.additionalPhones.length]);

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
        // Only validate format if phone is provided
        if (value.trim() && !/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, ''))) {
          newErrors.primaryPhone = 'Please enter a valid phone number';
        }
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
    
    const newEntry = addToWatchlist(formData);
    
    // If this was promoted from a visitor, update the visitor's watchlist status
    const visitorId = searchParams.get('visitorId');
    if (visitorId) {
      updateVisitorWatchlistStatus(visitorId, true, 'High risk');
    }
    
    // Navigate to watchlist page with success message
    const message = visitorId 
      ? `${formData.firstName} ${formData.lastName} was successfully promoted to the Watchlist`
      : `${formData.firstName} ${formData.lastName} was successfully added to the Watchlist`;
      
    navigate('/watchlist', { 
      state: { 
        showToast: true, 
        toastMessage: message,
        toastType: 'success'
      } 
    });
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
    // Auto-hide section if no alternative first names remain
    if (formData.alternativeFirstNames.length === 1) {
      setShowAlternativeFirstNamesSection(false);
    }
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
    // Auto-hide section if no alternative last names remain
    if (formData.alternativeLastNames.length === 1) {
      setShowAlternativeLastNamesSection(false);
    }
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
    // Auto-hide section if no additional emails remain
    if (formData.additionalEmails.length === 1) {
      setShowAdditionalEmailsSection(false);
    }
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
    // Auto-hide section if no additional phones remain
    if (formData.additionalPhones.length === 1) {
      setShowAdditionalPhonesSection(false);
    }
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

  return (
    <div className="max-w-2xl space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <Link to="/watchlist" className="hover:text-gray-700">Watchlist</Link>
        <span>/</span>
        <span>Add to watchlist</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Add to watchlist</h1>
        <p className="text-sm text-gray-600 mt-1">
          Enter the individual's full name, email, and phone number. Include their physical description,
          incident details, and reason for inclusion. Specify actions to take if they are encountered.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-6">
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
            
            {/* Add aliases button under First name */}
            {!showAlternativeFirstNamesSection ? (
              <button
                type="button"
                onClick={() => setShowAlternativeFirstNamesSection(true)}
                className="mt-3 inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add aliases, other names
              </button>
            ) : (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="px-3 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
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
            
            {/* Add aliases button under Last name */}
            {!showAlternativeLastNamesSection ? (
              <button
                type="button"
                onClick={() => setShowAlternativeLastNamesSection(true)}
                className="mt-3 inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add aliases, other names
              </button>
            ) : (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="px-3 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primary email
            </label>
            <input
              type="email"
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
            
            {/* Add another email button under Primary email */}
            {!showAdditionalEmailsSection ? (
              <button
                type="button"
                onClick={() => setShowAdditionalEmailsSection(true)}
                className="mt-3 inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add another email
              </button>
            ) : (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="px-3 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
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
            
            {/* Add another phone button under Primary phone */}
            {!showAdditionalPhonesSection ? (
              <button
                type="button"
                onClick={() => setShowAdditionalPhonesSection(true)}
                className="mt-3 inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add another phone
              </button>
            ) : (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional phone(s)
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
                    className="px-3 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reported By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reported by (Optional)
          </label>
          <input
            type="text"
            value={formData.reportedBy}
            onChange={(e) => handleFieldChange('reportedBy', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="The tenant who reported this individual."
          />
        </div>

        {/* Watchlist Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Watchlist level *
          </label>
          <div className="relative">
            <select
              value={formData.level}
              onChange={(e) => handleFieldChange('level', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
            >
              <option value="High risk">High risk</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
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
            onChange={(e) => handleFieldChange('notes', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Please include any relevant context, physical descriptions, or reasons for inclusion on the watchlist."
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500">
              Please include any relevant context, physical descriptions, or reasons for inclusion on the watchlist.
            </p>
            <span className="text-xs text-gray-400">
              {formData.notes.length} / 500
            </span>
          </div>
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
          <Link
            to="/watchlist"
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 text-center"
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
  );
};

export default AddToWatchlistPage;