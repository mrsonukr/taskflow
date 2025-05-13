"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2, Users2 } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { useTask, Task, TaskStatus, TaskPriority } from "@/context/TaskContext";
import { useUser, User } from "@/context/UserContext";
import { UserSearchInput } from "./UserSearchInput";
import { toast } from "sonner";

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().min(5, {
    message: "Description must be at least 5 characters.",
  }),
  status: z.enum(["To Do", "In Process", "Completed"]),
  priority: z.enum(["Low", "Medium", "High"]),
  dueDate: z.date({
    required_error: "Please select a due date.",
  }),
});

interface EditTaskDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTaskDialog({ task, open, onOpenChange }: EditTaskDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"users" | "details">("details");
  const { updateTask } = useTask();
  const { users, currentUser } = useUser();
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: new Date(task.dueDate),
    },
  });

  // Initialize selected users when the dialog opens
  useEffect(() => {
    console.log("EditTaskDialog useEffect - task.assignedTo:", task.assignedTo);
    console.log("EditTaskDialog useEffect - users:", users);

    if (!task.assignedTo) {
      setSelectedUsers([]);
      return;
    }

    // Use task.assignedTo directly, as it contains User objects
    setSelectedUsers(task.assignedTo);

    // Optional: Enrich with additional user properties from `users` if needed
    if (users && users.length > 0) {
      const enrichedUsers = task.assignedTo.map((assignedUser) => {
        const matchingUser = users.find((user: User) => user.id === assignedUser.id);
        return matchingUser ? { ...matchingUser, fullName: assignedUser.fullName } : assignedUser;
      });
      setSelectedUsers(enrichedUsers);
    }
  }, [task.assignedTo, users]);

  const handleClose = () => {
    setStep("details");
    form.reset();
    onOpenChange(false);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!currentUser) {
      toast.error("You must be logged in to update a task");
      return;
    }
    if (selectedUsers.length === 0) {
      form.setError("root", {
        message: "Please select at least one user to assign the task to.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await updateTask(task.id, {
        ...values,
        dueDate: values.dueDate.toISOString(),
        assignedTo: selectedUsers,
      });

      handleClose();
      toast.success("Task updated successfully");
    } catch (error: any) {
      console.error("Failed to update task:", error);
      toast.error(error.message || "Failed to update task");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === "users" ? "Update Assigned Users" : "Edit Task"}
          </DialogTitle>
          <DialogDescription>
            {step === "users"
              ? "Modify the users assigned to this task"
              : "Update the task details"}
          </DialogDescription>
        </DialogHeader>

        {step === "users" ? (
          <div className="space-y-6">
            <UserSearchInput
              selectedUsers={selectedUsers}
              setSelectedUsers={setSelectedUsers}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("details")}>
                Back
              </Button>
              <Button
                onClick={() => setStep("details")}
                disabled={selectedUsers.length === 0}
              >
                <Users2 className="mr-2 h-4 w-4" />
                Continue with {selectedUsers.length} user{selectedUsers.length !== 1 ? "s" : ""}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter task title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter task description"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="To Do">To Do</SelectItem>
                          <SelectItem value="In Process">In Process</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("users")}
                  className="gap-2"
                >
                  <Users2 className="h-4 w-4" />
                  Edit Assigned Users ({selectedUsers.length})
                </Button>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Task"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}