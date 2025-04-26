
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { createBudget, fetchCategories, updateBudget } from "@/services/api";
import { Budget } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getMonthName, iconMapping } from "@/utils/formatters";
import { Spinner } from "@/components/ui/spinner";

// Define form schema with Zod
const formSchema = z.object({
  category: z.string().min(1, "Category is required"),
  plannedAmount: z.coerce.number().positive("Budget amount must be positive"),
  month: z.coerce.number().min(1).max(12, "Month must be between 1 and 12"),
  year: z.coerce.number().min(2000).max(2100, "Year must be between 2000 and 2100"),
});

interface BudgetFormProps {
  budget?: Budget | null;
  defaultMonth?: number;
  defaultYear?: number;
  onSuccess: () => void;
}

const BudgetForm: React.FC<BudgetFormProps> = ({
  budget,
  defaultMonth,
  defaultYear,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  
  const currentDate = new Date();
  const currentMonth = defaultMonth || currentDate.getMonth() + 1;
  const currentYear = defaultYear || currentDate.getFullYear();

  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "",
      plannedAmount: 0,
      month: currentMonth,
      year: currentYear,
    },
  });

  // Fetch categories on component mount
  useEffect(() => {
    const getCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const response = await fetchCategories();
        setCategories(response.data || []);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load categories.",
        });
      } finally {
        setIsLoadingCategories(false);
      }
    };

    getCategories();
  }, [toast]);

  // Populate form if editing an existing budget
  useEffect(() => {
    if (budget) {
      const categoryId = typeof budget.category === 'string' 
        ? budget.category 
        : budget.category._id;
      
      form.reset({
        category: categoryId,
        plannedAmount: budget.plannedAmount,
        month: budget.month,
        year: budget.year,
      });
    }
  }, [budget, form]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      if (budget) {
        // Update existing budget
        await updateBudget(budget._id, {
          category: data.category,
          plannedAmount: data.plannedAmount,
          month: data.month,
          year: data.year,
        });
        toast({
          title: "Budget updated",
          description: "Your budget has been updated successfully.",
        });
      } else {
        // Create new budget
        await createBudget({
          category: data.category,
          plannedAmount: data.plannedAmount,
          month: data.month,
          year: data.year,
        });
        toast({
          title: "Budget added",
          description: "Your new budget has been added successfully.",
        });
      }
      onSuccess();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save budget. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: getMonthName(i + 1)
  }));

  const yearOptions = Array.from({ length: 5 }, (_, i) => ({
    value: currentDate.getFullYear() - 2 + i,
    label: `${currentDate.getFullYear() - 2 + i}`
  }));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-2">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="month"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Month</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))} 
                  value={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {months.map(month => (
                      <SelectItem key={month.value} value={month.value.toString()}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))} 
                  value={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {yearOptions.map(year => (
                      <SelectItem key={year.value} value={year.value.toString()}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value} 
                disabled={isLoadingCategories}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => {
                    const Icon = category.icon ? iconMapping[category.icon] : null;
                    
                    return (
                      <SelectItem key={category._id} value={category._id}>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-4 h-4 rounded-full flex items-center justify-center" 
                            style={{ backgroundColor: category.color }}
                          >
                            {Icon && <Icon size={10} color="white" />}
                          </div>
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="plannedAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget Amount</FormLabel>
              <FormControl>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    $
                  </div>
                  <Input type="number" step="0.01" min="0" className="pl-7" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Spinner className="mr-2" /> : null}
            {budget ? "Update" : "Add"} Budget
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default BudgetForm;
