import { BrandMark } from "./Header";
import { Separator } from "./ui/separator";
import { scrollIntoViewWithMotion } from "../utils/motion";

export function Footer() {
  const scrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) scrollIntoViewWithMotion(el);
  };

  return (
    <footer className="border-t border-black/10 bg-[#f8f7f3]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-3">
              <BrandMark />
              <div>
                <div className="font-semibold text-sm">CityU <span className="text-violet-600">CampuSync</span></div>
                <div className="font-mono text-[10px] text-muted-foreground uppercase">CityUHK Academic Planning Platform</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
              Unified course planning, conflict radar, and safe add/drop timetable rehearsal built for CityUHK undergraduates.
              Protects your enrolled AIMS seats while you plan.
            </p>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-[#6c4cff] mb-3">Navigation</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><a href="#overview" onClick={scrollTo("overview")} className="hover:text-foreground transition-colors">Overview</a></li>
              <li><a href="#capabilities" onClick={scrollTo("capabilities")} className="hover:text-foreground transition-colors">Capabilities</a></li>
              <li><a href="#persona" onClick={scrollTo("persona")} className="hover:text-foreground transition-colors">Student Persona</a></li>
              <li><a href="#walkthrough" onClick={scrollTo("walkthrough")} className="hover:text-foreground transition-colors">How It Works</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-[#6c4cff] mb-3">Platform Guarantees</h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li><span className="font-medium text-foreground">Zero AIMS Write Risk</span> · Safe Rehearsal</li>
              <li><span className="font-medium text-foreground">12.0-CR Full-Time Guard</span> · Load Protection</li>
              <li><span className="font-medium text-foreground">Official Syllabus Archive</span> · Course Inspector</li>
              <li><span className="font-medium text-foreground">Verified Student Reviews</span> · Community Blogs</li>
              <li><span className="font-medium text-foreground">Control Gate Handoff</span> · CRN Checklist</li>
            </ul>
          </div>
        </div>

        <Separator className="my-6 bg-black/10" />

        <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-muted-foreground gap-2">
          <p>© 2026 CityU CampuSync. All rights reserved. Built for CityUHK undergraduates.</p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 font-mono text-[11px]">
            <span>AY2026/27 Sem A</span>
            <span>·</span>
            <span>Instant Access</span>
            <span>·</span>
            <span>AIMS Companion Mode</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
