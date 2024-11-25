import React, { useState } from "react";
import { Box, TextField, Button, Typography, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { createProject } from "../services/api";
import useAuth from "../hooks/useAuth";

const CreateProject: React.FC = () => {
  useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null); 
    try {
      await createProject({ title, description });
      navigate("/dashboard");
    } catch (err) {
      setError("Error creating the project. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 450,
        margin: "0 auto",
        padding: 3,
        backgroundColor: "white",
        borderRadius: 2,
        boxShadow: 3,
        textAlign: "center",
        mt: 10,
      }}
    >
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "#333" }}>
        Create Project
      </Typography>
      {error && (
        <Typography color="error" sx={{ mb: 2, fontSize: "0.875rem" }}>
          {error}
        </Typography>
      )}
      <TextField
        label="Project Title"
        fullWidth
        sx={{ mb: 3 }}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        variant="outlined"
        InputLabelProps={{
          style: { fontSize: "1rem" },
        }}
        InputProps={{
          style: { borderRadius: "8px" },
        }}
      />
      <TextField
        label="Project Description"
        fullWidth
        multiline
        rows={4}
        sx={{ mb: 3 }}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        variant="outlined"
        InputLabelProps={{
          style: { fontSize: "1rem" },
        }}
        InputProps={{
          style: { borderRadius: "8px" },
        }}
      />
      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{
          borderRadius: "8px",
          padding: "10px 0",
          fontSize: "1rem",
          textTransform: "none",
          boxShadow: 2,
        }}
        onClick={handleSubmit}
        disabled={loading || !title || !description}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : "Create"}
      </Button>
    </Box>
  );
};

export default CreateProject;
