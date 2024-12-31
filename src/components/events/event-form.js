import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  Button,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Paper,
  Typography,
  Grid,
  Checkbox,
  Divider,
  Alert
} from '@material-ui/core';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import { NotificationManager } from 'react-notifications';
import { uploadTimeseriesFile, uploadParameterFile, uploadParameterRangesFile, uploadValidationFile } from '../../services/event-services';

export default function EventForm() {
  const { authData } = useAuth();
  const { state } = useLocation();
  const { group } = state;
  const history = useHistory();

  // Form mode states
  const [mode, setMode] = useState({
    forward: false,
    pso: false,
    lhs: false,
    monteCarlo: false
  });

  // Error metric states
  const [errorMetric, setErrorMetric] = useState({
    rmse: false,
    nse: false,
    kge: false
  });

  // Numerical scheme states
  const [numericalScheme, setNumericalScheme] = useState({
    euler: false,
    rk2: false,
    rk4: false,
    crankNicolson: false
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  // File states
  const [files, setFiles] = useState({
    timeseriesFile: null,
    parameterFile: null,
    parameterRangesFile: null,
    validationFile: null
  });

  // Basic simulation parameters
  const [formData, setFormData] = useState({
    // Basic parameters
    model: 'W',
    interpolate: true,
    n_data_interpolate: 7,
    validation_required: true,
    core: 1,
    depth: 14.0,
    compiler: 'F',
    CFL: 0.9,
    databaseformat: 'C',
    computeparameterranges: true,
    computeparameters: false,
    log_flag: true,
    resampling_frequency_days: 1,
    resampling_frequency_weeks: 1,
    email_send: false,
    email_list: '',

    // PSO specific parameters
    swarm_size: 2000,
    phi1: 2.0,
    phi2: 2.0,
    omega: 0.9,
    max_iterations: 2000,

    // LHS specific parameters
    num_samples: 2000,

    // Monte Carlo specific parameters
    num_simulations: 2000,

    // Forward mode parameters
    parameter1: '',
    parameter2: '',
    parameter3: '',
    parameter4: '',
    parameter5: '',
    parameter6: '',
    parameter7: '',
    parameter8: ''
  });

  // Handle mode changes
  const handleModeChange = (modeName) => (event) => {
    const newMode = Object.keys(mode).reduce((acc, key) => {
      acc[key] = key === modeName ? event.target.checked : false;
      return acc;
    }, {});
    setMode(newMode);
  };

  // Handle error metric changes
  const handleErrorMetricChange = (metricName) => (event) => {
    const newMetrics = Object.keys(errorMetric).reduce((acc, key) => {
      acc[key] = key === metricName ? event.target.checked : false;
      return acc;
    }, {});
    setErrorMetric(newMetrics);
  };

  // Handle numerical scheme changes
  const handleNumericalSchemeChange = (schemeName) => (event) => {
    const newSchemes = Object.keys(numericalScheme).reduce((acc, key) => {
      acc[key] = key === schemeName ? event.target.checked : false;
      return acc;
    }, {});
    setNumericalScheme(newSchemes);
  };

  // Handle file changes
  const handleFileChange = (fileType) => (event) => {
    const file = event.target.files[0];
    setFiles(prev => ({
      ...prev,
      [fileType]: file
    }));
  };

  // Handle form data changes
  const handleInputChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateFiles = () => {
    // Required file validation
    if (!files.timeseriesFile) {
      NotificationManager.error("Time series file is required");
      return false;
    }

    // Validate file extensions
    if (!files.timeseriesFile.name.endsWith('.txt')) {
      NotificationManager.error("Time series file must be a .txt file");
      return false;
    }

    if (mode.forward && files.parameterFile && !files.parameterFile.name.endsWith('.txt')) {
      NotificationManager.error("Parameter file must be a .txt file");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFiles()) return;

    try {
      // 1. Upload timeseries file
      const timeseriesFormData = new FormData();
      timeseriesFormData.append('file', files.timeseriesFile);
      timeseriesFormData.append('group', group.id.toString()); // Ensure group id is string
      timeseriesFormData.append('description', 'Time series data');
      timeseriesFormData.append('user', authData.user.id.toString()); // Add user ID
      const timeseriesData = await uploadTimeseriesFile(authData.token, timeseriesFormData);
      
      if (!timeseriesData) throw new Error('Failed to upload time series file');

      // 2. Upload additional files if needed
      let parameterFileData = null;
      let parameterRangesData = null;
      let validationFileData = null;

      if (files.parameterFile) {
        const paramFormData = new FormData();
        paramFormData.append('file', files.parameterFile);
        paramFormData.append('group', group.id);
        parameterFileData = await uploadParameterFile(authData.token, paramFormData);
      }

      if (files.parameterRangesFile) {
        const rangesFormData = new FormData();
        rangesFormData.append('file', files.parameterRangesFile);
        rangesFormData.append('group', group.id);
        parameterRangesData = await uploadParameterRangesFile(authData.token, rangesFormData);
      }

      if (files.validationFile) {
        const validationFormData = new FormData();
        validationFormData.append('file', files.validationFile);
        validationFormData.append('group', group.id);
        validationFileData = await uploadValidationFile(authData.token, validationFormData);
      }

      
      // Create simulation data
      const simulationData = {
        // Basic identifiers
        group: group.id,
        timeseries: timeseriesData.id, // ID from the uploaded timeseries file

        // Model and mode selection
        model: formData.model, // 'W' for Air2water, 'S' for Air2stream
        mode: mode.forward ? 'F' : 'C', // 'F' for Forward, 'C' for Calibration
        method: 'S', // 'S' for SPOTPY, 'C' for PYCUP
        
        // Optimization settings based on selected mode
        optimizer: mode.pso ? 'P' : (mode.lhs ? 'L' : 'M'), // 'P' for PSO, 'L' for LATINHYPERCUBE, 'M' for MONTECARLO
        
        // Error metric and solver selection
        error_metric: errorMetric.rmse ? 'R' : (errorMetric.nse ? 'N' : 'K'), // 'R' for RMSE, 'N' for NSE, 'K' for KGE
        solver: numericalScheme.euler ? 'E' : 
                (numericalScheme.rk2 ? 'T' : 
                (numericalScheme.rk4 ? 'F' : 'C')), // 'E' for Euler, 'T' for RK2, 'F' for RK4, 'C' for CrankNicolson

        // Basic simulation parameters
        interpolate: formData.interpolate,
        n_data_interpolate: formData.n_data_interpolate,
        validation_required: formData.validation_required,
        core: formData.core,
        depth: formData.depth,
        compiler: formData.compiler, // 'C' for Cython, 'F' for Fortran
        CFL: formData.CFL,
        databaseformat: formData.databaseformat, // 'C' for Custom, 'R' for RAM
        computeparameterranges: formData.computeparameterranges,
        computeparameters: formData.computeparameters,
        
        // Advanced settings
        log_flag: formData.log_flag,
        resampling_frequency_days: formData.resampling_frequency_days,
        resampling_frequency_weeks: formData.resampling_frequency_weeks,
        email_send: formData.email_send,
        email_list: formData.email_list,

        // File references (if uploaded)
        parameters_file: files.parameterFile ? parameterFileData.id : null,
        parameter_ranges: files.parameterRangesFile ? parameterRangesData.id : null,
        user_validation: files.validationFile ? validationFileData.id : null,

        // Mode specific options
        forward_options: mode.forward ? (files.parameterFile ? 'U' : 'W') : null, // 'U' for Upload, 'W' for Write
    };

      // Create the simulation
      const simResponse = await fetch('http://127.0.0.1:8000/forecasting/simulations/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authData.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(simulationData)
      });

      if (!simResponse.ok) throw new Error('Failed to create simulation');

      NotificationManager.success("Simulation created successfully");
      history.push(`/forecasting/groups/${group.id}`);

    } catch (error) {
      NotificationManager.error(error.message || "Error creating simulation");
    }
  };

  return (
    <Paper className="p-6">
      <Typography variant="h5" className="mb-4">
        New Simulation for {group.name}
      </Typography>

      <form onSubmit={handleSubmit}>
        {/* Mode Selection */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6">Simulation Mode</Typography>
            <FormControlLabel
              control={<Checkbox checked={mode.forward} onChange={handleModeChange('forward')} />}
              label="Forward Mode"
            />
            <FormControlLabel
              control={<Checkbox checked={mode.pso} onChange={handleModeChange('pso')} />}
              label="Particle Swarm Optimization"
            />
            <FormControlLabel
              control={<Checkbox checked={mode.lhs} onChange={handleModeChange('lhs')} />}
              label="Latin Hypercube"
            />
            <FormControlLabel
              control={<Checkbox checked={mode.monteCarlo} onChange={handleModeChange('monteCarlo')} />}
              label="Monte Carlo"
            />
          </Grid>

          {/* File Uploads */}
          <Grid item xs={12}>
            <Typography variant="h6">Required Files</Typography>
            <input
              accept=".txt"
              style={{ display: 'none' }}
              id="timeseries-file"
              type="file"
              onChange={handleFileChange('timeseriesFile')}
            />
            <label htmlFor="timeseries-file">
              <Button
                variant="contained"
                component="span"
                startIcon={<CloudUploadIcon />}
              >
                Upload Time Series Data {files.timeseriesFile ? `(${files.timeseriesFile.name})` : ''}
              </Button>
            </label>
          </Grid>

          {/* Error Metrics */}
          <Grid item xs={12}>
            <Typography variant="h6">Error Metric</Typography>
            <FormControlLabel
              control={<Checkbox checked={errorMetric.rmse} onChange={handleErrorMetricChange('rmse')} />}
              label="RMSE"
            />
            <FormControlLabel
              control={<Checkbox checked={errorMetric.nse} onChange={handleErrorMetricChange('nse')} />}
              label="NSE"
            />
            <FormControlLabel
              control={<Checkbox checked={errorMetric.kge} onChange={handleErrorMetricChange('kge')} />}
              label="KGE"
            />
          </Grid>

          {/* Numerical Schemes */}
          <Grid item xs={12}>
            <Typography variant="h6">Numerical Scheme</Typography>
            <FormControlLabel
              control={<Checkbox checked={numericalScheme.euler} onChange={handleNumericalSchemeChange('euler')} />}
              label="Euler"
            />
            <FormControlLabel
              control={<Checkbox checked={numericalScheme.rk2} onChange={handleNumericalSchemeChange('rk2')} />}
              label="RK2"
            />
            <FormControlLabel
              control={<Checkbox checked={numericalScheme.rk4} onChange={handleNumericalSchemeChange('rk4')} />}
              label="RK4"
            />
            <FormControlLabel
              control={<Checkbox checked={numericalScheme.crankNicolson} onChange={handleNumericalSchemeChange('crankNicolson')} />}
              label="Crank-Nicolson"
            />
          </Grid>

          {/* Advanced Settings Button */}
          <Grid item xs={12}>
            <Button
              variant="outlined"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
            </Button>
          </Grid>

          {/* Advanced Settings Content */}
          {showAdvanced && (
            <>
              {/* PSO Parameters */}
              {mode.pso && (
                <Grid item xs={12}>
                  <Typography variant="h6">PSO Parameters</Typography>
                  <TextField
                    label="Swarm Size"
                    type="number"
                    value={formData.swarm_size}
                    onChange={handleInputChange('swarm_size')}
                    fullWidth
                    className="mb-2"
                  />
                  <TextField
                    label="Phi1"
                    type="number"
                    value={formData.phi1}
                    onChange={handleInputChange('phi1')}
                    fullWidth
                    className="mb-2"
                  />
                  <TextField
                    label="Phi2"
                    type="number"
                    value={formData.phi2}
                    onChange={handleInputChange('phi2')}
                    fullWidth
                    className="mb-2"
                  />
                </Grid>
              )}

              {/* LHS Parameters */}
              {mode.lhs && (
                <Grid item xs={12}>
                  <Typography variant="h6">Latin Hypercube Parameters</Typography>
                  <TextField
                    label="Number of Samples"
                    type="number"
                    value={formData.num_samples}
                    onChange={handleInputChange('num_samples')}
                    fullWidth
                  />
                </Grid>
              )}

              {/* Monte Carlo Parameters */}
              {mode.monteCarlo && (
                <Grid item xs={12}>
                  <Typography variant="h6">Monte Carlo Parameters</Typography>
                  <TextField
                    label="Number of Simulations"
                    type="number"
                    value={formData.num_simulations}
                    onChange={handleInputChange('num_simulations')}
                    fullWidth
                  />
                </Grid>
              )}
            </>
          )}

          {/* Submit Button */}
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              fullWidth
            >
              Create Simulation
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
}