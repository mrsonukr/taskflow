"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useUser } from '@/context/UserContext'
import { useTask, Task, TaskStatus } from '@/context/TaskContext'
import { TaskCard } from '@/components/tasks/TaskCard'

export default function AssignedTasksPage() {
  const router = useRouter()
  const { currentUser } = useUser()
  const { getTasksAssignedToMe } = useTask()
  const [activeTab, setActiveTab] = useState<string>("all")
  
  const assignedTasks = getTasksAssignedToMe()
  
  // Filter tasks based on the active tab
  const getFilteredTasks = () => {
    if (activeTab === "all") return assignedTasks
    
    return assignedTasks.filter(task => task.status === activeTab)
  }
  
  const filteredTasks = getFilteredTasks()
  
  // Handle authentication (redirect if not logged in)
  useEffect(() => {
    if (!currentUser) {
      router.push('/')
    }
  }, [currentUser, router])
  
  if (!currentUser) {
    return null
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Tasks Assigned to Me</h1>
        <p className="text-muted-foreground">
          Tasks that have been assigned to you by others
        </p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTasks.map(task => (
                <TaskCard 
                  key={task.id}
                  task={task}
                  isCreator={task.createdBy === currentUser.id}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}