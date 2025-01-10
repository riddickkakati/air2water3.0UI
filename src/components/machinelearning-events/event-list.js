import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Typography,
  Button,
  LinearProgress,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@material-ui/core';
import GetAppIcon from '@material-ui/icons/GetApp';
import AssessmentIcon from '@material-ui/icons/Assessment';
import ErrorIcon from '@material-ui/icons/Error';
import CloseIcon from '@material-ui/icons/Close';
import { useAuth } from '../../hooks/useAuth';
import { checkSimulationStatus3 } from '../../services/event-services';
import config from '../../utils/config';

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(2)
  },
  card: {
    marginBottom: theme.spacing(2),
    position: 'relative'
  },
  statusChip: {
    position: 'absolute',
    top: theme.spacing(2),
    right: theme.spacing(2)
  },
  title: {
    marginBottom: theme.spacing(2)
  },
  infoGrid: {
    marginBottom: theme.spacing(2)
  },
  resultsSection: {
    marginTop: theme.spacing(2)
  },
  metric: {
    marginBottom: theme.spacing(1)
  },
  error: {
    color: theme.palette.error.main,
    marginTop: theme.spacing(1)
  },
  dialogTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modelTypeChip: {
    marginRight: theme.spacing(1)
  },
  progressContainer: {
    marginTop: theme.spacing(2)
  }
}));

const EventList = () => {
  const classes = useStyles();
  const { authData } = useAuth();
  const [mlRuns, setMlRuns] = useState([]);
  const [runStatus, setRunStatus] = useState({}); // Store status and download links for each run
  const [loading, setLoading] = useState(true);
  const [selectedResults, setSelectedResults] = useState(null);
  const [resultsDialogOpen, setResultsDialogOpen] = useState(false);

  useEffect(() => {
    fetchMLRuns();
  }, []);

  // Separate effect for polling
  useEffect(() => {
    const pollInterval = setInterval(updateRunningAnalyses, 5000);
    return () => clearInterval(pollInterval);
  }, [mlRuns]); // Depend on mlRuns to restart polling when runs change

  const fetchMLRuns = async () => {
    try {
      const response = await fetch(`${config.API_URL}/machinelearning/ml_analysis/`, {
        headers: {
          'Authorization': `Token ${authData.token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMlRuns(data);
        // Initialize status tracking for each run
        const initialStatus = {};
        data.forEach(run => {
          initialStatus[run.id] = {
            status: run.status,
            downloadLinks: null,
            results: null
          };
        });
        setRunStatus(initialStatus);
      }
    } catch (error) {
      console.error('Error fetching ML runs:', error);
    }
    setLoading(false);
  };

  const updateRunningAnalyses = async () => {
    const pendingRuns = mlRuns.filter(run => 
      run.status === 'running' || run.status === 'pending' || 
      (run.status === 'completed' && !runStatus[run.id]?.downloadLinks)
    );

    if (pendingRuns.length === 0) return;

    await Promise.all(
      pendingRuns.map(async run => {
        try {
          const response = await checkSimulationStatus3(authData.token, run.id);
          
          if (response.status !== runStatus[run.id]?.status || 
              response.status === 'completed' && !runStatus[run.id]?.downloadLinks) {
            
            setRunStatus(prev => ({
              ...prev,
              [run.id]: {
                status: response.status,
                downloadLinks: response.status === 'completed' ? {
                  resultsZip: response.results_zip,
                  resultsYaml: response.results_yaml
                } : null,
                results: response.status === 'completed' ? {
                  analysis_summary: response.analysis_summary,
                  best_model: response.best_model,
                  total_time: response.total_time
                } : null
              }
            }));

            // Update the run in mlRuns
            setMlRuns(prev => 
              prev.map(prevRun => 
                prevRun.id === run.id 
                  ? { ...prevRun, status: response.status }
                  : prevRun
              )
            );
          }
        } catch (error) {
          console.error(`Error updating run ${run.id}:`, error);
        }
      })
    );
  };

  const getStatusChipProps = (status) => {
    switch (status) {
      case 'completed':
        return { label: 'Completed', color: 'primary' };
      case 'running':
        return { label: 'Running', color: 'secondary' };
      case 'failed':
        return { label: 'Failed', color: 'error' };
      default:
        return { label: 'Pending', color: 'default' };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const handleViewResults = (run) => {
    setSelectedResults({
      ...run,
      ...runStatus[run.id]
    });
    setResultsDialogOpen(true);
  };

  const handleCloseResults = () => {
    setResultsDialogOpen(false);
    setSelectedResults(null);
  };

  if (loading) return <LinearProgress />;

  return (
    <div className={classes.root}>
      <Typography variant="h5" className={classes.title}>
        ML Analysis Runs
      </Typography>

      {mlRuns.length === 0 ? (
        <Typography>No ML analysis runs found.</Typography>
      ) : (
        mlRuns.map(run => (
          <Card key={run.id} className={classes.card}>
            <CardContent>
              <Chip
                {...getStatusChipProps(runStatus[run.id]?.status || run.status)}
                className={classes.statusChip}
              />
              
              <Grid container spacing={2} className={classes.infoGrid}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="h6">
                    Analysis #{run.id}
                  </Typography>
                  <Chip 
                    label={run.model === 'W' ? 'Air2water' : 'Air2stream'}
                    className={classes.modelTypeChip}
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    Started: {formatDate(run.start_time)}
                  </Typography>
                  {run.end_time && (
                    <Typography variant="body2">
                      Completed: {formatDate(run.end_time)}
                    </Typography>
                  )}
                </Grid>
              </Grid>

              {runStatus[run.id]?.status === 'running' && (
                <div className={classes.progressContainer}>
                  <LinearProgress />
                  <Typography variant="body2" align="center">
                    Analysis in progress...
                  </Typography>
                </div>
              )}

              {run.status === 'failed' && (
                <Typography className={classes.error}>
                  <ErrorIcon /> Error: {run.error_message}
                </Typography>
              )}
            </CardContent>

            <CardActions>
              {runStatus[run.id]?.status === 'completed' && (
                <>
                  <Button
                    startIcon={<AssessmentIcon />}
                    onClick={() => handleViewResults(run)}
                    color="primary"
                  >
                    View Results
                  </Button>
                  {runStatus[run.id]?.downloadLinks?.resultsZip && (
                    <Button
                      startIcon={<GetAppIcon />}
                      href={runStatus[run.id].downloadLinks.resultsZip}
                      color="secondary"
                    >
                      Download simulation results zip file
                    </Button>
                  )}
                  {runStatus[run.id]?.downloadLinks?.resultsYaml && (
                    <Button
                      startIcon={<GetAppIcon />}
                      href={runStatus[run.id].downloadLinks.resultsYaml}
                      color="secondary"
                    >
                      Download algorithm performance results
                    </Button>
                  )}
                </>
              )}
            </CardActions>
          </Card>
        ))
      )}

      {/* Results Dialog */}
      <Dialog
        open={resultsDialogOpen}
        onClose={handleCloseResults}
        maxWidth="md"
        fullWidth
      >
        {selectedResults && selectedResults.results && (
          <>
            <DialogTitle>
              <div className={classes.dialogTitle}>
                <Typography variant="h6">
                  Analysis Results #{selectedResults.id}
                </Typography>
                <IconButton onClick={handleCloseResults}>
                  <CloseIcon />
                </IconButton>
              </div>
            </DialogTitle>
            <DialogContent>
              <Paper elevation={0}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Best Model Performance
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1" className={classes.metric}>
                        Model: {selectedResults.results.best_model?.name}
                      </Typography>
                      <Typography variant="body1" className={classes.metric}>
                        Type: {selectedResults.results.best_model?.type}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1" className={classes.metric}>
                        Validation R²: {selectedResults.results.best_model?.validation_r2.toFixed(4)}
                      </Typography>
                      <Typography variant="body1" className={classes.metric}>
                        Training R² (mean): {selectedResults.results.best_model?.training_r2_mean.toFixed(4)}
                      </Typography>
                      <Typography variant="body1" className={classes.metric}>
                        Training R² (std): {selectedResults.results.best_model?.training_r2_std.toFixed(4)}
                      </Typography>
                    </Grid>
                  </Grid>
                  
                  <Typography variant="body1" className={classes.metric}>
                    Total Execution Time: {selectedResults.results.total_time.toFixed(2)} seconds
                  </Typography>
                </CardContent>
              </Paper>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseResults} color="primary">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
};

export default EventList;