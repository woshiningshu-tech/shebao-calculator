# 五险一金计算器 — 项目上下文中枢

> **最后更新**: 2026-06-24
> **状态**: ✅ 开发完成，端到端测试通过

---

## 1. 项目概述

构建一个迷你的"五险一金"计算器 Web 应用。用户上传城市社保标准和员工工资数据（Excel），选择一个城市后，系统自动计算公司应为每位员工缴纳的社保公积金费用，并将结果以表格形式展示。

### 核心用户流程

```
上传 Excel (cities + salaries) → 选择城市 → 点击计算 → 查看结果表格
```

---

## 2. 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端框架 | Next.js (App Router) | 最新版本，使用 Server Components + Client Components |
| UI / 样式 | Tailwind CSS | 实用优先的原子化 CSS 框架 |
| 数据库 | Supabase | 提供 PostgreSQL 数据库 + 自动生成的 REST API |
| Excel 解析 | SheetJS (xlsx) | 在服务端解析上传的 Excel 文件 |
| 语言 | TypeScript | 全栈类型安全 |

---

## 3. 数据库设计 (Supabase)

### 3.1 `cities` — 城市社保标准表

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `id` | `int8` (PK, 自增) | 主键 | 1 |
| `city_name` | `text` | 城市名称 | "佛山" |
| `year` | `text` | 适用年份 | "2025" |
| `base_min` | `int8` | 社保基数下限 | 4492 |
| `base_max` | `int8` | 社保基数上限 | 27501 |
| `rate` | `float8` | 综合缴纳比例 | 0.15 |

### 3.2 `salaries` — 员工工资表

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `id` | `int8` (PK, 自增) | 主键 | 1 |
| `employee_id` | `text` | 员工工号 | "EMP001" |
| `employee_name` | `text` | 员工姓名 | "张三" |
| `month` | `text` | 年月 (YYYYMM) | "202501" |
| `salary_amount` | `int8` | 当月工资金额 | 8000 |

### 3.3 `results` — 计算结果表

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `int8` (PK, 自增) | 主键 |
| `employee_name` | `text` | 员工姓名 |
| `avg_salary` | `float8` | 年度月平均工资 |
| `contribution_base` | `float8` | 最终缴费基数 (封顶保底后) |
| `company_fee` | `float8` | 公司应缴纳金额 |

---

## 4. 核心业务逻辑

### 计算函数：`calculateShebao(cityName, year)`

```
输入: city_name (城市名), year (年份)
输出: results[] 写入数据库

步骤:
1. 从 salaries 表读取所有数据
2. 按 employee_name 分组，计算每位员工的「年度月平均工资」
   - 匹配逻辑: salaries.month 的前4位 === year (YYYYMM → YYYY)
   - avg_salary = SUM(salary_amount) / 月份数
3. 从 cities 表获取该城市该年份的 base_min、base_max、rate
4. 对每位员工，确定「最终缴费基数」:
   - if avg_salary < base_min → contribution_base = base_min
   - if avg_salary > base_max → contribution_base = base_max
   - else → contribution_base = avg_salary
5. 计算公司应缴金额:
   - company_fee = contribution_base × rate
6. 将结果写入 results 表（全量替换: 先清空 results 表，再批量插入）
```

### 关键约束

- **年份匹配**: `salaries.month` 是 YYYYMM 格式（如 "202501"），取前 4 位与 `cities.year` 匹配
- **全量替换**: 每次触发计算，先 `DELETE` 清空 `results` 表所有旧数据，再 `INSERT` 新结果
- **城市选择**: 用户在上传页通过下拉框手动选择目标城市

---

## 5. 前端页面设计

### 5.1 `/` — 主页

- **定位**: 入口页面 + 导航中枢
- **布局**: 居中排列两张功能卡片，响应式（桌面端并排 / 移动端堆叠）
- **卡片一 "数据上传"**: 描述"上传 Excel 数据并执行计算"，点击跳转 `/upload`
- **卡片二 "结果查询"**: 描述"查看社保计算结果"，点击跳转 `/results`

### 5.2 `/upload` — 数据上传与操作页

- **定位**: 后台操作控制面板
- **功能区一 — 数据上传**:
  - 上传 cities.xlsx → 解析后写入 `cities` 表（全量替换）
  - 上传 salaries.xlsx → 解析后写入 `salaries` 表（全量替换）
  - 上传后显示成功提示（插入了多少行数据）
- **功能区二 — 执行计算**:
  - 城市下拉选择框（从 `cities` 表获取可选城市列表）
  - 年份下拉选择框（从选中城市的数据中获取可选年份）
  - "执行计算并存储结果" 按钮 → 触发 `calculateShebao()` → 提示成功
- **交互细节**: 按钮点击后显示 loading 状态；操作完成用 toast / alert 反馈

### 5.3 `/results` — 结果查询与展示页

- **定位**: 计算结果展示
- **功能**: 页面加载时自动从 `results` 表获取全部数据
- **展示**: 使用 Tailwind CSS 样式的表格
  - 表头: 员工姓名 | 年度月平均工资 | 最终缴费基数 | 公司应缴纳金额
  - 空态处理: 若无数据，显示"暂无计算结果"
  - 数值格式化: 平均工资和基数保留整数，公司缴纳金额保留两位小数

---

## 6. 项目目录结构（规划）

```
shebao/
├── .env.local                  # Supabase 环境变量
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.ts
├── app/
│   ├── layout.tsx              # 全局布局（含导航栏）
│   ├── page.tsx                # 主页 (卡片导航)
│   ├── globals.css             # Tailwind 入口样式
│   ├── upload/
│   │   └── page.tsx            # 上传与操作页
│   └── results/
│       └── page.tsx            # 结果展示页
├── lib/
│   ├── supabase.ts             # Supabase 客户端 (服务端)
│   ├── calculator.ts           # 核心计算函数
│   └── excel-parser.ts         # Excel 解析工具 (基于 xlsx)
├── types/
│   └── database.ts             # 数据库表对应的 TypeScript 类型
└── components/
    ├── Navbar.tsx              # 顶部导航
    └── ResultTable.tsx         # 结果表格组件
```

---

## 7. 开发 TODO 清单

### 阶段一：项目初始化与环境搭建

- [x] **T1.1** 使用 `create-next-app` 创建 Next.js 项目，启用 TypeScript 和 Tailwind CSS
- [x] **T1.2** 安装依赖: `@supabase/supabase-js`, `xlsx` (SheetJS)
- [x] **T1.3** 在 Supabase 控制台创建项目，获取 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [x] **T1.4** 创建 `.env.local` 文件，配置 Supabase 环境变量
- [x] **T1.5** 在 Supabase SQL Editor 中执行建表 SQL，创建 `cities`、`salaries`、`results` 三张表

### 阶段二：基础设施层

- [x] **T2.1** 创建 `types/database.ts`，定义三张表的 TypeScript 接口
- [x] **T2.2** 创建 `lib/supabase.ts`，初始化 Supabase 服务端客户端
- [x] **T2.3** 创建 `lib/excel-parser.ts`，实现 Excel 文件解析函数（读取文件 buffer → 返回行数据数组）
- [x] **T2.4** 创建 `lib/calculator.ts`，实现核心计算函数 `calculateShebao(cityName, year)`

### 阶段三：API 路由 (Server Actions 或 Route Handlers)

- [x] **T3.1** 实现「上传 cities Excel → 写入数据库」的 Server Action
- [x] **T3.2** 实现「上传 salaries Excel → 写入数据库」的 Server Action
- [x] **T3.3** 实现「执行计算并存储结果」的 Server Action（调用 `calculateShebao`）
- [x] **T3.4** 实现「获取 results 数据」的 Server Action（供结果页调用）
- [x] **T3.5** 实现「获取城市列表 + 年份列表」的 Server Action（供上传页下拉框使用）

### 阶段四：前端页面开发

- [x] **T4.1** 创建全局布局 `app/layout.tsx` 和导航组件 `components/Navbar.tsx`
- [x] **T4.2** 开发主页 `app/page.tsx`（两张导航卡片，响应式布局）
- [x] **T4.3** 开发上传页 `app/upload/page.tsx`
  - 城市下拉框 + 年份下拉框
  - "上传 cities Excel" 按钮 + "上传 salaries Excel" 按钮
  - "执行计算并存储结果" 按钮
  - Loading 状态 + 操作反馈
- [x] **T4.4** 开发结果页 `app/results/page.tsx`
  - 自动加载 results 数据
  - 表格展示（含空态处理、数值格式化）
  - 创建 `components/ResultTable.tsx` 表格组件

### 阶段五：集成与打磨

- [x] **T5.1** 全流程端到端测试：上传 Excel → 选择城市/年份 → 计算 → 查看结果
- [x] **T5.2** UI 细节优化（hover 效果、间距、字体一致性）
- [x] **T5.3** 错误处理完善（Excel 格式校验、数据库操作失败提示等）

---

> **使用说明**: 后续每次开发会话，请首先读取本文件以确保上下文对齐。每完成一个 TODO 项，请更新其状态为 `[x]`。
