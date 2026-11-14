import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ArrowRight, UserCheck, Shield } from "lucide-react";
import { Link } from "react-router";

export function TestimonialsSection() {
  return (
    <section id="persona" className="py-20 bg-[#eeece6]/40 border-t border-black/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#6c4cff] mb-3">Primary Persona Profile</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl tracking-tight mb-4 font-semibold">
            Designed around real student challenges
          </h2>
          <p className="max-w-2xl mx-auto text-base md:text-lg text-muted-foreground">
            Synthesized from CityU Semester A registration constraints and student course planning challenges.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-white border border-black/10 shadow-sm p-6 md:p-8">
            <CardContent className="p-0 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-black/10 pb-6">
                <div className="flex items-center space-x-4">
                  <div className="h-14 w-14 rounded-2xl bg-[#6c4cff] text-white flex items-center justify-center font-bold text-lg font-mono">
                    ML
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold">Marcus Li</h3>
                      <Badge className="bg-[#d9ff63] text-[#171717] font-mono text-[10px] hover:bg-[#d9ff63]">
                        Target Persona
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Year 2 · BEng Computer and Data Engineering · Full-Time Student (SID 55412980)
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right font-mono text-xs text-muted-foreground">
                  <div>Enrolled: <span className="font-bold text-foreground">12.0 Credits</span></div>
                  <div>Full-Time Min Load: <span className="font-bold text-green-600">&gt;= 12.0 Credits</span></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
                <div className="space-y-2 bg-[#f8f7f3] p-4 rounded-xl border border-black/5">
                  <div className="font-semibold text-sm text-[#171717] flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-[#6c4cff]" />
                    Registration Constraints & Goals
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                    <li>Blocks personal time on Mon & Thu mornings (09:00–13:00).</li>
                    <li>Must maintain at least 12.0 credits to satisfy full-time minimum credit load requirements.</li>
                    <li>Needs to swap an elective for continuous coursework without risking his registered seats.</li>
                  </ul>
                </div>

                <div className="space-y-2 bg-[#f8f7f3] p-4 rounded-xl border border-black/5">
                  <div className="font-semibold text-sm text-[#171717] flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    Target User Design Goal
                  </div>
                  <p className="text-muted-foreground">
                    Students hesitate to modify schedules on AIMS because dropping a 3-credit course momentarily drops their load to 9.0 credits, violating full-time minimum load. CityU CampuSync provides a risk-free rehearsal environment to stage, verify, and resolve conflicts before committing changes.
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground pt-1">
                    — CityU EE4213 CityU CampuSync Problem Statement
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <p className="text-xs text-muted-foreground">
                  Ready to test Marcus Li's schedule in the live simulation?
                </p>
                <Button asChild className="bg-[#171717] text-white hover:bg-[#6c4cff] transition-colors">
                  <Link to="/dashboard">
                    Enter Marcus Li's Workspace
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
