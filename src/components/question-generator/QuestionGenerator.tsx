import { useState } from "react";
import { Card } from "@/components/ui/card";
import ApiKeyManager from "./ApiKeyManager";
import GenerationForm from "./GenerationForm";
import QuestionPreview from "./QuestionPreview";
import { Sparkles } from "lucide-react";

const QuestionGenerator = () => {
  const [apiKeysConfigured, setApiKeysConfigured] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center gap-2 mb-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
          Question Generator
        </h1>
        <p className="text-muted-foreground">Powered by Gemini 2.5 Pro</p>
      </div>

      {/* API Key Configuration */}
      <Card className="mb-6">
        <ApiKeyManager onKeysConfigured={setApiKeysConfigured} />
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generation Form */}
        <Card className="p-6">
          <GenerationForm
            apiKeysConfigured={apiKeysConfigured}
            onQuestionsGenerated={setGeneratedQuestions}
          />
        </Card>

        {/* Preview Panel */}
        <Card className="p-6 sticky top-4 max-h-[calc(100vh-2rem)] overflow-auto">
          <QuestionPreview questions={generatedQuestions} />
        </Card>
      </div>
    </div>
  );
};

export default QuestionGenerator;
