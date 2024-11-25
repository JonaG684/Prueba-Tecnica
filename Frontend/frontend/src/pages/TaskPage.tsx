import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Checkbox,
  IconButton,
  Modal,
  Paper,
  Grid,
  Divider,
  Alert,
} from "@mui/material";
import { getTasksByProject, createTask, updateTask, deleteTask, getSubscriptionStatus } from "../services/api";
import { useParams } from "react-router-dom";
import { Delete as DeleteIcon } from "@mui/icons-material";
import BackButton from "./BackButton";

const Tasks: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTasks = async () => {
    try {
      const data = await getTasksByProject(Number(projectId));
      setTasks(data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptionStatus = async () => {
    try {
      const status = await getSubscriptionStatus();
      setSubscriptionStatus(status);
    } catch (err) {
      console.error("Error fetching subscription status:", err);
    }
  };

  const handleCreateTask = async () => {
    if (!subscriptionStatus?.is_subscribed) {
      setIsModalOpen(true);
      return;
    }

    try {
      await createTask({
        title: newTaskTitle,
        description: newTaskDescription,
        project_id: Number(projectId),
      });
      setNewTaskTitle("");
      setNewTaskDescription("");
      fetchTasks();
    } catch (err) {
      console.error("Error creating task:", err);
    }
  };

  const handleToggleCompletion = async (taskId: number, isCompleted: boolean) => {
    try {
      await updateTask(taskId, !isCompleted);
      fetchTasks();
    } catch (err) {
      console.error("Error updating task status:", err);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await deleteTask(taskId);
      fetchTasks();
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchSubscriptionStatus();
  }, [projectId]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, margin: "0 auto", padding: 3 }}>
      <BackButton />
      <Typography variant="h4" sx={{ mb: 4, textAlign: "center" }}>
        Manage Tasks
      </Typography>

      <Paper sx={{ padding: 3, backgroundColor: "#f9f9f9", borderRadius: 2, boxShadow: 1, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Add a New Task
        </Typography>
        <TextField
          label="Task Title"
          fullWidth
          sx={{ mb: 2 }}
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
        />
        <TextField
          label="Task Description"
          fullWidth
          multiline
          rows={3}
          sx={{ mb: 2 }}
          value={newTaskDescription}
          onChange={(e) => setNewTaskDescription(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateTask}
          fullWidth
          sx={{ padding: "12px", fontSize: "1rem" }}
        >
          Add Task
        </Button>
      </Paper>

      {/* Subscription Alert */}
      {!subscriptionStatus?.is_subscribed && (
        <Alert severity="warning" sx={{ mb: 4 }}>
          You need an active subscription to add tasks.
        </Alert>
      )}

      {/* Tasks list */}
      {tasks.length === 0 ? (
        <Typography variant="h6" sx={{ textAlign: "center", color: "#888" }}>
          No tasks available for this project.
        </Typography>
      ) : (
        tasks.map((task: any) => (
          <Paper key={task.id} sx={{ padding: 3, marginBottom: 2, backgroundColor: "#fff", borderRadius: 2, boxShadow: 1 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {task.title}
            </Typography>
            <Typography sx={{ mb: 2 }}>{task.description}</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Checkbox
                checked={task.is_completed}
                onChange={() => handleToggleCompletion(task.id, task.is_completed)}
                color="primary"
              />
              <Typography sx={{ fontWeight: "bold" }}>
                {task.is_completed ? "Completed" : "Pending"}
              </Typography>
              <IconButton color="error" onClick={() => handleDeleteTask(task.id)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          </Paper>
        ))
      )}

      {/* Modal for subscription */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box
          sx={{
            padding: 4,
            background: "white",
            maxWidth: 400,
            margin: "50px auto",
            textAlign: "center",
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Subscription Required
          </Typography>
          <Typography sx={{ mb: 4 }}>
            You need an active subscription to add tasks.
          </Typography>
          <Button variant="contained" color="primary" onClick={() => setIsModalOpen(false)} sx={{ fontSize: "1rem" }}>
            OK
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default Tasks;



