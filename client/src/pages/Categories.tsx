
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCategories, deleteCategory } from "@/services/api";
import { iconMapping } from "@/utils/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Category } from "@/types";
import PageHeader from "@/components/PageHeader";
import CategoryForm from "@/components/CategoryForm";

const Categories = () => {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id);
      toast({
        title: "Category deleted",
        description: "The category has been successfully deleted.",
      });
      refetch();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete category. It may be in use by transactions.",
      });
    }
  };

  const confirmDelete = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const editCategory = (category: Category) => {
    setSelectedCategory(category);
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container px-4 py-6">
        <div className="mb-6">
          <Skeleton className="h-10 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <Skeleton className="h-6 w-1/2 mb-3" />
              <Skeleton className="h-4 w-1/3" />
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
            Error loading categories. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const categories = data?.data || [];

  return (
    <div className="container px-4 py-6">
      <PageHeader 
        title="Categories" 
        description="Manage your transaction categories"
        action={{
          label: "Add Category",
          onClick: () => {
            setSelectedCategory(null);
            setDialogOpen(true);
          }
        }}
      />

      {/* Category grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.length === 0 ? (
          <div className="col-span-full py-12 text-center">
            <p className="text-muted-foreground">No categories found.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSelectedCategory(null);
                setDialogOpen(true);
              }}
            >
              Add your first category
            </Button>
          </div>
        ) : (
          categories.map((category) => {
            const Icon = category.icon ? iconMapping[category.icon] : null;
            
            return (
              <div 
                key={category._id} 
                className="border rounded-lg p-4 hover:border-primary hover:shadow-sm transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3 mb-2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center" 
                      style={{ backgroundColor: category.color }}
                    >
                      {Icon && <Icon size={16} color="white" />}
                    </div>
                    <h3 className="font-medium">{category.name}</h3>
                  </div>
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => editCategory(category)}
                    >
                      <span className="sr-only">Edit</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => confirmDelete(category)}
                    >
                      <span className="sr-only">Delete</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                    </Button>
                  </div>
                </div>
                <div 
                  className="text-xs inline-block px-2 py-1 rounded-full mt-1" 
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  {category.icon}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Category Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          </DialogHeader>
          <CategoryForm 
            category={selectedCategory} 
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
            <p>Are you sure you want to delete this category?</p>
            <p className="text-sm text-muted-foreground mt-2">
              This will only work if no transactions are using this category.
            </p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedCategory && handleDelete(selectedCategory._id)}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Categories;
