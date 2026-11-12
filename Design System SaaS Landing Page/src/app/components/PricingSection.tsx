import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Check, ArrowRight } from "lucide-react";
import { Link } from "react-router";

const steps = [
  {
    step: "Step 01",
    title: "Stage Candidate Course",
    badge: "Direct Manipulation",
    description: "Browse the live catalogue dock and click 'Stage for Rehearsal' to place an elective into the ghost swap slot.",
    features: [
      "No effect on registered AIMS seats",
      "Instant visual preview on weekly timetable",
      "One-click bidirectional un-stage"
    ]
  },
  {
    step: "Step 02",
    title: "Validate Safety Invariants",
    badge: "Automatic Guard",
    description: "The engine runs instant checks across lecture hours, exam schedules, and personal time blocks.",
    features: [
      "12.0-credit full-time minimum load validation",
      "Conflict radar alerts with priority resolution",
      "Prerequisite chain verification"
    ]
  },
  {
    step: "Step 03",
    title: "Supervised AIMS Handoff",
    badge: "Human-in-the-Loop",
    description: "Open the Control Gate to review the side-by-side delta and follow the 3-step manual CRN execution checklist.",
    features: [
      "Accurate CRN drop/add instructions",
      "Student closure checklist verification",
      "One-click schedule revert if AIMS fails"
    ]
  }
];

export function PricingSection() {
  return (
    <section id="walkthrough" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#6c4cff] mb-3">Rehearsal Workflow</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl tracking-tight mb-4 font-semibold">
            Three steps to safe course registration
          </h2>
          <p className="max-w-2xl mx-auto text-base md:text-lg text-muted-foreground">
            From initial rehearsal staging to final supervised execution on CityU AIMS.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((item, index) => (
            <Card key={index} className="relative bg-white border border-black/10 shadow-sm flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-[#6c4cff]">{item.step}</span>
                  <Badge variant="outline" className="font-mono text-[10px] bg-[#f8f7f3]">
                    {item.badge}
                  </Badge>
                </div>
                <CardTitle className="text-lg font-semibold">{item.title}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground pt-1">
                  {item.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <div className="space-y-2 border-t pt-3">
                  {item.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start text-xs text-muted-foreground gap-2">
                      <Check className="h-3.5 w-3.5 text-green-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button asChild size="lg" className="bg-[#171717] text-white hover:bg-[#6c4cff] transition-colors">
            <Link to="/dashboard">
              Try It in Marcus Li's Schedule
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
