import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { homeToolIcons } from "@/components/icons";
import type { HomeTool } from "@/content/home";

type ToolCardProps = {
  tool: HomeTool;
};

export default function ToolCard({ tool }: ToolCardProps) {
  const Icon = homeToolIcons[tool.icon];

  if (tool.disabled) {
    return (
      <div className="cursor-not-allowed">
        <Card className="h-full select-none opacity-60">
          <CardHeader>
            <div className="flex items-start justify-between">
              <span
                className={`flex h-10 w-10 items-center justify-center ${tool.iconClass}`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <Badge variant="outline" className="text-[10px]">
                Coming Soon
              </Badge>
            </div>
            <CardTitle>{tool.name}</CardTitle>
            <CardDescription>{tool.description}</CardDescription>
          </CardHeader>
          <CardContent className="mt-auto">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              Coming soon
            </span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Link href={tool.href} className="group block">
      <Card className="h-full transition-all duration-200 group-hover:ring-foreground/20 group-hover:shadow-md">
        <CardHeader>
          <span
            className={`flex h-10 w-10 items-center justify-center ${tool.iconClass}`}
          >
            <Icon className="h-5 w-5" />
          </span>
          <CardTitle>{tool.name}</CardTitle>
          <CardDescription>{tool.description}</CardDescription>
        </CardHeader>
        <CardContent className="mt-auto">
          <span className="flex items-center gap-1 text-xs text-muted-foreground transition-colors group-hover:text-foreground">
            Open tool
            <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
