import { ReportReason } from "@/redux/slices/reportSlice";

export const TWEET_PREVIEW_LENGTH = 160;

export const PAGE_SIZE = 10;

export const REPORT_REASON_OPTIONS: { label: string; value: ReportReason }[] = [
  { label: "رسائل مزعجة", value: "spam" },
  { label: "تحرش أو إساءة", value: "harassment" },
  { label: "محتوى جنسي", value: "sexual" },
  { label: "عنف", value: "violence" },
  { label: "كراهية", value: "hate" },
  { label: "حساب مزيف", value: "fake_account" },
  { label: "احتيال", value: "scam" },
  { label: "أخرى", value: "other" },
];