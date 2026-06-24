# 🧮 五险一金计算器

一个迷你的 Web 应用，上传员工工资数据和城市社保标准，自动计算公司应为每位员工缴纳的社保公积金费用。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Next.js 16 (App Router) |
| UI 样式 | Tailwind CSS 4 |
| 数据库 | Supabase (PostgreSQL) |
| Excel 解析 | SheetJS (xlsx) |
| 语言 | TypeScript |

## 功能

- 📤 **数据上传** — 上传城市社保标准 Excel 和员工工资 Excel，支持中文/英文列名自动匹配
- ⚙️ **社保计算** — 多城市支持，按年份匹配工资数据，封顶保底规则自动计算缴费基数
- 📊 **结果展示** — 表格展示每位员工的月平均工资、缴费基数、公司应缴纳金额

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/woshiningshu-tech/shebao-calculator.git
cd shebao-calculator
npm install
```

### 2. 配置 Supabase

在 [supabase.com](https://supabase.com) 创建项目，获取 `Project URL` 和 `anon key`。

创建 `.env.local`：

```
NEXT_PUBLIC_SUPABASE_URL=https://你的项目id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon_key
```

在 Supabase SQL Editor 中执行 [`setup.sql`](setup.sql) 建表。

### 3. 启动

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

## 项目结构

```
├── app/
│   ├── page.tsx              # 主页（导航卡片）
│   ├── upload/page.tsx        # 数据上传 & 计算触发
│   └── results/page.tsx       # 计算结果表格
├── lib/
│   ├── actions.ts             # Server Actions（上传/计算/查询）
│   ├── calculator.ts          # 核心计算逻辑
│   ├── excel-parser.ts        # Excel 文件解析
│   └── supabase.ts            # Supabase 客户端
├── components/
│   ├── Navbar.tsx             # 顶部导航栏
│   └── ResultTable.tsx        # 结果表格组件
├── types/database.ts          # 数据库类型定义
└── setup.sql                  # 建表 SQL
```

## 核心计算逻辑

1. 从 `salaries` 表按员工姓名分组，计算年度月平均工资
2. 从 `cities` 表获取目标城市该年份的基数上下限和费率
3. 封顶保底：低于下限按下限，高于上限按上限，中间取自身
4. `公司应缴金额 = 缴费基数 × 费率`

## 数据库表

| 表 | 用途 |
|----|------|
| `cities` | 城市社保标准（基数下限、基数上限、综合费率） |
| `salaries` | 员工月工资记录 |
| `results` | 计算结果（月均工资、缴费基数、公司应缴金额） |
