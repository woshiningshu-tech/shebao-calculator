-- 五险一金计算器 - 数据表建表 SQL
-- 在 Supabase SQL Editor 中执行此文件

-- 1. 城市社保标准表
CREATE TABLE IF NOT EXISTS cities (
  id BIGSERIAL PRIMARY KEY,
  city_name TEXT NOT NULL,
  year TEXT NOT NULL,
  base_min BIGINT NOT NULL,
  base_max BIGINT NOT NULL,
  rate FLOAT8 NOT NULL
);

-- 2. 员工工资表
CREATE TABLE IF NOT EXISTS salaries (
  id BIGSERIAL PRIMARY KEY,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  month TEXT NOT NULL,
  salary_amount BIGINT NOT NULL
);

-- 3. 计算结果表
CREATE TABLE IF NOT EXISTS results (
  id BIGSERIAL PRIMARY KEY,
  employee_name TEXT NOT NULL,
  avg_salary FLOAT8 NOT NULL,
  contribution_base FLOAT8 NOT NULL,
  company_fee FLOAT8 NOT NULL
);

-- 为了让 anon key 能读写，开启 RLS 并允许公开访问
-- （如果不需要 RLS，可以跳过这步，直接通过 anon key + RLS disabled 操作）
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- 允许公开读写（内部工具简化配置）
CREATE POLICY "Allow all on cities" ON cities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on salaries" ON salaries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on results" ON results FOR ALL USING (true) WITH CHECK (true);
