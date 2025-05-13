"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useUser } from '@/context/UserContext'
import { useTask } from '@/context/TaskContext'
import { RecentTasksList } from '@/components/dashboard/RecentTasksList'

export default function Dashboard() {
  const router = useRouter()
  const { currentUser } = useUser()
  const { getTasksAssignedToMe } = useTask()
  
  const myTasks = getTasksAssignedToMe()
  
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
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {currentUser.fullName}
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your tasks and activities
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Assigned Tasks</CardTitle>
            <CardDescription>Tasks assigned to you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{myTasks.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Tasks To Complete</CardTitle>
            <CardDescription>Tasks not yet completed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {myTasks.filter(task => task.status !== 'Completed').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">High Priority Tasks</CardTitle>
            <CardDescription>Tasks marked as high priority</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">
              {myTasks.filter(task => task.priority === 'High').length}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
          <CardDescription>Your most recently assigned tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <RecentTasksList />
        </CardContent>
      </Card>
    </div>
  )
}