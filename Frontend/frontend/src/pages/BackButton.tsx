import React from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom'; 

const BackButton: React.FC = () => {
  const navigate = useNavigate(); 

  const handleBack = () => {
    navigate(-1); 
  };

  return (
    <Button
      variant="outlined"
      color="primary"
      onClick={handleBack}
      startIcon={<i className="material-icons"></i>} 
    >
      Back
    </Button>
  );
};

export default BackButton;
