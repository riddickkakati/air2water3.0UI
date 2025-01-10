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
  makeStyles,
  Grid
} from '@material-ui/core';
import { useAuth } from '../../hooks/useAuth';
import { useFetchGroup2 } from '../../hooks/fetch-group';
import config from '../../utils/config';

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
  },
  selectedFile: {
    marginTop: theme.spacing(1),
    color: theme.palette.text.secondary
  }
}));

const EventForm = () => {
  const classes = useStyles();
  const { authData } = useAuth();
  const location = useLocation();
  const history = useHistory();
  
  const group = location.state?.group;
  const [groupData, loading, error] = useFetchGroup2(group?.id);
  const [isInGroup, setIsInGroup] = useState(false);
  const [serviceKeyFile, setServiceKeyFile] = useState(null);
  
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    latitude: '10.683',
    longitude: '45.667',
    satellite: 'L',
    parameter: 'C',
    cloud_cover: 7,
    service_account: 'your-service-account@project.iam.gserviceaccount.com'
  });

  useEffect(() => {
    if (!group) {
      history.push('/monitoring');
    }
  }, [group, history]);

  useEffect(() => {
    if (groupData && authData?.user) {
      const memberStatus = groupData.monitoring_members?.find(
        member => member.user.id === authData.user.id
      );
      setIsInGroup(!!memberStatus);
    }
  }, [groupData, authData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create form data for multipart/form-data submission
      const submitFormData = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        submitFormData.append(key, formData[key]);
      });
      
      // Add the group ID
      submitFormData.append('group', group.id);
      
      // Add the service key file if selected
      if (serviceKeyFile) {
        submitFormData.append('service_key_file', serviceKeyFile);
      }

      const response = await fetch(`${config.API_URL}/monitoring/compute/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authData.token}`
          // Don't set Content-Type - it will be set automatically for FormData
        },
        body: submitFormData
      });

      if (!response.ok) {
        throw new Error('Failed to create monitoring run');
      }

      const data = await response.json();

      const runResponse = await fetch(`${config.API_URL}/monitoring/compute/${data.id}/run_monitoring/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authData.token}`
        }
      });

      if (!runResponse.ok) {
        throw new Error('Failed to start monitoring run');
      }

      history.push(`/monitoring/groups/${group.id}`);

    } catch (error) {
      console.error('Error in monitoring creation:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.endsWith('.json')) {
        alert('Please upload a JSON file');
        return;
      }
      setServiceKeyFile(file);
    }
  };

  if (!group) return <Typography>No group information provided</Typography>;
  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography>Error loading group: {error.message}</Typography>;
  if (!isInGroup) return <Typography>You must be a member of this group to create an event</Typography>;

  const isFormValid = formData.latitude && 
                     formData.longitude && 
                     formData.start_date && 
                     formData.end_date && 
                     formData.parameter && 
                     formData.satellite &&
                     serviceKeyFile;

  return (
    <Paper className={classes.root}>
      <Typography variant="h5" className={classes.title}>
        Create New Monitoring Run
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Parameter Selection */}
          <Grid item xs={12} md={6}>
            <FormControl component="fieldset" className={classes.formControl}>
              <FormLabel component="legend">Select Parameter</FormLabel>
              <RadioGroup 
                value={formData.parameter}
                onChange={handleChange}
                name="parameter"
              >
                <FormControlLabel value="C" control={<Radio />} label="CHLA" />
                <FormControlLabel value="T" control={<Radio />} label="TURBIDITY" />
                <FormControlLabel value="D" control={<Radio />} label="DO" />
              </RadioGroup>
            </FormControl>
          </Grid>

          {/* Satellite Selection */}
          <Grid item xs={12} md={6}>
            <FormControl component="fieldset" className={classes.formControl}>
              <FormLabel component="legend">Select Satellite</FormLabel>
              <RadioGroup 
                value={formData.satellite}
                onChange={handleChange}
                name="satellite"
              >
                <FormControlLabel value="L" control={<Radio />} label="Landsat" />
                <FormControlLabel value="S" control={<Radio />} label="Sentinel" />
              </RadioGroup>
            </FormControl>
          </Grid>

          {/* Location Fields */}
          <Grid item xs={12} md={6}>
            <TextField
              label="Latitude"
              type="number"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              fullWidth
              required
              className={classes.textField}
              inputProps={{ step: "any" }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Longitude"
              type="number"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              fullWidth
              required
              className={classes.textField}
              inputProps={{ step: "any" }}
            />
          </Grid>

          {/* Date Range Fields */}
          <Grid item xs={12} md={6}>
            <TextField
              label="Start Date"
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              fullWidth
              required
              className={classes.textField}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="End Date"
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              fullWidth
              required
              className={classes.textField}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Cloud Cover Setting */}
          <Grid item xs={12}>
            <TextField
              label="Cloud Cover (%)"
              type="number"
              name="cloud_cover"
              value={formData.cloud_cover}
              onChange={handleChange}
              fullWidth
              className={classes.textField}
              inputProps={{
                min: 0,
                max: 100
              }}
            />
          </Grid>

          {/* Service Account Settings */}
          <Grid item xs={12}>
            <TextField
              label="Service Account Email"
              name="service_account"
              value={formData.service_account}
              onChange={handleChange}
              fullWidth
              className={classes.textField}
            />
          </Grid>

          {/* Service Key File Upload */}
          <Grid item xs={12}>
            <Typography variant="body2" className={classes.fileLabel}>
              Service Key File (JSON)
            </Typography>
            <input
              accept=".json"
              type="file"
              onChange={handleFileChange}
              className={classes.fileInput}
            />
            {serviceKeyFile && (
              <Typography variant="body2" className={classes.selectedFile}>
                Selected file: {serviceKeyFile.name}
              </Typography>
            )}
          </Grid>
        </Grid>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={!isFormValid}
          className={classes.submitButton}
        >
          Start Monitoring Run
        </Button>
      </form>
    </Paper>
  );
};

export default EventForm;