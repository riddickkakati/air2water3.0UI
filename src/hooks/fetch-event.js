import {useState, useEffect} from 'react';
import { getEvent, getEvent2, getEvent3 } from '../services/event-services';

export function useFetchEvent(token, eventId){

  const [ event, setEvent] = useState(null);
  const [ loading, setLoading] = useState(false);
  const [ error, setError] = useState(false);

  useEffect(()=>{
    const getData = async () => {
      setLoading(true);
      const data = await getEvent(token, eventId);
      setEvent(data);
      setLoading(false);
      setError(null);
    }
    getData();
  },[eventId]);

  return [event, loading, error]
}

export function useFetchEvent2(token, eventId){

  const [ event, setEvent] = useState(null);
  const [ loading, setLoading] = useState(false);
  const [ error, setError] = useState(false);

  useEffect(()=>{
    const getData = async () => {
      setLoading(true);
      const data = await getEvent2(token, eventId);
      setEvent(data);
      setLoading(false);
      setError(null);
    }
    getData();
  },[eventId]);

  return [event, loading, error]
}

export function useFetchEvent3(token, eventId){

  const [ event, setEvent] = useState(null);
  const [ loading, setLoading] = useState(false);
  const [ error, setError] = useState(false);

  useEffect(()=>{
    const getData = async () => {
      setLoading(true);
      const data = await getEvent3(token, eventId);
      setEvent(data);
      setLoading(false);
      setError(null);
    }
    getData();
  },[eventId]);

  return [event, loading, error]
}