import React, {useState, useEffect} from 'react';
import { Link, useParams, useHistory } from 'react-router-dom';
import { useFetchGroup } from '../../hooks/fetch-group';
import { makeStyles } from '@material-ui/core/styles';
import User from '../user/user';
import { Button } from '@material-ui/core';
import { joinGroup, leaveGroup, createGroup } from '../../services/group-services';
import { useAuth } from '../../hooks/useAuth';
import Comments from '../forecasting-comments/comments';
import EventList from '../forecasting-events/event-list';
import EmojiEventsIcon from '@material-ui/icons/EmojiEvents';


const useStyles = makeStyles( theme => ({
    dateTime: {
        fontSize: '18px',
        marginRight: '3px',
        marginTop: '10px',
        color: theme.colors.mainAccentColor
    },
    memberContainer: {
        display: 'grid',
        gridTemplateColumns: 'auto 5fr 1fr',
        alignItems: 'center'
    },
    gold: {
        color: 'gold'
    },
    silver: {
        color: 'silver'
    },
    bronze: {
        color: 'bronze'
    }
}));

function GroupDetails() {
    const classes = useStyles();
    const { authData } = useAuth();
    const { id } = useParams();
    const [ data, loading, error, refetch ] = useFetchGroup(id);  // Add refetch to the hook return
    const [ group, setGroup] = useState(null);
    const [ isGroup, setInGroup ] = useState(false);
    const [ isAdmin, setIsAdmin] = useState(false);
    const history = useHistory();
    
    useEffect(()=>{
        if(data?.forecasting_members){
              if(authData?.user) {
                setInGroup(!!data.forecasting_members.find( member => member.user.id === authData.user.id));
                setIsAdmin(data.forecasting_members.find( member => member.user.id === authData.user.id)?.admin);
            }
        }
        setGroup(data);
    }, [data, authData]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleString();
      };
    
    const joinHere = () => {
        joinGroup({user: authData.user.id, group: group.id}).then(
            res => { 
                console.log(res);
                refetch();  // Refetch group data after joining
            }
        );
    };
    
    const leaveHere = () => {
        leaveGroup({user: authData.user.id, group: group.id}).then(
            res => { 
                console.log(res);
                refetch();  // Refetch group data after leaving
            }
        );
    };

    const addEvent = () => {
        history.push('/forecasting/event-form', {group})
    }

    if (error) return <h1>Error</h1>
    if (loading) return <h1>Loading....</h1>


    return (
        <div>
            { group &&
            <React.Fragment>
                <h1>{group.name}</h1>
                <h1>{group.location}</h1>
                <h2>{group.description}</h2>
                <h2>
                    {group.forecasting_members &&
                        group.forecasting_members
                        .find(member => member.admin)?.user.username || 'No Admin'} created this group on {formatDate(group.time)}
                    </h2>

                <Link to={'/forecasting/group-form'}>Create Group</Link>

                { isGroup ?
                    <Button onClick={()=> leaveHere()} variant="contained"
                            color="primary">Leave Group</Button>
                    :
                    <Button onClick={()=> joinHere()} variant="contained"
                            color="primary">Join Group</Button>
                }

                { isGroup && <Button onClick={()=> addEvent()} variant="contained"
                                    color="primary">Add new Event</Button>}


                <EventList />

                <br/>
                <h3>Members:</h3>
                { group.forecasting_members.map ( member => {

                    return <div key={member.id} className={classes.memberContainer}>
                        <User user={member.user}/>
                        <p>{formatDate(member.time)}</p>
                    </div>
                })}
                
                {isGroup && <Comments group={group}/>}
            </React.Fragment>
            }

        </div>
    );
}

export default GroupDetails;
