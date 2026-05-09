import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/Input.jsx";

export default function Signup() {
  return (
    <main className="grid min-h-screen place-items-center bg-ink-950 px-4">
      <Card className="w-full max-w-md">
        <h1 className="font-display text-3xl text-white">Create your workspace</h1>
        <p className="mt-3 text-sm text-white/52">Set up a ChaiPoll account shell for tomorrow's auth integration.</p>
        <div className="mt-8 grid gap-4">
          <Input label="Name" placeholder="Ishaan Satapathy" />
          <Input label="Email" placeholder="you@chaicode.com" />
          <Input label="Password" type="password" placeholder="Create password" />
          <Button to="/dashboard" className="mt-2">Create account preview</Button>
        </div>
        <p className="mt-6 text-center text-sm text-white/46">
          Already registered? <Link to="/login" className="text-white">Login</Link>
        </p>
      </Card>
    </main>
  );
}
