import Segment from '../../../components/Segment';
import { cn } from '../../../lib/cn';
import { SYMPTOM_LABEL, type Intensity, type SymptomKey } from '../../../types/common';

const INTENSITY_OPTIONS: { label: string; value: Intensity }[] = [
  { label: '없음', value: 0 },
  { label: '약간', value: 1 },
  { label: '보통', value: 2 },
  { label: '심함', value: 3 },
];

interface IntensitySelectBlockProps {
  selectedSymptoms: SymptomKey[];
  symptomLevels: Record<SymptomKey, Intensity>;
  onChangeIntensity: (symptom: SymptomKey, level: Intensity) => void;
}

export default function IntensitySelectBlock({
  selectedSymptoms,
  symptomLevels,
  onChangeIntensity,
}: IntensitySelectBlockProps) {
  return (
    <div className="flex w-full flex-col gap-[10px]">
      {selectedSymptoms.map((symptomKey) => (
        <div key={symptomKey} className="flex w-full items-center gap-[10px]">
          <span className="typo-body w-12 shrink-0 text-text-secondary">
            {SYMPTOM_LABEL[symptomKey]}
          </span>

          <div className="flex flex-1 items-center gap-[2px] rounded-btn bg-surface-fill p-[3px]">
            {INTENSITY_OPTIONS.map((option) => {
              const isSelected = symptomLevels[symptomKey] === option.value;
              return (
                <Segment
                  key={option.value}
                  selected={isSelected}
                  className={cn(
                    'typo-body border-none rounded-[6px] py-[6px] px-0',
                    isSelected
                      ? 'bg-primary text-primary-on'
                      : 'bg-transparent text-text-secondary'
                  )}
                  onClick={() => onChangeIntensity(symptomKey, option.value)}
                >
                  {option.label}
                </Segment>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}