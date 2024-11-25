import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Modal,
  TextField,
  List,
  ListItem,
  LinearProgress,
  ListItemText,
  Grid,
} from "@mui/material";
import {
  getProjects,
  getSubscriptionStatus,
  searchUsers,
  addUserToProject,
  deleteProject,
  getProjectProgress,
} from "../services/api";
import useAuth from "../hooks/useAuth";
import { Link } from "react-router-dom";

const Dashboard: React.FC = () => {
  useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProjects = async () => {
    const projectsData = await getProjects();
    const projectsWithProgress = await Promise.all(
      projectsData.map(async (project: any) => {
        const progressData = await getProjectProgress(project.id);
        return { ...project, progress: progressData.progress };
      })
    );
    setProjects(projectsWithProgress);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const subscriptionData = await getSubscriptionStatus();
        await fetchProjects();
        setSubscriptionStatus(subscriptionData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = async () => {
    try {
      const results = await searchUsers(selectedProject!, searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error("Error searching users:", err);
    }
  };

  const handleInvite = async (userId: number) => {
    try {
      await addUserToProject(selectedProject!, userId);
      alert("User invited successfully!");
      setSearchResults((prev) => prev.filter((user) => user.id !== userId));
    } catch (err) {
      console.error("Error inviting user:", err);
      alert("Failed to invite user.");
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    try {
      await deleteProject(projectId);
      setProjects((prev) => prev.filter((project) => project.id !== projectId));
      alert("Project deleted successfully!");
    } catch (err) {
      console.error("Error deleting project:", err);
      alert("Failed to delete project.");
    }
  };

  const openInviteModal = (projectId: number) => {
    setSelectedProject(projectId);
    setIsModalOpen(true);
    setSearchQuery("");
    setSearchResults([]);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, textAlign: "center" }}>
        Dashboard
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 4 }}>
        <Button
          component={Link}
          to="/subscription"
          variant="contained"
          color="secondary"
          sx={{ fontSize: "1rem" }}
        >
          Manage Subscription
        </Button>

        {subscriptionStatus && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              backgroundColor: subscriptionStatus.is_subscribed ? "#e8f5e9" : "#ffebee",
              padding: 1.5,
              borderRadius: 1,
              boxShadow: 1,
              textAlign: "center",
              width: "auto",
            }}
          >
            <Typography variant="body1">
              Subscription:{" "}
              {subscriptionStatus.is_subscribed ? "Active" : "Expired"}
            </Typography>
          </Box>
        )}
      </Box>

      {subscriptionStatus?.is_subscribed && (
        <Box sx={{ mb: 4 }}>
          <Button
            component={Link}
            to="/create-project"
            variant="contained"
            color="primary"
            fullWidth
          >
            Create New Project
          </Button>
        </Box>
      )}

      
      <Grid container spacing={2}>
        {projects.map((project: any) => (
          <Grid item xs={12} sm={6} md={4} key={project.id}>
            <Box
              sx={{
                border: "1px solid #ddd",
                borderRadius: 2,
                padding: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                boxShadow: 2,
                textAlign: "center",
              }}
            >
              <Typography variant="h6">{project.title}</Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {project.description}
              </Typography>
              <LinearProgress variant="determinate" value={project.progress || 0} sx={{ width: "100%", mb: 2 }} />
              <Link
                to={`/projects/${project.id}/tasks`}
                style={{ textDecoration: "none", marginBottom: "8px" }}
              >
                <Button variant="outlined" fullWidth sx={{ mb: 1 }}>
                  View Tasks
                </Button>
              </Link>

              {subscriptionStatus?.is_subscribed ? (
                <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    sx={{ flexGrow: 1 }}
                    onClick={() => openInviteModal(project.id)}
                  >
                    Invite Users
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    sx={{ flexGrow: 1 }}
                    onClick={() => handleDeleteProject(project.id)}
                  >
                    Delete Project
                  </Button>
                </Box>
              ) : (
                <Typography sx={{ mt: 2 }} color="error">
                  Subscription required to modify this project.
                </Typography>
              )}
            </Box>
          </Grid>
        ))}
      </Grid>


      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box
          sx={{
            padding: 4,
            background: "white",
            maxWidth: 600,
            margin: "50px auto",
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <Typography variant="h5" sx={{ mb: 2 }}>
            Invite Users to Project
          </Typography>
          <TextField
            label="Search Users"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button variant="contained" onClick={handleSearch} sx={{ mb: 2 }}>
            Search
          </Button>
          <List>
            {searchResults.map((user) => (
              <ListItem key={user.id} sx={{ display: "flex", justifyContent: "space-between" }}>
                <ListItemText primary={user.username} secondary={user.email} />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleInvite(user.id)}
                >
                  Invite
                </Button>
              </ListItem>
            ))}
          </List>
        </Box>
      </Modal>
    </Box>
  );
};

export default Dashboard;