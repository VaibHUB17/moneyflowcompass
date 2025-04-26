
import { useQuery } from "@tanstack/react-query";
import { fetchSpendingInsights, fetchMonthlyExpenses } from "@/services/api";
import { formatCurrency, iconMapping } from "@/utils/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Cell 
} from "recharts";
import PageHeader from "@/components/PageHeader";
import { useState } from "react";

const Insights = () => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  
  const {
    data: insightsData,
    isLoading: isInsightsLoading,
    error: insightsError
  } = useQuery({
    queryKey: ["insights"],
    queryFn: fetchSpendingInsights
  });

  const {
    data: monthlyData,
    isLoading: isMonthlyLoading,
    error: monthlyError
  } = useQuery({
    queryKey: ["monthly", year],
    queryFn: () => fetchMonthlyExpenses(year)
  });

  const isLoading = isInsightsLoading || isMonthlyLoading;
  const error = insightsError || monthlyError;

  if (isLoading) {
    return (
      <div className="container px-4 py-6">
        <div className="mb-6">
          <Skeleton className="h-10 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/6" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/6" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container px-4 py-6">
        <Alert variant="destructive">
          <AlertDescription>
            Error loading insights data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const insights = insightsData?.data;
  const monthly = monthlyData?.data || [];
  
  // Format monthly data for the bar chart
  const monthlyChartData = monthly.map(item => ({
    month: item.month,
    monthName: `${item.month}`,
    amount: item.totalAmount
  }));

  const prevYear = year - 1;
  const nextYear = year + 1;

  return (
    <div className="container px-4 py-6">
      <PageHeader title="Spending Insights" description="Analytics and insights about your spending habits" />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Expenses Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Monthly Expenses ({year})</CardTitle>
            <div className="flex items-center space-x-2 text-sm">
              <button 
                onClick={() => setYear(prevYear)} 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {prevYear}
              </button>
              <span className="text-primary font-medium">{year}</span>
              <button 
                onClick={() => setYear(nextYear)} 
                className="text-muted-foreground hover:text-primary transition-colors"
                disabled={nextYear > currentYear}
              >
                {nextYear}
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {monthlyChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="monthName" 
                      tickLine={false}
                    />
                    <YAxis 
                      tickFormatter={(value) => `$${value}`}
                      tickLine={false}
                      axisLine={false}
                    />
                    <RechartsTooltip 
                      formatter={(value) => formatCurrency(Number(value))} 
                      labelFormatter={(value) => `Month ${value}`}
                    />
                    <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No data available for {year}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Day of Week Spending */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Day of Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {insights?.dayOfWeekSpending && insights.dayOfWeekSpending.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={insights.dayOfWeekSpending} 
                    margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="dayName"
                      tickLine={false}
                    />
                    <YAxis 
                      tickFormatter={(value) => `$${value}`}
                      tickLine={false}
                      axisLine={false}
                    />
                    <RechartsTooltip 
                      formatter={(value) => formatCurrency(Number(value))}
                      labelFormatter={(label) => label}
                    />
                    <Bar dataKey="averageAmount" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]}>
                      {insights?.dayOfWeekSpending.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${171 + index * 15}, 90%, 28%)`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No day of week data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Top Spending Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {insights?.topCategories && insights.topCategories.length > 0 ? (
              <div className="space-y-4">
                {insights.topCategories.map((category) => {
                  const Icon = category.icon ? iconMapping[category.icon] : null;
                  
                  return (
                    <div key={category.category} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center" 
                          style={{ backgroundColor: category.color }}
                        >
                          {Icon && <Icon size={16} color="white" />}
                        </div>
                        <div>
                          <div className="font-medium">{category.category}</div>
                          <div className="text-xs text-muted-foreground">
                            {category.count} transactions | Avg: {formatCurrency(category.averageTransaction)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right font-medium">
                        {formatCurrency(category.totalAmount)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No category data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Over Budget Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Over Budget Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {insights?.overBudgetCategories && insights.overBudgetCategories.length > 0 ? (
              <div className="space-y-4">
                {insights.overBudgetCategories.map((category) => {
                  const Icon = category.icon ? iconMapping[category.icon] : null;
                  
                  return (
                    <div key={category.category} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center" 
                          style={{ backgroundColor: category.color }}
                        >
                          {Icon && <Icon size={16} color="white" />}
                        </div>
                        <div>
                          <div className="font-medium">{category.category}</div>
                          <div className="text-xs text-destructive">
                            {formatCurrency(category.difference)} over budget
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(category.actualAmount)}</div>
                        <div className="text-xs text-muted-foreground">
                          of {formatCurrency(category.plannedAmount)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No over budget categories
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Insights;
