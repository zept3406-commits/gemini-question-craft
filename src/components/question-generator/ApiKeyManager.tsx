import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Key, Plus, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApiKeyManagerProps {
  onKeysConfigured: (configured: boolean) => void;
}

const ApiKeyManager = ({ onKeysConfigured }: ApiKeyManagerProps) => {
  const [apiKeys, setApiKeys] = useState<string[]>([]);
  const [keyInput, setKeyInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load API keys from localStorage
    const saved = localStorage.getItem("gemini_api_keys");
    if (saved) {
      const keys = JSON.parse(saved);
      setApiKeys(keys);
      onKeysConfigured(keys.length > 0);
    }
  }, [onKeysConfigured]);

  const handleBulkPaste = () => {
    const lines = keyInput
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("AIza"));
    
    if (lines.length === 0) {
      toast({
        title: "No valid keys found",
        description: "Please paste keys starting with 'AIza'",
        variant: "destructive",
      });
      return;
    }

    const updatedKeys = [...new Set([...apiKeys, ...lines])];
    setApiKeys(updatedKeys);
    localStorage.setItem("gemini_api_keys", JSON.stringify(updatedKeys));
    setKeyInput("");
    onKeysConfigured(true);

    toast({
      title: "API Keys Added",
      description: `${lines.length} keys added successfully`,
    });
  };

  const removeKey = (index: number) => {
    const updated = apiKeys.filter((_, i) => i !== index);
    setApiKeys(updated);
    localStorage.setItem("gemini_api_keys", JSON.stringify(updated));
    onKeysConfigured(updated.length > 0);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Gemini API Keys (Smart Round Robin)</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Collapse" : "Expand"}
        </Button>
      </div>

      <div className="text-sm text-muted-foreground mb-4 bg-primary-soft/30 p-3 rounded-lg border border-primary/20">
        <p className="mb-1">
          Add up to 100 Gemini API keys. The system will rotate them automatically and handle errors with 10-second delays.
        </p>
        <ul className="list-disc list-inside space-y-1 text-xs ml-2">
          <li>Keys are used in round-robin rotation (1st → 2nd → 3rd → ... → 1st)</li>
          <li>If any key fails, it waits 10 seconds then switches to the next key</li>
          <li>Keys with 3+ consecutive errors are temporarily disabled</li>
          <li>Perfect for generating 1000+ questions without hitting rate limits</li>
        </ul>
      </div>

      {apiKeys.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <Badge variant={apiKeys.length > 0 ? "default" : "secondary"} className="bg-success">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {apiKeys.length} API key{apiKeys.length > 1 ? "s" : ""} configured and ready
            </Badge>
          </div>
          
          {isExpanded && (
            <div className="space-y-2">
              {apiKeys.map((key, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-muted p-3 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">
                      Key {index + 1}
                    </Badge>
                    <span className="font-mono text-sm">
                      {key.substring(0, 15)}••••••••••••••••
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeKey(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {(isExpanded || apiKeys.length === 0) && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Bulk Paste API Keys (One Click Import)
            </label>
            <Textarea
              placeholder="Paste all your API keys here (each starting with AIza). They'll be automatically separated."
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              className="font-mono text-sm min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground mt-1">
              💡 Paste all keys at once - they'll be automatically separated by detecting "AIza" pattern
            </p>
          </div>

          <Button onClick={handleBulkPaste} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add API Keys
          </Button>
        </div>
      )}
    </div>
  );
};

export default ApiKeyManager;
