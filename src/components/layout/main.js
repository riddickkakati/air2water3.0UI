import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom'
import GroupList from '../group/group-list';
import GroupDetails from '../group/group-details';
import Register from '../user/register';
import Account from '../user/account';
import Event from '../events/event';
import EventForm from '../events/event-form';
import { useAuth } from '../../hooks/useAuth';
import { Link, useHistory } from 'react-router-dom';
import MakeGroup from '../group/group-form';


function Main() {

  const { authData } = useAuth();

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
          <Route exact path="/forecasting/">
              <Link to={'/forecasting/group-form'}>Create Group</Link>
              <GroupList />
          </Route>
          <Route path="/forecasting/group-form">
              <MakeGroup />
          </Route>
          
          <Route path="/forecasting/details/:id">
              <GroupDetails />
          </Route>
          <Route path="/forecasting/event/:id">
              <Event />
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