import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Paper,
  Typography,
  Grid,
  Divider
} from '@material-ui/core';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import { NotificationManager } from 'react-notifications';

export default function EventForm() {
  const { authData } = useAuth();
  const { state } = useLocation();
  const { group } = state;
  const history = useHistory();

  // Basic simulation parameters
  const [formData, setFormData] = useState({
    model: '',
    mode: '',
    method: '',
    optimizer: '',
    forward_options: '',
    error_metric: '',
    solver: '',
    interpolate: true,
    n_data_interpolate: 7,
    validation_required: true,
    core: 1,
    depth: 14.0,
    compiler: '',
    CFL: 0.9,
    databaseformat: '',
    computeparameterranges: true,
    computeparameters: false,
    log_flag: true,
    resampling_frequency_days: 1,
    resampling_frequency_weeks: 1,
    email_send: false,
    email_list: ''
  });

  // File states
  const [files, setFiles] = useState({
    timeseriesFile: null,
    parameterFile: null,
    parameterRangesFile: null,
    validationFile: null
  });

  // File descriptions
  const [fileDescriptions, setFileDescriptions] = useState({
    timeseriesFile: '',
    parameterFile: '',
    parameterRangesFile: '',
    validationFile: ''
  });

  const handleInputChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' 
      ? event.target.checked 
      : event.target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (fileType) => (event) => {
    const file = event.target.files[0];
    setFiles(prev => ({
      ...prev,
      [fileType]: file
    }));
  };

  const handleDescriptionChange = (fileType) => (event) => {
    setFileDescriptions(prev => ({
      ...prev,
      [fileType]: event.target.value
    }));
  };

  const validateFileExtension = (file, allowedExtensions) => {
    if (!file) return true;
    const extension = file.name.split('.').pop().toLowerCase();
    return allowedExtensions.includes(extension);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate file extensions
    if (!validateFileExtension(files.timeseriesFile, ['txt'])) {
      NotificationManager.error("Time series file must be a .txt file");
      return;
    }
    if (!validateFileExtension(files.parameterFile, ['txt'])) {
      NotificationManager.error("Parameter file must be a .txt file");
      return;
    }
    if (!validateFileExtension(files.parameterRangesFile, ['yaml'])) {
      NotificationManager.error("Parameter ranges file must be a .yaml file");
      return;
    }
    if (!validateFileExtension(files.validationFile, ['txt'])) {
      NotificationManager.error("Validation file must be a .txt file");
      return;
    }

    // Create FormData instance to handle file uploads
    const formDataToSend = new FormData();
    
    // Append regular form data
    Object.keys(formData).forEach(key => {
      formDataToSend.append(key, formData[key]);
    });
    
    // Append files and their descriptions
    if (files.timeseriesFile) {
      formDataToSend.append('timeseriesFile', files.timeseriesFile);
      formDataToSend.append('timeseriesDescription', fileDescriptions.timeseriesFile);
    }
    if (files.parameterFile) {
      formDataToSend.append('parameterFile', files.parameterFile);
      formDataToSend.append('parameterDescription', fileDescriptions.parameterFile);
    }
    if (files.parameterRangesFile) {
      formDataToSend.append('parameterRangesFile', files.parameterRangesFile);
      formDataToSend.append('parameterRangesDescription', fileDescriptions.parameterRangesFile);
    }
    if (files.validationFile) {
      formDataToSend.append('validationFile', files.validationFile);
      formDataToSend.append('validationDescription', fileDescriptions.validationFile);
    }

    formDataToSend.append('group', group.id);

    /*try {
      const simulationData = await createSimulation(authData.token, formDataToSend);
      if (simulationData) {
        NotificationManager.success("Simulation created");
        history.push('/details/' + group.id);
      }
    } catch (error) {
      NotificationManager.error("Error creating simulation. Please try again later");
    }*/
  };

  const FileUploadSection = ({ title, fileType, accept, description }) => (
    <Paper style={{ padding: '20px', marginBottom: '20px' }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <input
            accept={accept}
            style={{ display: 'none' }}
            id={fileType}
            type="file"
            onChange={handleFileChange(fileType)}
          />
          <label htmlFor={fileType}>
            <Button
              variant="contained"
              color="default"
              component="span"
              startIcon={<CloudUploadIcon />}
              fullWidth
            >
              Upload {files[fileType] ? files[fileType].name : 'File'}
            </Button>
          </label>
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Description"
            value={fileDescriptions[fileType]}
            onChange={handleDescriptionChange(fileType)}
            fullWidth
          />
        </Grid>
      </Grid>
    </Paper>
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <h3>New Simulation for {group.name}</h3>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Original form fields */}
        <Paper style={{ padding: '20px', marginBottom: '20px' }}>
          <Typography variant="h6" gutterBottom>
            Simulation Parameters
          </Typography>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* [Previous form fields remain the same...] */}
            {/* Model Selection */}
            <FormControl fullWidth>
              <InputLabel>Model</InputLabel>
              <Select
                value={formData.model}
                onChange={handleInputChange('model')}
              >
                <MenuItem value="W">Air2water</MenuItem>
                <MenuItem value="S">Air2stream</MenuItem>
              </Select>
            </FormControl>

            {/* Mode Selection */}
            <FormControl fullWidth>
              <InputLabel>Mode</InputLabel>
              <Select
                value={formData.mode}
                onChange={handleInputChange('mode')}
              >
                <MenuItem value="F">Forward Mode</MenuItem>
                <MenuItem value="C">Calibration</MenuItem>
              </Select>
            </FormControl>

            {/* Method Selection */}
            <FormControl fullWidth>
              <InputLabel>Method</InputLabel>
              <Select
                value={formData.method}
                onChange={handleInputChange('method')}
              >
                <MenuItem value="S">SPOTPY</MenuItem>
                <MenuItem value="C">PYCUP</MenuItem>
              </Select>
            </FormControl>

            {/* Optimizer Selection */}
            <FormControl fullWidth>
              <InputLabel>Optimizer</InputLabel>
              <Select
                value={formData.optimizer}
                onChange={handleInputChange('optimizer')}
              >
                <MenuItem value="P">PSO</MenuItem>
                <MenuItem value="L">LATINHYPERCUBE</MenuItem>
                <MenuItem value="M">MONTECARLO</MenuItem>
              </Select>
            </FormControl>

            {/* Numeric Inputs */}
            <TextField
              label="Number of Cores"
              type="number"
              value={formData.core}
              onChange={handleInputChange('core')}
              InputProps={{ inputProps: { min: 1 } }}
              fullWidth
            />

            <TextField
              label="Depth"
              type="number"
              value={formData.depth}
              onChange={handleInputChange('depth')}
              InputProps={{ inputProps: { step: 0.1 } }}
              fullWidth
            />

            <TextField
              label="CFL Number"
              type="number"
              value={formData.CFL}
              onChange={handleInputChange('CFL')}
              InputProps={{ inputProps: { step: 0.1, min: 0, max: 1 } }}
              fullWidth
            />

            <TextField
              label="Data Interpolation Points"
              type="number"
              value={formData.n_data_interpolate}
              onChange={handleInputChange('n_data_interpolate')}
              InputProps={{ inputProps: { min: 1 } }}
              fullWidth
            />
          </div>
        </Paper>

        {/* File upload sections */}
        <FileUploadSection
          title="Time Series Data"
          fileType="timeseriesFile"
          accept=".txt"
          description="Upload time series data file (TXT)"
        />

        <FileUploadSection
          title="Parameter File"
          fileType="parameterFile"
          accept=".txt"
          description="Upload parameter file (TXT)"
        />

        <FileUploadSection
          title="Parameter Ranges File"
          fileType="parameterRangesFile"
          accept=".yaml"
          description="Upload parameter ranges file (YAML)"
        />

        <FileUploadSection
          title="Validation File"
          fileType="validationFile"
          accept=".txt"
          description="Upload validation file (TXT)"
        />

        <Button 
          variant="contained" 
          color="primary" 
          type="submit"
          fullWidth
          style={{ marginTop: '20px' }}
        >
          Start Simulation
        </Button>
      </form>
    </div>
  );
}