"use client"

import Link from 'next/link'
import { Bell, Menu, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { useTask } from '@/context/TaskContext'
import { useState } from 'react'
import { AddTaskDialog } from '@/components/tasks/AddTaskDialog'
import { useUser } from '@/context/UserContext'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Sidebar } from './Sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function Header() {
  const [showAddTask, setShowAddTask] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { getUnreadNotificationsCount, notifications, markNotificationAsRead } = useTask()
  const { currentUser } = useUser()
  
  const unreadCount = getUnreadNotificationsCount()
  const userNotifications = currentUser 
    ? notifications.filter(n => n.userId === currentUser.id)
    : []

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-6">
      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center gap-4">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0">
              <Sidebar onNavigate={() => setSidebarOpen(false)} />
            </SheetContent>
          </Sheet>
          
          <h1 className="text-xl font-semibold">Task Management</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {currentUser && currentUser.role !== 'admin' && (
            <Button onClick={() => setShowAddTask(true)} size="sm" className="hidden sm:flex">
              <Plus className="mr-1 h-4 w-4" />
              Add Task
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[300px]">
              <div className="px-3 py-2 text-sm font-medium">Notifications</div>
              <div className="max-h-[300px] overflow-y-auto">
                {userNotifications.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No notifications
                  </div>
                ) : (
                  userNotifications.map(notification => (
                    <DropdownMenuItem 
                      key={notification.id}
                      className={cn(
                        "flex flex-col items-start px-3 py-2 cursor-pointer",
                        !notification.read && "bg-muted/50"
                      )}
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <div className="font-medium">{notification.message}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleString()}
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <ThemeToggle />
        </div>
      </div>
      
      {showAddTask && (
        <AddTaskDialog open={showAddTask} onOpenChange={setShowAddTask} />
      )}
    </header>
  )
}