import React from "react";
import axios from "axios";
import {Link, useParams, useNavigate} from 'react-router-dom';
import {AppBar, Box, Button, Toolbar, Typography} from "@mui/material";

const MenuBar = () => {
    const navigate = useNavigate();

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position='static'>
                <Toolbar>
                    <Button
                        color="inherit" variant="outlined"
                        onClick={() => navigate('/auctions')}
                    >
                        Auctions
                    </Button>
                    <Box sx={{ flexGrow: 1 }}/>
                    <Button
                        color="inherit" variant="outlined"
                        onClick={() => navigate('/account')}
                    >
                        Login/Register
                    </Button>
                </Toolbar>
            </AppBar>
        </Box>
    )
}

export default MenuBar;