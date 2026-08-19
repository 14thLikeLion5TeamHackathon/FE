import { useState } from 'react';
import { useNavigate } from 'react-router';

import BottomCTA from '../../components/BottomCTA';
import Card from '../../components/Card';
import Checkbox from '../../components/Checkbox';
import DateField from '../../components/DateField';
import NavHeader from '../../components/NavHeader';
import ProgressBar from '../../components/ProgressBar';
import Segment from '../../components/Segment';
import { useUpdateKakaoConsent } from '../../hooks/notification/useNotification';
import { useOnboarding } from '../../hooks/user/useUser';
import { cn } from '../../lib/cn';
import { toDateInputValue } from '../../lib/date';
import { TERMS, type Term, type TermId } from '../../lib/terms';
import { GENDER_LABEL, type Gender } from '../../types/user';
import AgreementItem from './components/AgreementItem';
import LabeledField from './components/LabeledField';
import SegmentGroup from './components/SegmentGroup';
import TermsSheet from './components/TermsSheet';

type Visited = 'VISITED' | 'FIRST';

const VISITED_LABEL: Record<Visited, string> = {
  VISITED: '방문해봤어요',
  FIRST: '처음이에요',
};

/** 약관 id → 동의 여부. 항목은 lib/terms의 TERMS가 단일 소스라 여기서 나열하지 않는다. */
type Agreements = Record<TermId, boolean>;

const NO_AGREEMENTS: Agreements = Object.fromEntries(
  TERMS.map((term) => [term.id, false]),
) as Agreements;

/**
 * 회원가입 — 기본 정보 → 약관 동의 2스텝.
 * 담당: 윤서
 */
export default function SignupPage() {
  const navigate = useNavigate();

  const { mutate: onboard, isPending, isError } = useOnboarding();
  const { mutate: setKakaoConsent } = useUpdateKakaoConsent();

  const [step, setStep] = useState<1 | 2>(1);

  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [visited, setVisited] = useState<Visited | null>(null);

  const [agreements, setAgreements] = useState<Agreements>(NO_AGREEMENTS);

  /** 전문 시트에 띄울 약관. null이면 닫힌 상태 */
  const [viewing, setViewing] = useState<Term | null>(null);

  const isStep1Valid =
    name.trim() !== '' && birthDate.trim() !== '' && gender !== null && visited !== null;

  const isAllAgreed = TERMS.every((term) => agreements[term.id]);
  /** 가입 조건은 **필수 약관만**이다. 선택 약관까지 요구하면 동의를 강제하는 게 된다. */
  const isStep2Valid = TERMS.every((term) => !term.required || agreements[term.id]);

  const toggleAgreement = (key: TermId) => () => {
    setAgreements((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAll = () => {
    const next = !isAllAgreed;
    setAgreements(Object.fromEntries(TERMS.map((term) => [term.id, next])) as Agreements);
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
      {
        onSuccess: () => {
          // 카카오 알림 동의는 온보딩 요청에 담을 자리가 없다(스펙에 필드가 없음) —
          // 가입이 끝난 뒤 따로 보낸다. **실패해도 가입을 막지 않는다.** 선택 약관이고,
          // 이 시점엔 카카오 연동 자체가 없어 서버가 거절할 수 있다(BE 확인 중).
          // 실패하면 알림만 안 올 뿐이고, 마이페이지 토글로 언제든 다시 켤 수 있다.
          // TODO(#85): 온보딩이 agreeKakaoNotification을 받아주면 이 호출을 지운다.
          if (agreements.kakaoNotification) setKakaoConsent(true);
          navigate('/');
        },
      },
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

            {TERMS.map((term) => (
              <AgreementItem
                key={term.id}
                required={term.required}
                title={term.title}
                badge={term.badge}
                description={term.summary}
                checked={agreements[term.id]}
                onToggle={toggleAgreement(term.id)}
                onView={() => setViewing(term)}
              />
            ))}
          </div>

          <p className="typo-caption text-text-tertiary">
            선택 항목은 동의하지 않아도 가입할 수 있어요. 일정 동의가 없으면 사전 경고 없이
            D-day·환경 지표만으로 안내하고, 카카오 알림 동의가 없으면 앱 내 푸시로 보내드려요.
            둘 다 마이페이지에서 언제든 바꿀 수 있어요.
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

      <TermsSheet term={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}
