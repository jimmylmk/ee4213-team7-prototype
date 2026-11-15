import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ArrowRight, UserCheck, Shield } from "lucide-react";
import { Link } from "react-router";

export function TestimonialsSection() {
  return (
    <section id="persona" className="py-20 bg-[#eeece6]/40 border-t border-black/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#6c4cff] mb-3">Student Persona</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl tracking-tight mb-4 font-semibold">
            Built around an authentic engineering pathway
          </h2>
          <p className="max-w-2xl mx-auto text-base md:text-lg text-muted-foreground">
            Whether you are protecting a 12-credit full-time minimum load, staging electives, or blocking off personal commitments, CityU CampuSync keeps every constraint visible.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Persona: Marcus Li */}
          <Card className="bg-white border border-black/10 shadow-sm p-6 md:p-8 flex flex-col justify-between">
            <CardContent className="p-0 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-black/10 pb-5">
                <div className="flex items-center space-x-3.5">
                  <div className="h-12 w-12 shrink-0 rounded-2xl bg-[#6c4cff] text-white flex items-center justify-center font-bold text-base font-mono">
                    ML
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold">Marcus Li</h3>
                      <Badge className="bg-[#d9ff63] text-[#171717] font-mono text-[10px] hover:bg-[#d9ff63]">
                        JUPAS Full-Time
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Year 2 · BEng Computer &amp; Data Engineering (SID 55412980)
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right font-mono text-xs text-muted-foreground">
                  <div>Enrolled: <span className="font-bold text-foreground">15.0 CR</span></div>
                  <div>Min Floor: <span className="font-bold text-green-600">&gt;= 12.0 CR</span></div>
                </div>
              </div>

              <div className="space-y-4 text-xs leading-relaxed">
                <div className="space-y-2 bg-[#f8f7f3] p-4 rounded-xl border border-black/5">
                  <div className="font-semibold text-sm text-[#171717] flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-[#6c4cff]" />
                    Schedule Goals &amp; Personal Commitments
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                    <li>Blocks recurring personal time for his part-time tech placement, gym sessions, and family dinner.</li>
                    <li>Must stay at or above 12.0 credits to preserve his full-time student status.</li>
                    <li>Wants to swap a heavy final-exam GE course for a 100% coursework option without losing his current seat first.</li>
                  </ul>
                </div>

                <div className="space-y-1.5 bg-[#f8f7f3] p-4 rounded-xl border border-black/5">
                  <div className="font-semibold text-sm text-[#171717] flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    How CityU CampuSync Helps
                  </div>
                  <p className="text-muted-foreground">
                    Marcus marks a course for drop and stages replacement electives on the <span className="font-medium text-foreground">Rehearsal Timetable</span> while his personal time blocks warn him of any overlap before he updates AIMS.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Button asChild className="w-full sm:w-auto bg-[#171717] text-white hover:bg-[#6c4cff] transition-colors">
                  <Link to="/dashboard">
                    Rehearse Marcus Li&apos;s Timetable
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
