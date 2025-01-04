import { status } from '../utils';

export function getGroups(){
  return fetch(`http://127.0.0.1:8000/forecasting/groups/`)
  .then(status).catch( e => {console.log(e)})
}

export function getGroups2(){
  return fetch(`http://127.0.0.1:8000/monitoring/groups/`)
  .then(status).catch( e => {console.log(e)})
}

export function getGroup(id){
  return fetch(`http://127.0.0.1:8000/forecasting/groups/${id}/`)
  .then(status).catch( e => {console.log(e)})
}

export function getGroup2(id){
  return fetch(`http://127.0.0.1:8000/monitoring/groups/${id}/`)
  .then(status).catch( e => {console.log(e)})
}

export function createGroup(token, userData){
  return fetch(`http://127.0.0.1:8000/forecasting/groups/`, {
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
  return fetch(`http://127.0.0.1:8000/monitoring/groups/`, {
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
  return fetch(`http://127.0.0.1:8000/forecasting/members/join/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(status).catch( e => {console.log(e)})
}

export function joinGroup2(data){
  return fetch(`http://127.0.0.1:8000/monitoring/members/join/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(status).catch( e => {console.log(e)})
}

export function leaveGroup(data){
  return fetch(`http://127.0.0.1:8000/forecasting/members/leave/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(status).catch( e => {console.log(e)})
}

export function leaveGroup2(data){
  return fetch(`http://127.0.0.1:8000/monitoring/members/leave/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(status).catch( e => {console.log(e)})
}


export function postComment(token, description, group, user){
  return fetch(`http://127.0.0.1:8000/forecasting/comments/`, {
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
  return fetch(`http://127.0.0.1:8000/monitoring/comments/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    },
    body: JSON.stringify({description, group, user})
  })
  .then(status).catch( e => {console.log(e)})
}