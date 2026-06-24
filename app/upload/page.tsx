"use client";

import { useState, useEffect, useCallback } from "react";
import {
  uploadCitiesAction,
  uploadSalariesAction,
  calculateAndSaveAction,
  getCityOptionsAction,
} from "@/lib/actions";
import type { CityOption } from "@/types/database";

export default function UploadPage() {
  // 城市选项
  const [cityOptions, setCityOptions] = useState<CityOption[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [availableYears, setAvailableYears] = useState<string[]>([]);

  // 文件
  const [citiesFile, setCitiesFile] = useState<File | null>(null);
  const [salariesFile, setSalariesFile] = useState<File | null>(null);

  // 状态
  const [uploadingCities, setUploadingCities] = useState(false);
  const [uploadingSalaries, setUploadingSalaries] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // 页面加载时获取城市列表
  useEffect(() => {
    getCityOptionsAction().then(setCityOptions);
  }, []);

  // 城市变化时更新年份列表
  useEffect(() => {
    const years = [
      ...new Set(
        cityOptions
          .filter((c) => c.city_name === selectedCity)
          .map((c) => c.year)
      ),
    ].sort();
    setAvailableYears(years);
    setSelectedYear("");
  }, [selectedCity, cityOptions]);

  // 上传城市 Excel
  const handleUploadCities = useCallback(async () => {
    if (!citiesFile) return;
    setUploadingCities(true);
    setMessage(null);
    const fd = new FormData();
    fd.append("file", citiesFile);
    const result = await uploadCitiesAction(fd);
    setMessage({ type: result.success ? "success" : "error", text: result.message });
    if (result.success) {
      // 刷新城市选项
      const options = await getCityOptionsAction();
      setCityOptions(options);
    }
    setUploadingCities(false);
  }, [citiesFile]);

  // 上传工资 Excel
  const handleUploadSalaries = useCallback(async () => {
    if (!salariesFile) return;
    setUploadingSalaries(true);
    setMessage(null);
    const fd = new FormData();
    fd.append("file", salariesFile);
    const result = await uploadSalariesAction(fd);
    setMessage({ type: result.success ? "success" : "error", text: result.message });
    setUploadingSalaries(false);
  }, [salariesFile]);

  // 执行计算
  const handleCalculate = useCallback(async () => {
    if (!selectedCity || !selectedYear) return;
    setCalculating(true);
    setMessage(null);
    const result = await calculateAndSaveAction(selectedCity, selectedYear);
    setMessage({ type: result.success ? "success" : "error", text: result.message });
    setCalculating(false);
  }, [selectedCity, selectedYear]);

  const btnBase =
    "px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">📤 数据上传与计算</h1>
        <p className="text-gray-500 text-sm mt-1">上传 Excel 数据，执行社保缴费计算</p>
      </div>

      {/* 反馈消息 */}
      {message && (
        <div
          className={`px-4 py-3 rounded-lg text-sm font-medium ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* 数据上传区 */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-1">📋 数据上传</h2>

        {/* 城市表上传 */}
        <div className="flex items-center gap-4 flex-wrap">
          <label className="flex-1 min-w-[200px]">
            <span className="text-sm font-medium text-gray-600">城市社保标准 (cities.xlsx)</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setCitiesFile(e.target.files?.[0] ?? null)}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4
                         file:rounded-lg file:border-0 file:text-sm file:font-medium
                         file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100
                         file:cursor-pointer cursor-pointer"
            />
          </label>
          <button
            onClick={handleUploadCities}
            disabled={!citiesFile || uploadingCities}
            className={`${btnBase} bg-blue-600 text-white hover:bg-blue-700 self-end`}
          >
            {uploadingCities ? "上传中..." : "上传城市数据"}
          </button>
        </div>

        {/* 工资表上传 */}
        <div className="flex items-center gap-4 flex-wrap">
          <label className="flex-1 min-w-[200px]">
            <span className="text-sm font-medium text-gray-600">员工工资数据 (salaries.xlsx)</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setSalariesFile(e.target.files?.[0] ?? null)}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4
                         file:rounded-lg file:border-0 file:text-sm file:font-medium
                         file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100
                         file:cursor-pointer cursor-pointer"
            />
          </label>
          <button
            onClick={handleUploadSalaries}
            disabled={!salariesFile || uploadingSalaries}
            className={`${btnBase} bg-blue-600 text-white hover:bg-blue-700 self-end`}
          >
            {uploadingSalaries ? "上传中..." : "上传工资数据"}
          </button>
        </div>
      </section>

      {/* 执行计算区 */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-1">⚙️ 执行计算</h2>

        {/* 城市下拉框 */}
        <div className="flex items-center gap-4 flex-wrap">
          <label className="flex-1 min-w-[160px]">
            <span className="text-sm font-medium text-gray-600">选择城市</span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">-- 请选择 --</option>
              {[...new Set(cityOptions.map((c) => c.city_name))].sort().map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          {/* 年份下拉框 */}
          <label className="flex-1 min-w-[160px]">
            <span className="text-sm font-medium text-gray-600">选择年份</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              disabled={!selectedCity}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">-- 请选择 --</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>

          <button
            onClick={handleCalculate}
            disabled={!selectedCity || !selectedYear || calculating}
            className={`${btnBase} bg-green-600 text-white hover:bg-green-700 self-end`}
          >
            {calculating ? "计算中..." : "执行计算并存储结果"}
          </button>
        </div>
      </section>
    </div>
  );
}
