import React, {useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import { getGroups3 } from '../../services/group-services';

function GroupList() {

  const [ groups, setGroups] = useState(null);
  const [ loading, setLoading] = useState(false);
  const [ error, setError] = useState(false);

  useEffect(()=>{
    setLoading(true);
    const getData = async () => {
      await getGroups3()
      .then( data => {
        console.log(data);
        setGroups(data);
        setLoading(false);
      }).catch( e => {
        setError(true);
        setLoading(false);
      })
    }
    getData();
  }, [])

  if (error) return <h1>Error</h1>
  if (loading) return <h1>Loading....</h1>

  return (
    <div>
        { groups && groups.map(group => {
          return <Link key={group.id} to={`/machinelearning/groups/${group.id}`}>
              <p> {group.name} from {group.location} : {group.description} </p>
            </Link>
        })}
    </div>
  );
}

export default GroupList;
