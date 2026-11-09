import type { Metadata } from "next";
import { ToolPage } from "@/components/tool-page";
import { pageSeo } from "@/content/seo";
import { ValidatorsTool } from "@/modules/validators";

export const metadata: Metadata = pageSeo.validators;

export default function ValidatorsPage() {
  return (
    <ToolPage
      title="Validators"
      description="Check JSON, YAML, TOML, SQL, XML, HTML, CSS, JavaScript, TypeScript, and Markdown with instant errors and warnings. Free and completely browser-based."
    >
      <ValidatorsTool />
    </ToolPage>
  );
}
