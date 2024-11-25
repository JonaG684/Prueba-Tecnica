import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  Grid,
  Alert,
} from "@mui/material";
import BackButton from "./BackButton";
import { subscribe, unsubscribe, getSubscriptionStatus } from "../services/api";
import useAuth from "../hooks/useAuth";

const Subscription: React.FC = () => {
  useAuth();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string>("monthly");

  const fetchSubscriptionStatus = async () => {
    try {
      const data = await getSubscriptionStatus();
      setStatus(data);
    } catch (err) {
      console.error("Error fetching subscription status:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      await subscribe(selectedPlan);
      fetchSubscriptionStatus();
    } catch (err) {
      console.error("Error subscribing:", err);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      await unsubscribe();
      fetchSubscriptionStatus();
    } catch (err) {
      console.error("Error unsubscribing:", err);
    }
  };

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

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
    <Box
      sx={{
        maxWidth: 500,
        margin: "0 auto",
        padding: 3,
        textAlign: "center",
        mt: 8,
        backgroundColor: "white",
        borderRadius: 2,
        boxShadow: 3,
      }}
    > 
      <BackButton />
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "#333" }}>
        Subscription Management
      </Typography>
      
      {status?.is_subscribed ? (
        <Alert severity="success" sx={{ mb: 3 }}>
          Your subscription is active!
        </Alert>
      ) : (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Your subscription has expired.
        </Alert>
      )}

      {status?.subscription_end_date && (
        <Typography sx={{ mb: 3 }}>
          <strong>Ends on:</strong>{" "}
          {new Date(status.subscription_end_date).toLocaleDateString()}
        </Typography>
      )}

      <Paper
        sx={{
          padding: 3,
          backgroundColor: "#f4f4f4",
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Select a Plan
        </Typography>
        <RadioGroup
          aria-label="subscription-plan"
          name="subscription-plan"
          value={selectedPlan}
          onChange={(e) => setSelectedPlan(e.target.value)}
        >
          <FormControlLabel
            value="monthly"
            control={<Radio />}
            label="Monthly Plan (30 days)"
          />
          <FormControlLabel
            value="yearly"
            control={<Radio />}
            label="Yearly Plan (365 days)"
          />
        </RadioGroup>
      </Paper>

      <Grid container spacing={2} sx={{ mt: 4 }}>
        {status?.is_subscribed ? (
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              onClick={handleUnsubscribe}
              sx={{
                padding: "12px",
                fontSize: "1rem",
                textTransform: "none",
              }}
            >
              Cancel Subscription
            </Button>
          </Grid>
        ) : (
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleSubscribe}
              sx={{
                padding: "12px",
                fontSize: "1rem",
                textTransform: "none",
              }}
            >
              Subscribe Now
            </Button>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Subscription;

