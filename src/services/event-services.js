import { status } from '../utils';

// Existing functions
export function getEvent(token, id) {
  return fetch(`http://127.0.0.1:8000/forecasting/simulations/${id}/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    },
  })
  .then(status)
  .catch(e => {console.log(e)});
}

export function getEvent2(token, id) {
  return fetch(`http://127.0.0.1:8000/monitoring/compute/${id}/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    },
  })
  .then(status)
  .catch(e => {console.log(e)});
}

// File upload functions
export function uploadTimeseriesFile(token, fileData) {
  return fetch('http://127.0.0.1:8000/forecasting/timeseries/', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`,
      // Do not set Content-Type header - let the browser set it with the boundary
    },
    body: fileData
  })
  .then(status)
  .catch(e => {
    console.log(e);
    throw e;
  });
}

export function uploadParameterFile(token, fileData) {
  return fetch('http://127.0.0.1:8000/forecasting/parameters/', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`
    },
    body: fileData
  })
  .then(status)
  .catch(e => {console.log(e)});
}

export function uploadParameterRangesFile(token, fileData) {
  return fetch('http://127.0.0.1:8000/forecasting/parameterranges/', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`
    },
    body: fileData
  })
  .then(status)
  .catch(e => {console.log(e)});
}

export function uploadValidationFile(token, fileData) {
  return fetch('http://127.0.0.1:8000/forecasting/uservalidation/', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`
    },
    body: fileData
  })
  .then(status)
  .catch(e => {console.log(e)});
}

// Simulation creation and management
export function createSimulation(token, simulationData) {
  return fetch('http://127.0.0.1:8000/forecasting/simulations/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    },
    body: JSON.stringify(simulationData)
  })
  .then(status)
  .catch(e => {console.log(e)});
}

export function createSimulation2(token, simulationData) {
  return fetch('http://127.0.0.1:8000/monitoring/compute/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    },
    body: JSON.stringify(simulationData)
  })
  .then(status)
  .catch(e => {console.log(e)});
}

export function runSimulation(token, simulationId) {
  return fetch(`http://127.0.0.1:8000/forecasting/simulations/${simulationId}/run_simulation/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    }
  })
  .then(status)
  .catch(e => {console.log(e)});
}

export function runSimulation2(token, simulationId) {
  return fetch(`http://127.0.0.1:8000/monitoring/compute/${simulationId}/run_monitoring/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    }
  })
  .then(status)
  .catch(e => {console.log(e)});
}

export function checkSimulationStatus(token, simulationId) {
  return fetch(`http://127.0.0.1:8000/forecasting/simulations/${simulationId}/check_status/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    }
  })
  .then(status)
  .catch(e => {console.log(e)});
}

export function checkSimulationStatus2(token, simulationId) {
  return fetch(`http://127.0.0.1:8000/monitoring/compute/${simulationId}/check_status/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    }
  })
  .then(status)
  .catch(e => {console.log(e)});
}

// Additional simulation parameter functions
export function savePSOParameters(token, simulationId, psoData) {
  return fetch(`http://127.0.0.1:8000/forecasting/psoparameter/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    },
    body: JSON.stringify({
      simulation: simulationId,
      ...psoData
    })
  })
  .then(status)
  .catch(e => {console.log(e)});
}

export function saveLatinParameters(token, simulationId, latinData) {
  return fetch(`http://127.0.0.1:8000/forecasting/latinparameter/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    },
    body: JSON.stringify({
      simulation: simulationId,
      ...latinData
    })
  })
  .then(status)
  .catch(e => {console.log(e)});
}

export function saveMonteCarloParameters(token, simulationId, monteCarloData) {
  return fetch(`http://127.0.0.1:8000/forecasting/montecarloparameter/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    },
    body: JSON.stringify({
      simulation: simulationId,
      ...monteCarloData
    })
  })
  .then(status)
  .catch(e => {console.log(e)});
}

export function saveForwardParameters(token, simulationId, forwardData) {
  return fetch(`http://127.0.0.1:8000/forecasting/parameterforward/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    },
    body: JSON.stringify({
      simulation: simulationId,
      ...forwardData
    })
  })
  .then(status)
  .catch(e => {console.log(e)});
}