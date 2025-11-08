import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, FileText, Brain } from "lucide-react";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

interface QuestionPreviewProps {
  questions: any[];
}

const renderLatexContent = (content: string) => {
  if (!content) return null;

  // Split content by LaTeX blocks and inline math
  const parts: React.ReactNode[] = [];
  let remaining = content;
  let key = 0;

  while (remaining.length > 0) {
    // Check for display math $$...$$
    const displayMatch = remaining.match(/\$\$(.*?)\$\$/s);
    if (displayMatch && displayMatch.index !== undefined) {
      // Add text before math
      if (displayMatch.index > 0) {
        parts.push(
          <span key={key++}>{remaining.substring(0, displayMatch.index)}</span>
        );
      }
      // Add display math
      try {
        parts.push(<BlockMath key={key++} math={displayMatch[1]} />);
      } catch (e) {
        parts.push(<span key={key++}>{displayMatch[0]}</span>);
      }
      remaining = remaining.substring(
        displayMatch.index + displayMatch[0].length
      );
      continue;
    }

    // Check for inline math $...$
    const inlineMatch = remaining.match(/\$([^$]+?)\$/);
    if (inlineMatch && inlineMatch.index !== undefined) {
      // Add text before math
      if (inlineMatch.index > 0) {
        parts.push(
          <span key={key++}>{remaining.substring(0, inlineMatch.index)}</span>
        );
      }
      // Add inline math
      try {
        parts.push(<InlineMath key={key++} math={inlineMatch[1]} />);
      } catch (e) {
        parts.push(<span key={key++}>{inlineMatch[0]}</span>);
      }
      remaining = remaining.substring(
        inlineMatch.index + inlineMatch[0].length
      );
      continue;
    }

    // No more LaTeX found, add remaining text
    parts.push(<span key={key++}>{remaining}</span>);
    break;
  }

  return <>{parts}</>;
};

const QuestionPreview = ({ questions }: QuestionPreviewProps) => {
  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-12">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent blur-2xl opacity-20 rounded-full"></div>
          <Brain className="h-20 w-20 text-primary relative" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Ready to Generate
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Configure your settings and click Generate to see AI-powered questions appear here in real-time
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Generated Questions</h2>
        <Badge variant="default" className="bg-success">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          {questions.length} Generated
        </Badge>
      </div>

      <ScrollArea className="h-[calc(100vh-16rem)]">
        <div className="space-y-6">
          {questions.map((question, index) => (
            <div
              key={index}
              className="border border-border rounded-lg p-4 bg-card"
            >
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline">Question {index + 1}</Badge>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {question.time_minutes} min
                </div>
              </div>

              <div className="space-y-3">
                <div className="font-medium leading-relaxed">
                  {renderLatexContent(question.question_statement)}
                </div>

                {question.options && (
                  <div className="space-y-2">
                    {question.options.map((option: string, i: number) => (
                      <div
                        key={i}
                        className={`p-3 rounded-lg transition-colors ${
                          option === question.answer
                            ? "bg-success/10 border-2 border-success/40 font-medium"
                            : "bg-muted/40 border border-border"
                        }`}
                      >
                        <span className="font-semibold mr-2">
                          {String.fromCharCode(65 + i)}.
                        </span>
                        {renderLatexContent(option)}
                      </div>
                    ))}
                  </div>
                )}

                {question.solution && (
                  <div className="mt-4 p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2 text-sm font-semibold mb-2 text-primary">
                      <Brain className="h-4 w-4" />
                      Solution:
                    </div>
                    <div className="text-sm text-foreground leading-relaxed">
                      {renderLatexContent(question.solution)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default QuestionPreview;
