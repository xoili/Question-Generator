export type QuestionType = 'cq' | 'mcq' | 'short' | 'fill_in_the_blanks' | 'matching';

export interface MCQOption {
  label: string; // 'ক', 'খ', 'গ', 'ঘ'
  text: string;
  isCorrect?: boolean;
}

export interface CQSubQuestion {
  key: string; // 'ক', 'খ', 'গ', 'ঘ'
  text: string;
  marks: number;
  marksBn: string;
  cognitiveLevel?: string; // জ্ঞানমূলক, অনুধাবনমূলক, প্রয়োগমূলক, উচ্চতর দক্ষতা
}

export interface MatchingPair {
  left: string;
  right: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  sectionId?: string; // Optional section grouping e.g. "বিভাগ ক"
  numberBn: string; // e.g. "১", "২", "৩"
  title?: string;
  stimulus?: string; // উদ্দীপক / দৃশ্যপট
  instruction?: string; // যেমন: "নিচের উদ্দীপকটি পড় এবং প্রশ্নগুলোর উত্তর দাও:"
  text: string; // মূল প্রশ্ন
  marks: number;
  marksBn: string;
  options?: MCQOption[]; // For MCQ
  subQuestions?: CQSubQuestion[]; // For CQ
  matchingPairs?: MatchingPair[]; // For Matching
  answerHint?: string; // Solution or teacher reference
}

export interface ExamSection {
  id: string;
  name: string; // e.g. "ক-বিভাগ (সৃজনশীল প্রশ্ন)", "খ-বিভাগ (বহুনির্বাচনী প্রশ্ন)"
  instruction?: string; // e.g. "যেকোনো ৫টি প্রশ্নের উত্তর দাও:"
  totalMarks?: number;
}

export interface ExamHeader {
  instituteName: string;
  instituteSubTitle?: string;
  examTitle: string; // e.g. "বার্ষিক পরীক্ষা - ২০২৬"
  gradeClass: string; // e.g. "দশম শ্রেণি"
  sectionName?: string; // e.g. "শাখা: মেঘনা ও যমুনা"
  subject: string; // e.g. "বাংলা প্রথম পত্র"
  subjectCode: string; // e.g. "১০১"
  duration: string; // e.g. "২ ঘণ্টা ৩০ মিনিট"
  fullMarks: number; // e.g. ৭০ বা ১০০
  fullMarksBn: string; // e.g. "৭০" বা "১০০"
  instructions: string; // e.g. "[দ্রষ্টব্য: ডান পাশের সংখ্যা প্রশ্নের পূর্ণমান জ্ঞাপক...]"
  showMonogram: boolean;
  monogramUrl?: string;
  showWatermark: boolean;
  watermarkText: string;
  signature1: string; // e.g. "বিষয় শিক্ষক"
  signature2: string; // e.g. "পরীক্ষা নিয়ন্ত্রক"
  signature3: string; // e.g. "প্রধান শিক্ষক"
  showSignatures: boolean;
}

export interface PageSettings {
  layoutColumns: 1 | 2; // Single column or standard Bangladesh Board 2-column layout
  fontSize: 'sm' | 'base' | 'lg'; // 13.5px, 15px, 16.5px
  lineHeight: 'tight' | 'normal' | 'relaxed';
  headerStyle: 'standard' | 'formal-double-border' | 'minimal' | 'madrasah';
  showMarksInBrackets: boolean;
  bengaliNumerals: boolean;
  includeAnswerSheet: boolean;
}

export interface ExamPaper {
  id: string;
  header: ExamHeader;
  sections: ExamSection[];
  questions: Question[];
  settings: PageSettings;
}
