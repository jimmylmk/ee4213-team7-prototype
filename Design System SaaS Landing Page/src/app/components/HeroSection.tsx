import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ArrowRight, Calendar, ShieldCheck, Layers } from "lucide-react";
import { useEffect, useRef } from "react";
import { Link } from "react-router";

export function HeroSection() {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const cards = scene.querySelectorAll('.floating-card');
    
    const animateCards = () => {
      cards.forEach((card, index) => {
        const element = card as HTMLElement;
        const time = Date.now() * 0.001;
        const offset = index * 0.7;
        
        const x = Math.sin(time + offset) * 20;
        const y = Math.cos(time + offset * 1.2) * 15;
        const rotateX = Math.sin(time + offset) * 6;
        const rotateY = Math.cos(time + offset * 0.8) * 10;
        
        element.style.transform = `
          translate3d(${x}px, ${y}px, 0) 
          rotateX(${rotateX}deg) 
          rotateY(${rotateY}deg)
        `;
      });
      
      requestAnimationFrame(animateCards);
    };
    
    animateCards();
  }, []);

  return (
    <section id="overview" className="relative py-20 lg:py-28 overflow-hidden bg-[#f8f7f3]">
      <div className="container mx-auto px-4 text-center">
        <Badge variant="secondary" className="mb-6 font-mono text-xs px-3 py-1 bg-[#ece9ff] text-[#34266f] border border-[#d9ccff]">
          AY2026/27 Semester A Course Add/Drop Rehearsal
        </Badge>
        <h1 className="mx-auto max-w-4xl text-4xl md:text-6xl lg:text-7xl tracking-tight mb-6 font-semibold">
          Rehearse course swaps with{" "}
          <span className="bg-gradient-to-r from-[#171717] to-[#6c4cff] bg-clip-text text-transparent">
            zero AIMS risk
          </span>
        </h1>
        <p className="mx-auto max-w-2xl text-base md:text-lg text-muted-foreground mb-8">
          CityU EE4213 Team #7: Unified Course Planning & Safe-Swap Rehearsal Sandbox.
          Direct manipulation schedule canvas, real-time conflict radar, 12.0-credit visa floor protection, and human-in-the-loop control gates.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Button size="lg" className="w-full sm:w-auto bg-[#171717] text-white hover:bg-[#6c4cff] transition-all px-8" asChild>
            <Link to="/dashboard">
              Launch Rehearsal Sandbox
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="w-full sm:w-auto border-black/15 bg-white hover:bg-black/5" asChild>
            <Link to="/dashboard?view=inspector">
              Explore Course Inspector
            </Link>
          </Button>
        </div>

        {/* 3D Floating Schedule Cards Scene */}
        <div className="relative max-w-4xl mx-auto h-80 md:h-96">
          <div ref={sceneRef} className="relative w-full h-full [perspective:1000px]">
            {/* Center Main Stage Card */}
            <div className="floating-card absolute top-12 left-1/2 -translate-x-1/2 w-80 md:w-96 bg-white border border-black/10 rounded-2xl shadow-xl p-5 text-left transform-gpu z-20">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-[#6c4cff]">EE4213</span>
                <span className="font-mono text-[10px] bg-[#d9ff63] text-[#171717] px-2 py-0.5 font-bold uppercase rounded">
                  [Enrolled · Protected on AIMS]
                </span>
              </div>
              <h3 className="font-semibold text-sm mb-1">Human-Computer Interaction</h3>
              <p className="text-xs text-muted-foreground mb-3">Mon 10:00–12:00 · LT-4 · 3.0 Credits</p>
              <div className="flex items-center justify-between border-t pt-2 text-[11px] text-muted-foreground">
                <span>CRN 51001</span>
                <span className="text-green-600 font-medium">No schedule clash</span>
              </div>
            </div>

            {/* Left Staged Preview Card */}
            <div className="floating-card absolute top-28 left-4 md:left-12 w-72 bg-white border-2 border-dashed border-[#6c4cff] rounded-2xl shadow-lg p-4 text-left transform-gpu z-10 hidden sm:block">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs font-bold text-[#171717]">CS3334</span>
                <span className="font-mono text-[9px] bg-[#ece9ff] text-[#34266f] px-1.5 py-0.5 rounded font-semibold">
                  [Staged Preview]
                </span>
              </div>
              <h4 className="font-medium text-xs">Data Structures & Algorithms</h4>
              <p className="text-[11px] text-muted-foreground">Mon 16:00–19:00 · 8 Seats Open</p>
            </div>

            {/* Right Visa Guard Badge Card */}
            <div className="floating-card absolute top-36 right-4 md:right-12 w-64 bg-white border border-black/10 rounded-2xl shadow-lg p-4 text-left transform-gpu z-10 hidden sm:block">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                <span className="font-semibold text-xs">Visa Floor Protected</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Total Credits: <span className="font-bold text-foreground">15.0 CR</span> (Minimum: 12.0 CR)
              </div>
            </div>

            {/* Background Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(15)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1.5 h-1.5 bg-[#6c4cff]/20 rounded-full animate-pulse"
                  style={{
                    left: `${(i * 7 + 10) % 90}%`,
                    top: `${(i * 11 + 15) % 80}%`,
                    animationDelay: `${i * 0.3}s`,
                    animationDuration: `${2 + (i % 3)}s`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
