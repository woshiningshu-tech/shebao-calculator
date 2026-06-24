import Link from "next/link";

const cards = [
  {
    href: "/upload",
    title: "数据上传",
    description: "上传城市社保标准和员工工资 Excel 文件，选择城市和年份后一键执行计算。",
    icon: "📤",
    bg: "bg-blue-50",
  },
  {
    href: "/results",
    title: "结果查询",
    description: "查看所有计算结果，包括每位员工的月平均工资、缴费基数和公司应缴纳金额。",
    icon: "📊",
    bg: "bg-green-50",
  },
];

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          🧮 五险一金计算器
        </h1>
        <p className="text-gray-500">
          快速计算公司为员工应缴纳的社保公积金费用
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group block bg-white rounded-2xl border border-gray-200 p-8 shadow-sm
                       hover:shadow-md hover:border-gray-300 transition-all duration-200"
          >
            <div
              className={`w-14 h-14 rounded-xl ${card.bg} flex items-center justify-center text-2xl mb-5`}
            >
              {card.icon}
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
              {card.title}
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              {card.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
