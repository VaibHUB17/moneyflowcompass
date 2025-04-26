
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
import { createTransaction, fetchCategories, updateTransaction } from "@/services/api";
import { Transaction } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDateForInput, iconMapping } from "@/utils/formatters";
import { Spinner } from "@/components/ui/spinner";

// Define form schema with Zod
const formSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  date: z.string().min(1, "Date is required"),
  category: z.string().min(1, "Category is required"),
});

interface TransactionFormProps {
  transaction?: Transaction | null;
  onSuccess: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  transaction,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: 0,
      date: new Date().toISOString().substring(0, 10),
      category: "",
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

  // Populate form if editing an existing transaction
  useEffect(() => {
    if (transaction) {
      const categoryId = typeof transaction.category === 'string' 
        ? transaction.category 
        : transaction.category._id;
      
      form.reset({
        description: transaction.description,
        amount: transaction.amount,
        date: formatDateForInput(transaction.date),
        category: categoryId,
      });
    }
  }, [transaction, form]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      if (transaction) {
        // Update existing transaction
        await updateTransaction(transaction._id, {
          description: data.description,
          amount: data.amount,
          date: new Date(data.date).toISOString(),
          category: data.category,
        });
        toast({
          title: "Transaction updated",
          description: "Your transaction has been updated successfully.",
        });
      } else {
        // Create new transaction
        await createTransaction({
          description: data.description,
          amount: data.amount,
          date: new Date(data.date).toISOString(),
          category: data.category,
        });
        toast({
          title: "Transaction added",
          description: "Your new transaction has been added successfully.",
        });
      }
      onSuccess();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save transaction. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-2">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Grocery shopping" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
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
        
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
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
        
        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Spinner className="mr-2" /> : null}
            {transaction ? "Update" : "Add"} Transaction
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TransactionForm;
