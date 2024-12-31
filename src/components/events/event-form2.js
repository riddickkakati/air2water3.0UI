import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
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
import { useFetchGroup } from '../../hooks/useFetchGroup';

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
  const { id: groupId } = useParams();
  const history = useHistory();
  
  // Use the existing useFetchGroup hook
  const [groupData, loading, error, refetchGroup] = useFetchGroup(groupId);
  const [isInGroup, setIsInGroup] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Step tracking
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form states
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

  // Effect to check group membership
  useEffect(() => {
    if (groupData && authData?.user) {
      const memberStatus = groupData.forecasting_members?.find(
        member => member.user.id === authData.user.id
      );
      setIsInGroup(!!memberStatus);
      setIsAdmin(memberStatus?.admin || false);
    }
  }, [groupData, authData]);

  const handleTimeseriesUpload = async (e) => {
    const file = e.target.files[0];
    setTimeseriesFile(file);
  };

  const uploadTimeseries = async () => {
    if (!timeseriesFile || !groupData) return;

    const formData = new FormData();
    formData.append('file', timeseriesFile);
    formData.append('group', groupData.id);
    formData.append('description', '');

    try {
      const response = await fetch('http://127.0.0.1:8000/forecasting/timeseries/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authData.token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to upload timeseries');

      const data = await response.json();
      setTimeseriesId(data.id);
      setCurrentStep(2);
    } catch (error) {
      console.error('Upload error:', error);
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

  // Your existing render functions (renderStep1, renderStep2, renderStep3, renderStep4)
  // ... (keep them exactly as they were)

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