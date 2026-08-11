import type { ComponentProps } from 'react';

import Field from '../../../components/Field';

type LabeledFieldProps = ComponentProps<typeof Field> & {
  label: string;
};

/** 라벨 + 필수 마커 + Field 한 세트. 회원가입 1단계 텍스트 입력에서만 쓴다. */
export default function LabeledField({ label, id, ...props }: LabeledFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="typo-label text-text-primary">
        {label} <span className="text-primary">*</span>
      </label>
      <Field id={id} {...props} />
    </div>
  );
}
