
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
import { createCategory, updateCategory } from "@/services/api";
import { Category } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { iconMapping } from "@/utils/formatters";
import { Spinner } from "@/components/ui/spinner";

// Define form schema with Zod
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  icon: z.string().min(1, "Icon is required"),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Color must be a valid hex code"),
});

interface CategoryFormProps {
  category?: Category | null;
  onSuccess: () => void;
}

const iconOptions = [
  { value: "home", label: "Home" },
  { value: "shopping-cart", label: "Shopping" },
  { value: "credit-card", label: "Credit Card" },
  { value: "utensils", label: "Food" },
  { value: "film", label: "Entertainment" },
  { value: "user", label: "Personal" },
  { value: "users", label: "Family" },
];

const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#6D28D9"); // Default purple color

  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      icon: "home",
      color: "#6D28D9",
    },
  });

  // Populate form if editing an existing category
  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        icon: category.icon,
        color: category.color,
      });
      setSelectedColor(category.color);
    }
  }, [category, form]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      if (category) {
        // Update existing category
        await updateCategory(category._id, data);
        toast({
          title: "Category updated",
          description: "Your category has been updated successfully.",
        });
      } else {
        // Create new category
        await createCategory(data);
        toast({
          title: "Category added",
          description: "Your new category has been added successfully.",
        });
      }
      onSuccess();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save category. Please try again.",
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Groceries" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an icon" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {iconOptions.map(icon => {
                    const Icon = iconMapping[icon.value];
                    return (
                      <SelectItem key={icon.value} value={icon.value}>
                        <div className="flex items-center space-x-2">
                          {Icon && <Icon size={16} />}
                          <span>{icon.label}</span>
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
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <div className="flex space-x-2">
                <FormControl>
                  <Input {...field} 
                    onChange={(e) => {
                      field.onChange(e);
                      setSelectedColor(e.target.value);
                    }}
                  />
                </FormControl>
                <div 
                  className="w-10 h-10 rounded-md border" 
                  style={{ backgroundColor: selectedColor }}
                />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="pt-2 flex space-x-2 justify-end">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Spinner className="mr-2" /> : null}
            {category ? "Update" : "Add"} Category
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CategoryForm;
