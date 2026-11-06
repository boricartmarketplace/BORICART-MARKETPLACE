import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  PieChart,
  BarChart3,
  Download,
  Printer,
  ShoppingBag,
  Store,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
} from 'lucide-react';
import { Order, Product } from '../../types';
import { formatNaira } from '../../firebase/services';

interface ProfitReportsTabProps {
  orders: Order[];
  products: Product[];
}

type PeriodType = 'daily' | 'weekly' | 'monthly' | 'annual';

interface FinancialPeriodSummary {
  periodLabel: string;
  startDate: string;
  orderCount: number;
  onlineCount: number;
  offlineCount: number;
  grossRevenue: number;
  cogs: number; // Cost of Goods Sold
  adSpend: number;
  grossProfit: number;
  netProfit: number;
  marginPercent: number;
}

export const ProfitReportsTab: React.FC<ProfitReportsTabProps> = ({ orders, products }) => {
  const [period, setPeriod] = useState<PeriodType>('daily');
  const [channelFilter, setChannelFilter] = useState<'all' | 'online' | 'offline'>('all');

  // Map products by ID for fast fallback COGS/Ad Spend lookups
  const productMap = useMemo(() => {
    const map = new Map<string, Product>();
    products.forEach((p) => map.set(p.id, p));
    return map;
  }, [products]);

  // Filter completed / delivered orders only
  const validOrders = useMemo(() => {
    return orders.filter((o) => {
      // Exclude cancelled and failed orders
      if (o.status === 'cancelled' || o.status === 'failed_delivery') return false;
      if (channelFilter === 'online' && o.channel === 'offline') return false;
      if (channelFilter === 'offline' && o.channel !== 'offline') return false;
      return true;
    });
  }, [orders, channelFilter]);

  // Aggregate orders into Period Summaries (Daily, Weekly, Monthly, Annual)
  const summaries = useMemo(() => {
    const map = new Map<string, FinancialPeriodSummary>();

    validOrders.forEach((ord) => {
      const orderDate = new Date(ord.createdAt);
      if (isNaN(orderDate.getTime())) return;

      let key = '';
      let label = '';

      if (period === 'daily') {
        key = orderDate.toISOString().slice(0, 10); // YYYY-MM-DD
        label = orderDate.toLocaleDateString('en-GB', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      } else if (period === 'weekly') {
        // Calculate week number
        const oneJan = new Date(orderDate.getFullYear(), 0, 1);
        const numberOfDays = Math.floor((orderDate.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
        const weekNumber = Math.ceil((orderDate.getDay() + 1 + numberOfDays) / 7);
        key = `${orderDate.getFullYear()}-W${weekNumber}`;
        label = `Week ${weekNumber}, ${orderDate.getFullYear()}`;
      } else if (period === 'monthly') {
        key = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
        label = orderDate.toLocaleDateString('en-GB', {
          month: 'long',
          year: 'numeric',
        });
      } else {
        // annual
        key = String(orderDate.getFullYear());
        label = `Year ${orderDate.getFullYear()}`;
      }

      // Calculate order revenue, cogs, ads
      const revenue = ord.totalAmount || 0;
      let orderCogs = ord.costAmount;
      let orderAds = ord.adSpendAmount;

      if (orderCogs === undefined) {
        orderCogs = ord.items.reduce((sum, item) => {
          const prod = productMap.get(item.productId);
          const unitCost = item.costPrice !== undefined ? item.costPrice : (prod?.costPrice || 0);
          return sum + unitCost * item.quantity;
        }, 0);
      }

      if (orderAds === undefined) {
        orderAds = ord.items.reduce((sum, item) => {
          const prod = productMap.get(item.productId);
          const unitAd = item.adSpend !== undefined ? item.adSpend : (prod?.adSpend || 0);
          return sum + unitAd * item.quantity;
        }, 0);
      }

      const isOffline = ord.channel === 'offline';

      if (!map.has(key)) {
        map.set(key, {
          periodLabel: label,
          startDate: key,
          orderCount: 0,
          onlineCount: 0,
          offlineCount: 0,
          grossRevenue: 0,
          cogs: 0,
          adSpend: 0,
          grossProfit: 0,
          netProfit: 0,
          marginPercent: 0,
        });
      }

      const cur = map.get(key)!;
      cur.orderCount += 1;
      if (isOffline) cur.offlineCount += 1;
      else cur.onlineCount += 1;
      cur.grossRevenue += revenue;
      cur.cogs += orderCogs;
      cur.adSpend += orderAds;
      cur.grossProfit = cur.grossRevenue - cur.cogs;
      cur.netProfit = cur.grossRevenue - cur.cogs - cur.adSpend;
      cur.marginPercent = cur.grossRevenue > 0 ? Math.round((cur.netProfit / cur.grossRevenue) * 100) : 0;
    });

    // Convert map to sorted array (newest period first)
    const list = Array.from(map.values());
    list.sort((a, b) => b.startDate.localeCompare(a.startDate));
    return list;
  }, [validOrders, period, productMap]);

  // Overall Totals
  const totalRevenue = summaries.reduce((sum, s) => sum + s.grossRevenue, 0);
  const totalCogs = summaries.reduce((sum, s) => sum + s.cogs, 0);
  const totalAdSpend = summaries.reduce((sum, s) => sum + s.adSpend, 0);
  const totalGrossProfit = totalRevenue - totalCogs;
  const totalNetProfit = totalRevenue - totalCogs - totalAdSpend;
  const overallMarginPercent = totalRevenue > 0 ? Math.round((totalNetProfit / totalRevenue) * 100) : 0;
  const totalOrdersCount = summaries.reduce((sum, s) => sum + s.orderCount, 0);
  const totalOnlineCount = summaries.reduce((sum, s) => sum + s.onlineCount, 0);
  const totalOfflineCount = summaries.reduce((sum, s) => sum + s.offlineCount, 0);

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Period', 'Orders Count', 'Online Orders', 'Offline Orders', 'Gross Revenue (NGN)', 'COGS (NGN)', 'Ad Spend (NGN)', 'Gross Profit (NGN)', 'Net Profit (NGN)', 'Net Margin %'];
    const rows = summaries.map((s) => [
      `"${s.periodLabel}"`,
      s.orderCount,
      s.onlineCount,
      s.offlineCount,
      s.grossRevenue,
      s.cogs,
      s.adSpend,
      s.grossProfit,
      s.netProfit,
      `${s.marginPercent}%`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `boricart_${period}_profit_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Top Title & Period Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-black text-2xl text-[#333333]">Financial & Profit Reports</h3>
          <p className="text-xs text-gray-500 mt-1">
            Track daily, weekly, monthly, and annual financial health: Gross Sales, COGS, Ad Spend, and Net Profit.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Period Toggle */}
          <div className="flex rounded-xl bg-gray-200/80 p-1">
            <button
              onClick={() => setPeriod('daily')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                period === 'daily' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setPeriod('weekly')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                period === 'weekly' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                period === 'monthly' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setPeriod('annual')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                period === 'annual' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Annual
            </button>
          </div>

          {/* Channel Filter */}
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value as any)}
            className="text-xs font-bold bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#F5A623]"
          >
            <option value="all">All Channels (Online + Offline)</option>
            <option value="online">Online Storefront Only</option>
            <option value="offline">Offline Counter POS Only</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-2xs"
            title="Export CSV Report"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              Gross Revenue
            </span>
            <div className="text-2xl font-black text-[#333333] mt-1">{formatNaira(totalRevenue)}</div>
            <span className="text-[11px] text-gray-500 font-semibold">
              {totalOrdersCount} orders ({totalOnlineCount} Online • {totalOfflineCount} Offline)
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#F5A623] flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              Cost of Goods (COGS)
            </span>
            <div className="text-2xl font-black text-blue-900 mt-1">{formatNaira(totalCogs)}</div>
            <span className="text-[11px] text-blue-600 font-semibold">
              Product manufacturing & acquisition
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              Ad Spend (Marketing)
            </span>
            <div className="text-2xl font-black text-purple-900 mt-1">{formatNaira(totalAdSpend)}</div>
            <span className="text-[11px] text-purple-600 font-semibold">
              Meta, TikTok & Google ad allocations
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              Net Profit
            </span>
            <div className="text-2xl font-black text-emerald-600 mt-1">{formatNaira(totalNetProfit)}</div>
            <span className="text-[11px] text-emerald-700 font-bold">
              {overallMarginPercent}% Net Profit Margin
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Visual Bar Breakdown Chart Component */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#F5A623]" />
            <h4 className="font-extrabold text-base text-[#333333]">
              {period.toUpperCase()} Profit & Revenue Progression
            </h4>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-gray-600">
              <span className="w-3 h-3 rounded-full bg-gray-900 inline-block"></span>
              <span>Revenue</span>
            </span>
            <span className="flex items-center gap-1.5 text-blue-700">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>
              <span>COGS</span>
            </span>
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
              <span>Net Profit</span>
            </span>
          </div>
        </div>

        {summaries.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-400">
            No completed sales orders recorded for the selected filter.
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {summaries.slice(0, 10).map((item) => {
              const maxRev = Math.max(...summaries.map((s) => s.grossRevenue), 1);
              const revPercent = Math.min(100, (item.grossRevenue / maxRev) * 100);
              const profitPercent = item.grossRevenue > 0 ? Math.max(0, (item.netProfit / item.grossRevenue) * 100) : 0;

              return (
                <div key={item.startDate} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-800">{item.periodLabel}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500">{item.orderCount} orders</span>
                      <span className="font-extrabold text-gray-900">{formatNaira(item.grossRevenue)}</span>
                      <span className={`font-black ${item.netProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        +{formatNaira(item.netProfit)} ({item.marginPercent}%)
                      </span>
                    </div>
                  </div>

                  {/* Proportional Performance Bar */}
                  <div className="h-3.5 w-full bg-gray-100 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${revPercent * (item.cogs / (item.grossRevenue || 1))}%` }}
                      className="bg-blue-500 h-full"
                      title={`COGS: ${formatNaira(item.cogs)}`}
                    ></div>
                    <div
                      style={{ width: `${revPercent * (item.adSpend / (item.grossRevenue || 1))}%` }}
                      className="bg-purple-500 h-full"
                      title={`Ads: ${formatNaira(item.adSpend)}`}
                    ></div>
                    <div
                      style={{ width: `${revPercent * Math.max(0, item.netProfit / (item.grossRevenue || 1))}%` }}
                      className="bg-emerald-500 h-full"
                      title={`Net Profit: ${formatNaira(item.netProfit)}`}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detailed Financial Ledger Table */}
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-6 pb-3 border-b border-gray-100 flex items-center justify-between">
          <h4 className="font-extrabold text-base text-[#333333]">
            Financial Statement & Ledger ({period.charAt(0).toUpperCase() + period.slice(1)} Breakdown)
          </h4>
          <span className="text-xs text-gray-400 font-mono">
            {summaries.length} records generated
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50 text-[11px] text-gray-400 uppercase font-bold tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-4 px-6">Period</th>
                <th className="py-4 px-4">Sales Split</th>
                <th className="py-4 px-4">Gross Revenue</th>
                <th className="py-4 px-4">COGS (Costs)</th>
                <th className="py-4 px-4">Ad Spend</th>
                <th className="py-4 px-4">Gross Profit</th>
                <th className="py-4 px-4">Net Profit</th>
                <th className="py-4 px-6 text-right">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {summaries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    No financial data found for this period.
                  </td>
                </tr>
              ) : (
                summaries.map((s) => (
                  <tr key={s.startDate} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-4 px-6 font-bold text-gray-900">{s.periodLabel}</td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-bold text-[10px]">
                          {s.onlineCount} Online
                        </span>
                        {s.offlineCount > 0 && (
                          <span className="bg-amber-100 text-[#D98200] px-2 py-0.5 rounded-md font-bold text-[10px]">
                            {s.offlineCount} Offline POS
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4 font-black text-gray-900">
                      {formatNaira(s.grossRevenue)}
                    </td>

                    <td className="py-4 px-4 font-semibold text-blue-800">
                      - {formatNaira(s.cogs)}
                    </td>

                    <td className="py-4 px-4 font-semibold text-purple-800">
                      - {formatNaira(s.adSpend)}
                    </td>

                    <td className="py-4 px-4 font-bold text-gray-900">
                      {formatNaira(s.grossProfit)}
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`font-black ${
                          s.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {formatNaira(s.netProfit)}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                          s.marginPercent >= 30
                            ? 'bg-emerald-100 text-emerald-800'
                            : s.marginPercent > 0
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {s.marginPercent}% Margin
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
