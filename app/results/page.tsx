import ResultTable from "@/components/ResultTable";
import { getSupabase } from "@/lib/supabase";
import type { CalculationResult } from "@/types/database";

// 禁用静态预渲染 — 此页面依赖实时数据库数据
export const dynamic = "force-dynamic";

async function fetchResults(): Promise<CalculationResult[]> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("results")
    .select("*")
    .order("employee_name");
  return (data as CalculationResult[]) ?? [];
}

export default async function ResultsPage() {
  const results = await fetchResults();

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">📊 计算结果</h1>
        <p className="text-gray-500 text-sm mt-1">
          共 {results.length} 位员工
        </p>
      </div>

      <ResultTable data={results} />
    </div>
  );
}
