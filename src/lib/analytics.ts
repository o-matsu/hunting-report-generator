import { Analytics, logEvent as firebaseLogEvent } from "firebase/analytics";
import type { FormValues } from "@/app/page";

// 共通のフォームデータ型
type FormDataParams = {
  submission_date?: string;
  capturer_name?: string;
  animal_gender?: string;
  capture_date?: string;
  capture_location?: string;
  diagram_number?: string;
  disposal_method?: string;
  has_photos: boolean;
};

export const logEvent = (
  analytics: Analytics | null,
  eventName: string,
  eventParams?: Record<string, unknown>
) => {
  if (!analytics) {
    // analyticsが初期化されていない場合（開発環境など）はコンソールログのみ出力
    console.log(`[Analytics Event]: ${eventName}`, eventParams);
    return;
  }

  firebaseLogEvent(analytics, eventName, eventParams);
};

// 共通のイベント名を定義
export const AnalyticsEventName = {
  // PDF関連
  PDF_GENERATION_START: "pdf_generation_start",
  PDF_GENERATION_SUCCESS: "pdf_generation_success",
  PDF_GENERATION_ERROR: "pdf_generation_error",
} as const;

// イベントパラメータの型定義
export type PDFGenerationParams = FormDataParams & {
  generation_time_ms?: number;
};

export type ErrorParams = {
  error_type: string;
  error_message: string;
  error_location: string;
  form_data?: FormDataParams;
};

// フォームデータをAnalyticsパラメータに変換するヘルパー関数
export const convertFormToAnalyticsParams = (values: FormValues): FormDataParams => {
  return {
    submission_date: values.submissionDate?.toISOString(),
    capturer_name: values.capturerName,
    animal_gender: values.animalGender,
    capture_date: values.captureDate?.toISOString(),
    capture_location: values.captureLocation,
    diagram_number: values.diagramNumber,
    disposal_method: values.disposalMethod,
    has_photos: Boolean(values.firstPhoto && values.secondPhoto),
  };
};