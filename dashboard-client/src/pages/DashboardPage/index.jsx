/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { getUserDetails, getMutualGuilds } from '../../util/api';

import '../styles.css';
import { Navbar } from '../../components';
// import Formik from 'formik';

export function DashboardPage(props) {
    
    const [ user, setUser ] = React.useState({});
    const [ guilds, setGuilds ] = React.useState([]);

    React.useEffect(() => {
        getUserDetails()
        .then(res => {
            // console.log(res.data);
            setUser(res.data);
            
            return getMutualGuilds();
        })
        .then(res => {
            // console.log(res.data);
            setGuilds(res.data);            
        })
        .catch(err => {
            props.history.push('/');
        });
    }, []);

    return (
        <div>
            <Navbar user={user} guilds={guilds} />
            
            <div className='app-header'>
                <h1>Dashboard Page</h1>
            </div>
        </div>
    );
}