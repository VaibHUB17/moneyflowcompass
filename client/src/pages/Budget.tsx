
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchBudgetComparison, fetchBudgets, deleteBudget } from "@/services/api";
import { formatCurrency, getMonthName, iconMapping } from "@/utils/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Budget } from "@/types";
import PageHeader from "@/components/PageHeader";
import BudgetForm from "@/components/BudgetForm";

const BudgetPage = () => {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  // Get current month and year
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());

  const {
    data: comparisonData,
    isLoading: isComparisonLoading,
    error: comparisonError,
    refetch: refetchComparison
  } = useQuery({
    queryKey: ["budgetComparison", month, year],
    queryFn: () => fetchBudgetComparison(month, year)
  });

  const {
    data: budgetsData,
    isLoading: isBudgetsLoading,
    error: budgetsError,
    refetch: refetchBudgets
  } = useQuery({
    queryKey: ["budgets", month, year],
    queryFn: () => fetchBudgets(month, year)
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteBudget(id);
      toast({
        title: "Budget deleted",
        description: "The budget has been successfully deleted.",
      });
      refetchBudgets();
      refetchComparison();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete budget. Please try again.",
      });
    }
  };

  const confirmDelete = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsDeleteDialogOpen(true);
  };

  const editBudget = (budget: Budget) => {
    setSelectedBudget(budget);
    setDialogOpen(true);
  };

  const isLoading = isComparisonLoading || isBudgetsLoading;
  const error = comparisonError || budgetsError;

  const handlePreviousMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="container px-4 py-6">
        <div className="mb-6">
          <Skeleton className="h-10 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <div className="mb-6 flex justify-between items-center">
          <Skeleton className="h-8 w-24" />
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
        <div className="space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-6 w-1/6" />
              </div>
              <Skeleton className="h-4 w-full mb-1" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-1/6" />
                <Skeleton className="h-4 w-1/6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container px-4 py-6">
        <Alert variant="destructive">
          <AlertDescription>
            Error loading budget data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const budgetComparisons = comparisonData?.data || [];
  const budgets = budgetsData?.data || [];

  return (
    <div className="container px-4 py-6">
      <PageHeader 
        title="Budget" 
        description="Track your spending against budget"
        action={{
          label: "Add Budget",
          onClick: () => {
            setSelectedBudget(null);
            setDialogOpen(true);
          }
        }}
      />

      {/* Month selector */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">
          {getMonthName(month)} {year}
        </h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={handlePreviousMonth}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            <span className="sr-only">Previous Month</span>
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              setMonth(currentDate.getMonth() + 1);
              setYear(currentDate.getFullYear());
            }}
          >
            Current Month
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleNextMonth}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            <span className="sr-only">Next Month</span>
          </Button>
        </div>
      </div>

      {/* Budget comparisons */}
      <div className="space-y-4">
        {budgetComparisons.length === 0 ? (
          <div className="text-center py-8 border rounded-lg">
            <p className="text-muted-foreground">No budgets set for this month.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSelectedBudget(null);
                setDialogOpen(true);
              }}
            >
              Create a budget
            </Button>
          </div>
        ) : (
          budgetComparisons.map((item) => {
            const Icon = item.icon ? iconMapping[item.icon] : null;
            const isOverBudget = item.percentageUsed > 100;
            
            return (
              <div key={item.category} className="border rounded-lg p-4 hover:border-primary hover:shadow-sm transition-all">
                <div className="flex justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center" 
                      style={{ backgroundColor: item.color }}
                    >
                      {Icon && <Icon size={16} color="white" />}
                    </div>
                    <h3 className="font-medium">{item.category}</h3>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatCurrency(item.actualAmount)} <span className="text-muted-foreground">of</span> {formatCurrency(item.plannedAmount)}
                    </div>
                    <div className={`text-sm font-medium ${isOverBudget ? 'text-destructive' : 'text-green-500'}`}>
                      {isOverBudget ? `${formatCurrency(item.difference)} over` : `${formatCurrency(Math.abs(item.difference))} remaining`}
                    </div>
                  </div>
                </div>
                
                <Progress 
                  value={Math.min(item.percentageUsed, 100)} 
                  className={`h-2 ${isOverBudget ? 'bg-red-100' : 'bg-green-100'}`}
                  indicatorClassName={isOverBudget ? 'bg-destructive' : 'bg-green-500'}
                />
                
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-muted-foreground">{item.percentageUsed}% used</span>
                  
                  {/* Find the matching budget to get the ID */}
                  {budgets.find(budget => 
                    typeof budget.category === 'object' && 
                    budget.category.name === item.category
                  ) && (
                    <div className="space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => {
                          const budget = budgets.find(b => 
                            typeof b.category === 'object' && 
                            b.category.name === item.category
                          );
                          if (budget) editBudget(budget);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                        onClick={() => {
                          const budget = budgets.find(b => 
                            typeof b.category === 'object' && 
                            b.category.name === item.category
                          );
                          if (budget) confirmDelete(budget);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Budget Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedBudget ? 'Edit Budget' : 'Add New Budget'}</DialogTitle>
          </DialogHeader>
          <BudgetForm 
            budget={selectedBudget} 
            defaultMonth={month}
            defaultYear={year}
            onSuccess={() => {
              setDialogOpen(false);
              refetchBudgets();
              refetchComparison();
            }} 
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this budget?</p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedBudget && handleDelete(selectedBudget._id)}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BudgetPage;
