export type ConverterMode = "csv-to-json" | "json-to-csv";

export type CsvDelimiter = "auto" | "," | ";" | "\t" | "|";

export interface CsvToJsonOptions {
  delimiter: CsvDelimiter;
  header: boolean;
  dynamicTyping: boolean;
  skipEmptyLines: boolean;
  indentSpaces: 2 | 4 | 0; // 0 for minified
}

export interface JsonToCsvOptions {
  delimiter: "," | ";" | "\t" | "|";
  header: boolean;
  quotes: boolean;
  flattenNested: boolean;
}

export interface ConversionStats {
  rowCount: number;
  columnCount: number;
  inputBytes: number;
  outputBytes: number;
}
