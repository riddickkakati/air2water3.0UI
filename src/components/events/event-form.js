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
  makeStyles
} from '@material-ui/core';
import { useAuth } from '../../hooks/useAuth';
import { useFetchGroup } from '../../hooks/fetch-group';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3)
  },
  button: {
    marginTop: theme.spacing(2)
  },
  formControl: {
    margin: theme.spacing(2, 0)
  },
  backButton: {
    marginRight: theme.spacing(2)
  },
  inputFile: {
    margin: theme.spacing(2, 0)
  }
}));

const EventForm = () => {
  const classes = useStyles();
  const { authData } = useAuth();
  const location = useLocation();
  const history = useHistory();
  
  // Get group from location state
  const group = location.state?.group;
  
  // Use the group id from location state
  const [groupData, loading, error, refetchGroup] = useFetchGroup(group?.id);
  const [isInGroup, setIsInGroup] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Redirect if no group was passed
  useEffect(() => {
    if (!group) {
      history.push('/forecasting');
    }
  }, [group, history]);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [timeseriesFile, setTimeseriesFile] = useState(null);
  const [timeseriesId, setTimeseriesId] = useState(null);
  const [selectedMode, setSelectedMode] = useState('');
  const [parameterUploadType, setParameterUploadType] = useState('');
  const [parameterFile, setParameterFile] = useState(null);
  const [parameters, setParameters] = useState({
    parameter1: '', parameter2: '', parameter3: '', parameter4: '',
    parameter5: '', parameter6: '', parameter7: '', parameter8: ''
  });
  
  // Advanced settings states
  const [psoSettings, setPsoSettings] = useState({
    swarm_size: 2000,
    phi1: 2.0,
    phi2: 2.0,
    max_iterations: 1000
  });
  
  const [latinSettings, setLatinSettings] = useState({
    num_samples: 2000
  });
  
  const [monteCarloSettings, setMonteCarloSettings] = useState({
    num_iterations: 2000
  });
  
  const [errorMetric, setErrorMetric] = useState('');
  const [solver, setSolver] = useState('');

  useEffect(() => {
    if (groupData && authData?.user) {
      const memberStatus = groupData.forecasting_members?.find(
        member => member.user.id === authData.user.id
      );
      setIsInGroup(!!memberStatus);
      setIsAdmin(memberStatus?.admin || false);
    }
  }, [groupData, authData]);

  if (!group) return <Typography>No group information provided</Typography>;
  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography>Error loading group: {error.message}</Typography>;
  if (!isInGroup) return <Typography>You must be a member of this group to create an event</Typography>;

  const uploadTimeseries = async () => {
    if (!timeseriesFile || !group) return;
  
    try {
      // First log what we're about to send
      console.log('Uploading file:', timeseriesFile);
      console.log('Group:', group);
  
      const formData = new FormData();
      
      // Add the file with key 'file'
      formData.append('file', timeseriesFile);
      
      // Add the group ID
      formData.append('group', group.id);
      
      // Add user ID (though this should be handled by backend)
      formData.append('user', authData.user.id);
      
      // Add description (can be empty)
      formData.append('description', '');
  
      // Log the FormData (for debugging)
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }
  
      const response = await fetch('http://127.0.0.1:8000/forecasting/timeseries/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authData.token}`
        },
        body: formData
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response status:', response.status);
        console.error('Response text:', errorText);
        throw new Error(`Upload failed: ${errorText}`);
      }
  
      const data = await response.json();
      console.log('Upload success:', data);
      setTimeseriesId(data.id);
      setCurrentStep(2);
  
    } catch (error) {
      console.error('Upload error:', error);
    }
  };
  
  // Modify the file input to ensure it accepts only .txt files
  const handleTimeseriesUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.endsWith('.txt')) {
        alert('Please upload a .txt file');
        return;
      }
      setTimeseriesFile(file);
    }
  };

  const handleParameterUpload = async () => {
    if (!parameterFile || !groupData) return;

    const formData = new FormData();
    formData.append('file', parameterFile);
    formData.append('group', groupData.id);
    formData.append('description', '');

    try {
      const response = await fetch('http://127.0.0.1:8000/forecasting/parameters/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authData.token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to upload parameters');

      const data = await response.json();
      setCurrentStep(3);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const handleSubmitSimulation = async () => {
    if (!groupData) return;

    const simulationData = {
      user: {
        id: authData.user.id,
        username: authData.user.username,
        email: authData.user.email,
        profile: authData.user.profile
      },
      group: {
        id: groupData.id,
        name: groupData.name,
        location: groupData.location,
        description: groupData.description
      },
      timeseries: {
        id: timeseriesId,
        group: groupData.id,
        user: authData.user.id
      },
      interpolate: true,
      n_data_interpolate: 7,
      validation_required: true,
      core: 1,
      depth: 14.0,
      compiler: 'C',
      databaseformat: 'C',
      computeparameterranges: true,
      computeparameters: false,
      model: 'W',
      mode: selectedMode === 'forward' ? 'F' : 'C',
      method: 'S',
      optimizer: selectedMode === 'pso' ? 'P' : 
                selectedMode === 'latin' ? 'L' : 
                selectedMode === 'monteCarlo' ? 'M' : null,
      forward_options: selectedMode === 'forward' ? 
                      (parameterUploadType === 'upload' ? 'U' : 'W') : null,
      error_metric: errorMetric,
      solver: solver,
      log_flag: true,
      resampling_frequency_days: 1,
      resampling_frequency_weeks: 1,
      email_send: false,
      email_list: ''
    };

    // Add mode-specific parameters
    if (selectedMode === 'pso') {
      simulationData.pso_params = psoSettings;
    } else if (selectedMode === 'latin') {
      simulationData.latin_params = latinSettings;
    } else if (selectedMode === 'monteCarlo') {
      simulationData.monte_params = monteCarloSettings;
    } else if (selectedMode === 'forward' && parameterUploadType === 'manual') {
      simulationData.parameters_forward = parameters;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/forecasting/simulations/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authData.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(simulationData)
      });

      if (!response.ok) throw new Error('Failed to create simulation');

      history.push('/forecasting/');
    } catch (error) {
      console.error('Simulation error:', error);
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography>Error loading group: {error.message}</Typography>;
  if (!groupData) return <Typography>No group data available</Typography>;
  if (!isInGroup) return <Typography>You must be a member of this group to create an event</Typography>;


  const renderStep1 = () => (
    <div>
      <Typography variant="h6">Step 1: Upload Time Series Data</Typography>
      <input
        type="file"
        accept=".txt"
        onChange={handleTimeseriesUpload}
        style={{ display: 'block', marginBottom: '1rem' }}
      />
      {timeseriesFile && (
        <Typography variant="body2">
          Selected file: {timeseriesFile.name}
        </Typography>
      )}
      <Button
        variant="contained"
        color="primary"
        onClick={uploadTimeseries}
        disabled={!timeseriesFile}
      >
        Upload and Continue
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <Typography variant="h6">Step 2: Select Calibration Mode</Typography>
      <FormControl component="fieldset">
        <RadioGroup value={selectedMode} onChange={(e) => setSelectedMode(e.target.value)}>
          <FormControlLabel value="forward" control={<Radio />} label="Forward Mode" />
          <FormControlLabel value="pso" control={<Radio />} label="Particle Swarm Optimization" />
          <FormControlLabel value="latin" control={<Radio />} label="Latin Hypercube" />
          <FormControlLabel value="monteCarlo" control={<Radio />} label="Monte Carlo" />
        </RadioGroup>
      </FormControl>

      {selectedMode === 'forward' && (
        <div>
          <FormControl component="fieldset">
            <RadioGroup 
              value={parameterUploadType} 
              onChange={(e) => setParameterUploadType(e.target.value)}
            >
              <FormControlLabel value="upload" control={<Radio />} label="Upload Parameters File" />
              <FormControlLabel value="manual" control={<Radio />} label="Enter Parameters Manually" />
            </RadioGroup>
          </FormControl>

          {parameterUploadType === 'upload' && (
            <div>
              <input
                type="file"
                accept=".txt"
                onChange={(e) => setParameterFile(e.target.files[0])}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleParameterUpload}
                disabled={!parameterFile}
              >
                Upload Parameters
              </Button>
            </div>
          )}

          {parameterUploadType === 'manual' && (
            <div>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                <TextField
                  key={num}
                  label={`Parameter ${num}`}
                  value={parameters[`parameter${num}`]}
                  onChange={(e) => setParameters({
                    ...parameters,
                    [`parameter${num}`]: e.target.value
                  })}
                  type="number"
                />
              ))}
              <Button
                variant="contained"
                color="primary"
                onClick={() => setCurrentStep(3)}
              >
                Continue
              </Button>
            </div>
          )}
        </div>
      )}

      {selectedMode === 'pso' && (
        <div>
          <Typography variant="subtitle1">PSO Settings</Typography>
          <TextField
            label="Swarm Size"
            value={psoSettings.swarm_size}
            onChange={(e) => setPsoSettings({...psoSettings, swarm_size: e.target.value})}
            type="number"
          />
          <TextField
            label="Phi1"
            value={psoSettings.phi1}
            onChange={(e) => setPsoSettings({...psoSettings, phi1: e.target.value})}
            type="number"
          />
          <TextField
            label="Phi2"
            value={psoSettings.phi2}
            onChange={(e) => setPsoSettings({...psoSettings, phi2: e.target.value})}
            type="number"
          />
          <TextField
            label="Max Iterations"
            value={psoSettings.max_iterations}
            onChange={(e) => setPsoSettings({...psoSettings, max_iterations: e.target.value})}
            type="number"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => setCurrentStep(3)}
          >
            Continue
          </Button>
        </div>
      )}

      {/* Similar blocks for Latin Hypercube and Monte Carlo */}
      {/* Add those blocks here */}

      <Button
        variant="contained"
        onClick={() => setCurrentStep(1)}
      >
        Back
      </Button>
    </div>
  );

  const renderStep3 = () => (
    <div>
      <Typography variant="h6">Step 3: Select Error Metric</Typography>
      <FormControl component="fieldset">
        <RadioGroup value={errorMetric} onChange={(e) => setErrorMetric(e.target.value)}>
          <FormControlLabel value="R" control={<Radio />} label="RMSE" />
          <FormControlLabel value="N" control={<Radio />} label="NSE" />
          <FormControlLabel value="K" control={<Radio />} label="KGE" />
        </RadioGroup>
      </FormControl>
      <Button
        variant="contained"
        onClick={() => setCurrentStep(2)}
      >
        Back
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setCurrentStep(4)}
        disabled={!errorMetric}
      >
        Continue
      </Button>
    </div>
  );

  const renderStep4 = () => (
    <div>
      <Typography variant="h6">Step 4: Select Solver</Typography>
      <FormControl component="fieldset">
        <RadioGroup value={solver} onChange={(e) => setSolver(e.target.value)}>
          <FormControlLabel value="E" control={<Radio />} label="Euler" />
          <FormControlLabel value="T" control={<Radio />} label="Runge Kutta 2nd order" />
          <FormControlLabel value="F" control={<Radio />} label="Runge Kutta 4th order" />
          <FormControlLabel value="C" control={<Radio />} label="Crank-Nicolson" />
        </RadioGroup>
      </FormControl>
      <Button
        variant="contained"
        onClick={() => setCurrentStep(3)}
      >
        Back
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmitSimulation}
        disabled={!solver}
      >
        Run Simulation
      </Button>
    </div>
  );

  return (
    <Paper className={classes.root}>
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
      {currentStep === 4 && renderStep4()}
    </Paper>
  );
};

export default EventForm;