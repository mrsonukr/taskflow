"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  CheckSquare, 
  ListTodo, 
  Settings, 
  ClipboardList,
  LogOut,
  Plus 
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useUser } from '@/context/UserContext'
import { AddTaskDialog } from '../tasks/AddTaskDialog'

interface NavItem {
  title: string
  icon: React.ReactNode
  href: string
  variant: "default" | "ghost"
}

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname()
  const { currentUser, logout } = useUser()
  const [navItems, setNavItems] = useState<NavItem[]>([])
  const [showAddTask, setShowAddTask] = useState(false)

  useEffect(() => {
    const items: NavItem[] = [
      {
        title: "Dashboard",
        icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
        href: "/dashboard",
        variant: pathname === "/dashboard" ? "default" : "ghost",
      },
      {
        title: "My Tasks",
        icon: <CheckSquare className="mr-2 h-4 w-4" />,
        href: "/dashboard/my-tasks",
        variant: pathname === "/dashboard/my-tasks" ? "default" : "ghost",
      },
      {
        title: "Assigned Tasks",
        icon: <ListTodo className="mr-2 h-4 w-4" />,
        href: "/dashboard/assigned-tasks",
        variant: pathname === "/dashboard/assigned-tasks" ? "default" : "ghost",
      }
    ]

    // Add admin-specific items
    if (currentUser?.role === 'admin') {
      items.push({
        title: "All Tasks",
        icon: <ClipboardList className="mr-2 h-4 w-4" />,
        href: "/dashboard/all-tasks",
        variant: pathname === "/dashboard/all-tasks" ? "default" : "ghost",
      })
    }

    // Add settings for both roles
    items.push({
      title: "Settings",
      icon: <Settings className="mr-2 h-4 w-4" />,
      href: "/dashboard/settings",
      variant: pathname === "/dashboard/settings" ? "default" : "ghost",
    })

    setNavItems(items)
  }, [pathname, currentUser])

  const handleNavigation = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <div className="group flex flex-col h-full bg-card border-r">
      <div className="flex h-14 items-center px-4 border-b">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold" onClick={handleNavigation}>
          <ClipboardList className="h-5 w-5" />
          <span>TaskFlow</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {navItems.map((item) => (
            <Button
              key={item.title}
              variant={item.variant}
              size="sm"
              className="w-full justify-start"
              asChild
            >
              <Link href={item.href} onClick={handleNavigation}>
                {item.icon}
                {item.title}
              </Link>
            </Button>
          ))}
        </div>
      </ScrollArea>
      
      {currentUser && currentUser.role !== 'admin' && (
        <div className="p-4 border-t md:hidden">
          <Button className="w-full" onClick={() => setShowAddTask(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>
      )}
      
      <div className="flex flex-col gap-2 p-4 border-t">
        {currentUser && (
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
              {currentUser.fullName.charAt(0)}
            </div>
            <div className="flex flex-col space-y-0">
              <p className="text-sm font-medium">{currentUser.fullName}</p>
              <p className="text-xs text-muted-foreground">@{currentUser.username}</p>
            </div>
          </div>
        )}
        <Button variant="outline" size="sm" className="justify-start" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </div>

      {showAddTask && (
        <AddTaskDialog 
          open={showAddTask} 
          onOpenChange={(open) => {
            setShowAddTask(open);
            if (!open && onNavigate) {
              onNavigate();
            }
          }} 
        />
      )}
    </div>
  )
}