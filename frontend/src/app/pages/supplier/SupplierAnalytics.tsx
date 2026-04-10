import { useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  Eye,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Target,
  Percent,
  Clock
} from 'lucide-react';

// Mock data for analytics
const revenueData = [
  { month: 'Jan', revenue: 285000, orders: 42, profit: 85500 },
  { month: 'Feb', revenue: 312000, orders: 48, profit: 93600 },
  { month: 'Mar', revenue: 298000, orders: 45, profit: 89400 },
  { month: 'Apr', revenue: 356000, orders: 54, profit: 106800 },
  { month: 'May', revenue: 389000, orders: 58, profit: 116700 },
  { month: 'Jun', revenue: 421000, orders: 63, profit: 126300 },
  { month: 'Jul', revenue: 445000, orders: 68, profit: 133500 },
  { month: 'Aug', revenue: 472000, orders: 71, profit: 141600 },
  { month: 'Sep', revenue: 498000, orders: 75, profit: 149400 },
  { month: 'Oct', revenue: 523000, orders: 79, profit: 156900 },
  { month: 'Nov', revenue: 556000, orders: 84, profit: 166800 },
  { month: 'Dec', revenue: 589000, orders: 89, profit: 176700 },
];

const weeklyData = [
  { day: 'Mon', sales: 45000, orders: 12 },
  { day: 'Tue', sales: 52000, orders: 15 },
  { day: 'Wed', sales: 48000, orders: 13 },
  { day: 'Thu', sales: 61000, orders: 18 },
  { day: 'Fri', sales: 55000, orders: 16 },
  { day: 'Sat', sales: 38000, orders: 10 },
  { day: 'Sun', sales: 29000, orders: 8 },
];

const productPerformance = [
  { name: 'Hot Rolled Steel Sheets', sales: 450000, units: 120, growth: 15.5 },
  { name: 'Galvanized Steel Coils', sales: 380000, units: 95, growth: 12.3 },
  { name: 'Steel Rebars', sales: 320000, units: 150, growth: 8.7 },
  { name: 'Stainless Steel Pipes', sales: 280000, units: 75, growth: 5.2 },
  { name: 'Steel Beams', sales: 250000, units: 60, growth: -2.1 },
];

const categoryDistribution = [
  { name: 'Steel Sheets', value: 35, amount: 450000 },
  { name: 'Steel Coils', value: 28, amount: 380000 },
  { name: 'Rebar', value: 22, amount: 320000 },
  { name: 'Pipes', value: 10, amount: 150000 },
  { name: 'Beams', value: 5, amount: 80000 },
];

const customerSegments = [
  { segment: 'Construction', orders: 245, revenue: 890000, percentage: 42 },
  { segment: 'Manufacturing', orders: 189, revenue: 670000, percentage: 31 },
  { segment: 'Infrastructure', orders: 156, revenue: 580000, percentage: 27 },
];

const topCustomers = [
  { name: 'Al-Mansour Construction Co.', orders: 45, revenue: 320000, lastOrder: '2 days ago' },
  { name: 'Modern Industries Ltd.', orders: 38, revenue: 280000, lastOrder: '5 days ago' },
  { name: 'Saudi Infrastructure Projects', orders: 32, revenue: 245000, lastOrder: '1 week ago' },
  { name: 'National Steel Fabricators', orders: 28, revenue: 210000, lastOrder: '3 days ago' },
  { name: 'Al-Qahtani Trading', orders: 24, revenue: 185000, lastOrder: '4 days ago' },
];

const orderStatus = [
  { status: 'Completed', value: 156, color: '#10B981' },
  { status: 'In Progress', value: 48, color: '#F59E0B' },
  { status: 'Pending', value: 23, color: '#3B82F6' },
  { status: 'Cancelled', value: 8, color: '#EF4444' },
];

const COLORS = ['#0F2854', '#1C4D8D', '#4988C4', '#BDE8F5', '#8FC8E8'];

export default function SupplierAnalytics() {
  const [timeRange, setTimeRange] = useState('12months');
  const [compareWith, setCompareWith] = useState('previous');

  // Calculate KPIs
  const currentMonthRevenue = revenueData[revenueData.length - 1].revenue;
  const previousMonthRevenue = revenueData[revenueData.length - 2].revenue;
  const revenueGrowth = ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue * 100).toFixed(1);

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = revenueData.reduce((sum, item) => sum + item.orders, 0);
  const averageOrderValue = totalRevenue / totalOrders;
  const totalProfit = revenueData.reduce((sum, item) => sum + item.profit, 0);
  const profitMargin = (totalProfit / totalRevenue * 100).toFixed(1);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#0F2854]">Analytics Dashboard</h1>
            <p className="text-[#6B7280] mt-1">Comprehensive insights into your business performance</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px] bg-white border-[#E5E7EB]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="12months">Last 12 Months</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Revenue */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-[#6B7280]">Total Revenue</CardTitle>
                <div className="h-10 w-10 rounded-full bg-[#BDE8F5] flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-[#0F2854]" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#111827]">
                {(totalRevenue / 1000000).toFixed(2)}M SAR
              </div>
              <div className="flex items-center gap-1 mt-2">
                <ArrowUpRight className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600 font-medium">{revenueGrowth}%</span>
                <span className="text-sm text-[#6B7280]">vs last month</span>
              </div>
            </CardContent>
          </Card>

          {/* Total Orders */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-[#6B7280]">Total Orders</CardTitle>
                <div className="h-10 w-10 rounded-full bg-[#BDE8F5] flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-[#0F2854]" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#111827]">{totalOrders}</div>
              <div className="flex items-center gap-1 mt-2">
                <ArrowUpRight className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600 font-medium">12.5%</span>
                <span className="text-sm text-[#6B7280]">vs last period</span>
              </div>
            </CardContent>
          </Card>

          {/* Average Order Value */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-[#6B7280]">Avg Order Value</CardTitle>
                <div className="h-10 w-10 rounded-full bg-[#BDE8F5] flex items-center justify-center">
                  <Target className="h-5 w-5 text-[#0F2854]" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#111827]">
                {averageOrderValue.toLocaleString('en-US', { maximumFractionDigits: 0 })} SAR
              </div>
              <div className="flex items-center gap-1 mt-2">
                <ArrowUpRight className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600 font-medium">8.2%</span>
                <span className="text-sm text-[#6B7280]">vs last period</span>
              </div>
            </CardContent>
          </Card>

          {/* Profit Margin */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-[#6B7280]">Profit Margin</CardTitle>
                <div className="h-10 w-10 rounded-full bg-[#BDE8F5] flex items-center justify-center">
                  <Percent className="h-5 w-5 text-[#0F2854]" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#111827]">{profitMargin}%</div>
              <div className="flex items-center gap-1 mt-2">
                <ArrowUpRight className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600 font-medium">2.3%</span>
                <span className="text-sm text-[#6B7280]">vs last period</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue & Profit Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Revenue & Profit Trends</CardTitle>
                <CardDescription>Monthly revenue and profit over the last 12 months</CardDescription>
              </div>
              <Select defaultValue="revenue">
                <SelectTrigger className="w-[160px] bg-white border-[#E5E7EB]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="profit">Profit</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                  <SelectItem value="orders">Orders</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F2854" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0F2854" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4988C4" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4988C4" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#0F2854" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  name="Revenue (SAR)"
                />
                <Area 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#4988C4" 
                  fillOpacity={1} 
                  fill="url(#colorProfit)" 
                  name="Profit (SAR)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Performance & Order Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Performance</CardTitle>
              <CardDescription>Sales performance over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="day" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#FFFFFF', 
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="sales" fill="#0F2854" radius={[8, 8, 0, 0]} name="Sales (SAR)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Order Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status Distribution</CardTitle>
              <CardDescription>Current status of all orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={orderStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label
                    >
                      {orderStatus.map((entry, index) => (
                        <Cell key={`order-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {orderStatus.map((item) => (
                  <div key={item.status} className="flex items-center gap-2">
                    <div 
                      className="h-3 w-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-[#6B7280]">{item.status}</span>
                    <span className="text-sm font-semibold text-[#111827]">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Product Performance & Category Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Products Performance */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Top Products Performance</CardTitle>
              <CardDescription>Best performing products by revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {productPerformance.map((product, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[#111827]">{product.name}</span>
                          {product.growth > 0 ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              {product.growth}%
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                              <TrendingDown className="h-3 w-3 mr-1" />
                              {Math.abs(product.growth)}%
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-[#6B7280]">
                          <span>{product.sales.toLocaleString()} SAR</span>
                          <span>•</span>
                          <span>{product.units} units sold</span>
                        </div>
                      </div>
                    </div>
                    <Progress value={(product.sales / 450000) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Category Distribution</CardTitle>
              <CardDescription>Revenue by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`category-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {categoryDistribution.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-3 w-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm text-[#6B7280]">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-[#111827]">{item.value}%</div>
                      <div className="text-xs text-[#6B7280]">
                        {(item.amount / 1000).toFixed(0)}K SAR
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Customers */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Top Customers</CardTitle>
                  <CardDescription>Your most valuable customers</CardDescription>
                </div>
                <Users className="h-5 w-5 text-[#6B7280]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCustomers.map((customer, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 bg-[#F9FAFB] rounded-lg hover:bg-[#F3F4F6] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[#0F2854] flex items-center justify-center text-white font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-[#111827]">{customer.name}</div>
                        <div className="text-sm text-[#6B7280] flex items-center gap-2">
                          <span>{customer.orders} orders</span>
                          <span>•</span>
                          <Clock className="h-3 w-3" />
                          <span>{customer.lastOrder}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-[#111827]">
                        {(customer.revenue / 1000).toFixed(0)}K SAR
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Customer Segments */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Segments</CardTitle>
              <CardDescription>Orders and revenue by industry</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {customerSegments.map((segment, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#111827]">{segment.segment}</span>
                      <span className="text-sm text-[#6B7280]">{segment.percentage}%</span>
                    </div>
                    <Progress value={segment.percentage} className="h-2" />
                    <div className="flex items-center justify-between text-sm text-[#6B7280]">
                      <span>{segment.orders} orders</span>
                      <span>{(segment.revenue / 1000).toFixed(0)}K SAR</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-[#F0F9FF] border border-[#BAE6FD] rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-[#0F2854] flex items-center justify-center flex-shrink-0">
                    <Star className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#0F2854] mb-1">Industry Insight</h4>
                    <p className="text-sm text-[#374151]">
                      Construction sector shows the highest growth potential. Consider expanding your product range to capture more market share.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-[#6B7280]">Active Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#111827]">47</div>
              <div className="flex items-center gap-1 mt-2">
                <Package className="h-4 w-4 text-[#6B7280]" />
                <span className="text-sm text-[#6B7280]">12 low stock alerts</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-[#6B7280]">Total Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#111827]">234</div>
              <div className="flex items-center gap-1 mt-2">
                <ArrowUpRight className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600 font-medium">18 new</span>
                <span className="text-sm text-[#6B7280]">this month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-[#6B7280]">Page Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#111827]">12,458</div>
              <div className="flex items-center gap-1 mt-2">
                <Eye className="h-4 w-4 text-[#6B7280]" />
                <span className="text-sm text-[#6B7280]">Last 30 days</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}