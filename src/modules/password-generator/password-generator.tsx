"use client";

import { useState, useEffect, useCallback } from "react";
import { Copy, Check, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import { generatePassword, calculateStrength, type PasswordOptions } from "./generate-password";

const TOGGLES: {
  key: keyof Omit<PasswordOptions, "length">;
  label: string;
  sample: string;
}[] = [
  { key: "uppercase", label: "Uppercase letters", sample: "A – Z" },
  { key: "lowercase", label: "Lowercase letters", sample: "a – z" },
  { key: "numbers",   label: "Numbers",           sample: "0 – 9" },
  { key: "symbols",   label: "Symbols",           sample: "! @ # $ % …" },
];

const STRENGTH_COLORS: Record<number, string> = {
  1: "bg-red-500",
  2: "bg-orange-400",
  3: "bg-yellow-400",
  4: "bg-emerald-500",
  5: "bg-green-500",
};

export function PasswordGenerator() {
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: false,
  });

  const generate = useCallback(() => {
    setPassword(generatePassword(options));
  }, [options]);

  // Auto-generate on mount and whenever options change
  useEffect(() => {
    generate();
  }, [generate]);

  const copy = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const setOption = <K extends keyof PasswordOptions>(
    key: K,
    value: PasswordOptions[K],
  ) => setOptions((prev) => ({ ...prev, [key]: value }));

  const strength = calculateStrength(options);
  const strengthColor = STRENGTH_COLORS[strength.score] ?? "bg-muted";

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Your password</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        {/* ── Password display ── */}
        <div className="flex items-stretch gap-2">
          <div className="flex min-h-12 flex-1 items-center break-all border border-border bg-muted px-4 py-3 font-mono text-sm leading-relaxed">
            {password ? (
              password
            ) : (
              <span className="italic text-muted-foreground">
                Select at least one character type
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={copy}
              disabled={!password}
              aria-label="Copy password"
            >
              {copied ? (
                <Check className="size-4 text-emerald-500" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={generate}
              aria-label="Regenerate password"
            >
              <RefreshCw className="size-4" />
            </Button>
          </div>
        </div>

        {/* ── Strength meter ── */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Strength</span>
            <span className="font-semibold">{strength.label}</span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 flex-1 transition-colors duration-300",
                  i < Math.min(strength.score, 4) ? strengthColor : "bg-muted",
                )}
              />
            ))}
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* ── Length slider ── */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Password Length</Label>
            <span className="min-w-[2ch] text-right font-mono text-sm font-bold tabular-nums">
              {options.length}
            </span>
          </div>

          <Slider
            min={8}
            max={128}
            step={1}
            value={[options.length]}
            onValueChange={(val) => {
              const v = Array.isArray(val) ? val[0] : val;
              setOption("length", v as number);
            }}
          />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>8</span>
            <span>128</span>
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* ── Character type toggles ── */}
        <div className="flex flex-col gap-0">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Character Types
          </p>

          {TOGGLES.map(({ key, label, sample }, i) => (
            <div
              key={key}
              className={cn(
                "flex items-center justify-between py-3",
                i < TOGGLES.length - 1 && "border-b border-border",
              )}
            >
              <div className="flex flex-col gap-0.5">
                <Label
                  htmlFor={`toggle-${key}`}
                  className="cursor-pointer font-medium"
                >
                  {label}
                </Label>
                <span className="font-mono text-xs text-muted-foreground">
                  {sample}
                </span>
              </div>

              <Switch
                id={`toggle-${key}`}
                checked={options[key] as boolean}
                onCheckedChange={(checked) => setOption(key, checked)}
              />
            </div>
          ))}
        </div>

        {/* ── Generate button ── */}
        <Button onClick={generate} className="w-full">
          Generate New Password
        </Button>
      </CardContent>
    </Card>
  );
}
