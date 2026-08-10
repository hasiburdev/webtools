import type { Metadata } from "next";
import { pageSeo } from "@/content/seo";
import HeroSection from "@/components/home/hero-section";
import ToolsList from "@/components/home/tools-list";

export const metadata: Metadata = pageSeo.home;

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <HeroSection />
      <ToolsList />
    </div>
  );
}
