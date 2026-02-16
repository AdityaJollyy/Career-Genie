import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CtaSection() {
  return (
    <section className="w-full">
      <div className="mx-auto py-24 gradient rounded-lg">
        <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tighter text-primary-foreground sm:text-4xl md:text-5xl">
            Ready to Accelerate Your Career?
          </h2>

          <p className="mx-auto max-w-150 text-primary-foreground/80 md:text-xl">
            Join thousands of professionals who are advancing their careers with
            AI-powered guidance.
          </p>

          <Button
            asChild
            size="lg"
            variant="secondary"
            className="h-11 mt-5 animate-bounce"
          >
            <Link href="/dashboard">
              Start Your Journey Today
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
