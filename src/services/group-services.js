import { status } from '../utils';
import config from '../utils/config';

export function getGroups(){
  return fetch(`${config.API_URL}/forecasting/groups/`)
  .then(status).catch( e => {console.log(e)})
}

export function getGroups2(){
  return fetch(`${config.API_URL}/monitoring/groups/`)
  .then(status).catch( e => {console.log(e)})
}

export function getGroups3(){
  return fetch(`${config.API_URL}/machinelearning/groups/`)
  .then(status).catch( e => {console.log(e)})
}

export function getGroup(id){
  return fetch(`${config.API_URL}/forecasting/groups/${id}/`)
  .then(status).catch( e => {console.log(e)})
}

export function getGroup2(id){
  return fetch(`${config.API_URL}/monitoring/groups/${id}/`)
  .then(status).catch( e => {console.log(e)})
}

export function getGroup3(id){
  return fetch(`${config.API_URL}/machinelearning/groups/${id}/`)
  .then(status).catch( e => {console.log(e)})
}

export function createGroup(token, userData){
  return fetch(`${config.API_URL}/forecasting/groups/`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
      },
      body: JSON.stringify(userData)  // Remove the extra {} wrapping
  })
  .then(status)
  .catch(e => {console.log(e)})
}

export function createGroup2(token, userData){
  console.log('Making request with token:', token);
  return fetch(`${config.API_URL}/monitoring/groups/`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}` // Make sure there's a space after "Token"
      },
      body: JSON.stringify(userData)
  })
  .then(async response => {
    if (!response.ok) {
      // Get the error message from the response
      const errorData = await response.json();
      console.log('Error response:', errorData);
      throw new Error(errorData.detail || 'Request failed');
    }
    return response.json();
  })
  .catch(e => {
    console.error('Full error:', e);
    throw e;
  })
}

export function createGroup3(token, userData){
  console.log('Making request with token:', token);
  return fetch(`${config.API_URL}/machinelearning/groups/`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}` // Make sure there's a space after "Token"
      },
      body: JSON.stringify(userData)
  })
  .then(async response => {
    if (!response.ok) {
      // Get the error message from the response
      const errorData = await response.json();
      console.log('Error response:', errorData);
      throw new Error(errorData.detail || 'Request failed');
    }
    return response.json();
  })
  .catch(e => {
    console.error('Full error:', e);
    throw e;
  })
}

export function joinGroup(data){
  return fetch(`${config.API_URL}/forecasting/members/join/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(status).catch( e => {console.log(e)})
}

export function joinGroup2(data){
  return fetch(`${config.API_URL}/monitoring/members/join/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(status).catch( e => {console.log(e)})
}

export function joinGroup3(data){
  return fetch(`${config.API_URL}/machinelearning/members/join/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(status).catch( e => {console.log(e)})
}

export function leaveGroup(data){
  return fetch(`${config.API_URL}/forecasting/members/leave/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(status).catch( e => {console.log(e)})
}

export function leaveGroup2(data){
  return fetch(`${config.API_URL}/monitoring/members/leave/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(status).catch( e => {console.log(e)})
}

export function leaveGroup3(data){
  return fetch(`${config.API_URL}/machinelearning/members/leave/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(status).catch( e => {console.log(e)})
}


export function postComment(token, description, group, user){
  return fetch(`${config.API_URL}/forecasting/comments/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    },
    body: JSON.stringify({description, group, user})
  })
  .then(status).catch( e => {console.log(e)})
}

export function postComment2(token, description, group, user){
  return fetch(`${config.API_URL}/monitoring/comments/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    },
    body: JSON.stringify({description, group, user})
  })
  .then(status).catch( e => {console.log(e)})
}

export function postComment3(token, description, group, user){
  return fetch(`${config.API_URL}/machinelearning/comments/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    },
    body: JSON.stringify({description, group, user})
  })
  .then(status).catch( e => {console.log(e)})
}