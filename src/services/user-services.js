import { status } from '../utils';
import config from '../utils/config';

export function auth(credentials){
  return fetch(`${config.API_URL}/forecasting/authenticate/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  }).then(status).catch( e => {console.log(e)})
}

export function register(userData){
  return fetch(`${config.API_URL}/forecasting/users/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  }).then(status).catch( e => {console.log(e)})
}

export function changePass(userData, userId, token){
  return fetch(`${config.API_URL}/forecasting/users/${userId}/change_pass/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    },
    body: JSON.stringify(userData)
  }).then(status).catch( e => {console.log(e)})
}

export function uploadAvatar(profileId, data){
  return fetch(`${config.API_URL}/forecasting/profile/${profileId}/`, {
    method: 'PUT',
    body: data
  }).then(status).catch( e => {console.log(e)})
}