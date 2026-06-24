import type { CalculationResult } from "@/types/database";

interface ResultTableProps {
  data: CalculationResult[];
}

export default function ResultTable({ data }: ResultTableProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-lg">暂无计算结果</p>
        <p className="text-sm mt-2">请先上传数据并执行计算</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-6 py-3 font-semibold text-gray-700">员工姓名</th>
            <th className="px-6 py-3 font-semibold text-gray-700">年度月平均工资</th>
            <th className="px-6 py-3 font-semibold text-gray-700">最终缴费基数</th>
            <th className="px-6 py-3 font-semibold text-gray-700">公司应缴纳金额</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={row.id ?? idx}
              className="border-b border-gray-100 last:border-none hover:bg-blue-50/40 transition-colors"
            >
              <td className="px-6 py-3 font-medium text-gray-800">{row.employee_name}</td>
              <td className="px-6 py-3 text-gray-600">
                {row.avg_salary.toLocaleString("zh-CN", { maximumFractionDigits: 0 })}
              </td>
              <td className="px-6 py-3 text-gray-600">
                {row.contribution_base.toLocaleString("zh-CN", { maximumFractionDigits: 0 })}
              </td>
              <td className="px-6 py-3 text-gray-800 font-medium">
                ¥{row.company_fee.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
