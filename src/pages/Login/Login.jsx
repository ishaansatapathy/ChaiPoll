import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/Input.jsx";

export default function Login() {
  return (
    <main className="grid min-h-screen place-items-center bg-ink-950 px-4">
      <Card className="w-full max-w-md">
        <h1 className="font-display text-3xl text-white">Welcome back</h1>
        <p className="mt-3 text-sm text-white/52">Frontend-only auth screen. Backend wiring comes later.</p>
        <div className="mt-8 grid gap-4">
          <Input label="Email" placeholder="you@chaicode.com" />
          <Input label="Password" type="password" placeholder="Password" />
          <Button to="/dashboard" className="mt-2">Login preview</Button>
        </div>
        <p className="mt-6 text-center text-sm text-white/46">
          New here? <Link to="/signup" className="text-white">Create account</Link>
        </p>
      </Card>
    </main>
  );
}
