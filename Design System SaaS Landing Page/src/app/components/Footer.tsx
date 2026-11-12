import { BrandMark } from "./Header";
import { Separator } from "./ui/separator";

export function Footer() {
  const scrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="border-t border-black/10 bg-[#f8f7f3]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-3">
              <BrandMark />
              <div>
                <div className="font-semibold text-sm">SafeSwap Rehearsal Sandbox</div>
                <div className="font-mono text-[10px] text-muted-foreground uppercase">CityU EE4213 Team #7</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
              Unified Course Planning & Safe-Swap Rehearsal Sandbox developed for CityU EE4213 Human-Computer Interaction.
              100% offline single-session simulation ensuring zero AIMS registration risk.
            </p>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-[#6c4cff] mb-3">Navigation</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><a href="#overview" onClick={scrollTo("overview")} className="hover:text-foreground transition-colors">Overview</a></li>
              <li><a href="#capabilities" onClick={scrollTo("capabilities")} className="hover:text-foreground transition-colors">Capabilities</a></li>
              <li><a href="#persona" onClick={scrollTo("persona")} className="hover:text-foreground transition-colors">Student Persona</a></li>
              <li><a href="#walkthrough" onClick={scrollTo("walkthrough")} className="hover:text-foreground transition-colors">Rehearsal Workflow</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-[#6c4cff] mb-3">Project Roster</h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li><span className="font-medium text-foreground">Jimmy (Lam Kin)</span> · Prototype Lead</li>
              <li><span className="font-medium text-foreground">Aadib</span> · Technical Lead</li>
              <li><span className="font-medium text-foreground">Praneel</span> · Video & Demo Lead</li>
              <li><span className="font-medium text-foreground">Hudaifa</span> · Usability Study Lead</li>
              <li><span className="font-medium text-foreground">Louis</span> · Data Analyst</li>
            </ul>
          </div>
        </div>

        <Separator className="my-6 bg-black/10" />

        <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-muted-foreground gap-2">
          <p>© 2026 CityU EE4213 Team 7. All rights reserved. Academic simulation prototype.</p>
          <div className="flex space-x-4 font-mono text-[11px]">
            <span>AY2026/27 Sem A</span>
            <span>·</span>
            <span>Zero Auth Mode</span>
            <span>·</span>
            <span>100% Offline Simulation</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
