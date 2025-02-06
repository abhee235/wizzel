import { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface InlineEditableLabelProps {
  initialValue: string;
  onSave: (newValue: string) => void; // Callback when value is saved
  className?: string;
  inputClassName?: string;
}

export default function InlineEditableLabel({
  initialValue,
  onSave,
  className,
  inputClassName,
}: InlineEditableLabelProps) {
  const [isEditing, setIsEditing] = useState(false); // Track if editing is active
  const [value, setValue] = useState(initialValue); // Track the label value
  const inputRef = useRef<HTMLInputElement>(null); // Reference to the input field

  // Handle saving the edited value
  const handleSave = () => {
    setIsEditing(false); // Switch back to label view
    onSave(value); // Call the onSave callback with the updated value
  };

  // Handle key events (e.g., Enter to save, Escape to cancel)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave(); // Save on Enter key
    } else if (e.key === 'Escape') {
      setIsEditing(false); // Cancel editing on Escape
      setValue(initialValue); // Revert to the initial value
    }
  };

  // Automatically focus the input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div className={cn('inline-block', className)}>
      {isEditing ? (
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave} // Save the value on blur
          onKeyDown={handleKeyDown} // Handle key events
          className={cn(
            inputClassName,
            'border border-gray-300 rounded px-2 py-1 w-full'
          )}
        />
      ) : (
        <span
          onClick={() => setIsEditing(true)} // Switch to edit mode on click
          className={cn(
            inputClassName,
            'cursor-pointer font-medium text-gray-700 hover:underline'
          )}
        >
          {initialValue || 'Click to edit'} {/* Display the label value */}
        </span>
      )}
    </div>
  );
}
