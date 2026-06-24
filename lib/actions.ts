"use server";

import { getSupabase } from "@/lib/supabase";
import { parseExcelBuffer } from "@/lib/excel-parser";
import { calculateShebao } from "@/lib/calculator";
import type { City, Salary, CalculationResult, CityOption } from "@/types/database";

/**
 * 从 Excel 行中取值，支持多别名匹配 + 自动 trim key
 */
function getVal(
  row: Record<string, unknown>,
  keys: string[]
): string | undefined {
  // 先尝试精确匹配
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null) return String(row[k]).trim();
  }
  // 再尝试 trim key 后匹配
  const trimmedKeys = Object.keys(row).reduce(
    (acc, k) => ({ ...acc, [k.trim()]: row[k] }),
    {} as Record<string, unknown>
  );
  for (const k of keys) {
    if (trimmedKeys[k] !== undefined && trimmedKeys[k] !== null)
      return String(trimmedKeys[k]).trim();
  }
  return undefined;
}

// ============================================================
// 上传城市数据
// ============================================================
export async function uploadCitiesAction(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) return { success: false, message: "请选择文件" };

  try {
    const buffer = await file.arrayBuffer();
    const rows = parseExcelBuffer(buffer);

    const cities: City[] = rows.map((row) => ({
      city_name:
        getVal(row, ["city_name", "city_namte", "城市", "city"]) ?? "",
      year: getVal(row, ["year", "年份"]) ?? "",
      base_min: Number(
        row.base_min ?? row["基数下限"] ?? row["下限"] ?? 0
      ),
      base_max: Number(
        row.base_max ?? row["基数上限"] ?? row["上限"] ?? 0
      ),
      rate: Number(row.rate ?? row["比例"] ?? 0),
    }));

    if (cities.length === 0 || !cities[0].city_name) {
      return { success: false, message: "Excel 数据为空或列名不匹配" };
    }

    const supabase = getSupabase();
    // 全量替换：先清空，再插入
    await supabase.from("cities").delete().neq("id", 0);
    const { error } = await supabase.from("cities").insert(cities);
    if (error) throw error;

    return { success: true, message: `成功导入 ${cities.length} 条城市数据` };
  } catch (err) {
    return {
      success: false,
      message: `导入失败: ${err instanceof Error ? err.message : "未知错误"}`,
    };
  }
}

// ============================================================
// 上传员工工资数据
// ============================================================
export async function uploadSalariesAction(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) return { success: false, message: "请选择文件" };

  try {
    const buffer = await file.arrayBuffer();
    const rows = parseExcelBuffer(buffer);

    const salaries: Salary[] = rows.map((row) => ({
      employee_id:
        getVal(row, ["employee_id", "员工工号", "工号", "员工编号"]) ?? "",
      employee_name:
        getVal(row, ["employee_name", "员工姓名", "姓名"]) ?? "",
      month: getVal(row, ["month", "月份", "年月"]) ?? "",
      salary_amount: Number(
        row.salary_amount ?? row["工资金额"] ?? row["工资"] ?? row["salary"] ?? 0
      ),
    }));

    if (salaries.length === 0 || !salaries[0].employee_name) {
      return { success: false, message: "Excel 数据为空或列名不匹配" };
    }

    const supabase = getSupabase();
    // 全量替换
    await supabase.from("salaries").delete().neq("id", 0);
    const { error } = await supabase.from("salaries").insert(salaries);
    if (error) throw error;

    return { success: true, message: `成功导入 ${salaries.length} 条工资数据` };
  } catch (err) {
    return {
      success: false,
      message: `导入失败: ${err instanceof Error ? err.message : "未知错误"}`,
    };
  }
}

// ============================================================
// 执行计算并存储结果
// ============================================================
export async function calculateAndSaveAction(cityName: string, year: string) {
  if (!cityName || !year) {
    return { success: false, message: "请选择城市和年份" };
  }

  try {
    const supabase = getSupabase();

    // 1. 获取城市社保标准
    const { data: cityData, error: cityError } = await supabase
      .from("cities")
      .select("*")
      .eq("city_name", cityName)
      .eq("year", year)
      .single();

    if (cityError || !cityData) {
      return { success: false, message: `未找到 ${cityName} ${year} 年的社保数据` };
    }

    // 2. 获取该年份的所有工资记录 (YYYYMM 前4位匹配)
    const { data: allSalaries, error: salaryError } = await supabase
      .from("salaries")
      .select("*");

    if (salaryError) throw salaryError;
    if (!allSalaries || allSalaries.length === 0) {
      return { success: false, message: "salaries 表为空，请先上传工资数据" };
    }

    const yearSalaries = allSalaries.filter((s) =>
      String(s.month).startsWith(year)
    );

    if (yearSalaries.length === 0) {
      return { success: false, message: `没有找到 ${year} 年的工资记录` };
    }

    // 3. 执行核心计算
    const results = calculateShebao(yearSalaries as Salary[], {
      base_min: cityData.base_min,
      base_max: cityData.base_max,
      rate: cityData.rate,
    });

    // 4. 全量替换 results 表
    await supabase.from("results").delete().neq("id", 0);
    const { error: insertError } = await supabase.from("results").insert(results);
    if (insertError) throw insertError;

    return {
      success: true,
      message: `计算完成！已将 ${results.length} 位员工的结果存入数据库`,
    };
  } catch (err) {
    return {
      success: false,
      message: `计算失败: ${err instanceof Error ? err.message : "未知错误"}`,
    };
  }
}

// ============================================================
// 获取全部计算结果
// ============================================================
export async function getResultsAction(): Promise<CalculationResult[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("results")
      .select("*")
      .order("employee_name");

    if (error) throw error;
    return data as CalculationResult[];
  } catch {
    return [];
  }
}

// ============================================================
// 获取城市+年份选项列表
// ============================================================
export async function getCityOptionsAction(): Promise<CityOption[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("cities")
      .select("city_name, year")
      .order("city_name");

    if (error) throw error;

    // 去重
    const seen = new Set<string>();
    const options: CityOption[] = [];
    for (const item of data) {
      const key = `${item.city_name}|${item.year}`;
      if (!seen.has(key)) {
        seen.add(key);
        options.push({ city_name: item.city_name, year: item.year });
      }
    }
    return options;
  } catch {
    return [];
  }
}
