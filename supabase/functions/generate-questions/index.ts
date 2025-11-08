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
  config: GenerationConfig,
  questionNumber: number
) {
  // Sample diverse questions for variety
  const allQuestions = [...pyqs, ...existingNew];
  const sampledQuestions = [];
  
  // Take questions at different intervals for diversity
  if (allQuestions.length > 0) {
    const interval = Math.max(1, Math.floor(allQuestions.length / 10));
    for (let i = 0; i < Math.min(10, allQuestions.length); i++) {
      const idx = (i * interval) % allQuestions.length;
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
          console.log("Waiting 5 seconds before retry...");
          await sleep(5000);
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
        await sleep(5000);
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
  topicNotes: string
): Promise<any> {
  const apiKey = apiKeyManager.getNextKey();

  const verificationPrompt = `You are a question quality checker. Verify this question and fix any issues.

**Question**: ${question.question_statement}

${question.options ? `**Options**:\n${question.options.map((opt: string, i: number) => `${String.fromCharCode(65 + i)}. ${opt}`).join('\n')}` : ''}

**Stated Answer**: ${question.answer}

**Solution**: ${question.solution}

**Topic Notes** (Use these concepts in solution):
${topicNotes}

**CRITICAL VERIFICATION TASKS**:
1. For MCQ/MSQ: CHECK if the stated answer EXACTLY matches one of the options. If not, FIX IT.
2. Verify the solution is CORRECT and uses concepts from the topic notes.
3. Ensure the solution explains step-by-step using formulas/concepts from notes.
4. Make sure the difficulty level is appropriate.

Return ONLY a valid JSON object with corrections:
{
  "question_statement": "Corrected question if needed",
  "options": ["Corrected options if needed"],
  "answer": "EXACT option text that is correct",
  "solution": "Improved solution using topic notes concepts",
  "difficulty_level": "Easy/Medium/Hard",
  "is_valid": true/false
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
            temperature: 0.3,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("Verification failed, using original");
      return question;
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return question;
    }

    const verified = JSON.parse(jsonMatch[0]);
    
    if (verified.is_valid === false) {
      console.log("Question failed verification, regenerating...");
      return null;
    }

    return {
      ...question,
      question_statement: verified.question_statement,
      options: verified.options || question.options,
      answer: verified.answer,
      solution: verified.solution,
      difficulty_level: verified.difficulty_level,
    };
  } catch (error) {
    console.error("Verification error:", error);
    return question;
  }
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
        let attempts = 0;
        const maxAttempts = 3;
        
        while (attempts < maxAttempts) {
          try {
            console.log(`Generating question ${totalGenerated + 1} for topic: ${topic.name}`);
            
            const prompt = buildPrompt(topic, pyqs, existingNew, config, totalGenerated + 1);
            const question = await generateQuestionWithRetry(
              apiKeyManager,
              prompt
            );

            // Verify answer matches options and solution uses topic notes
            console.log("Verifying question quality...");
            const verifiedQuestion = await verifyQuestionAnswer(
              apiKeyManager,
              question,
              topic.notes || ""
            );

            if (!verifiedQuestion) {
              console.log("Question failed verification, retrying...");
              attempts++;
              await sleep(2000);
              continue;
            }

            // Save to database
            const { data: savedQuestion, error: saveError } = await supabase
              .from("new_questions")
              .insert({
                topic_id: topicId,
                topic_name: topic.name,
                chapter_id: topic.chapter_id,
                part_id: config.partId,
                slot_id: config.slotId,
                question_statement: verifiedQuestion.question_statement,
                question_type: config.questionType,
                options: verifiedQuestion.options || null,
                answer: verifiedQuestion.answer || null,
                solution: verifiedQuestion.solution || null,
                difficulty_level: verifiedQuestion.difficulty_level || "Medium",
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
            existingNew.push(savedQuestion); // Add to context for variety
            totalGenerated++;
            break; // Success, exit retry loop

          } catch (error) {
            console.error(`Attempt ${attempts + 1} failed for question ${i + 1}:`, error);
            attempts++;
            if (attempts < maxAttempts) {
              await sleep(3000);
            }
          }
        }

        if (attempts >= maxAttempts) {
          console.error(`Failed to generate question after ${maxAttempts} attempts for topic ${topic.name}`);
        }

        // Delay between questions
        await sleep(1500);
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
