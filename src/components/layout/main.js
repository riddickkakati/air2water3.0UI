import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { Link, useHistory } from 'react-router-dom';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
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

function Main() {
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

  const MainMenuItem = ({ to, children, bgColor = "bg-blue-600" }) => (
    <div className="w-full mb-8">
      <Link 
        to={to}
        className={`block w-full h-32 ${bgColor} rounded-lg shadow-lg hover:shadow-xl transition-all duration-300`}
      >
        <div className="w-full h-full flex items-center justify-center">
          <h2 className="text-4xl font-bold text-white">
            {children}
          </h2>
        </div>
      </Link>
    </div>
  );

  const ActionButton = ({ to, children, bgColor = "bg-blue-600" }) => (
    <Link 
      to={to}
      className={`inline-block px-6 py-3 ${bgColor} text-white rounded-lg hover:opacity-90 transition-opacity duration-200 font-medium text-lg`}
    >
      {children}
    </Link>
  );

  const BackButton = ({ to }) => (
    <Link 
      to={to}
      className="inline-flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 mb-4"
    >
      <ChevronLeftIcon className="w-5 h-5 mr-1" />
      <span>Back</span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="w-full max-w-6xl mx-auto px-4 py-8 text-center">
        <Switch>
          <Route path="/register">
            <Register />
          </Route>

          <Route exact path="/">
            {authData ? (
              <div className="w-full">
                <h1 className="text-4xl font-bold text-gray-900 mb-16">Dashboard</h1>
                <div className="w-full space-y-12">
                  <MainMenuItem to="/forecasting/" bgColor="bg-indigo-600">Forecasting</MainMenuItem>
                  <MainMenuItem to="/monitoring/" bgColor="bg-emerald-600">Monitoring</MainMenuItem>
                  <MainMenuItem to="/machinelearning/" bgColor="bg-violet-600">Machine Learning</MainMenuItem>
                </div>
              </div>
            ) : (
              <Redirect to="/register" />
            )}
          </Route>

          {authData ? (
            <>
              <Route exact path="/forecasting/">
                <div className="space-y-8 bg-indigo-50 p-8 rounded-xl">
                  <BackButton to={backLink} />
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Forecasting Groups</h2>
                    <ActionButton to="/forecasting/group-form" bgColor="bg-indigo-600">Create Group</ActionButton>
                  </div>
                  <GroupList />
                </div>
              </Route>

              <Route exact path="/monitoring/">
                <div className="space-y-8 bg-emerald-50 p-8 rounded-xl">
                  <BackButton to={backLink} />
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Monitoring Groups</h2>
                    <ActionButton to="/monitoring/group-form" bgColor="bg-emerald-600">Create Group</ActionButton>
                  </div>
                  <GroupList2 />
                </div>
              </Route>

              <Route exact path="/machinelearning/">
                <div className="space-y-8 bg-violet-50 p-8 rounded-xl">
                  <BackButton to={backLink} />
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Machine Learning Groups</h2>
                    <ActionButton to="/machinelearning/group-form" bgColor="bg-violet-600">Create Group</ActionButton>
                  </div>
                  <GroupList3 />
                </div>
              </Route>

              <Route path="/forecasting/group-form">
                <BackButton to={backLink} />
                <MakeGroup />
              </Route>

              <Route path="/monitoring/group-form">
                <BackButton to={backLink} />
                <MakeGroup2 />
              </Route>

              <Route path="/machinelearning/group-form">
                <BackButton to={backLink} />
                <MakeGroup3 />
              </Route>

              <Route path="/forecasting/groups/:id">
                <BackButton to={backLink} />
                <GroupDetails />
              </Route>

              <Route path="/monitoring/groups/:id">
                <BackButton to={backLink} />
                <GroupDetails2 />
              </Route>

              <Route path="/machinelearning/groups/:id">
                <BackButton to={backLink} />
                <GroupDetails3 />
              </Route>

              <Route path="/forecasting/event-form">
                <BackButton to={backLink} />
                <EventForm />
              </Route>

              <Route path="/monitoring/event-form">
                <BackButton to={backLink} />
                <EventForm2 />
              </Route>

              <Route path="/machinelearning/event-form">
                <BackButton to={backLink} />
                <EventForm3 />
              </Route>

              <Route path="/account">
                <BackButton to={backLink} />
                <Account />
              </Route>
            </>
          ) : (
            <Redirect to="/register" />
          )}
        </Switch>
      </div>
    </div>
  );
}

export default Main;