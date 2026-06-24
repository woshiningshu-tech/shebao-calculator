import * as XLSX from "xlsx";

/**
 * 解析 Excel 文件的 ArrayBuffer，返回行数据数组
 * @param buffer - Excel 文件的 ArrayBuffer
 * @returns 解析后的行数据（key-value 对象数组）
 */
export function parseExcelBuffer(buffer: ArrayBuffer): Record<string, unknown>[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(worksheet);
}
