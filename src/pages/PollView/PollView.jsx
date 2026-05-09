import { useState } from "react";
import { Navbar } from "../../components/layout/Navbar.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { pollQuestions } from "../../data/mockData.js";

export default function PollView() {
  const [answers, setAnswers] = useState({});

  return (
    <main className="min-h-screen bg-ink-950">
      <Navbar />
      <section className="page-shell grid min-h-screen place-items-center py-28">
        <div className="w-full max-w-3xl">
          <Badge>Public poll preview</Badge>
          <h1 className="mt-5 font-display text-4xl font-normal tracking-[-0.04em] text-white md:text-6xl">What should ChaiPoll ship next?</h1>
          <p className="mt-5 max-w-2xl text-white/56">This frontend-only public poll screen will later validate expiry, required questions and auth-only access.</p>
          <div className="mt-8 grid gap-5">
            {pollQuestions.map((question, index) => (
              <Card key={question.id}>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h2 className="font-display text-xl text-white">{index + 1}. {question.text}</h2>
                  {question.required && <Badge>Required</Badge>}
                </div>
                <div className="grid gap-3">
                  {question.options.map((option) => (
                    <label key={option} className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-white/[0.025] px-4 py-3 text-white/72 transition hover:bg-white/[0.055]">
                      <input
                        type="radio"
                        name={question.id}
                        checked={answers[question.id] === option}
                        onChange={() => setAnswers({ ...answers, [question.id]: option })}
                        className="accent-white"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </Card>
            ))}
          </div>
          <Button className="mt-8 w-full sm:w-auto">Submit response preview</Button>
        </div>
      </section>
    </main>
  );
}
