
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem 
} from '@/components/ui/sidebar';
import { Home, CreditCard, BarChart, PieChart, Calendar } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function AppSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    {
      title: 'Dashboard',
      url: '/',
      icon: Home,
    },
    {
      title: 'Transactions',
      url: '/transactions',
      icon: CreditCard,
    },
    {
      title: 'Categories',
      url: '/categories',
      icon: PieChart,
    },
    {
      title: 'Budget',
      url: '/budget',
      icon: BarChart,
    },
    {
      title: 'Insights',
      url: '/insights',
      icon: Calendar,
    }
  ];

  const isActive = (path: string) => {
    return path === '/' ? currentPath === '/' : currentPath.startsWith(path);
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center space-x-2 px-6 py-4">
          <div className="h-6 w-6 rounded-md bg-primary"></div>
          <span className="text-lg font-semibold">Money Flow</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title} className={isActive(item.url) ? "bg-sidebar-accent" : ""}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url} className="flex items-center">
                      <item.icon size={18} className={isActive(item.url) ? "text-primary" : ""} />
                      <span className={isActive(item.url) ? "text-primary font-medium" : ""}>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-6 py-3 text-xs text-muted-foreground">
          Money Flow Compass © 2025
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
