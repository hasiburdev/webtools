"use client";

import { useState, useMemo, useRef } from "react";
import {
  ArrowLeftRight,
  Copy,
  Check,
  Download,
  Upload,
  Trash2,
  Table as TableIcon,
  Sparkles,
  AlertCircle,
  FileSpreadsheet,
  FileCode,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type {
  ConverterMode,
  CsvDelimiter,
  CsvToJsonOptions,
  JsonToCsvOptions,
} from "./types";
import {
  convertCsvToJson,
  convertJsonToCsv,
  downloadTextFile,
  SAMPLE_CSV,
  SAMPLE_JSON,
} from "./csv-json-utils";

export function CsvJsonConverter() {
  const [mode, setMode] = useState<ConverterMode>("csv-to-json");
  const [csvInput, setCsvInput] = useState<string>(SAMPLE_CSV);
  const [jsonInput, setJsonInput] = useState<string>(SAMPLE_JSON);

  // Options
  const [csvOptions, setCsvOptions] = useState<CsvToJsonOptions>({
    delimiter: "auto",
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    indentSpaces: 2,
  });

  const [jsonOptions, setJsonOptions] = useState<JsonToCsvOptions>({
    delimiter: ",",
    header: true,
    quotes: false,
    flattenNested: true,
  });

  const [copied, setCopied] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Computed conversions
  const csvToJsonResult = useMemo(
    () => convertCsvToJson(csvInput, csvOptions),
    [csvInput, csvOptions]
  );

  const jsonToCsvResult = useMemo(
    () => convertJsonToCsv(jsonInput, jsonOptions),
    [jsonInput, jsonOptions]
  );

  const activeResult = mode === "csv-to-json" ? csvToJsonResult : jsonToCsvResult;
  const currentOutput =
    mode === "csv-to-json"
      ? csvToJsonResult.jsonString
      : jsonToCsvResult.csvString;

  const handleCopy = async () => {
    if (!currentOutput) return;
    await navigator.clipboard.writeText(currentOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwap = () => {
    if (mode === "csv-to-json") {
      setJsonInput(csvToJsonResult.jsonString);
      setMode("json-to-csv");
    } else {
      setCsvInput(jsonToCsvResult.csvString);
      setMode("csv-to-json");
    }
  };

  const handleDownload = () => {
    if (!currentOutput) return;
    if (mode === "csv-to-json") {
      downloadTextFile(currentOutput, "converted.json", "application/json");
    } else {
      downloadTextFile(currentOutput, "converted.csv", "text/csv");
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      if (mode === "csv-to-json") {
        setCsvInput(content);
      } else {
        setJsonInput(content);
      }
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    if (mode === "csv-to-json") {
      setCsvInput("");
    } else {
      setJsonInput("");
    }
  };

  const handleLoadSample = () => {
    if (mode === "csv-to-json") {
      setCsvInput(SAMPLE_CSV);
    } else {
      setJsonInput(SAMPLE_JSON);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hidden file input for uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept={mode === "csv-to-json" ? ".csv,.tsv,.txt" : ".json,.txt"}
        onChange={(e) => handleFileUpload(e.target.files)}
        className="sr-only"
      />

      {/* Mode Switcher and Options Bar */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between shadow-xs">
        <div className="flex rounded-lg bg-muted p-1 text-sm font-medium">
          <button
            type="button"
            onClick={() => setMode("csv-to-json")}
            className={`flex items-center gap-2 rounded-md px-4 py-1.5 transition-all ${
              mode === "csv-to-json"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileSpreadsheet className="size-4 text-primary" /> CSV ➔ JSON
          </button>
          <button
            type="button"
            onClick={() => setMode("json-to-csv")}
            className={`flex items-center gap-2 rounded-md px-4 py-1.5 transition-all ${
              mode === "json-to-csv"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileCode className="size-4 text-primary" /> JSON ➔ CSV
          </button>
        </div>

        {/* Options for CSV to JSON */}
        {mode === "csv-to-json" && (
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Delimiter:</span>
              <select
                value={csvOptions.delimiter}
                onChange={(e) =>
                  setCsvOptions((prev) => ({
                    ...prev,
                    delimiter: e.target.value as CsvDelimiter,
                  }))
                }
                className="rounded-md border border-border bg-background px-2 py-1 text-foreground"
              >
                <option value="auto">Auto Detect</option>
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value="&#9;">Tab (\t)</option>
                <option value="|">Pipe (|)</option>
              </select>
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground">
              <input
                type="checkbox"
                checked={csvOptions.header}
                onChange={(e) =>
                  setCsvOptions((prev) => ({
                    ...prev,
                    header: e.target.checked,
                  }))
                }
                className="rounded border-border text-primary size-3.5"
              />
              <span>Header Row</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground">
              <input
                type="checkbox"
                checked={csvOptions.dynamicTyping}
                onChange={(e) =>
                  setCsvOptions((prev) => ({
                    ...prev,
                    dynamicTyping: e.target.checked,
                  }))
                }
                className="rounded border-border text-primary size-3.5"
              />
              <span>Parse Numbers</span>
            </label>

            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Indent:</span>
              <select
                value={csvOptions.indentSpaces}
                onChange={(e) =>
                  setCsvOptions((prev) => ({
                    ...prev,
                    indentSpaces: parseInt(e.target.value, 10) as 2 | 4 | 0,
                  }))
                }
                className="rounded-md border border-border bg-background px-2 py-1 text-foreground"
              >
                <option value="2">2 Spaces</option>
                <option value="4">4 Spaces</option>
                <option value="0">Minified</option>
              </select>
            </div>
          </div>
        )}

        {/* Options for JSON to CSV */}
        {mode === "json-to-csv" && (
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Delimiter:</span>
              <select
                value={jsonOptions.delimiter}
                onChange={(e) =>
                  setJsonOptions((prev) => ({
                    ...prev,
                    delimiter: e.target.value as "," | ";" | "\t" | "|",
                  }))
                }
                className="rounded-md border border-border bg-background px-2 py-1 text-foreground"
              >
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value="&#9;">Tab (\t)</option>
                <option value="|">Pipe (|)</option>
              </select>
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground">
              <input
                type="checkbox"
                checked={jsonOptions.header}
                onChange={(e) =>
                  setJsonOptions((prev) => ({
                    ...prev,
                    header: e.target.checked,
                  }))
                }
                className="rounded border-border text-primary size-3.5"
              />
              <span>Include Header</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground">
              <input
                type="checkbox"
                checked={jsonOptions.flattenNested}
                onChange={(e) =>
                  setJsonOptions((prev) => ({
                    ...prev,
                    flattenNested: e.target.checked,
                  }))
                }
                className="rounded border-border text-primary size-3.5"
              />
              <span>Flatten Objects</span>
            </label>
          </div>
        )}
      </div>

      {/* Dual Panel Editor: Input & Output */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Input Panel */}
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                {mode === "csv-to-json" ? "CSV Input" : "JSON Input"}
              </span>
              <Badge variant="outline" className="text-[11px] font-normal">
                {mode === "csv-to-json" ? csvInput.length : jsonInput.length} chars
              </Badge>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadSample}
                className="h-7 px-2 text-xs"
              >
                <Sparkles className="mr-1 size-3 text-primary" /> Sample
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-7 px-2 text-xs"
              >
                <Upload className="mr-1 size-3" /> Upload
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="mr-1 size-3" /> Clear
              </Button>
            </div>
          </div>

          <Textarea
            value={mode === "csv-to-json" ? csvInput : jsonInput}
            onChange={(e) =>
              mode === "csv-to-json"
                ? setCsvInput(e.target.value)
                : setJsonInput(e.target.value)
            }
            placeholder={
              mode === "csv-to-json"
                ? "Paste CSV data or drag & drop a file here..."
                : "Paste JSON array or object here..."
            }
            rows={12}
            className="font-mono text-xs resize-y"
          />
        </div>

        {/* Output Panel */}
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                {mode === "csv-to-json" ? "JSON Output" : "CSV Output"}
              </span>
              <Badge variant="outline" className="text-[11px] font-normal">
                {activeResult.stats.rowCount} rows · {activeResult.stats.columnCount} cols
              </Badge>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSwap}
                disabled={!currentOutput}
                className="h-7 px-2 text-xs"
                title="Swap input and output"
              >
                <ArrowLeftRight className="mr-1 size-3" /> Swap
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownload}
                disabled={!currentOutput}
                className="h-7 px-2.5 text-xs"
              >
                <Download className="mr-1 size-3" /> Download
              </Button>
              <Button
                size="sm"
                onClick={handleCopy}
                disabled={!currentOutput}
                className="h-7 px-2.5 text-xs"
              >
                {copied ? (
                  <>
                    <Check className="mr-1 size-3 text-emerald-500" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-1 size-3" /> Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {activeResult.error ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center text-destructive">
              <AlertCircle className="mb-2 size-6" />
              <p className="text-sm font-semibold">Conversion Error</p>
              <p className="mt-1 text-xs opacity-90">{activeResult.error}</p>
            </div>
          ) : (
            <Textarea
              readOnly
              value={currentOutput}
              placeholder="Output will appear here automatically..."
              rows={12}
              className="font-mono text-xs resize-y bg-muted/40 cursor-text"
            />
          )}
        </div>
      </div>

      {/* Interactive Table Preview of Data */}
      {activeResult.tableData.length > 0 && activeResult.headers.length > 0 && (
        <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <TableIcon className="size-4 text-primary" /> Live Data Table
                Preview
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Displaying parsed tabular records (showing up to 20 rows).
              </p>
            </div>
            <Badge variant="secondary" className="font-mono text-xs">
              Total: {activeResult.stats.rowCount} rows
            </Badge>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="py-2.5 px-3 w-12 font-semibold">#</th>
                  {activeResult.headers.map((h) => (
                    <th key={h} className="py-2.5 px-3 font-semibold text-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {activeResult.tableData.slice(0, 20).map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/20">
                    <td className="py-2 px-3 text-muted-foreground font-mono">
                      {idx + 1}
                    </td>
                    {activeResult.headers.map((h) => (
                      <td key={h} className="py-2 px-3 font-mono text-foreground">
                        {typeof row[h] === "boolean" ? (
                          <Badge
                            variant={row[h] ? "default" : "secondary"}
                            className="text-[10px] py-0 px-1.5"
                          >
                            {String(row[h])}
                          </Badge>
                        ) : typeof row[h] === "object" && row[h] !== null ? (
                          JSON.stringify(row[h])
                        ) : (
                          String(row[h] ?? "")
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
