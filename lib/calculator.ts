import { Salary, City, CalculationResult } from "@/types/database";

/**
 * 核心计算函数：根据员工工资和城市社保标准，计算每位员工的应缴金额
 *
 * @param salaries - 按年份筛选后的员工工资记录
 * @param cityStandard - 城市社保标准（base_min, base_max, rate）
 * @returns 计算结果数组（不含 id）
 */
export function calculateShebao(
  salaries: Salary[],
  cityStandard: Pick<City, "base_min" | "base_max" | "rate">
): Omit<CalculationResult, "id">[] {
  // 步骤1: 按 employee_name 分组，计算年度月平均工资
  const groups = new Map<
    string,
    { salaries: number[]; months: Set<string> }
  >();

  for (const s of salaries) {
    if (!groups.has(s.employee_name)) {
      groups.set(s.employee_name, { salaries: [], months: new Set() });
    }
    const g = groups.get(s.employee_name)!;
    g.salaries.push(s.salary_amount);
    g.months.add(s.month);
  }

  // 步骤2: 为每位员工计算最终缴费基数
  const { base_min, base_max, rate } = cityStandard;
  const results: Omit<CalculationResult, "id">[] = [];

  for (const [employeeName, group] of groups) {
    // 年度月平均工资 = 总工资 / 有工资记录的月数
    const avgSalary = group.salaries.reduce((sum, s) => sum + s, 0) / group.salaries.length;

    // 步骤3: 封顶保底 — 确定最终缴费基数
    let contributionBase: number;
    if (avgSalary < base_min) {
      contributionBase = base_min;
    } else if (avgSalary > base_max) {
      contributionBase = base_max;
    } else {
      contributionBase = avgSalary;
    }

    // 步骤4: 计算公司应缴纳金额
    const companyFee = contributionBase * rate;

    results.push({
      employee_name: employeeName,
      avg_salary: Math.round(avgSalary * 100) / 100,
      contribution_base: contributionBase,
      company_fee: Math.round(companyFee * 100) / 100,
    });
  }

  return results;
}
