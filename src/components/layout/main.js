import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom'
import GroupList from '../group/group-list';
import GroupDetails from '../group/group-details';
import Register from '../user/register';
import Account from '../user/account';
import EventForm from '../events/event-form';
import { useAuth } from '../../hooks/useAuth';
import { Link, useHistory } from 'react-router-dom';
import MakeGroup from '../group/group-form';
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
        default:
            if (pathname.startsWith('/forecasting/groups/')) {
                return '/forecasting/';
            }
            if (pathname.startsWith('/forecasting/event/')) {
                return '/forecasting/';
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
              <h2>Monitoring Link</h2>
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
          <Route path="/forecasting/group-form">
              <MakeGroup />
          </Route>
          
          <Route path="/forecasting/groups/:id">
              <GroupDetails />
          </Route>
          <Route path="/forecasting/event-form">
              <EventForm />
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