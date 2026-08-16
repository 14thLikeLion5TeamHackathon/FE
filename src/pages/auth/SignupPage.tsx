import { useState } from 'react';
import { useNavigate } from 'react-router';

import BottomCTA from '../../components/BottomCTA';
import Card from '../../components/Card';
import Checkbox from '../../components/Checkbox';
import DateField from '../../components/DateField';
import NavHeader from '../../components/NavHeader';
import ProgressBar from '../../components/ProgressBar';
import Segment from '../../components/Segment';
import { useOnboarding } from '../../hooks/user/useUser';
import { cn } from '../../lib/cn';
import { toDateInputValue } from '../../lib/date';
import { GENDER_LABEL, type Gender } from '../../types/user';
import AgreementItem from './components/AgreementItem';
import LabeledField from './components/LabeledField';
import SegmentGroup from './components/SegmentGroup';

type Visited = 'VISITED' | 'FIRST';

const VISITED_LABEL: Record<Visited, string> = {
  VISITED: '방문해봤어요',
  FIRST: '처음이에요',
};

type Agreements = {
  personalInfo: boolean;
  healthData: boolean;
  scheduleData: boolean;
};

/**
 * 회원가입 — 기본 정보 → 약관 동의 2스텝.
 * 담당: 윤서
 */
export default function SignupPage() {
  const navigate = useNavigate();

  const { mutate: onboard, isPending, isError } = useOnboarding();

  const [step, setStep] = useState<1 | 2>(1);

  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [visited, setVisited] = useState<Visited | null>(null);

  const [agreements, setAgreements] = useState<Agreements>({
    personalInfo: false,
    healthData: false,
    scheduleData: false,
  });

  const isStep1Valid =
    name.trim() !== '' && birthDate.trim() !== '' && gender !== null && visited !== null;

  const isAllAgreed = agreements.personalInfo && agreements.healthData && agreements.scheduleData;
  const isStep2Valid = agreements.personalInfo && agreements.healthData;

  const toggleAgreement = (key: keyof Agreements) => () => {
    setAgreements((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAll = () => {
    const next = !isAllAgreed;
    setAgreements({ personalInfo: next, healthData: next, scheduleData: next });
  };

  const handleSubmit = () => {
    onboard(
      {
        name: name.trim(),
        // 화면 상태는 "2007.05.17", 서버는 "2007-05-17"을 받는다
        birthDate: toDateInputValue(birthDate),
        gender: gender ?? undefined,
        agreePersonalInfo: agreements.personalInfo,
        agreeHealthData: agreements.healthData,
        agreeCalendarData: agreements.scheduleData,
        hasAacOfflineExperience: visited === 'VISITED',
      },
      { onSuccess: () => navigate('/') },
    );
  };

  return (
    <div className="flex flex-col gap-3.5 px-5 pt-5 pb-28">
      <NavHeader title="회원가입" />
      <ProgressBar value={step} max={2} label={`회원가입 ${step}/2단계`} />

      {step === 1 ? (
        <div className="flex flex-col gap-5">
          <div>
            <h2 className="typo-title">회원정보</h2>
            <p className="typo-body text-text-secondary mt-1">
              서비스 이용을 위한 기본 정보를 입력해주세요
            </p>
          </div>

          <LabeledField
            label="이름"
            placeholder="이름을 입력해주세요"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="flex flex-col gap-2">
            <p className="typo-label text-text-primary">
              생년월일 <span className="text-primary">*</span>
            </p>
            <DateField value={birthDate} onChange={setBirthDate} />
          </div>

          <SegmentGroup label="성별">
            {(Object.keys(GENDER_LABEL) as Gender[]).map((value) => (
              <Segment key={value} selected={gender === value} onClick={() => setGender(value)}>
                {GENDER_LABEL[value]}
              </Segment>
            ))}
          </SegmentGroup>

          <div className="flex flex-col gap-2">
            <SegmentGroup label="AAC 오프라인 매장 방문 경험">
              {(Object.keys(VISITED_LABEL) as Visited[]).map((value) => (
                <Segment
                  key={value}
                  selected={visited === value}
                  onClick={() => setVisited(value)}
                >
                  {VISITED_LABEL[value]}
                </Segment>
              ))}
            </SegmentGroup>
            <p className="typo-caption text-text-tertiary">
              방문 경험에 따라 첫 화면 구성이 달라져요
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div>
            <h2 className="typo-title">약관 동의</h2>
            <p className="typo-body text-text-secondary mt-1">
              AAC 맞춤 케어 서비스를 위해 동의가 필요합니다
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            <Card
              variant="block"
              className={cn(
                'border',
                isAllAgreed ? 'border-primary border-[1.5px]' : 'border-transparent',
              )}
            >
              <div className="flex items-center gap-2.5">
                <Checkbox checked={isAllAgreed} onChange={toggleAll} aria-label="전체 동의하기" />
                <span className="typo-body text-text-primary">전체 동의하기</span>
              </div>
            </Card>

            <AgreementItem
              required
              title="개인정보 수집 및 처리 동의"
              checked={agreements.personalInfo}
              onToggle={toggleAgreement('personalInfo')}
            />
            <AgreementItem
              required
              title="건강·시술 데이터 연동 동의"
              description="AAC 매장 방문 및 시술 정보 수신에 동의합니다"
              checked={agreements.healthData}
              onToggle={toggleAgreement('healthData')}
            />
            <AgreementItem
              title="일정 데이터 활용 동의"
              description="캘린더 일정을 분석해 전날 밤 사전 경고를 보내드려요"
              checked={agreements.scheduleData}
              onToggle={toggleAgreement('scheduleData')}
            />
          </div>

          <p className="typo-caption text-text-tertiary">
            일정 동의는 선택이에요. 동의하지 않아도 가입할 수 있고, 이 경우 사전 경고와 일정 기반
            안내 없이 D-day·환경 지표만으로 안내해드려요.
          </p>

          {/* 실패해도 화면이 그대로면 사용자는 버튼이 안 먹은 줄 안다 */}
          {isError && (
            <p className="typo-caption text-danger">
              가입에 실패했어요. 잠시 후 다시 시도해주세요.
            </p>
          )}
        </div>
      )}

      <BottomCTA
        label={step === 1 ? '다음' : isPending ? '가입 중...' : '가입 완료하기'}
        disabled={step === 1 ? !isStep1Valid : !isStep2Valid || isPending}
        onClick={step === 1 ? () => setStep(2) : handleSubmit}
      />
    </div>
  );
}
