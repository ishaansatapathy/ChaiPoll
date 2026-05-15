import { Trash2 } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

export function QuestionCard({ question, index, onChange, onRemove, onAddOption, onRemoveOption }) {
  return (
    <div className="surface rounded-xl p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <span className="text-sm font-semibold text-white/60">Question {index + 1}</span>
        <Button variant="ghost" className="min-h-9 px-3 text-white/50" onClick={onRemove}>
          <Trash2 size={16} />
        </Button>
      </div>
      <Input
        label="Question"
        value={question.text}
        onChange={(event) => onChange({ …question, text: event.target.value })}
        placeholder="Ask something clear and answerable"
      />
      <div className="mt-4 grid gap-3">
        {question.options.map((option, optionIndex) => (
          <div key={optionIndex} className="flex gap-2">
            <Input
              className="w-full"
              value={option}
              onChange={(event) => {
                const next = […question.options];
                next[optionIndex] = event.target.value;
                onChange({ …question, options: next });
              }}
              placeholder={`Option ${optionIndex + 1}`}
            />
            <Button
              variant="secondary"
              className="min-h-12 px-4"
              onClick={() => onRemoveOption(optionIndex)}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-white/62">
          <input
            type="checkbox"
            checked={question.required}
            onChange={(event) => onChange({ …question, required: event.target.checked })}
            className="accent-white"
          />
          Required question
        </label>
        <Button variant="secondary" onClick={onAddOption}>
          Add option
        </Button>
      </div>
    </div>
  );
}
