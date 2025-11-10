import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Play } from "lucide-react";

interface GenerationFormProps {
  apiKeysConfigured: boolean;
  onQuestionsGenerated: (questions: any[]) => void;
}

const GenerationForm = ({
  apiKeysConfigured,
  onQuestionsGenerated,
}: GenerationFormProps) => {
  const [exams, setExams] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  const [parts, setParts] = useState<any[]>([]);
  
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedPart, setSelectedPart] = useState("");
  const [generationMode, setGenerationMode] = useState("new");

  const [questionDistribution, setQuestionDistribution] = useState<Map<string, { topicName: string; count: number }>>(new Map());
  
  const [questionType, setQuestionType] = useState("MCQ (Single Correct)");
  const [numQuestions, setNumQuestions] = useState("30");
  const [timeMinutes, setTimeMinutes] = useState("3");
  const [correctMarks, setCorrectMarks] = useState("4");
  const [incorrectMarks, setIncorrectMarks] = useState("-1");
  const [skippedMarks, setSkippedMarks] = useState("0");
  const [partialMarks, setPartialMarks] = useState("0");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Fetch exams
  useEffect(() => {
    const fetchExams = async () => {
      const { data } = await supabase.from("exams").select("*");
      if (data) setExams(data);
    };
    fetchExams();
  }, []);

  // Fetch courses when exam changes
  useEffect(() => {
    if (selectedExam) {
      const fetchCourses = async () => {
        const { data } = await supabase
          .from("courses")
          .select("*")
          .eq("exam_id", selectedExam);
        if (data) setCourses(data);
      };
      fetchCourses();
    }
  }, [selectedExam]);

  // Fetch slots when course changes
  useEffect(() => {
    if (selectedCourse) {
      const fetchSlots = async () => {
        const { data } = await supabase
          .from("slots")
          .select("*")
          .eq("course_id", selectedCourse);
        if (data) setSlots(data);
      };
      fetchSlots();
    }
  }, [selectedCourse]);

  // Fetch parts when course/slot changes
  useEffect(() => {
    if (selectedCourse) {
      const fetchParts = async () => {
        let query = supabase.from("parts").select("*").eq("course_id", selectedCourse);

        if (selectedSlot) {
          query = query.eq("slot_id", selectedSlot);
        } else {
          query = query.is("slot_id", null);
        }

        const { data } = await query;
        if (data) setParts(data);
      };
      fetchParts();
    }
  }, [selectedCourse, selectedSlot]);

  // Calculate question distribution when part/slot/numQuestions changes
  useEffect(() => {
    if (selectedPart && numQuestions) {
      calculateDistribution();
    }
  }, [selectedPart, selectedSlot, numQuestions]);

  const calculateDistribution = async () => {
    if (!selectedPart) return;

    let query = supabase
      .from("topics_weightage")
      .select(`
        *,
        topics:topic_id (
          id,
          name
        )
      `)
      .eq("part_id", selectedPart);

    if (selectedSlot) {
      query = query.eq("slot_id", selectedSlot);
    }

    const { data: topicsWithWeightage } = await query;
    if (!topicsWithWeightage) return;

    const distribution = new Map<string, { topicName: string; count: number }>();
    let allocated = 0;
    const totalQ = parseInt(numQuestions);

    topicsWithWeightage.forEach((tw: any) => {
      const count = Math.floor((totalQ * (tw.weightage_percent || 0)) / 100);
      if (tw.topics) {
        distribution.set(tw.topic_id, {
          topicName: tw.topics.name,
          count,
        });
        allocated += count;
      }
    });

    const remaining = totalQ - allocated;
    if (remaining > 0 && topicsWithWeightage.length > 0 && topicsWithWeightage[0].topics) {
      const firstTopicId = topicsWithWeightage[0].topic_id;
      const existing = distribution.get(firstTopicId);
      if (existing) {
        distribution.set(firstTopicId, {
          ...existing,
          count: existing.count + remaining,
        });
      }
    }

    setQuestionDistribution(distribution);
  };

  const handleGenerate = async () => {
    if (!apiKeysConfigured) {
      toast({
        title: "API Keys Required",
        description: "Please configure your Gemini API keys first",
        variant: "destructive",
      });
      return;
    }

    if (!selectedExam || !selectedCourse || !selectedPart) {
      toast({
        title: "Missing Configuration",
        description: "Please select exam, course, and part",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log("Starting question generation...");
      
      const apiKeys = localStorage.getItem("gemini_api_keys");
      if (!apiKeys || JSON.parse(apiKeys).length === 0) {
        throw new Error("No API keys configured");
      }

      const { data, error } = await supabase.functions.invoke("generate-questions", {
        body: {
          courseId: selectedCourse,
          partId: selectedPart,
          slotId: selectedSlot || null,
          questionType,
          numQuestions: parseInt(numQuestions),
          timeMinutes: parseFloat(timeMinutes),
          correctMarks: parseFloat(correctMarks),
          incorrectMarks: parseFloat(incorrectMarks),
          skippedMarks: parseFloat(skippedMarks),
          partialMarks: parseFloat(partialMarks),
          generationMode,
        },
        headers: {
          "x-api-keys": JSON.stringify(JSON.parse(apiKeys)),
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        throw error;
      }

      if (!data) {
        throw new Error("No data returned from edge function");
      }

      console.log("Generation completed:", data);

      toast({
        title: "Success!",
        description: `Generated ${data.totalGenerated || 0} questions successfully`,
      });

      onQuestionsGenerated(data.questions || []);
    } catch (error: any) {
      console.error("Generation failed:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate questions. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Configuration</h2>
      </div>

      {/* Exam Selection */}
      <div className="space-y-2">
        <Label>Select Exam</Label>
        <Select value={selectedExam} onValueChange={setSelectedExam}>
          <SelectTrigger>
            <SelectValue placeholder="Select exam" />
          </SelectTrigger>
          <SelectContent>
            {exams.map((exam) => (
              <SelectItem key={exam.id} value={exam.id}>
                {exam.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Course Selection */}
      <div className="space-y-2">
        <Label>Select Course</Label>
        <Select
          value={selectedCourse}
          onValueChange={setSelectedCourse}
          disabled={!selectedExam}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Generation Mode */}
      <div className="space-y-2">
        <Label>Generation Mode</Label>
        <RadioGroup value={generationMode} onValueChange={setGenerationMode}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="new" id="new" />
            <Label htmlFor="new">Generate New Questions</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pyq" id="pyq" />
            <Label htmlFor="pyq">Generate PYQ Solutions</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Paper Configuration */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="font-semibold">Paper Configuration (Optional)</h3>

        {/* Slot Selection */}
        {slots.length > 0 && (
          <div className="space-y-2">
            <Label>Slot</Label>
            <Select value={selectedSlot} onValueChange={setSelectedSlot}>
              <SelectTrigger>
                <SelectValue placeholder="Select a slot (optional)" />
              </SelectTrigger>
              <SelectContent>
                {slots.map((slot) => (
                  <SelectItem key={slot.id} value={slot.id}>
                    {slot.slot_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Part Selection */}
        <div className="space-y-2">
          <Label>Part</Label>
          <Select
            value={selectedPart}
            onValueChange={setSelectedPart}
            disabled={!selectedCourse}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select part" />
            </SelectTrigger>
            <SelectContent>
              {parts.map((part) => (
                <SelectItem key={part.id} value={part.id}>
                  {part.part_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Question Configuration */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="font-semibold">Question Configuration</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Question Type</Label>
            <Select value={questionType} onValueChange={setQuestionType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MCQ (Single Correct)">
                  MCQ (Single Correct)
                </SelectItem>
                <SelectItem value="MSQ">MSQ</SelectItem>
                <SelectItem value="NAT">NAT</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Number of Questions</Label>
            <Input
              type="number"
              value={numQuestions}
              onChange={(e) => setNumQuestions(e.target.value)}
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label>Time (minutes)</Label>
            <Input
              type="number"
              value={timeMinutes}
              onChange={(e) => setTimeMinutes(e.target.value)}
              step="0.5"
            />
          </div>

          <div className="space-y-2">
            <Label>Correct Marks</Label>
            <Input
              type="number"
              value={correctMarks}
              onChange={(e) => setCorrectMarks(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Incorrect Marks</Label>
            <Input
              type="number"
              value={incorrectMarks}
              onChange={(e) => setIncorrectMarks(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Skipped Marks</Label>
            <Input
              type="number"
              value={skippedMarks}
              onChange={(e) => setSkippedMarks(e.target.value)}
            />
          </div>

          <div className="space-y-2 col-span-2">
            <Label>Partial Marks</Label>
            <Input
              type="number"
              value={partialMarks}
              onChange={(e) => setPartialMarks(e.target.value)}
            />
          </div>
        </div>
      </div>

      {questionDistribution.size > 0 && (
        <div className="space-y-2 border-t pt-4">
          <h3 className="font-semibold text-sm">Question Distribution by Topic</h3>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {Array.from(questionDistribution.entries()).map(([topicId, info]) => (
              <div
                key={topicId}
                className="flex justify-between items-center text-xs p-2 bg-muted/50 rounded"
              >
                <span className="font-medium">{info.topicName}</span>
                <span className="text-muted-foreground">{info.count} questions</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={!apiKeysConfigured || isGenerating}
        size="lg"
        className="w-full"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Generating {numQuestions} Questions...
          </>
        ) : (
          <>
            <Play className="mr-2 h-5 w-5" />
            Generate {numQuestions} Questions
          </>
        )}
      </Button>
    </div>
  );
};

export default GenerationForm;
