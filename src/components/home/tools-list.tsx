import { homeTools } from "@/content/home";
import ToolCard from "./tool-card";

export default function ToolsList() {
  function renderTools() {
    if (homeTools.length === 0) {
      return (
        <div className="rounded-lg border border-dashed border-border bg-card/40 px-6 py-10 text-center text-sm text-muted-foreground">
          No tools are available yet.
        </div>
      );
    }

    return homeTools.map((tool) => <ToolCard key={tool.name} tool={tool} />);
  }

  return (
    <section className="flex-1 px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          All Tools
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {renderTools()}
        </div>
      </div>
    </section>
  );
}
