import { useState } from "react";
import { Plus } from "lucide-react";
import { QuestionCard } from "../../components/poll/QuestionCard.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Input, Textarea } from "../../components/ui/Input.jsx";

const createQuestion = () => ({
  id: crypto.randomUUID(),
  text: "",
  required: true,
  options: ["", ""],
});

export default function CreatePoll() {
  const [questions, setQuestions] = useState([createQuestion()]);
  const [anonymous, setAnonymous] = useState(true);

  const updateQuestion = (id, next) => setQuestions((items) => items.map((item) => (item.id === id ? next : item)));

  return (
    <section className="py-4">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.14em] text-white/38">Poll builder</p>
        <h1 className="mt-3 font-display text-4xl font-normal tracking-[-0.04em] text-white md:text-6xl">Create a new poll</h1>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-5">
          <Card>
            <div className="grid gap-4">
              <Input label="Poll title" placeholder="What should we build next?" />
              <Textarea label="Description" placeholder="Give voters helpful context." />
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Expiry date" type="datetime-local" />
                <label className="flex min-h-12 items-center justify-between rounded-lg border border-white/10 bg-white/[0.035] px-4 text-sm text-white/72">
                  Anonymous responses
                  <input type="checkbox" checked={anonymous} onChange={(event) => setAnonymous(event.target.checked)} className="accent-white" />
                </label>
              </div>
            </div>
          </Card>
          {questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              index={index}
              onChange={(next) => updateQuestion(question.id, next)}
              onRemove={() => setQuestions((items) => items.filter((item) => item.id !== question.id))}
              onAddOption={() => updateQuestion(question.id, { ...question, options: [...question.options, ""] })}
              onRemoveOption={(optionIndex) => updateQuestion(question.id, { ...question, options: question.options.filter((_, index) => index !== optionIndex) })}
            />
          ))}
          <Button variant="secondary" className="gap-2" onClick={() => setQuestions((items) => [...items, createQuestion()])}>
            <Plus size={16} /> Add question
          </Button>
        </div>
        <Card className="h-fit lg:sticky lg:top-6">
          <h2 className="font-display text-2xl text-white">Publish preview</h2>
          <p className="mt-3 text-sm leading-6 text-white/52">No backend call yet. This panel shows the data shape the server will receive later.</p>
          <div className="mt-6 grid gap-3 text-sm text-white/58">
            <span>Questions: {questions.length}</span>
            <span>Mode: {anonymous ? "Anonymous allowed" : "Authenticated only"}</span>
            <span>Share link: generated after backend integration</span>
          </div>
          <Button className="mt-6 w-full">Save draft preview</Button>
        </Card>
      </div>
    </section>
  );
}
