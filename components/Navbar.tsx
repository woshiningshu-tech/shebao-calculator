import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-gray-800 hover:text-blue-600 transition-colors">
          🧮 五险一金计算器
        </Link>
        <div className="flex gap-6 text-sm font-medium">
          <Link href="/upload" className="text-gray-600 hover:text-blue-600 transition-colors">
            数据上传
          </Link>
          <Link href="/results" className="text-gray-600 hover:text-blue-600 transition-colors">
            结果查询
          </Link>
        </div>
      </div>
    </nav>
  );
}
