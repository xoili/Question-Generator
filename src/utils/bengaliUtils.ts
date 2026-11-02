// Bengali digit mappings
const englishToBengaliDigitsMap: Record<string, string> = {
  '0': '০',
  '1': '১',
  '2': '২',
  '3': '৩',
  '4': '৪',
  '5': '৫',
  '6': '৬',
  '7': '৭',
  '8': '৮',
  '9': '৯',
};

const bengaliToEnglishDigitsMap: Record<string, string> = {
  '০': '0',
  '১': '1',
  '২': '2',
  '৩': '3',
  '৪': '4',
  '৫': '5',
  '৬': '6',
  '৭': '7',
  '৮': '8',
  '৯': '9',
};

export const toBengaliDigits = (num: number | string | undefined | null): string => {
  if (num === undefined || num === null || num === '') return '';
  return String(num).replace(/[0-9]/g, (match) => englishToBengaliDigitsMap[match] || match);
};

export const toEnglishDigits = (str: string | undefined | null): string => {
  if (!str) return '';
  return String(str).replace(/[০-৯]/g, (match) => bengaliToEnglishDigitsMap[match] || match);
};

export const bengaliSubQuestionKeys = ['ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ', 'ছ', 'জ'];

export const getBengaliQuestionNumber = (index: number): string => {
  return toBengaliDigits(index + 1);
};

export const calculateTotalMarks = (questions: { marks: number }[]): number => {
  return questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
};

export const defaultInstructions =
  '[বিশেষ নির্দেশাবলী: ডান পাশের সংখ্যা প্রশ্নের পূর্ণমান জ্ঞাপক। ক-বিভাগ থেকে ৩টি এবং খ-বিভাগ থেকে ৪টি সহ মোট ৭টি প্রশ্নের উত্তর দাও। প্রতিটি সৃজনশীল প্রশ্নের মান ১০। পরিচ্ছন্ন হাতের লেখার জন্য অতিরিক্ত মূল্যায়ন করা হবে।]';
