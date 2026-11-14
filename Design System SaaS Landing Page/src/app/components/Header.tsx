import { useState } from "react";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";
import { Link } from "react-router";
import { scrollIntoViewWithMotion } from "../utils/motion";

export function BrandMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <span className={`relative grid h-8 w-8 grid-cols-2 gap-[3px] p-1 rounded-lg ${inverse ? "bg-white" : "bg-foreground"}`}>
      <span className={inverse ? "bg-foreground" : "bg-[#d9ff63]"} />
      <span className={inverse ? "bg-foreground" : "bg-white"} />
      <span className={inverse ? "bg-foreground" : "bg-white"} />
      <span className={inverse ? "bg-[#6c4cff]" : "bg-[#6c4cff]"} />
    </span>
  );
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) scrollIntoViewWithMotion(el);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center lg:space-x-8">
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
            <BrandMark />
            <div className="flex flex-col">
              <span className="whitespace-nowrap font-semibold text-sm leading-tight tracking-tight">CityU <span className="text-violet-600">CampuSync</span></span>
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">CityU EE4213</span>
            </div>
          </Link>
          <nav className="hidden lg:flex items-center space-x-6 text-sm">
            <a href="#overview" onClick={scrollTo("overview")} className="text-muted-foreground hover:text-foreground transition-colors">
              Overview
            </a>
            <a href="#capabilities" onClick={scrollTo("capabilities")} className="text-muted-foreground hover:text-foreground transition-colors">
              Capabilities
            </a>
            <a href="#persona" onClick={scrollTo("persona")} className="text-muted-foreground hover:text-foreground transition-colors">
              Student Persona
            </a>
            <a href="#walkthrough" onClick={scrollTo("walkthrough")} className="text-muted-foreground hover:text-foreground transition-colors">
              Walkthrough
            </a>
          </nav>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-4">
          <Button variant="ghost" className="hidden lg:inline-flex text-xs font-mono" asChild>
            <Link to="/dashboard?view=inspector">Course Inspector</Link>
          </Button>
          <Button asChild className="bg-[#171717] text-white hover:bg-[#6c4cff] transition-colors max-[420px]:px-2">
            <Link to="/dashboard" aria-label="Launch Sandbox">
              <span className="max-[420px]:hidden">Launch Sandbox &rarr;</span>
              <span className="hidden max-[420px]:inline">Launch</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Toggle navigation"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="lg:hidden border-t bg-background/95 px-4 py-4 space-y-3 backdrop-blur shadow-lg">
          <nav className="flex flex-col space-y-2 text-sm">
            <a
              href="#overview"
              onClick={scrollTo("overview")}
              className="px-2 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-black/5 transition-colors"
            >
              Overview
            </a>
            <a
              href="#capabilities"
              onClick={scrollTo("capabilities")}
              className="px-2 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-black/5 transition-colors"
            >
              Capabilities
            </a>
            <a
              href="#persona"
              onClick={scrollTo("persona")}
              className="px-2 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-black/5 transition-colors"
            >
              Student Persona
            </a>
            <a
              href="#walkthrough"
              onClick={scrollTo("walkthrough")}
              className="px-2 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-black/5 transition-colors"
            >
              Walkthrough
            </a>
          </nav>
          <div className="pt-2 border-t flex flex-col space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs font-mono"
              asChild
              onClick={() => setMobileMenuOpen(false)}
            >
              <Link to="/dashboard?view=inspector">Course Inspector</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
