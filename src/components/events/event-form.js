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
import { useFetchGroup } from '../../hooks/fetch-group';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3)
  },
  button: {
    marginTop: theme.spacing(2)
  },
  formControl: {
    margin: theme.spacing(2, 0),
    width: '100%'
  },
  backButton: {
    marginRight: theme.spacing(2)
  },
  inputFile: {
    margin: theme.spacing(1, 0)
  },
  fileUploads: {
    marginTop: theme.spacing(3)
  },
  modeOptions: {
    marginTop: theme.spacing(3)
  },
  parameterInputs: {
    marginTop: theme.spacing(2)
  },
  textField: {
    marginBottom: theme.spacing(2)
  },
  navigationContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(4),
    borderTop: `1px solid ${theme.palette.divider}`,
    paddingTop: theme.spacing(2)
  },
  navigation: {
    marginTop: theme.spacing(4)
  },
  fileUpload: {
    marginTop: theme.spacing(2)
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
  const [parameterRangesFile, setParameterRangesFile] = useState(null);
  const [validationFile, setValidationFile] = useState(null);
  const [parameterRangesId, setParameterRangesId] = useState(null);
  const [validationFileId, setValidationFileId] = useState(null);
  const [parameterFileId, setParameterFileId] = useState(null);
  const [parameterForwardId, setParameterForwardId] = useState(null);
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
    formData.append('user', authData.user.id);
    formData.append('description', '');

    try {
      console.log('Uploading parameter file with:', {
        file: parameterFile.name,
        group: groupData.id,
        user: authData.user.id
      });

      const response = await fetch('http://127.0.0.1:8000/forecasting/parameters/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authData.token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Parameter upload error:', errorText);
        throw new Error('Failed to upload parameters');
      }

      const data = await response.json();
      console.log('Parameter upload successful:', data);
      setParameterFileId(data.id);
      setCurrentStep(3);  // Move to next step after successful upload
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const handleParameterRangesUpload = async () => {
    if (!parameterRangesFile || !group) {
      console.log('No parameter ranges file or group:', { parameterRangesFile, group });
      return null;
    }
  
    const formData = new FormData();
    formData.append('group', group.id);
    formData.append('user', authData.user.id);
    formData.append('file', parameterRangesFile);
    formData.append('description', 'Parameter ranges file');
  
    console.log('Starting parameter ranges upload...');
  
    try {
      const response = await fetch('http://127.0.0.1:8000/forecasting/parameterranges/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authData.token}`
        },
        body: formData
      });
  
      const responseText = await response.text();
      console.log('Raw parameter ranges response:', responseText);
  
      if (!response.ok) {
        throw new Error(`Failed to upload parameter ranges: ${responseText}`);
      }
  
      const data = JSON.parse(responseText);
      console.log('Parameter ranges upload successful. Received ID:', data.id);
      
      // Store the ID in state
      setParameterRangesId(data.id);
  
      // Verify state update
      console.log('Parameter ranges ID set in state:', data.id);
      
      return data.id;
    } catch (error) {
      console.error('Parameter ranges upload error:', error);
      return null;
    }
  };

  // Add function to handle validation file upload
  const handleValidationFileUpload = async () => {
    if (!validationFile || !group) return;

    const formData = new FormData();
    formData.append('file', validationFile);
    formData.append('group', group.id);
    formData.append('description', '');

    try {
      const response = await fetch('http://127.0.0.1:8000/forecasting/uservalidation/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authData.token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to upload validation file');

      const data = await response.json();
      setValidationFileId(data.id);
    } catch (error) {
      console.error('Validation file upload error:', error);
    }
  };

  // Add function to handle parameter forward submission
  const handleParameterForwardSubmit = async () => {
    if (!group) return;

    try {
      const response = await fetch('http://127.0.0.1:8000/forecasting/parameterforward/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authData.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          group: group.id,
          ...parameters
        })
      });

      if (!response.ok) throw new Error('Failed to submit parameters');

      const data = await response.json();
      setParameterForwardId(data.id);
    } catch (error) {
      console.error('Parameter forward submission error:', error);
    }
  };

  const handleSubmitSimulation = async () => {
    if (!group || !timeseriesId) return;
  
    try {
      let currentParameterRangesId = parameterRangesId;
      
      // If we have a parameter ranges file and we're not in forward mode, make sure it's uploaded
      if (parameterRangesFile && selectedMode !== 'forward') {
        const formData = new FormData();
        formData.append('group', group.id);
        formData.append('user', authData.user.id);
        formData.append('file', parameterRangesFile);
        formData.append('description', 'Parameter ranges file');
  
        const response = await fetch('http://127.0.0.1:8000/forecasting/parameterranges/', {
          method: 'POST',
          headers: {
            'Authorization': `Token ${authData.token}`
          },
          body: formData
        });
  
        if (!response.ok) {
          throw new Error('Failed to upload parameter ranges file');
        }
  
        const data = await response.json();
        currentParameterRangesId = data.id;
        console.log('Parameter ranges upload confirmed, ID:', currentParameterRangesId);
      }
  
      // Forward mode parameter handling
      if (selectedMode === 'forward' && parameterUploadType === 'manual') {
        await handleParameterForwardSubmit();
      }
  
      // Create simulation data with confirmed parameter ranges ID
      // Create simulation data with confirmed parameter ranges ID
    const simulationData = {
      user: authData.user.id,
      group: group.id,
      timeseries: timeseriesId,
      model: 'W',
      mode: selectedMode === 'forward' ? 'F' : 'C',
      method: 'S',
      optimizer: selectedMode === 'pso' ? 'P' : 
                selectedMode === 'latin' ? 'L' : 
                selectedMode === 'monteCarlo' ? 'M' : null,
      error_metric: errorMetric,
      parameter_ranges_file: currentParameterRangesId,
      user_validation_file: validationFileId,
      parameters_file: selectedMode === 'forward' && parameterUploadType === 'upload' ? parameterFileId : null,
      parameters_forward: selectedMode === 'forward' && parameterUploadType === 'manual' ? parameterForwardId : null,
      solver: solver,
      interpolate: true,
      n_data_interpolate: 7,
      validation_required: true,
      core: 1,
      depth: 14.0,
      compiler: 'C',
      databaseformat: 'C',
      computeparameterranges: true,
      computeparameters: false,
      log_flag: true,
      resampling_frequency_days: 1,
      resampling_frequency_weeks: 1,
      email_send: false,
      email_list: ''
    };
  
      console.log('About to send simulation data:', JSON.stringify(simulationData, null, 2));
  
      const simResponse = await fetch('http://127.0.0.1:8000/forecasting/simulations/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authData.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(simulationData)
      });
  
      if (!simResponse.ok) {
        const errorText = await simResponse.text();
        console.error('Simulation Response:', errorText);
        throw new Error(`Failed to create simulation: ${errorText}`);
      }
  
      const simData = await simResponse.json();
      console.log('Simulation created successfully:', simData)
  
      if (selectedMode === 'pso') {
        const psoFormData = new FormData();
        psoFormData.append('simulation', simData.id);
        psoFormData.append('swarm_size', psoSettings.swarm_size);
        psoFormData.append('phi1', psoSettings.phi1);
        psoFormData.append('phi2', psoSettings.phi2);
        psoFormData.append('max_iterations', psoSettings.max_iterations);
      
        const psoResponse = await fetch('http://127.0.0.1:8000/forecasting/psoparameter/', {
          method: 'POST',
          headers: {
            'Authorization': `Token ${authData.token}`
            // Remove Content-Type header, let the browser set it for FormData
          },
          body: psoFormData
        });
      
        if (!psoResponse.ok) {
          const errorText = await psoResponse.text();
          console.error('PSO Response:', errorText);
          throw new Error('Failed to create PSO parameters');
        }
      }

      if (selectedMode === 'latin') {
        const latinFormData = new FormData();
        latinFormData.append('simulation', simData.id);
        latinFormData.append('num_samples', latinSettings.num_samples);
      
        const latinResponse = await fetch('http://127.0.0.1:8000/forecasting/latinparameter/', {
          method: 'POST',
          headers: {
            'Authorization': `Token ${authData.token}`
            // Remove Content-Type header, let the browser set it for FormData
          },
          body: latinFormData
        });
      
        if (!latinResponse.ok) {
          const errorText = await latinResponse.text();
          console.error('Latin Response:', errorText);
          throw new Error('Failed to create LHS parameters');
        }
      }

      if (selectedMode === 'monteCarlo') {
        const monteCarloFormData = new FormData();
        monteCarloFormData.append('simulation', simData.id);
        monteCarloFormData.append('num_iterations', monteCarloSettings.num_iterations);
      
        const monteCarloResponse = await fetch('http://127.0.0.1:8000/forecasting/montecarloparameter/', {
          method: 'POST',
          headers: {
            'Authorization': `Token ${authData.token}`
            // Remove Content-Type header, let the browser set it for FormData
          },
          body: monteCarloFormData
        });
      
        if (!monteCarloResponse.ok) {
          const errorText = await monteCarloResponse.text();
          console.error('Monte Carlo Response:', errorText);
          throw new Error('Failed to create MC parameters');
        }
      }
  
      const statusResponse = await fetch(`http://127.0.0.1:8000/forecasting/simulations/${simData.id}/run_simulation/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authData.token}`,
        }
      });
  
      if (!statusResponse.ok) {
        throw new Error('Failed to run simulation');
      }
  
      history.push(`/forecasting/groups/${group.id}`);
  
    } catch (error) {
      console.error('Error in simulation creation:', error);
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography>Error loading group: {error.message}</Typography>;
  if (!groupData) return <Typography>No group data available</Typography>;
  if (!isInGroup) return <Typography>You must be a member of this group to create an event</Typography>;


  const FormNavigation = ({ 
    onBack, 
    onNext, 
    nextLabel = "Continue",
    showBack = true,
    disableNext = false,
    hidden = false
  }) => {
    const classes = useStyles();
    
    if (hidden) return null;
    
    return (
      <div className={classes.navigationContainer}>
        <div>
          {showBack && (
            <Button
              variant="contained"
              onClick={onBack}
            >
              Back
            </Button>
          )}
        </div>
        <div>
          <Button
            variant="contained"
            color="primary"
            onClick={onNext}
            disabled={disableNext}
          >
            {nextLabel}
          </Button>
        </div>
      </div>
    );
  };
  
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
      <FormNavigation
        onNext={uploadTimeseries}
        disableNext={!timeseriesFile}
        showBack={false}
        nextLabel="Upload and Continue"
      />
    </div>
  );
  
  const renderStep2 = () => (
    <div>
      <Typography variant="h6" gutterBottom>Step 2: Select Calibration Mode</Typography>
      
      <FormControl component="fieldset" className={classes.formControl}>
        <FormLabel component="legend">Select Mode</FormLabel>
        <RadioGroup 
          value={selectedMode} 
          onChange={(e) => {
            setSelectedMode(e.target.value);
            if (e.target.value === 'forward') {
              setParameterRangesFile(null);
              setParameterRangesId(null);
            }
            // Reset parameter upload type when changing modes
            setParameterUploadType('');
          }}
        >
          <FormControlLabel value="forward" control={<Radio />} label="Forward Mode" />
          <FormControlLabel value="pso" control={<Radio />} label="Particle Swarm Optimization" />
          <FormControlLabel value="latin" control={<Radio />} label="Latin Hypercube" />
          <FormControlLabel value="monteCarlo" control={<Radio />} label="Monte Carlo" />
        </RadioGroup>
      </FormControl>
  
      {/* Forward Mode Specific Options */}
      {selectedMode === 'forward' && (
        <div className={classes.modeOptions}>
          <FormControl component="fieldset" className={classes.formControl}>
            <FormLabel component="legend">Parameter Input Method</FormLabel>
            <RadioGroup 
              value={parameterUploadType} 
              onChange={(e) => setParameterUploadType(e.target.value)}
            >
              <FormControlLabel value="upload" control={<Radio />} label="Upload Parameters File" />
              <FormControlLabel value="manual" control={<Radio />} label="Enter Parameters Manually" />
            </RadioGroup>
          </FormControl>
  
          {parameterUploadType === 'upload' && (
            <div className={classes.modeOptions}>
              {/* Validation File Upload first */}
              <Grid container spacing={3} className={classes.fileUploads}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>Validation File (Optional)</Typography>
                  <input
                    type="file"
                    accept=".yaml"
                    onChange={(e) => setValidationFile(e.target.files[0])}
                    className={classes.inputFile}
                  />
                  {validationFile && (
                    <Typography variant="body2" color="textSecondary">
                      Selected file: {validationFile.name}
                    </Typography>
                  )}
                </Grid>
              </Grid>
  
              {/* Parameters File Upload second */}
              <div className={classes.fileUpload}>
                <Typography variant="subtitle1" gutterBottom>Parameters File</Typography>
                <input
                  type="file"
                  accept=".yaml"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      if (!file.name.endsWith('.yaml')) {
                        alert('Please upload a .yaml file');
                        return;
                      }
                      console.log('Parameter file selected:', file.name);
                      setParameterFile(file);
                    }
                  }}
                  className={classes.inputFile}
                />
                {parameterFile && (
                  <Typography variant="body2" color="textSecondary">
                    Selected file: {parameterFile.name}
                  </Typography>
                )}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleParameterUpload}
                  disabled={!parameterFile}
                  className={classes.button}
                >
                  Upload and Continue
                </Button>
              </div>
            </div>
          )}
  
          {parameterUploadType === 'manual' && (
            <Grid container spacing={2} className={classes.parameterInputs}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                <Grid item xs={12} sm={6} md={3} key={num}>
                  <TextField
                    label={`Parameter ${num}`}
                    value={parameters[`parameter${num}`]}
                    onChange={(e) => setParameters({
                      ...parameters,
                      [`parameter${num}`]: e.target.value
                    })}
                    type="number"
                    fullWidth
                    className={classes.textField}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </div>
      )}
  
      {/* PSO Mode Specific Options */}
      {selectedMode === 'pso' && (
        <Grid container spacing={2} className={classes.modeOptions}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>PSO Settings</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Swarm Size"
              value={psoSettings.swarm_size}
              onChange={(e) => setPsoSettings({...psoSettings, swarm_size: e.target.value})}
              type="number"
              fullWidth
              className={classes.textField}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Phi1"
              value={psoSettings.phi1}
              onChange={(e) => setPsoSettings({...psoSettings, phi1: e.target.value})}
              type="number"
              fullWidth
              className={classes.textField}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Phi2"
              value={psoSettings.phi2}
              onChange={(e) => setPsoSettings({...psoSettings, phi2: e.target.value})}
              type="number"
              fullWidth
              className={classes.textField}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Max Iterations"
              value={psoSettings.max_iterations}
              onChange={(e) => setPsoSettings({...psoSettings, max_iterations: e.target.value})}
              type="number"
              fullWidth
              className={classes.textField}
            />
          </Grid>
        </Grid>
      )}
  
      {/* Latin Hypercube Mode Specific Options */}
      {selectedMode === 'latin' && (
        <Grid container spacing={2} className={classes.modeOptions}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>Latin Hypercube Settings</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Number of Samples"
              value={latinSettings.num_samples}
              onChange={(e) => setLatinSettings({...latinSettings, num_samples: e.target.value})}
              type="number"
              fullWidth
              className={classes.textField}
            />
          </Grid>
        </Grid>
      )}
  
      {/* Monte Carlo Mode Specific Options */}
      {selectedMode === 'monteCarlo' && (
        <Grid container spacing={2} className={classes.modeOptions}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>Monte Carlo Settings</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Number of Iterations"
              value={monteCarloSettings.num_iterations}
              onChange={(e) => setMonteCarloSettings({...monteCarloSettings, num_iterations: e.target.value})}
              type="number"
              fullWidth
              className={classes.textField}
            />
          </Grid>
        </Grid>
      )}
  
      {/* Optional File Uploads - Only shown for non-forward modes */}
      {selectedMode && selectedMode !== 'forward' && (
        <Grid container spacing={3} className={classes.fileUploads}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>Parameter Ranges File (Optional)</Typography>
            <input
              type="file"
              accept=".yaml"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  console.log('Parameter ranges file selected:', file.name);
                  setParameterRangesFile(file);
                }
              }}
              className={classes.inputFile}
            />
            {parameterRangesFile && (
              <Typography variant="body2" color="textSecondary">
                Selected file: {parameterRangesFile.name}
              </Typography>
            )}
          </Grid>
  
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>Validation File (Optional)</Typography>
            <input
              type="file"
              accept=".txt"
              onChange={(e) => setValidationFile(e.target.files[0])}
              className={classes.inputFile}
            />
            {validationFile && (
              <Typography variant="body2" color="textSecondary">
                Selected file: {validationFile.name}
              </Typography>
            )}
          </Grid>
        </Grid>
      )}
  
      <FormNavigation
        onBack={() => setCurrentStep(1)}
        onNext={() => setCurrentStep(3)}
        disableNext={
          !selectedMode || 
          (selectedMode === 'forward' && parameterUploadType === 'manual' && !Object.values(parameters).some(val => val !== ''))
        }
        showBack={true}
        hidden={selectedMode === 'forward' && parameterUploadType === 'upload'}
      />
    </div>
  );
  
  const renderStep3 = () => (
    <div>
      <Typography variant="h6">Step 3: Select Error Metric</Typography>
      <FormControl component="fieldset" className={classes.formControl}>
        <RadioGroup value={errorMetric} onChange={(e) => setErrorMetric(e.target.value)}>
          <FormControlLabel value="R" control={<Radio />} label="RMSE" />
          <FormControlLabel value="N" control={<Radio />} label="NSE" />
          <FormControlLabel value="K" control={<Radio />} label="KGE" />
        </RadioGroup>
      </FormControl>
  
      <FormNavigation
        onBack={() => setCurrentStep(2)}
        onNext={() => setCurrentStep(4)}
        disableNext={!errorMetric}
      />
    </div>
  );
  
  const renderStep4 = () => (
    <div>
      <Typography variant="h6">Step 4: Select Solver</Typography>
      <FormControl component="fieldset" className={classes.formControl}>
        <RadioGroup value={solver} onChange={(e) => setSolver(e.target.value)}>
          <FormControlLabel value="E" control={<Radio />} label="Euler" />
          <FormControlLabel value="T" control={<Radio />} label="Runge Kutta 2nd order" />
          <FormControlLabel value="F" control={<Radio />} label="Runge Kutta 4th order" />
          <FormControlLabel value="C" control={<Radio />} label="Crank-Nicolson" />
        </RadioGroup>
      </FormControl>
  
      <FormNavigation
        onBack={() => setCurrentStep(3)}
        onNext={handleSubmitSimulation}
        nextLabel="Run Simulation"
        disableNext={!solver}
      />
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