import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Typography, Card, CardContent, Button, LinearProgress, Grid } from '@material-ui/core';
import { useAuth } from '../../hooks/useAuth';  // Add this import

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(2)
  },
  simulationCard: {
    marginBottom: theme.spacing(2)
  },
  downloadButton: {
    margin: theme.spacing(1),
    width: '100%'
  },
  resultsSection: {
    marginTop: theme.spacing(2)
  }
}));

export default function EventList({ simulations }) {
  const classes = useStyles();
  const { authData } = useAuth();
  const [simulationResults, setSimulationResults] = useState({});

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

    // Fetch status for each simulation
    if (simulations?.length > 0) {
      simulations.forEach(simulation => {
        fetchSimulationStatus(simulation.id);
      });
    }
  }, [simulations, authData.token]);

  return (
    <div className={classes.root}>
      <Typography variant="h5" gutterBottom>
        Simulations
      </Typography>

      {simulations?.map(simulation => {
        const results = simulationResults[simulation.id];
        return (
          <Card key={simulation.id} className={classes.simulationCard}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Simulation #{simulation.id}
              </Typography>

              {results ? (
                <Grid container spacing={2}>
                  {results.plot_path && (
                    <Grid item xs={12} sm={6}>
                      <Button
                        variant="contained"
                        color="primary"
                        className={classes.downloadButton}
                        href={results.plot_path}
                        target="_blank"
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
                      >
                        Download Results CSV
                      </Button>
                    </Grid>
                  )}
                </Grid>
              ) : (
                <LinearProgress />
              )}
            </CardContent>
          </Card>
        );
      })}

      {(!simulations || simulations.length === 0) && (
        <Typography variant="body1">
          No simulations found.
        </Typography>
      )}
    </div>
  );
}