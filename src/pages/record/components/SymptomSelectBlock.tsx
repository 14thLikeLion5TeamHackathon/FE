import Chip from '../../../components/Chip';
import { cn } from '../../../lib/cn';
import { SYMPTOM_LABEL, type SymptomKey } from '../../../types/common';

const ALL_SYMPTOMS: SymptomKey[] = ['REDNESS', 'SWELLING', 'PAIN', 'DRYNESS'];

interface SymptomSelectBlockProps {
  selectedSymptoms: SymptomKey[];
  onToggleSymptom: (symptom: SymptomKey) => void;
}

export default function SymptomSelectBlock({
  selectedSymptoms,
  onToggleSymptom,
}: SymptomSelectBlockProps) {
  return (
    <div className="flex w-full items-start gap-2">
      {ALL_SYMPTOMS.map((key) => {
        const isSelected = selectedSymptoms.includes(key);
        return (
          <Chip
            key={key}
            className={cn(
              'flex-1 cursor-pointer justify-center px-3 py-[6px] text-center transition-colors border',
              isSelected
                ? 'border-primary bg-primary-tint text-primary'
                : 'border-border-strong bg-transparent text-text-secondary'
            )}
            onClick={() => onToggleSymptom(key)}
          >
            {SYMPTOM_LABEL[key] ?? key}
          </Chip>
        );
      })}
    </div>
  );
}