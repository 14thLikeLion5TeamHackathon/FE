import Chip from '../../../components/Chip';
import { cn } from '../../../lib/cn';
import { SYMPTOM_LABEL, type SymptomKey } from '../../../types/common';

interface SymptomSelectBlockProps {
  selectedSymptoms: SymptomKey[];
  onToggleSymptom?: (symptom: SymptomKey) => void;
  disabled?: boolean;
}

export default function SymptomSelectBlock({
  selectedSymptoms,
  onToggleSymptom,
  disabled = false,
}: SymptomSelectBlockProps) {
  return (
    <div className="flex w-full items-start gap-2">
      {selectedSymptoms.map((key) => {
        const isSelected = selectedSymptoms.includes(key);
        return (
          <Chip
            key={key}
            className={cn(
              'flex-1 justify-center px-3 py-[6px] text-center transition-colors border',
              disabled ? 'cursor-default' : 'cursor-pointer',
              isSelected
                ? 'border-primary bg-primary-tint text-primary'
                : 'border-border-strong bg-transparent text-text-secondary',
            )}
            onClick={disabled ? undefined : () => onToggleSymptom?.(key)}
          >
            {SYMPTOM_LABEL[key] ?? key}
          </Chip>
        );
      })}
    </div>
  );
}
