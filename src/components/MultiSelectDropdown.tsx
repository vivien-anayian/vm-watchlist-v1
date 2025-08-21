import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface MultiSelectOption {
  id: string;
  name: string;
  type: 'security' | 'member' | 'team';
}

interface MultiSelectDropdownProps {
  options: MultiSelectOption[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  placeholder?: string;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  options,
  selectedIds,
  onChange,
  placeholder = "Select recipients"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggleOption = (optionId: string) => {
    const newSelectedIds = selectedIds.includes(optionId)
      ? selectedIds.filter(id => id !== optionId)
      : [...selectedIds, optionId];
    
    onChange(newSelectedIds);
  };

  const getDisplayText = () => {
    if (selectedIds.length === 0) {
      return placeholder;
    }
    
    if (selectedIds.length === 1) {
      const selectedOption = options.find(option => option.id === selectedIds[0]);
      return selectedOption ? selectedOption.name : placeholder;
    }
    
    return `${selectedIds.length} groups selected`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 flex items-center justify-between"
      >
        <span className="text-sm text-gray-900 truncate">
          {getDisplayText()}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="py-1">
            {options.map((option) => {
              const isSelected = selectedIds.includes(option.id);
              return (
                <div
                  key={option.id}
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-50 ${
                    isSelected ? 'bg-gray-100' : ''
                  }`}
                  onClick={() => handleToggleOption(option.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      isSelected 
                        ? 'bg-indigo-600 border-indigo-600' 
                        : 'border-gray-300 bg-white'
                    }`}>
                      {isSelected && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className="text-sm text-gray-900">
                      {option.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;