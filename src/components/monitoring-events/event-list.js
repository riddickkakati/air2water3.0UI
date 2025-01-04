import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { 
  Typography, 
  Button, 
  LinearProgress, 
  Grid,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton
} from '@material-ui/core';
import { useAuth } from '../../hooks/useAuth';
import MapIcon from '@material-ui/icons/Map';
import GetAppIcon from '@material-ui/icons/GetApp';
import CloseIcon from '@material-ui/icons/Close';

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(2)
  },
  monitoring: {
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
  monitoringTitle: {
    color: '#fff',
    fontWeight: 500
  },
  monitoringInfo: {
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
  },
  dialogTitle: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  mapDialog: {
    '& .MuiDialog-paper': {
      maxWidth: '90vw',
      maxHeight: '90vh',
    },
  },
  mapContainer: {
    width: '100%',
    height: '70vh',
    '& iframe': {
      width: '100%',
      height: '100%',
      border: 'none'
    }
  }
}));

export default function EventList() {
  const classes = useStyles();
  const { authData } = useAuth();
  const [monitoringRuns, setMonitoringRuns] = useState([]);
  const [monitoringResults, setMonitoringResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedMap, setSelectedMap] = useState(null);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);

  useEffect(() => {
    const fetchMonitoringRuns = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/monitoring/compute/', {
          headers: {
            'Authorization': `Token ${authData.token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setMonitoringRuns(data);
          data.forEach(monitoring => {
            fetchMonitoringStatus(monitoring.id);
          });
        }
      } catch (error) {
        console.error('Error fetching monitoring runs:', error);
      }
      setLoading(false);
    };

    fetchMonitoringRuns();
  }, [authData.token]);

  const fetchMonitoringStatus = async (monitoringId) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/monitoring/compute/${monitoringId}/check_status/`,
        {
          headers: {
            'Authorization': `Token ${authData.token}`
          }
        }
      );
      if (response.ok) {
        const data = await response.json();
        setMonitoringResults(prev => ({
          ...prev,
          [monitoringId]: data
        }));
        return data.status;
      }
    } catch (error) {
      console.error('Error fetching monitoring status:', error);
    }
    return null;
  };

  useEffect(() => {
    const intervals = {};

    const startPolling = (monitoringId) => {
      intervals[monitoringId] = setInterval(async () => {
        const status = await fetchMonitoringStatus(monitoringId);
        if (status === 'completed' || status === 'failed') {
          clearInterval(intervals[monitoringId]);
          delete intervals[monitoringId];
        }
      }, 5000);
    };

    monitoringRuns.forEach(monitoring => {
      const currentStatus = monitoringResults[monitoring.id]?.status;
      if (currentStatus === 'pending' || currentStatus === 'running') {
        startPolling(monitoring.id);
      }
    });

    return () => {
      Object.values(intervals).forEach(interval => clearInterval(interval));
    };
  }, [monitoringRuns, monitoringResults]);

  const handleMapClick = (htmlContent) => {
    setSelectedMap(htmlContent);
    setMapDialogOpen(true);
  };

  const handleCloseMap = () => {
    setMapDialogOpen(false);
    setSelectedMap(null);
  };

  if (loading) {
    return <LinearProgress />;
  }

  const getParameterName = (param) => {
    switch(param) {
      case 'C': return 'CHLA';
      case 'T': return 'TURBIDITY';
      case 'D': return 'DO';
      default: return param;
    }
  };

  const getSatelliteName = (sat) => {
    switch(sat) {
      case 'L': return 'Landsat';
      case 'S': return 'Sentinel';
      default: return sat;
    }
  };

  return (
    <div className={classes.root}>
      <Typography variant="h5" gutterBottom className={classes.monitoringTitle}>
        Monitoring Runs
      </Typography>

      {monitoringRuns.map(monitoring => {
        const results = monitoringResults[monitoring.id];
        return (
          <div key={monitoring.id} className={classes.monitoring}>
            <Typography variant="h6" gutterBottom className={classes.monitoringTitle}>
              Monitoring Run #{monitoring.id}
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

            <Typography variant="body1" className={classes.monitoringInfo}>
              Parameter: {getParameterName(monitoring.parameter)}
              <br />
              Satellite: {getSatelliteName(monitoring.satellite)}
              <br />
              Date Range: {new Date(monitoring.start_date).toLocaleDateString()} - {new Date(monitoring.end_date).toLocaleDateString()}
              <br />
              Location: {monitoring.latitude}°N, {monitoring.longitude}°E
            </Typography>

            {results && results.status === 'completed' && (
              <Grid container spacing={2}>
                {results.map_html && (
                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="contained"
                      color="primary"
                      className={classes.downloadButton}
                      onClick={() => handleMapClick(results.map_html)}
                      startIcon={<MapIcon />}
                    >
                      View Interactive Map
                    </Button>
                  </Grid>
                )}

                {results.map_download && (
                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="contained"
                      color="secondary"
                      className={classes.downloadButton}
                      href={results.map_download}
                      download
                      startIcon={<GetAppIcon />}
                    >
                      Download Map Image
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

      {monitoringRuns.length === 0 && (
        <Typography variant="body1" className={classes.monitoringInfo}>
          No monitoring runs found.
        </Typography>
      )}

      {/* Map Dialog */}
      <Dialog
        open={mapDialogOpen}
        onClose={handleCloseMap}
        maxWidth="lg"
        fullWidth
        className={classes.mapDialog}
      >
        <DialogTitle disableTypography className={classes.dialogTitle}>
          <Typography variant="h6">Interactive Map</Typography>
          <IconButton className={classes.closeButton} onClick={handleCloseMap}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <div className={classes.mapContainer}>
            {selectedMap && (
              <iframe
                srcDoc={selectedMap}
                title="Interactive Map"
                sandbox="allow-same-origin allow-scripts"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}