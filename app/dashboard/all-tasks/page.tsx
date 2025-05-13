"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useUser } from '@/context/UserContext'
import { useTask } from '@/context/TaskContext'
import { TaskCard } from '@/components/tasks/TaskCard'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { AddTaskDialog } from '@/components/tasks/AddTaskDialog'
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination'

export default function AllTasksPage() {
  const router = useRouter()
  const { currentUser } = useUser()
  const { tasks, getAllTasks, totalPages, currentPage, setCurrentPage } = useTask()
  const [activeTab, setActiveTab] = useState<string>("all")
  const [showAddTask, setShowAddTask] = useState(false)
  
  // Filter tasks based on the active tab
  const getFilteredTasks = () => {
    if (activeTab === "all") return tasks
    
    return tasks.filter(task => task.status === activeTab)
  }
  
  const filteredTasks = getFilteredTasks()
  
  // Handle authentication and admin role check
  useEffect(() => {
    if (!currentUser) {
      router.push('/')
    } else if (currentUser.role !== 'admin') {
      router.push('/dashboard')
    } else {
      getAllTasks(currentPage)
    }
  }, [currentUser, router, currentPage])

  useEffect(() => {
    // Reset to first page when changing tabs
    setCurrentPage(1)
  }, [activeTab])
  
  if (!currentUser || currentUser.role !== 'admin') {
    return null
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">All Tasks</h1>
          <p className="text-muted-foreground">
            Administrator view of all tasks in the system
          </p>
        </div>
        <Button onClick={() => setShowAddTask(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="To Do">To Do</TabsTrigger>
            <TabsTrigger value="In Process">In Process</TabsTrigger>
            <TabsTrigger value="Completed">Completed</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value={activeTab} className="mt-4">
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="text-muted-foreground">No tasks to display</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTasks.map(task => (
                  <TaskCard 
                    key={task.id}
                    task={task}
                    isCreator={false}
                    isAdmin={true}
                  />
                ))}
              </div>
              
              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1} 
                        />
                      </PaginationItem>
                      
                      {[...Array(totalPages)].map((_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink
                            onClick={() => setCurrentPage(i + 1)}
                            isActive={currentPage === i + 1}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages} 
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {showAddTask && (
        <AddTaskDialog 
          open={showAddTask} 
          onOpenChange={setShowAddTask}
          isAdmin={true}
        />
      )}
    </div>
  )
}