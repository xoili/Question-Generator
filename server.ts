import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to check Gemini availability
const getGenAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// API: Generate questions with Gemini
app.post('/api/generate-questions', async (req, res) => {
  try {
    const {
      subject = 'বাংলা প্রথম পত্র',
      gradeClass = 'দশম শ্রেণি',
      chapter = 'সকল অধ্যায়',
      questionType = 'cq', // 'cq' | 'mcq' | 'short' | 'fill_in_the_blanks' | 'matching'
      count = 2,
      difficulty = 'মধ্যম',
      customPrompt = '',
    } = req.body;

    const ai = getGenAIClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured in process.env.GEMINI_API_KEY. AI Studio injects this key from Secrets.',
      });
    }

    const typeDescriptions: Record<string, string> = {
      cq: 'সৃজনশীল প্রশ্ন (Creative Question - CQ) প্রতিটি প্রশ্নে একটি উদ্দীপক (stimulus/passage/scenario) থাকবে এবং চারটি উপ-প্রশ্ন থাকবে: (ক) জ্ঞানমূলক [১ নম্বর], (খ) অনুধাবনমূলক [২ নম্বর], (গ) প্রয়োগমূলক [৩ নম্বর], (ঘ) উচ্চতর দক্ষতামূলক [৪ নম্বর]। মোট ১০ নম্বর।',
      mcq: 'বহুনির্বাচনী প্রশ্ন (Multiple Choice Question - MCQ) প্রতিটি প্রশ্নে প্রশ্নবাক্য, চারটি বিকল্প (ক, খ, গ, ঘ) এবং সঠিক উত্তরের নির্দেশ থাকবে। প্রতিটি ১ নম্বর। সাধারণ বহুনির্বাচনী বা বহুপদী সমাপ্তিসূচক প্রশ্ন (i, ii, iii) অন্তর্ভুক্ত হতে পারে।',
      short: 'সংক্ষিপ্ত উত্তরীয় প্রশ্ন। প্রতিটি প্রশ্নে সুস্পষ্ট প্রশ্নবাক্য এবং বরাদ্দকৃত নম্বর (সাধারণত ১, ২ বা ৩ নম্বর)।',
      fill_in_the_blanks: 'শূন্যস্থান পূরণ প্রশ্ন। বাক্যের মধ্যে উপযুক্ত শূন্যস্থান চিহ্নিত থাকবে এবং বরাদ্দকৃত নম্বর থাকবে।',
      matching: 'মিলকরণ প্রশ্ন। ক-স্তম্ভ এবং খ-স্তম্ভ অনুযায়ী তথ্য সামঞ্জস্য করার জন্য প্রশ্ন।',
    };

    const typeGuide = typeDescriptions[questionType] || typeDescriptions.cq;

    const prompt = `আপনি বাংলাদেশ জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB) ও মাধ্যমিক/উচ্চ মাধ্যমিক শিক্ষা বোর্ডের পাঠ্যক্রমের অভিজ্ঞ শিক্ষক ও প্রশ্ন প্রণেতা।
নিম্নলিখিত তথ্যানুযায়ী খাঁটি বাংলায় মানসম্মত পরীক্ষার প্রশ্ন তৈরি করুন:

- বিষয়: ${subject}
- শ্রেণি: ${gradeClass}
- অধ্যায় বা বিষয়বস্তু: ${chapter}
- প্রশ্নের ধরন: ${questionType} (${typeGuide})
- মোট প্রশ্নের সংখ্যা: ${count} টি
- কাঠিন্যের স্তর: ${difficulty}
${customPrompt ? `- অতিরিক্ত শিক্ষকের নির্দেশনা: ${customPrompt}` : ''}

বিশেষ নির্দেশনা:
1. ভাষা হবে পরিশীলিত, প্রমিত বাংলা এবং ব্যাকরণগতভাবে নির্ভুল।
2. নম্বর বা ক্রমিক বাংলায় লিখুন (যেমন: ১, ২, ৩ বা (ক), (খ), (গ), (ঘ))।
3. সৃজনশীল প্রশ্ন হলে অবশ্যই উদ্দীপকটি আকর্ষণীয় ও প্রাসঙ্গিক বাস্তব জীবনের অথবা পাঠ্যবই সংক্রান্ত দৃশ্যপট নিয়ে লিখবেন।
4. বহুনির্বাচনী হলে ৪টি যুক্তিসঙ্গত বিকল্প অপশন দিন।
5. উত্তর বা মার্কিং স্কিম সহকারে পরিষ্কার কাঠামোতে আউটপুট দিন।`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are a premier educational question setter for Bangladeshi school/college examinations (NCTB curriculum). Return ONLY structured JSON following the requested schema without any markdown wrapping or backticks.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              description: 'Array of generated questions',
              items: {
                type: Type.OBJECT,
                properties: {
                  type: {
                    type: Type.STRING,
                    description: 'Question type: cq, mcq, short, fill_in_the_blanks, matching',
                  },
                  title: {
                    type: Type.STRING,
                    description: 'Brief title or topic heading in Bengali',
                  },
                  stimulus: {
                    type: Type.STRING,
                    description: 'Stimulus/Passage/উদ্দীপক (for CQ or context-based MCQ). Empty if not needed.',
                  },
                  instruction: {
                    type: Type.STRING,
                    description: 'Instruction text e.g. নিচের উদ্দীপকটি পড়ে সংশ্লিষ্ট প্রশ্নগুলোর উত্তর দাও:',
                  },
                  text: {
                    type: Type.STRING,
                    description: 'Main question statement or prompt in Bengali',
                  },
                  marks: {
                    type: Type.NUMBER,
                    description: 'Marks allocated (e.g. 10 for CQ, 1 for MCQ, 2 for short)',
                  },
                  marksBn: {
                    type: Type.STRING,
                    description: 'Marks in Bengali numerals e.g. ১০, ১, ২, ৫',
                  },
                  options: {
                    type: Type.ARRAY,
                    description: 'Options for MCQ questions (ক, খ, গ, ঘ)',
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        label: { type: Type.STRING, description: 'ক, খ, গ, ঘ or A, B, C, D' },
                        text: { type: Type.STRING, description: 'Option content' },
                        isCorrect: { type: Type.BOOLEAN, description: 'Whether this option is the correct answer' },
                      },
                      required: ['label', 'text'],
                    },
                  },
                  subQuestions: {
                    type: Type.ARRAY,
                    description: 'Sub-questions for Creative Questions (ক, খ, গ, ঘ)',
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        key: { type: Type.STRING, description: 'ক, খ, গ, or ঘ' },
                        text: { type: Type.STRING, description: 'Question text' },
                        marks: { type: Type.NUMBER, description: 'Marks: 1 for ক, 2 for খ, 3 for গ, 4 for ঘ' },
                        marksBn: { type: Type.STRING, description: '১, ২, ৩, ৪' },
                        cognitiveLevel: {
                          type: Type.STRING,
                          description: 'জ্ঞানমূলক / অনুধাবনমূলক / প্রয়োগমূলক / উচ্চতর দক্ষতা',
                        },
                      },
                      required: ['key', 'text', 'marks', 'marksBn'],
                    },
                  },
                  matchingPairs: {
                    type: Type.ARRAY,
                    description: 'Pairs for matching questions (Column A and Column B)',
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        left: { type: Type.STRING, description: 'ক-স্তম্ভ' },
                        right: { type: Type.STRING, description: 'খ-স্তম্ভ' },
                      },
                      required: ['left', 'right'],
                    },
                  },
                  answerHint: {
                    type: Type.STRING,
                    description: 'Brief hint or solution outline in Bengali for the teacher/evaluator',
                  },
                },
                required: ['type', 'marks'],
              },
            },
          },
          required: ['questions'],
        },
      },
    });

    const outputText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(outputText);
    } catch {
      // If parsing fails directly, attempt regex extraction
      const match = outputText.match(/\{[\s\S]*\}/);
      if (match) {
        parsedData = JSON.parse(match[0]);
      } else {
        throw new Error('Failed to parse AI output into JSON');
      }
    }

    return res.json({
      success: true,
      questions: parsedData.questions || [],
    });
  } catch (err: unknown) {
    console.error('Gemini generation error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred while generating questions';
    return res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

// Setup Vite or static files
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT} (mode: ${isProd ? 'production' : 'development'})`);
  });
}

startServer();
