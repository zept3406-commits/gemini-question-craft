// @ts-nocheck

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, x-api-keys",
};

interface GenerationConfig {
  courseId: string;
  partId: string;
  slotId: string | null;
  questionType: string;
  numQuestions: number;
  timeMinutes: number;
  correctMarks: number;
  incorrectMarks: number;
  skippedMarks: number;
  partialMarks: number;
  generationMode: string;
}

class ApiKeyManager {
  private keys: string[] = [];
  private currentIndex = 0;
  private errorCounts: Map<string, number> = new Map();
  private lastErrorTime: Map<string, number> = new Map();

  constructor(keys: string[]) {
    this.keys = keys;
    keys.forEach((key) => {
      this.errorCounts.set(key, 0);
      this.lastErrorTime.set(key, 0);
    });
  }

  getNextKey(): string {
    const startIndex = this.currentIndex;
    let attempts = 0;

    while (attempts < this.keys.length) {
      const key = this.keys[this.currentIndex];
      const errorCount = this.errorCounts.get(key) || 0;
      const lastError = this.lastErrorTime.get(key) || 0;
      const timeSinceLastError = Date.now() - lastError;

      if (errorCount < 3 || timeSinceLastError > 60000) {
        return key;
      }

      this.currentIndex = (this.currentIndex + 1) % this.keys.length;
      attempts++;
    }

    this.errorCounts.clear();
    this.lastErrorTime.clear();
    this.currentIndex = 0;
    return this.keys[0];
  }

  markSuccess(key: string) {
    this.errorCounts.set(key, 0);
    this.currentIndex = (this.currentIndex + 1) % this.keys.length;
  }

  markError(key: string) {
    const count = (this.errorCounts.get(key) || 0) + 1;
    this.errorCounts.set(key, count);
    this.lastErrorTime.set(key, Date.now());
    this.currentIndex = (this.currentIndex + 1) % this.keys.length;
  }
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchTopicsWithWeightage(
  supabase: any,
  partId: string,
  slotId: string | null
) {
  let query = supabase
    .from("topics_weightage")
    .select(
      `
      *,
      topics:topic_id (
        id,
        name,
        notes
      )
    `
    )
    .eq("part_id", partId);

  if (slotId) {
    query = query.eq("slot_id", slotId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data;
}

async function calculateQuestionDistribution(
  topicsWithWeightage: any[],
  totalQuestions: number
) {
  const distribution: Map<string, number> = new Map();
  let allocated = 0;

  topicsWithWeightage.forEach((tw) => {
    const count = Math.floor(
      (totalQuestions * (tw.weightage_percent || 0)) / 100
    );
    distribution.set(tw.topic_id, count);
    allocated += count;
  });

  const remaining = totalQuestions - allocated;
  if (remaining > 0 && topicsWithWeightage.length > 0) {
    const firstTopic = topicsWithWeightage[0].topic_id;
    distribution.set(firstTopic, (distribution.get(firstTopic) || 0) + remaining);
  }

  return distribution;
}

async function fetchExistingQuestions(
  supabase: any,
  topicId: string,
  config: GenerationConfig
) {
  let pyqQuery = supabase
    .from("questions_topic_wise")
    .select("*")
    .eq("topic_id", topicId)
    .eq("question_type", config.questionType);

  if (config.partId) {
    pyqQuery = pyqQuery.eq("part_id", config.partId);
  }
  if (config.slotId) {
    pyqQuery = pyqQuery.eq("slot_id", config.slotId);
  }

  const { data: pyqs } = await pyqQuery.limit(50);

  let newQuery = supabase
    .from("new_questions")
    .select("*")
    .eq("topic_id", topicId)
    .eq("question_type", config.questionType);

  if (config.partId) {
    newQuery = newQuery.eq("part_id", config.partId);
  }
  if (config.slotId) {
    newQuery = newQuery.eq("slot_id", config.slotId);
  }

  const { data: existingNew } = await newQuery.limit(50);

  return {
    pyqs: pyqs || [],
    existingNew: existingNew || [],
  };
}

function buildPrompt(
  topic: any,
  pyqs: any[],
  existingNew: any[],
  config: GenerationConfig,
  questionNumber: number
) {
  const allQuestions = [...pyqs, ...existingNew];
  const sampledQuestions = [];
  
  if (allQuestions.length > 0) {
    const take = Math.min(8, allQuestions.length);
    const start = Math.floor(Math.random() * Math.max(1, allQuestions.length - take));
    const interval = Math.max(1, Math.floor(allQuestions.length / take));
    for (let i = 0; i < take; i++) {
      const idx = (start + i * interval) % allQuestions.length;
      sampledQuestions.push(allQuestions[idx]);
    }
  }

  const contextQuestions = sampledQuestions
    .map((q, i) => {
      let qText = `Example ${i + 1}. ${q.question_statement}`;
      if (q.options) {
        q.options.forEach((opt: string, j: number) => {
          qText += `\n   ${String.fromCharCode(65 + j)}. ${opt}`;
        });
      }
      return qText;
    })
    .join("\n\n");

  return `You are an expert question generator for competitive exams. Generate ONE UNIQUE ${config.questionType} question (Question #${questionNumber}).

**Topic**: ${topic.name}

**Topic Notes** (USE THESE CONCEPTS IN YOUR SOLUTION):
${topic.notes || "No notes available"}

**Reference Examples** (For style reference ONLY - DO NOT copy patterns):
${contextQuestions || "No reference available"}

**CRITICAL REQUIREMENTS FOR VARIETY**:
1. This is question #${questionNumber} - Make it COMPLETELY DIFFERENT from examples above
2. Cover DIFFERENT aspects/subtopics within "${topic.name}"
3. Use DIFFERENT problem-solving approaches than examples
4. Vary the context, numbers, and scenario from all examples
5. If examples use formulas A, B, C - you can use formula D or combine differently
6. DO NOT copy problem structures - create fresh scenarios

**ANSWER VALIDATION REQUIREMENTS**:
1. For MCQ: The answer MUST be EXACTLY one of the 4 options (copy the exact text)
2. For MSQ: The answer MUST list EXACTLY the correct option letters (e.g., "A, C")
3. VERIFY your answer matches an option before responding
4. The solution MUST clearly show why the answer is correct using topic notes concepts

**FORMATTING REQUIREMENTS**:
1. Use LaTeX: $ for inline math, $$ for display math
2. For MCQ: Provide EXACTLY 4 distinct options
3. For MSQ: Provide 4-6 options, mark 2-3 as correct
4. NO diagrams - use text descriptions only

**SOLUTION REQUIREMENTS**:
1. Base solution on concepts from Topic Notes above
2. Explain step-by-step using formulas/concepts from notes
3. Student should feel notes are sufficient for solving

**Marking Scheme**:
- Correct: ${config.correctMarks} marks
- Incorrect: ${config.incorrectMarks} marks
- Time: ${config.timeMinutes} minutes

Return ONLY valid JSON:
{
  "question_statement": "Fresh unique question with LaTeX",
  "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
  "answer": "EXACT text of correct option",
  "solution": "Step-by-step using Topic Notes concepts",
  "difficulty_level": "Easy/Medium/Hard"
}`;
}

async function generateQuestionWithRetry(
  apiKeyManager: ApiKeyManager,
  prompt: string,
  maxRetries = 3
): Promise<any> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const apiKey = apiKeyManager.getNextKey();

    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: 0.8,
              maxOutputTokens: 1024,
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error(`API Error (attempt ${attempt + 1}):`, error);
        
        // Check if API key is leaked
        if (error.includes("reported as leaked") || error.includes("PERMISSION_DENIED")) {
          throw new Error("API key has been flagged as leaked. Please provide a new API key that hasn't been compromised.");
        }
        
        apiKeyManager.markError(apiKey);

        if (attempt < maxRetries - 1) {
          await sleep(2000); // Reduced from 5s to 2s
          continue;
        }
        throw new Error(`API request failed: ${error}`);
      }

      const data = await response.json();
      apiKeyManager.markSuccess(apiKey);

      const text = data.candidates[0].content.parts[0].text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error("No valid JSON found in response");
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error(`Generation error (attempt ${attempt + 1}):`, error);
      
      // Don't retry if it's a leaked key error
      if (error instanceof Error && error.message.includes("leaked")) {
        throw error;
      }
      
      apiKeyManager.markError(apiKey);

      if (attempt < maxRetries - 1) {
        await sleep(2000); // Reduced from 5s to 2s
      } else {
        throw error;
      }
    }
  }

  throw new Error("Max retries exceeded");
}

async function verifyQuestionAnswer(
  apiKeyManager: ApiKeyManager,
  question: any,
  topicNotes: string,
  questionType: string
): Promise<any> {
  const apiKey = apiKeyManager.getNextKey();

  const verificationPrompt = `You are a question quality checker. Verify and FIX issues only if needed.

**Question**: ${question.question_statement}

${question.options ? `**Options**:\n${question.options.map((opt: string, i: number) => `${String.fromCharCode(65 + i)}. ${opt}`).join('\n')}` : ''}

**Stated Answer**: ${question.answer}

**Solution**: ${question.solution}

**Topic Notes** (MUST use these concepts in the solution):
${topicNotes}

Rules:
- For MCQ: The answer MUST be EXACTLY one of the 4 options (copy the exact option text)
- For MSQ: Answer MUST be letters of all correct options (e.g., "A, C")
- Ensure solution uses the Topic Notes concepts and is step-by-step
- If everything is correct, return the original as-is

Return ONLY valid JSON:
{
  "question_statement": "(same or corrected)",
  "options": ["(same or corrected options)"],
  "answer": "(correct format as per rules)",
  "solution": "(same or improved solution using notes)",
  "difficulty_level": "Easy|Medium|Hard"
}`;

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: verificationPrompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 512,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("Verification failed, using original");
      return question;
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return question;

    const verified = JSON.parse(jsonMatch[0]);
    return {
      ...question,
      question_statement: verified.question_statement || question.question_statement,
      options: verified.options || question.options,
      answer: verified.answer || question.answer,
      solution: verified.solution || question.solution,
      difficulty_level: verified.difficulty_level || question.difficulty_level || "Medium",
    };
  } catch (e) {
    console.error("Verification error:", e);
    return question;
  }
}


Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const config: GenerationConfig = await req.json();

    const secretKey = Deno.env.get("GEMINI_API_KEY") || "";
    let headerKeys: string[] = [];
    const headerRaw = req.headers.get("x-api-keys");
    if (headerRaw) {
      try { headerKeys = JSON.parse(headerRaw); } catch {}
    }
    const allKeys = [secretKey, ...headerKeys].filter(Boolean);
    if (allKeys.length === 0) {
      throw new Error("No API keys configured. Set GEMINI_API_KEY secret or pass x-api-keys header (JSON array).");
    }

    const apiKeyManager = new ApiKeyManager(allKeys);

    const topicsWithWeightage = await fetchTopicsWithWeightage(
      supabase,
      config.partId,
      config.slotId
    );

    const distribution = await calculateQuestionDistribution(
      topicsWithWeightage,
      config.numQuestions
    );

    const generatedQuestions: any[] = [];
    let totalGenerated = 0;

    for (const [topicId, count] of distribution.entries()) {
      if (count === 0) continue;

      const topicData = topicsWithWeightage.find((t: any) => t.topic_id === topicId);
      if (!topicData || !topicData.topics) continue;

      const topic = topicData.topics;

      const { pyqs, existingNew } = await fetchExistingQuestions(
        supabase,
        topicId,
        config
      );

      for (let i = 0; i < count; i++) {
        let attempts = 0;
        const maxAttempts = 2; // Reduced from 3 to 2
        
        while (attempts < maxAttempts) {
          try {
            console.log(`Generating question ${totalGenerated + 1} for topic: ${topic.name}`);
            
            const prompt = buildPrompt(topic, pyqs, existingNew, config, totalGenerated + 1);
            const question = await generateQuestionWithRetry(
              apiKeyManager,
              prompt
            );

            // Conditional verification to ensure answer-options consistency and solution quality
            let finalQuestion = question;
            const qType = (config.questionType || "").toUpperCase();
            const hasOptions = Array.isArray(question.options) && question.options.length >= 4;

            const isMCQ = qType.includes("MCQ");
            const isMSQ = qType.includes("MSQ");

            const answerMismatch = (() => {
              if (!hasOptions || !question.answer) return true;
              if (isMCQ) {
                return !question.options.some((opt: string) => (question.answer || "").trim() === (opt || "").trim());
              }
              if (isMSQ) {
                // Expect letters like "A, C" referencing existing options
                const letters = String(question.answer).split(/[,\s]+/).filter(Boolean);
                return letters.some((l: string) => {
                  const idx = l.trim().toUpperCase().charCodeAt(0) - 65;
                  return idx < 0 || idx >= question.options.length;
                });
              }
              return false;
            })();

            if ((isMCQ || isMSQ) && (answerMismatch || !question.solution || String(question.solution).length < 60)) {
              finalQuestion = await verifyQuestionAnswer(apiKeyManager, question, topic.notes || "", config.questionType);
            }

            const { data: savedQuestion, error: saveError } = await supabase
              .from("new_questions")
              .insert({
                topic_id: topicId,
                topic_name: topic.name,
                chapter_id: topic.chapter_id,
                part_id: config.partId,
                slot_id: config.slotId,
                question_statement: finalQuestion.question_statement,
                question_type: config.questionType,
                options: finalQuestion.options || null,
                answer: finalQuestion.answer || null,
                solution: finalQuestion.solution || null,
                difficulty_level: finalQuestion.difficulty_level || "Medium",
                correct_marks: config.correctMarks,
                incorrect_marks: config.incorrectMarks,
                skipped_marks: config.skippedMarks,
                partial_marks: config.partialMarks,
                time_minutes: config.timeMinutes,
                status: "generated",
              })
              .select()
              .single();

            if (saveError) {
              console.error("Save error:", saveError);
              attempts++;
              continue;
            }
            
            console.log(`Successfully generated and saved question ${totalGenerated + 1}`);
            generatedQuestions.push(savedQuestion);
            existingNew.push(savedQuestion);
            totalGenerated++;
            break;

          } catch (error) {
            console.error(`Attempt ${attempts + 1} failed for question ${i + 1}:`, error);
            
            // If it's a leaked key error, fail immediately
            if (error instanceof Error && error.message.includes("leaked")) {
              throw error;
            }
            
            attempts++;
            if (attempts < maxAttempts) {
              await sleep(1000); // Reduced from 3s to 1s
            }
          }
        }

        if (attempts >= maxAttempts) {
          console.error(`Failed to generate question after ${maxAttempts} attempts for topic ${topic.name}`);
        }

        await sleep(500); // Reduced from 1500ms to 500ms
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        questions: generatedQuestions,
        totalGenerated,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});