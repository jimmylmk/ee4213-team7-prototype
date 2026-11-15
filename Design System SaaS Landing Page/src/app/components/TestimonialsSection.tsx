import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ArrowRight, UserCheck, Shield, GraduationCap, Compass } from "lucide-react";
import { Link } from "react-router";

export function TestimonialsSection() {
  return (
    <section id="persona" className="py-20 bg-[#eeece6]/40 border-t border-black/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#6c4cff] mb-3">Student Personas</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl tracking-tight mb-4 font-semibold">
            Designed around real student challenges
          </h2>
          <p className="max-w-2xl mx-auto text-base md:text-lg text-muted-foreground">
            Synthesized from CityU registration rules, full-time minimum load policies, and direct-entry graduation pathways.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* Card 1: Marcus Li (Primary Persona) */}
          <Card className="bg-white border border-black/10 shadow-sm p-6 md:p-8 flex flex-col justify-between">
            <CardContent className="p-0 space-y-6 flex-1 flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-black/10 pb-6">
                <div className="flex items-center space-x-4">
                  <div className="h-14 w-14 rounded-2xl bg-[#6c4cff] text-white flex items-center justify-center font-bold text-lg font-mono shrink-0 shadow-sm">
                    ML
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold">Marcus Li</h3>
                      <Badge className="bg-[#d9ff63] text-[#171717] font-mono text-[10px] hover:bg-[#d9ff63] font-bold">
                        Primary Persona
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Year 2 · BEng Computer &amp; Data Engineering (SID 55412980)
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right font-mono text-xs text-muted-foreground shrink-0">
                  <div>Enrolled: <span className="font-bold text-foreground">12.0 Credits</span></div>
                  <div>Full-Time Min Load: <span className="font-bold text-green-600">&gt;= 12.0 Credits</span></div>
                </div>
              </div>

              <div className="space-y-4 text-xs leading-relaxed flex-1">
                <div className="space-y-2 bg-[#f8f7f3] p-4 rounded-xl border border-black/5">
                  <div className="font-semibold text-sm text-[#171717] flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-[#6c4cff]" />
                    Registration Constraints &amp; Goals
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                    <li>Blocks personal time for tech placement (Mon &amp; Thu mornings 09:00–13:00).</li>
                    <li>Must maintain &gt;= 12.0 CR to keep full-time student status.</li>
                    <li>Swaps electives for continuous coursework without risking registered seats.</li>
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
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-black/10 mt-auto">
                <p className="text-xs text-muted-foreground">
                  Rehearse Marcus&apos;s schedule in Workspace
                </p>
                <Button asChild className="w-full sm:w-auto bg-[#171717] text-white hover:bg-[#6c4cff] transition-colors">
                  <Link to="/dashboard">
                    Rehearse Schedule
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: John Jones (Secondary Persona) */}
          <Card className="bg-white border border-black/10 shadow-sm p-6 md:p-8 flex flex-col justify-between">
            <CardContent className="p-0 space-y-6 flex-1 flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-black/10 pb-6">
                <div className="flex items-center space-x-4">
                  <div className="h-14 w-14 rounded-2xl bg-[#0f766e] text-white flex items-center justify-center font-bold text-lg font-mono shrink-0 shadow-sm">
                    JJ
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold">John Jones</h3>
                      <Badge className="bg-[#ccfbf1] text-[#0f766e] font-mono text-[10px] hover:bg-[#ccfbf1] font-bold border border-[#99f6e4]">
                        Secondary Persona
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Direct-Entry / Advanced Standing · BEng Electronic &amp; Information Engineering (SID 55892144)
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right font-mono text-xs text-muted-foreground shrink-0">
                  <div>Enrolled: <span className="font-bold text-foreground">15.0 Credits</span></div>
                  <div>Pathway: <span className="font-bold text-[#0f766e]">Compressed 2-Year</span></div>
                </div>
              </div>

              <div className="space-y-4 text-xs leading-relaxed flex-1">
                <div className="space-y-2 bg-[#f8f7f3] p-4 rounded-xl border border-black/5">
                  <div className="font-semibold text-sm text-[#171717] flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-[#0f766e]" />
                    Transfer Constraints &amp; Goals
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                    <li>Direct-entry transfer navigating credit-waiver lockouts and cross-year prerequisite bridges.</li>
                    <li>Needs continuous coursework electives without 3-hour lab timetable collisions.</li>
                    <li>Compresses graduation timeline to 2 years while balancing rigorous EE core courses.</li>
                  </ul>
                </div>

                <div className="space-y-2 bg-[#f8f7f3] p-4 rounded-xl border border-black/5">
                  <div className="font-semibold text-sm text-[#171717] flex items-center gap-2">
                    <Compass className="h-4 w-4 text-[#0f766e]" />
                    Transfer Pathway &amp; Syllabus Inspector
                  </div>
                  <p className="text-muted-foreground">
                    Advanced-standing transfers require verified course syllabi, prerequisite chain validation, and peer insights from CityU Blogs before locking in electives that affect time-to-graduation.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-black/10 mt-auto">
                <p className="text-xs text-muted-foreground">
                  Explore John Jones&apos;s transfer advice and course syllabi?
                </p>
                <Button asChild variant="outline" className="w-full sm:w-auto border-black/15 bg-white hover:bg-black/5 hover:text-[#0f766e] transition-colors">
                  <Link to="/dashboard?view=inspector">
                    Enter John Jones&apos;s Workspace
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
