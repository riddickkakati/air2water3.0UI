import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { 
  Typography, 
  Button, 
  LinearProgress, 
  Grid 
} from '@material-ui/core';
import { useAuth } from '../../hooks/useAuth';
import TimelineIcon from '@material-ui/icons/Timeline';
import ScatterPlotIcon from '@material-ui/icons/ScatterPlot';
import BarChartIcon from '@material-ui/icons/BarChart';
import GetAppIcon from '@material-ui/icons/GetApp';

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(2)
  },
  simulation: {
    marginBottom: theme.spacing(4),
    padding: theme.spacing(2)
  },
  downloadButton: {
    margin: theme.spacing(1),
    width: '100%'
  },
  resultsSection: {
    marginTop: theme.spacing(2)
  },
  userCount: {
    marginTop: theme.spacing(4),
    textAlign: 'center',
    color: '#fff'
  },
  simulationTitle: {
    color: '#fff',
    fontWeight: 500
  },
  simulationInfo: {
    color: '#fff',
    marginBottom: theme.spacing(2)
  },
  status: {
    fontWeight: 500,
    marginBottom: theme.spacing(1)
  },
  statusPending: {
    color: '#f57c00'  // Orange
  },
  statusCompleted: {
    color: '#2e7d32'  // Green
  },
  statusFailed: {
    color: '#d32f2f'  // Red
  }
}));

export default function EventList() {
  const classes = useStyles();
  const { authData } = useAuth();
  const [simulations, setSimulations] = useState([]);
  const [simulationResults, setSimulationResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [userCount, setUserCount] = useState(0);

  // Fetch simulations and calculate user count
  useEffect(() => {
    const fetchSimulations = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/forecasting/simulations/', {
          headers: {
            'Authorization': `Token ${authData.token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setSimulations(data);
          // Get the highest simulation ID as user count
          if (data.length > 0) {
            const maxId = Math.max(...data.map(sim => sim.id));
            setUserCount(maxId);
          }
        }
      } catch (error) {
        console.error('Error fetching simulations:', error);
      }
      setLoading(false);
    };

    fetchSimulations();
  }, [authData.token]);

  // Fetch status for each simulation
  useEffect(() => {
    const fetchSimulationStatus = async (simulationId) => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/forecasting/simulations/${simulationId}/check_status/`,
          {
            headers: {
              'Authorization': `Token ${authData.token}`
            }
          }
        );
        if (response.ok) {
          const data = await response.json();
          setSimulationResults(prev => ({
            ...prev,
            [simulationId]: data
          }));
        }
      } catch (error) {
        console.error('Error fetching simulation status:', error);
      }
    };

    if (simulations.length > 0) {
      simulations.forEach(simulation => {
        fetchSimulationStatus(simulation.id);
      });
    }
  }, [simulations, authData.token]);

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <div className={classes.root}>
      <Typography variant="h5" gutterBottom className={classes.simulationTitle}>
        Simulations
      </Typography>

      {simulations.map(simulation => {
        const results = simulationResults[simulation.id];
        return (
          <div key={simulation.id} className={classes.simulation}>
            <Typography variant="h6" gutterBottom className={classes.simulationTitle}>
              Simulation #{simulation.id}
              {simulation.model && ` - ${simulation.model === 'W' ? 'Air2water' : 'Air2stream'}`}
            </Typography>

            {results && (
              <Typography 
                variant="subtitle1" 
                className={`${classes.status} ${
                  results.status === 'pending' ? classes.statusPending : 
                  results.status === 'completed' ? classes.statusCompleted : 
                  classes.statusFailed
                }`}
              >
                Status: {results.status.charAt(0).toUpperCase() + results.status.slice(1)}
              </Typography>
            )}

            <Typography variant="body1" className={classes.simulationInfo}>
              Mode: {simulation.mode === 'F' ? 'Forward' : 'Calibration'}
              {simulation.optimizer && ` - ${
                simulation.optimizer === 'P' ? 'PSO' : 
                simulation.optimizer === 'L' ? 'Latin Hypercube' : 
                'Monte Carlo'
              }`}
            </Typography>

            {results && results.status === 'completed' && (
              <Grid container spacing={2}>
                {results.plot_path && (
                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="contained"
                      color="primary"
                      className={classes.downloadButton}
                      href={results.plot_path}
                      target="_blank"
                      startIcon={<TimelineIcon />}
                    >
                      View Model Run Plot
                    </Button>
                  </Grid>
                )}

                {results.dotty_plots && (
                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="contained"
                      color="primary"
                      className={classes.downloadButton}
                      href={results.dotty_plots}
                      target="_blank"
                      startIcon={<ScatterPlotIcon />}
                    >
                      View Dotty Plots
                    </Button>
                  </Grid>
                )}

                {results.obj_function_path && (
                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="contained"
                      color="primary"
                      className={classes.downloadButton}
                      href={results.obj_function_path}
                      target="_blank"
                      startIcon={<BarChartIcon />}
                    >
                      View Objective Function
                    </Button>
                  </Grid>
                )}

                {results.parameter_convergence && (
                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="contained"
                      color="secondary"
                      className={classes.downloadButton}
                      href={results.parameter_convergence}
                      download
                      startIcon={<GetAppIcon />}
                    >
                      Download Parameter Convergence
                    </Button>
                  </Grid>
                )}

                {results.timeseries_path && (
                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="contained"
                      color="secondary"
                      className={classes.downloadButton}
                      href={results.timeseries_path}
                      download
                      startIcon={<GetAppIcon />}
                    >
                      Download Results CSV
                    </Button>
                  </Grid>
                )}
              </Grid>
            )}

            {results && results.status === 'pending' && (
              <LinearProgress />
            )}

            {results && results.status === 'failed' && results.error_message && (
              <Typography color="error">
                Error: {results.error_message}
              </Typography>
            )}
          </div>
        );
      })}

      {simulations.length === 0 && (
        <Typography variant="body1" className={classes.simulationInfo}>
          No simulations found.
        </Typography>
      )}

      {simulations.length > 0 && (
        <Typography variant="h6" className={classes.userCount}>
          There are {userCount} users of air2water3.0 forecast
        </Typography>
      )}
    </div>
  );
}