import { status } from '../utils';

export function getGroups(){
  return fetch(`http://127.0.0.1:8000/forecasting/groups/`)
  .then(status).catch( e => {console.log(e)})
}

export function getGroup(id){
  return fetch(`http://127.0.0.1:8000/forecasting/groups/${id}/`)
  .then(status).catch( e => {console.log(e)})
}

export function CreateGroup(token, name, location, description){
  return fetch(`http://127.0.0.1:8000/forecasting/groups/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    },
    body: JSON.stringify({name, location, description})
  })
  .then(status).catch( e => {console.log(e)})
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