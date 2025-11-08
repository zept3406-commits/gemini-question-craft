import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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

// API Key rotation manager
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
    // Find next valid key
    const startIndex = this.currentIndex;
    let attempts = 0;

    while (attempts < this.keys.length) {
      const key = this.keys[this.currentIndex];
      const errorCount = this.errorCounts.get(key) || 0;
      const lastError = this.lastErrorTime.get(key) || 0;
      const timeSinceLastError = Date.now() - lastError;

      // Skip keys with 3+ errors unless 60 seconds passed
      if (errorCount < 3 || timeSinceLastError > 60000) {
        return key;
      }

      this.currentIndex = (this.currentIndex + 1) % this.keys.length;
      attempts++;
    }

    // If all keys are problematic, reset and return first
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

  // Calculate proportional distribution
  topicsWithWeightage.forEach((tw) => {
    const count = Math.floor(
      (totalQuestions * (tw.weightage_percent || 0)) / 100
    );
    distribution.set(tw.topic_id, count);
    allocated += count;
  });

  // Distribute remaining questions
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
  // Fetch PYQs
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

  // Fetch already generated questions
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
  config: GenerationConfig
) {
  const contextQuestions = [...pyqs, ...existingNew]
    .map((q, i) => {
      let qText = `${i + 1}. ${q.question_statement}`;
      if (q.options) {
        q.options.forEach((opt: string, j: number) => {
          qText += `\n   ${String.fromCharCode(65 + j)}. ${opt}`;
        });
      }
      return qText;
    })
    .join("\n\n");

  return `You are an expert question generator for competitive exams. Your task is to generate ONE high-quality ${config.questionType} question.

**Topic**: ${topic.name}

**Topic Notes**:
${topic.notes || "No notes available"}

**Reference Questions** (Previous Year Questions and Already Generated):
${contextQuestions || "No reference questions available"}

**CRITICAL REQUIREMENTS**:
1. Generate a FRESH, UNIQUE question that is DIFFERENT from all reference questions
2. The question should be of similar or slightly higher difficulty
3. Use proper LaTeX formatting with $ for inline math and $$ for display math
4. For MCQ questions, provide exactly 4 options
5. DO NOT copy diagrams - if reference has diagrams, create a text-based alternative
6. Keep the question challenging but solvable

**Marking Scheme**:
- Correct: ${config.correctMarks} marks
- Incorrect: ${config.incorrectMarks} marks
- Skipped: ${config.skippedMarks} marks
- Time: ${config.timeMinutes} minutes

Return ONLY a valid JSON object with this exact structure:
{
  "question_statement": "The question text with proper LaTeX formatting",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "answer": "The correct option text",
  "solution": "Detailed solution with LaTeX formatting",
  "difficulty_level": "Medium"
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
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent",
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
              temperature: 0.9,
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error(`API Error (attempt ${attempt + 1}):`, error);
        apiKeyManager.markError(apiKey);

        if (attempt < maxRetries - 1) {
          console.log("Waiting 10 seconds before retry...");
          await sleep(10000);
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
      apiKeyManager.markError(apiKey);

      if (attempt < maxRetries - 1) {
        await sleep(10000);
      } else {
        throw error;
      }
    }
  }

  throw new Error("Max retries exceeded");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const config: GenerationConfig = await req.json();

    // Get API keys from localStorage (passed from client)
    const apiKeysStr = req.headers.get("x-api-keys");
    if (!apiKeysStr) {
      throw new Error("No API keys provided");
    }

    const apiKeys = JSON.parse(apiKeysStr);
    const apiKeyManager = new ApiKeyManager(apiKeys);

    // Fetch topics with weightage
    const topicsWithWeightage = await fetchTopicsWithWeightage(
      supabase,
      config.partId,
      config.slotId
    );

    // Calculate question distribution
    const distribution = await calculateQuestionDistribution(
      topicsWithWeightage,
      config.numQuestions
    );

    const generatedQuestions: any[] = [];
    let totalGenerated = 0;

    // Generate questions for each topic
    for (const [topicId, count] of distribution.entries()) {
      if (count === 0) continue;

      const topicData = topicsWithWeightage.find((t: any) => t.topic_id === topicId);
      if (!topicData || !topicData.topics) continue;

      const topic = topicData.topics;

      // Fetch existing questions for context
      const { pyqs, existingNew } = await fetchExistingQuestions(
        supabase,
        topicId,
        config
      );

      // Generate questions for this topic
      for (let i = 0; i < count; i++) {
        try {
          const prompt = buildPrompt(topic, pyqs, existingNew, config);
          const question = await generateQuestionWithRetry(
            apiKeyManager,
            prompt
          );

          // Save to database
          const { data: savedQuestion, error: saveError } = await supabase
            .from("new_questions")
            .insert({
              topic_id: topicId,
              topic_name: topic.name,
              chapter_id: topic.chapter_id,
              part_id: config.partId,
              slot_id: config.slotId,
              question_statement: question.question_statement,
              question_type: config.questionType,
              options: question.options || null,
              answer: question.answer || null,
              solution: question.solution || null,
              difficulty_level: question.difficulty_level || "Medium",
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
          } else {
            generatedQuestions.push(savedQuestion);
            existingNew.push(savedQuestion); // Add to context
            totalGenerated++;
          }

          // Small delay between questions
          await sleep(1000);
        } catch (error) {
          console.error(`Failed to generate question ${i + 1} for topic ${topic.name}:`, error);
        }
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
