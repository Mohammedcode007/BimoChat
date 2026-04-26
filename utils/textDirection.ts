// src/utils/textDirection.ts

export const isArabicText = (value?: string) => {
  const text = String(value || "").trim();

  const firstLetter =
    text.match(/[A-Za-z\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/)?.[0] || "";

  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(firstLetter);
};

export const getTextDirectionStyle = (value?: string) => {
  const isArabic = isArabicText(value);

  return {
    textAlign: isArabic ? ("right" as const) : ("left" as const),
    writingDirection: isArabic ? ("rtl" as const) : ("ltr" as const),
  };
};