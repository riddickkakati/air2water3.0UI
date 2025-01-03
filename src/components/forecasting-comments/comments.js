import { Button, TextField } from '@material-ui/core';
import React, { useState, useEffect } from 'react';
import Comment from './comment';
import { useAuth } from '../../hooks/useAuth';
import { postComment } from '../../services/group-services';

function Comments({group}) {
    const { authData } = useAuth();
    const [ newComment, setNewComment ] = useState('');
    const [ comments, setComments ] = useState([]);

    // Initialize comments when component mounts or group changes
    useEffect(() => {
        if (group.forecasting_comments) {
            setComments(group.forecasting_comments);
        }
    }, [group]);

    const getUser = userId => {
        return group.forecasting_members.find(member => member.user.id === userId).user;
    }

    const sendComment = () => {
        postComment(authData.token, newComment, group.id, authData.user.id)
            .then(resp => {
                setNewComment('');
                // Update the comments state with the new comment
                setComments(prevComments => [resp, ...prevComments]);
            });
    }

    return (
        <div className="header">
            <hr/>
            <h1>Comments:</h1>
            <TextField
                label="New comment"
                multiline
                fullWidth
                rows={4}
                variant="outlined"
                value={newComment}
                onChange={evt => setNewComment(evt.target.value)}
            />
            <Button 
                onClick={() => sendComment()} 
                disabled={!newComment}
                variant='contained' 
                color='primary'
            >
                Send Comment
            </Button>
            <br/><br/>
            {comments.map(comment => (
                <Comment 
                    key={comment.id} 
                    comment={comment} 
                    user={getUser(comment.user)}
                />
            ))}
        </div>
    );
}

export default Comments;