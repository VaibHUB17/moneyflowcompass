
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboardSummary } from "@/services/api";
import { formatCurrency, formatDate, iconMapping } from "@/utils/formatters";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUp, ArrowDown } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import PageHeader from "@/components/PageHeader";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => fetchDashboardSummary()
  });

  const dashboardData = data?.data;

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="container px-4 py-6">
        <div className="mb-6">
          <Skeleton className="h-10 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-1/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/2 mb-1" />
                <Skeleton className="h-4 w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-1/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[200px] w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[200px] w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container px-4 py-6">
        <Alert variant="destructive">
          <AlertDescription>
            Error loading dashboard data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container px-4 py-6">
      <PageHeader 
        title="Dashboard" 
        description={`Overview for ${dashboardData?.currentMonth || 'Current Month'}`} 
        action={{ 
          label: "Add Transaction", 
          onClick: () => navigate('/transactions/new') 
        }} 
      />
      
      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardData?.summary.totalExpenses || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {dashboardData?.summary.expenseChangeFromLastMonth !== undefined && (
                <span className={`flex items-center ${dashboardData.summary.expenseChangeFromLastMonth > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {dashboardData.summary.expenseChangeFromLastMonth > 0 ? <ArrowUp className="mr-1 h-3 w-3" /> : <ArrowDown className="mr-1 h-3 w-3" />}
                  {Math.abs(dashboardData.summary.expenseChangeFromLastMonth)}% from last month
                </span>
              )}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Budget Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardData?.summary.budgetRemaining || 0)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {dashboardData?.summary.budgetUsagePercentage}% of budget used
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Days Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.summary.daysRemaining || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatCurrency(dashboardData?.summary.dailyBudget || 0)} daily budget
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.summary.transactionCount || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">
              this month
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts and tables */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Transactions */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="px-2">
            <div className="space-y-4">
              {dashboardData?.recentTransactions.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">No recent transactions found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs text-muted-foreground">
                        <th className="pb-3 px-4">Date</th>
                        <th className="pb-3 px-4">Description</th>
                        <th className="pb-3 px-4">Category</th>
                        <th className="pb-3 px-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {dashboardData?.recentTransactions.map((transaction) => {
                        const category = typeof transaction.category === 'object' ? transaction.category : null;
                        const Icon = category?.icon ? iconMapping[category.icon] : null;
                        
                        return (
                          <tr key={transaction._id} className="hover:bg-muted/50">
                            <td className="py-3 px-4 text-sm">{formatDate(transaction.date)}</td>
                            <td className="py-3 px-4 text-sm">{transaction.description}</td>
                            <td className="py-3 px-4 text-sm">
                              {category && (
                                <div className="flex items-center space-x-2">
                                  <div 
                                    className="w-4 h-4 rounded-full flex items-center justify-center" 
                                    style={{ backgroundColor: category.color }}
                                  >
                                    {Icon && <Icon size={12} color="white" />}
                                  </div>
                                  <span>{category.name}</span>
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4 text-sm text-right font-medium">
                              {formatCurrency(transaction.amount)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData?.categoryBreakdown && dashboardData.categoryBreakdown.length > 0 ? (
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="totalAmount"
                      nameKey="category"
                    >
                      {dashboardData.categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [formatCurrency(Number(value)), name]}
                      labelFormatter={() => ''}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[240px]">
                <p className="text-muted-foreground">No category data available</p>
              </div>
            )}

            {/* Legend */}
            <div className="mt-4 space-y-2">
              {dashboardData?.categoryBreakdown.slice(0, 5).map((category) => (
                <div key={category.category} className="flex justify-between items-center text-sm">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: category.color }}
                    />
                    <span>{category.category}</span>
                  </div>
                  <span className="font-medium">{formatCurrency(category.totalAmount)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
