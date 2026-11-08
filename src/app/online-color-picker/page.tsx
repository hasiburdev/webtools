import type { Metadata } from "next";
import { ToolPage } from "@/components/tool-page";
import { pageSeo } from "@/content/seo";
import { OnlineColorPicker } from "@/modules/online-color-picker";

export const metadata: Metadata = pageSeo.onlineColorPicker;

export default function OnlineColorPickerPage() {
  return <ToolPage title="Online Color Picker" description="Sample colors from an image or your screen, inspect magnified pixels, and copy HEX, RGB, or HSL values."><OnlineColorPicker /></ToolPage>;
}
