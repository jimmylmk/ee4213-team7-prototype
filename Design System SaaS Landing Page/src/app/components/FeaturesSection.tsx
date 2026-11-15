import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  Calendar, 
  AlertTriangle, 
  ShieldCheck, 
  Search, 
  Lock, 
  MessageSquare, 
  Command, 
  WifiOff 
} from "lucide-react";

const capabilities = [
  {
    icon: Calendar,
    title: "Three-State Schedule Canvas",
    description: "Visually distinguish [Enrolled · Protected], [Marked for Drop], and [Staged Preview · Not on AIMS] simultaneously without clutter.",
    badge: "Core"
  },
  {
    icon: AlertTriangle,
    title: "Conflict Priority Radar",
    description: "Detects lecture clashes, exam time collisions, and Personal Time Block overlaps (Mon/Thu) in real time.",
    badge: "Safety"
  },
  {
    icon: ShieldCheck,
    title: "12.0-Credit Full-Time Load Guard",
    description: "Guards against accidental drops below the mandatory full-time minimum credit load threshold, preventing registration lockouts.",
    badge: "Compliance"
  },
  {
    icon: Search,
    title: "Course Inspector",
    description: "Transparent syllabus breakdowns, 100% coursework filters, schedule fit metrics, and prerequisite trees.",
    badge: "Academic"
  },
  {
    icon: Lock,
    title: "Human-in-the-Loop Control Gate",
    description: "Pre-AIMS confirmation checklist with side-by-side schedule comparison and copyable 5-digit CRNs so you stay in full control.",
    badge: "Safety"
  },
  {
    icon: MessageSquare,
    title: "CityU Community Blogs",
    description: "Authentic student workload reviews, semester survival tips, and grading experience logs for every simulated course.",
    badge: "Community"
  },
  {
    icon: Command,
    title: "Keyboard Accelerators",
    description: "Press / to jump straight to course search, and Esc to quickly close popups, previews, or filters.",
    badge: "Speed"
  },
  {
    icon: WifiOff,
    title: "100% Offline Simulation",
    description: "Zero login barriers, zero server dependencies, and zero live writes to CityU AIMS servers. Direct access to Marcus Li's schedule.",
    badge: "Offline"
  }
];

export function FeaturesSection() {
  return (
    <section id="capabilities" className="py-20 bg-[#eeece6]/50 border-y border-black/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#6c4cff] mb-3">System Capabilities</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl tracking-tight mb-4 font-semibold">
            Engineered for high-stakes course planning
          </h2>
          <p className="max-w-2xl mx-auto text-base md:text-lg text-muted-foreground">
            Built to eliminate Add/Drop panic with instant clash checks, credit guards, and safe schedule previews.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {capabilities.map((item, index) => (
            <Card key={index} className="relative bg-white border-black/10 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-[#f8f7f3] border border-black/10">
                    <item.icon className="h-5 w-5 text-[#171717]" />
                  </div>
                  <Badge variant="secondary" className="text-[10px] font-mono uppercase bg-[#ece9ff] text-[#34266f]">
                    {item.badge}
                  </Badge>
                </div>
                <CardTitle className="text-base font-semibold">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs leading-relaxed text-muted-foreground">{item.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
