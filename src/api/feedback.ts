import { AiFeedbackResponse, toAiFeedback, type AiFeedback } from '../types/feedback';
import axiosInstance from './axiosInstance';
import { getResult } from './helpers';
import { HttpStatus, type ApiError, type ApiResponse } from './types';

const path = (recordId: string) => `/api/v1/now/records/${recordId}/feedback`;

/**
 * 기록 하나에 대한 AI 피드백.
 *
 * **기록을 저장해도 피드백이 같이 만들어지지는 않는다.** 조회하면 404
 * (`AI_FEEDBACK_NOT_FOUND`)가 나고, POST로 생성해야 생긴다. 그래서 없으면 한 번 만든다.
 *
 * 생성은 하루 3회 제한(`feedbackQuota`)이 걸려 있다. 조회를 먼저 하는 이유가 이것이다 —
 * 이미 만든 피드백을 다시 볼 때는 횟수를 쓰지 않는다. 새로고침해도 마찬가지다.
 */
export async function getFeedback(recordId: string): Promise<AiFeedback> {
  try {
    const res = await axiosInstance.get<ApiResponse>(path(recordId));
    return toAiFeedback(AiFeedbackResponse.parse(getResult(res)));
  } catch (error) {
    if ((error as ApiError)?.status !== HttpStatus.NOT_FOUND) throw error;
    const created = await axiosInstance.post<ApiResponse>(path(recordId));
    return toAiFeedback(AiFeedbackResponse.parse(getResult(created)));
  }
}