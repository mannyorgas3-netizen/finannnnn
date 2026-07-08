"use client"

import { useEffect, useState } from "react"
import { z } from "zod"
import { ArrowUp, BarChart3, CheckCircle2, Clock, ListTodo } from "lucide-react"

import { BaseLayout } from "@/components/layouts/base-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { columns } from "./components/columns"
import { DataTable } from "./components/data-table"
import { taskSchema, type Task } from "./data/schema"
import tasksData from "./data/tasks.json"

// Use static import for tasks data (works in both Vite and Next.js)
async function getTasks() {
  return z.array(taskSchema).parse(tasksData)
}

export default function AccountsPayablePage() {
  const [tasks, setTasks] = useState<z.infer<typeof taskSchema>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const taskList = await getTasks()
        setTasks(taskList)
      } catch (error) {
        console.error("Failed to load tasks:", error)
      } finally {
        setLoading(false)
      }
    }

    loadTasks()
  }, [])

  const handleAddTask = (newTask: Task) => {
    setTasks(prev => [newTask, ...prev])
  }

  // Calculate statistics
  const stats = {
    total: tasks.length,
    paid: tasks.filter(t => t.status === "paid").length,
    scheduled: tasks.filter(t => t.status === "scheduled").length,
    approved: tasks.filter(t => t.status === "approved").length,
    pendingReview: tasks.filter(t => t.status === "pending-review").length,
  }

  if (loading) {
    return (
      <BaseLayout title="Accounts Payable (AP)" description="View the Accounts Payable page.">
        <div className="flex items-center justify-center h-96">
          <div className="text-muted-foreground">Loading tasks...</div>
        </div>
      </BaseLayout>
    )
  }

  return (
    <BaseLayout title="Accounts Payable (AP)" description="View the Accounts Payable page.">
      {/* Mobile view placeholder - shows message instead of images */}
      <div className="md:hidden">
        <div className="flex items-center justify-center h-96 border rounded-lg bg-muted/20">
          <div className="text-center p-8">
            <h3 className="text-lg font-semibold mb-2">Tasks Dashboard</h3>
            <p className="text-muted-foreground">
              Please use a larger screen to view the full tasks interface.
            </p>
          </div>
        </div>
      </div>

      {/* Desktop view */}
      <div className="hidden h-full flex-1 flex-col space-y-6 px-4 md:px-6 md:flex">
        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Total Tasks</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{stats.total}</span>
                    <span className="flex items-center gap-0.5 text-sm text-green-500">
                      <ArrowUp className="size-3.5" />
                      {stats.total > 0 ? 100 : 0}%
                    </span>
                  </div>
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <ListTodo className="size-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Paid</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{stats.paid}</span>
                    <span className="flex items-center gap-0.5 text-sm text-green-500">
                      <ArrowUp className="size-3.5" />
                      {stats.total > 0 ? Math.round((stats.paid / stats.total) * 100) : 0}%
                    </span>
                  </div>
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <CheckCircle2 className="size-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Scheduled</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{stats.scheduled}</span>
                    <span className="flex items-center gap-0.5 text-sm text-green-500">
                      <ArrowUp className="size-3.5" />
                      {stats.total > 0 ? Math.round((stats.scheduled / stats.total) * 100) : 0}%
                    </span>
                  </div>
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <Clock className="size-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Pending Review</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{stats.pendingReview}</span>
                    <span className="flex items-center gap-0.5 text-sm text-orange-500">
                      <ArrowUp className="size-3.5" />
                      {stats.total > 0 ? Math.round((stats.pendingReview / stats.total) * 100) : 0}%
                    </span>
                  </div>
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <BarChart3 className="size-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Accounts Payable Workflow</CardTitle>
            <CardDescription>
              View, filter, and manage invoices, approvals, and payments in one place
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable data={tasks} columns={columns} onAddTask={handleAddTask} />
          </CardContent>
        </Card>
      </div>
    </BaseLayout>
  )
}
