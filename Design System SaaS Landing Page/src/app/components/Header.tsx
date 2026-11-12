import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import { Link } from "react-router";

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
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-3">
            <BrandMark />
            <div className="flex flex-col">
              <span className="font-semibold text-sm leading-tight tracking-tight">SafeSwap</span>
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">CityU EE4213</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm">
            <a href="#overview" className="text-muted-foreground hover:text-foreground transition-colors">
              Overview
            </a>
            <a href="#capabilities" className="text-muted-foreground hover:text-foreground transition-colors">
              Capabilities
            </a>
            <a href="#persona" className="text-muted-foreground hover:text-foreground transition-colors">
              Student Persona
            </a>
            <a href="#walkthrough" className="text-muted-foreground hover:text-foreground transition-colors">
              Walkthrough
            </a>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" className="hidden md:inline-flex text-xs font-mono" asChild>
            <Link to="/dashboard?view=inspector">Course Inspector</Link>
          </Button>
          <Button asChild className="bg-[#171717] text-white hover:bg-[#6c4cff] transition-colors">
            <Link to="/dashboard">Launch Sandbox &rarr;</Link>
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
