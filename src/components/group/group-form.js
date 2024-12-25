import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Link, useHistory } from 'react-router-dom';
import { Button, Grid, TextField } from '@material-ui/core';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import EmailIcon from '@material-ui/icons/Email';
import { createGroup } from '../../services/group-services';
import { auth } from '../../services/user-services';

function MakeGroup() {
    const { setAuth } = useAuth();
    const history = useHistory();
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = async e => {
        e.preventDefault();
        const regData = await createGroup({ name, location, description });
        history.push('/forecasting');
    };

    return (
        <div>
            <Link to={'/forecasting'}>Back</Link>
            <h1>Create Group</h1>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={1} alignItems="flex-end">
                    <Grid item>
                        <AccountCircleIcon />
                    </Grid>
                    <Grid item>
                        <TextField 
                            id="input-with-icon-grid" 
                            label="Name"
                            onChange={e => setName(e.target.value)}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={1} alignItems="flex-end">
                    <Grid item>
                        <VpnKeyIcon />
                    </Grid>
                    <Grid item>
                        <TextField 
                            id="input-with-icon-grid" 
                            label="location"
                            onChange={e => setLocation(e.target.value)}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={1} alignItems="flex-end">
                    <Grid item>
                        <EmailIcon />
                    </Grid>
                    <Grid item>
                        <TextField 
                            id="input-with-icon-grid" 
                            label="description"
                            onChange={e => setDescription(e.target.value)}
                        />
                    </Grid>
                </Grid>
                <Button color="primary" variant="contained" type='submit'>
                    Register
                </Button>
                <br/>
            </form>
        </div>
    );
}

export default MakeGroup;