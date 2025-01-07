import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { Link, useHistory } from 'react-router-dom';
import GroupList from '../forecasting-group/group-list';
import GroupDetails from '../forecasting-group/group-details';
import GroupList2 from '../monitoring-group/group-list';
import GroupDetails2 from '../monitoring-group/group-details';
import GroupList3 from '../machinelearning-group/group-list';
import GroupDetails3 from '../machinelearning-group/group-details';
import Register from '../user/register';
import Account from '../user/account';
import EventForm from '../forecasting-events/event-form';
import EventForm2 from '../monitoring-events/event-form';
import EventForm3 from '../machinelearning-events/event-form';
import { useAuth } from '../../hooks/useAuth';
import MakeGroup from '../forecasting-group/group-form';
import MakeGroup2 from '../monitoring-group/group-form';
import MakeGroup3 from '../machinelearning-group/group-form';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import { 
  Container,
  Typography,
  Button,
  Paper,
  Box,
  makeStyles,
  Card,
  CardContent,
  IconButton
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100vh',
    backgroundColor: theme.palette.grey[100],
    padding: theme.spacing(3)
  },
  title: {
    marginBottom: theme.spacing(6),
    textAlign: 'center'
  },
  menuCard: {
    marginBottom: theme.spacing(3),
    height: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    '&:hover': {
      transform: 'translateY(-4px)',
      transition: 'transform 0.2s'
    }
  },
  forecasting: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText
  },
  monitoring: {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText
  },
  machinelearning: {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText
  },
  sectionContainer: {
    padding: theme.spacing(4),
    marginTop: theme.spacing(3)
  },
  backButton: {
    marginBottom: theme.spacing(3)
  },
  contentCenter: {
    textAlign: 'center'
  },
  createButton: {
    marginBottom: theme.spacing(4)
  },
  cardTitle: {
    fontSize: '2rem',
    fontWeight: 'bold'
  }
}));

function Main() {
  const classes = useStyles();
  const { authData } = useAuth();
  const history = useHistory();
  const currentPath = history.location.pathname;

  const getBackLink = (pathname) => {
    switch(pathname) {
      case '/forecasting/':
        return '/';
      case '/forecasting/group-form':
        return '/forecasting/';
      case '/forecasting/event-form':
        return '/forecasting/';
      case '/monitoring/':
        return '/';
      case '/monitoring/group-form':
        return '/monitoring/';
      case '/monitoring/event-form':
        return '/monitoring/';
      case '/machinelearning/':
        return '/';
      case '/machinelearning/group-form':
        return '/monitoring/';
      case '/machinelearning/event-form':
        return '/monitoring/';
      default:
        if (pathname.startsWith('/forecasting/groups/')) {
          return '/forecasting/';
        }
        if (pathname.startsWith('/forecasting/event/')) {
          return '/forecasting/';
        }
        if (pathname.startsWith('/monitoring/groups/')) {
          return '/monitoring/';
        }
        if (pathname.startsWith('/monitoring/event/')) {
          return '/monitoring/';
        }
        if (pathname.startsWith('/machinelearning/groups/')) {
          return '/machinelearning/';
        }
        if (pathname.startsWith('/machinelearning/event/')) {
          return '/machinelearning/';
        }
        return '/';
    }
  }

  const backLink = getBackLink(currentPath);

  return (
    <div className={classes.root}>
      <Container maxWidth="lg">
        <Switch>
          <Route path="/register">
            <Register />
          </Route>

          <Route exact path="/">
            {authData ? (
              <Box>
                <Typography variant="h3" component="h1" className={classes.title}>
                  Dashboard
                </Typography>
                
                <Box component={Link} to="/forecasting/" className={`${classes.menuCard} ${classes.forecasting}`}>
                  <Typography variant="h4" className={classes.cardTitle}>
                    Forecasting
                  </Typography>
                </Box>
                
                <Box component={Link} to="/monitoring/" className={`${classes.menuCard} ${classes.monitoring}`}>
                  <Typography variant="h4" className={classes.cardTitle}>
                    Monitoring
                  </Typography>
                </Box>
                
                <Box component={Link} to="/machinelearning/" className={`${classes.menuCard} ${classes.machinelearning}`}>
                  <Typography variant="h4" className={classes.cardTitle}>
                    Machine Learning
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Redirect to="/register" />
            )}
          </Route>

          {authData ? (
            <>
              <IconButton 
                component={Link} 
                to={backLink} 
                className={classes.backButton}
              >
                <ChevronLeftIcon />
              </IconButton>

              <Route exact path="/forecasting/">
                <Paper className={classes.sectionContainer}>
                  <Box className={classes.contentCenter}>
                    <Typography variant="h4" gutterBottom>
                      Forecasting Groups
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      component={Link}
                      to="/forecasting/group-form"
                      className={classes.createButton}
                    >
                      Create Group
                    </Button>
                  </Box>
                  <GroupList />
                </Paper>
              </Route>

              <Route exact path="/monitoring/">
                <Paper className={classes.sectionContainer}>
                  <Box className={classes.contentCenter}>
                    <Typography variant="h4" gutterBottom>
                      Monitoring Groups
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      component={Link}
                      to="/monitoring/group-form"
                      className={classes.createButton}
                    >
                      Create Group
                    </Button>
                  </Box>
                  <GroupList2 />
                </Paper>
              </Route>

              <Route exact path="/machinelearning/">
                <Paper className={classes.sectionContainer}>
                  <Box className={classes.contentCenter}>
                    <Typography variant="h4" gutterBottom>
                      Machine Learning Groups
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      component={Link}
                      to="/machinelearning/group-form"
                      className={classes.createButton}
                    >
                      Create Group
                    </Button>
                  </Box>
                  <GroupList3 />
                </Paper>
              </Route>

              <Route path="/forecasting/group-form">
                <MakeGroup />
              </Route>

              <Route path="/monitoring/group-form">
                <MakeGroup2 />
              </Route>

              <Route path="/machinelearning/group-form">
                <MakeGroup3 />
              </Route>

              <Route path="/forecasting/groups/:id">
                <GroupDetails />
              </Route>

              <Route path="/monitoring/groups/:id">
                <GroupDetails2 />
              </Route>

              <Route path="/machinelearning/groups/:id">
                <GroupDetails3 />
              </Route>

              <Route path="/forecasting/event-form">
                <EventForm />
              </Route>

              <Route path="/monitoring/event-form">
                <EventForm2 />
              </Route>

              <Route path="/machinelearning/event-form">
                <EventForm3 />
              </Route>

              <Route path="/account">
                <Account />
              </Route>
            </>
          ) : (
            <Redirect to="/register" />
          )}
        </Switch>
      </Container>
    </div>
  );
}

export default Main;