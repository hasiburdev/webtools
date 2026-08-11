import { Badge } from "@/components/ui/badge";
import { homeHero } from "@/content/home";

export default function HeroSection() {
  return (
    <section className="border-b border-border bg-card px-6 py-20 text-center">
      <div className="mx-auto max-w-2xl">
        <Badge variant="outline">{homeHero.badge}</Badge>
        <p className="mt-2 text-xs text-muted-foreground">
          by{" "}
          <a
            href={homeHero.author.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline-offset-4 hover:underline"
          >
            {homeHero.author.name}
          </a>
        </p>
        <h1 className="mt-5 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {homeHero.titlePrefix}{" "}
          <span className="text-muted-foreground">
            {homeHero.titleHighlight}
          </span>
        </h1>
        <p className="mt-5 text-lg leading-8 text-muted-foreground">
          {homeHero.description}
        </p>
      </div>
    </section>
  );
}
