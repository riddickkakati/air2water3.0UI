import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom'
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
import { Link, useHistory } from 'react-router-dom';
import MakeGroup from '../forecasting-group/group-form';
import MakeGroup2 from '../monitoring-group/group-form';
import MakeGroup3 from '../machinelearning-group/group-form';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';


function Main() {

  const { authData } = useAuth();

  // Function to determine back button destination based on the current route
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

  // Get current location for dynamic back button
  const history = useHistory();
  const currentPath = history.location.pathname;
  const backLink = getBackLink(currentPath);

  return (
    <div className="main">
      <Switch>
      <Route path="/register">
            <Register/>
          </Route>
      <Route exact path="/">
          {authData ? (
            <>
              <Link to={'/forecasting/'}>Forecasting</Link>
              <br/>
              <br/>
              <Link to={'/monitoring/'}>Monitoring</Link>
              <br/>
              <br/>
              <Link to={'/machinelearning/'}>Machine Learning</Link>
            </>
          ) : (
            <Redirect to="/register" />
          )}
        </Route>
        {authData ? (
          <>
          <Link to={backLink}><ChevronLeftIcon/></Link>
          <br/>
          <Route exact path="/forecasting/">
              <Link to={'/forecasting/group-form'}>Create Group</Link>
              <GroupList />
          </Route>
          <Route exact path="/monitoring/">
              <Link to={'/monitoring/group-form'}>Create Group</Link>
              <GroupList2 />
          </Route>
          <Route exact path="/machinelearning/">
              <Link to={'/machinelearning/group-form'}>Create Group</Link>
              <GroupList3 />
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
            <Account/>
          </Route>
          </>
          ) : (
            // Redirect to register if trying to access protected routes while not logged in
            <Redirect to="/register" />
          )}
      </Switch>
       
    </div>
  );
}

export default Main;