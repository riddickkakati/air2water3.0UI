import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  Button,
  TextField,
  Paper,
  Typography,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormControl,
  FormLabel,
  Checkbox,
  makeStyles,
  Grid
} from '@material-ui/core';
import { useAuth } from '../../hooks/useAuth';
import { useFetchGroup3 } from '../../hooks/fetch-group';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3)
  },
  formControl: {
    margin: theme.spacing(2, 0),
    width: '100%'
  },
  textField: {
    marginBottom: theme.spacing(2)
  },
  submitButton: {
    marginTop: theme.spacing(3)
  },
  title: {
    marginBottom: theme.spacing(3)
  },
  fileInput: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2)
  },
  fileLabel: {
    display: 'block',
    marginBottom: theme.spacing(1),
    color: theme.palette.text.secondary
  }
}));

const EventForm = () => {
  const classes = useStyles();
  const { authData } = useAuth();
  const location = useLocation();
  const history = useHistory();
  
  const group = location.state?.group;
  const [groupData, loading, error] = useFetchGroup3(group?.id);
  const [isInGroup, setIsInGroup] = useState(false);
  
  const [formData, setFormData] = useState({
    model: 'W', // Air2water is default
    interpolate: true,
    n_data_interpolate: 7,
    validation_required: 'F',
    percent: 10,
    email_send: false,
    email_list: ''
  });

  const [files, setFiles] = useState({
    timeseries_file: null,
    validation_file: null
  });

  useEffect(() => {
    if (!group) {
      history.push('/machinelearning');
    }
  }, [group, history]);

  useEffect(() => {
    if (groupData && authData?.user) {
      const memberStatus = groupData.machine_learning_members?.find(
        member => member.user.id === authData.user.id
      );
      setIsInGroup(!!memberStatus);
    }
  }, [groupData, authData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitFormData = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        submitFormData.append(key, formData[key]);
      });
      
      // Add files
      if (files.timeseries_file) {
        submitFormData.append('timeseries_file', files.timeseries_file);
      }
      if (files.validation_file) {
        submitFormData.append('validation_file', files.validation_file);
      }
      
      // Add group ID
      submitFormData.append('group', group.id);

      const response = await fetch('http://127.0.0.1:8000/machinelearning/ml_analysis/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authData.token}`
        },
        body: submitFormData
      });

      if (!response.ok) {
        throw new Error('Failed to create ML analysis');
      }

      const data = await response.json();

      // Start the analysis
      const runResponse = await fetch(`http://127.0.0.1:8000/machinelearning/ml_analysis/${data.id}/run_analysis/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authData.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!runResponse.ok) {
        throw new Error('Failed to start ML analysis');
      }

      history.push(`/machinelearning/groups/${group.id}`);

    } catch (error) {
      console.error('Error in ML analysis creation:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files[0]) {
      setFiles(prev => ({
        ...prev,
        [name]: files[0]
      }));
    }
  };

  if (!group) return <Typography>No group information provided</Typography>;
  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography>Error loading group: {error.message}</Typography>;
  if (!isInGroup) return <Typography>You must be a member of this group to create an ML analysis</Typography>;

  const isFormValid = files.timeseries_file && 
    (formData.validation_required === 'F' ? files.validation_file : true) &&
    formData.percent >= 1 && formData.percent <= 50;

  return (
    <Paper className={classes.root}>
      <Typography variant="h5" className={classes.title}>
        Create new analysis
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Model Selection */}
          <Grid item xs={12} md={6}>
            <FormControl component="fieldset" className={classes.formControl}>
              <FormLabel component="legend">Select Model</FormLabel>
              <RadioGroup 
                value={formData.model}
                onChange={handleChange}
                name="model"
              >
                <FormControlLabel value="W" control={<Radio />} label="Air2water" />
                <FormControlLabel value="S" control={<Radio />} label="Air2stream" />
              </RadioGroup>
            </FormControl>
          </Grid>

          {/* Validation Type Selection */}
          <Grid item xs={12} md={6}>
            <FormControl component="fieldset" className={classes.formControl}>
              <FormLabel component="legend">Validation Method</FormLabel>
              <RadioGroup 
                value={formData.validation_required}
                onChange={handleChange}
                name="validation_required"
              >
                <FormControlLabel value="F" control={<Radio />} label="Use Validation File" />
                <FormControlLabel value="R" control={<Radio />} label="Random Percentage" />
                <FormControlLabel value="U" control={<Radio />} label="Uniform Percentage" />
                <FormControlLabel value="N" control={<Radio />} label="Uniform Number" />
              </RadioGroup>
            </FormControl>
          </Grid>

          {/* File Uploads */}
          <Grid item xs={12}>
            <Typography variant="body2" className={classes.fileLabel}>
              Timeseries File (Required)
            </Typography>
            <input
              type="file"
              name="timeseries_file"
              onChange={handleFileChange}
              accept=".txt"
              className={classes.fileInput}
              required
            />
          </Grid>

          {formData.validation_required === 'F' && (
            <Grid item xs={12}>
              <Typography variant="body2" className={classes.fileLabel}>
                Validation File (Required for external validation)
              </Typography>
              <input
                type="file"
                name="validation_file"
                onChange={handleFileChange}
                accept=".txt"
                className={classes.fileInput}
                required
              />
            </Grid>
          )}

          {/* Interpolation Settings */}
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.interpolate}
                  onChange={handleChange}
                  name="interpolate"
                />
              }
              label="Enable Interpolation"
            />
          </Grid>

          {formData.interpolate && (
            <Grid item xs={12} md={6}>
              <TextField
                label="Interpolation Data Points"
                type="number"
                name="n_data_interpolate"
                value={formData.n_data_interpolate}
                onChange={handleChange}
                fullWidth
                className={classes.textField}
                inputProps={{
                  min: 1
                }}
              />
            </Grid>
          )}

          {/* Validation Percentage */}
          {formData.validation_required !== 'F' && (
            <Grid item xs={12} md={6}>
              <TextField
                label="Validation Percentage"
                type="number"
                name="percent"
                value={formData.percent}
                onChange={handleChange}
                fullWidth
                className={classes.textField}
                inputProps={{
                  min: 1,
                  max: 50
                }}
              />
            </Grid>
          )}

          {/* Email Settings */}
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.email_send}
                  onChange={handleChange}
                  name="email_send"
                />
              }
              label="Send Email Notifications"
            />
          </Grid>

          {formData.email_send && (
            <Grid item xs={12} md={6}>
              <TextField
                label="Email List (comma-separated)"
                name="email_list"
                value={formData.email_list}
                onChange={handleChange}
                fullWidth
                className={classes.textField}
              />
            </Grid>
          )}
        </Grid>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={!isFormValid}
          className={classes.submitButton}
        >
          Start ML Analysis
        </Button>
      </form>
    </Paper>
  );
};

export default EventForm;