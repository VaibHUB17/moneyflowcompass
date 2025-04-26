
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTransactions, deleteTransaction } from "@/services/api";
import { formatCurrency, formatDate, iconMapping } from "@/utils/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";
import { Transaction } from "@/types";
import TransactionForm from "@/components/TransactionForm";

const Transactions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["transactions", page],
    queryFn: () => fetchTransactions(page, 10, "-date")
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction(id);
      toast({
        title: "Transaction deleted",
        description: "The transaction has been successfully deleted.",
      });
      refetch();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete transaction. Please try again.",
      });
    }
  };

  const confirmDelete = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDeleteDialogOpen(true);
  };

  const editTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDialogOpen(true);
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (data && data.pagination && page < data.pagination.total) {
      setPage(page + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="container px-4 py-6">
        <div className="mb-6">
          <Skeleton className="h-10 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <div className="rounded-md border mb-4">
          <div className="p-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex justify-between items-center py-3">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container px-4 py-6">
        <Alert variant="destructive">
          <AlertDescription>
            Error loading transactions. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const transactions = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="container px-4 py-6">
      <PageHeader 
        title="Transactions" 
        description="Manage your financial transactions"
        action={{ 
          label: "Add Transaction", 
          onClick: () => {
            setSelectedTransaction(null);
            setDialogOpen(true);
          } 
        }}  
      />

      {/* Transaction list */}
      <div className="rounded-md border mb-4">
        {transactions.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No transactions found.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSelectedTransaction(null);
                setDialogOpen(true);
              }}
            >
              Add your first transaction
            </Button>
          </div>
        ) : (
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/40">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.map((transaction) => {
                  const category = typeof transaction.category === 'object' ? transaction.category : null;
                  const Icon = category?.icon ? iconMapping[category.icon] : null;
                  
                  return (
                    <tr key={transaction._id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-6 py-4">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4">
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
                      <td className="px-6 py-4 text-right font-medium">
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => editTransaction(transaction)}
                          className="mr-1"
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => confirmDelete(transaction)}
                          className="text-destructive hover:text-destructive"
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.total > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Page {pagination.current} of {pagination.total}
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handlePrevPage}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleNextPage}
              disabled={page >= (pagination?.total || 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Transaction Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedTransaction ? 'Edit Transaction' : 'Add New Transaction'}</DialogTitle>
          </DialogHeader>
          <TransactionForm 
            transaction={selectedTransaction} 
            onSuccess={() => {
              setDialogOpen(false);
              refetch();
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
            <p>Are you sure you want to delete this transaction?</p>
            <p className="text-sm text-muted-foreground mt-2">
              Description: {selectedTransaction?.description}<br />
              Amount: {selectedTransaction ? formatCurrency(selectedTransaction.amount) : ''}
            </p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedTransaction && handleDelete(selectedTransaction._id)}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Transactions;
