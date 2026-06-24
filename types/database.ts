// 城市社保标准表
export interface City {
  id?: number;
  city_name: string;
  year: string;
  base_min: number;
  base_max: number;
  rate: number;
}

// 员工工资表
export interface Salary {
  id?: number;
  employee_id: string;
  employee_name: string;
  month: string; // YYYYMM 格式
  salary_amount: number;
}

// 计算结果表
export interface CalculationResult {
  id?: number;
  employee_name: string;
  avg_salary: number;
  contribution_base: number;
  company_fee: number;
}

// 城市+年份选项（用于下拉框）
export interface CityOption {
  city_name: string;
  year: string;
}
