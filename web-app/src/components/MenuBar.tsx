import React from "react";
import axios from "axios";
import {useAuthStore} from "../store";
import {Link, useParams, useNavigate} from 'react-router-dom';
import {
    AppBar,
    Avatar,
    Box,
    Button,
    IconButton,
    Toolbar,
    Typography,
    Menu,
    MenuItem,
    ListItemIcon, Chip
} from "@mui/material";
import {encode} from "base64-arraybuffer";
import {Logout, Settings, AccountCircle} from "@mui/icons-material";


interface IMenuBarProps {
    auctions: boolean,
    login: boolean,
}

const MenuBar = (props: IMenuBarProps) => {
    const {auctions, login} = props;
    const navigate = useNavigate();
    const authData = useAuthStore(state => state.authData)
    const clearAuth = useAuthStore(state => state.clearAuth)

    const [user, setUser] = React.useState<UserReturnWithEmail>({firstName:"", lastName:"", email:""});
    const [userImage, setUserImage] = React.useState<string>("");
    const [userImageType, setUserImageType] = React.useState<string>("");


    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")


    React.useEffect(() => {
        if (authData.token != "") {
            getUser();
            getUserImage();
        }
    }, [])

    const getUser = () => {
        axios.get('http://localhost:4941/api/v1/users/' + authData.userId.toString())
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setUser(response.data)
            }, (error) => {
                if (error.response.status != 404) {
                    setErrorFlag(true)
                    setErrorMessage(error.toString())
                }
            })
    }

    const getUserImage = () => {
        axios.get('http://localhost:4941/api/v1/users/' + authData.userId.toString() + '/image', {responseType: "arraybuffer"})
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setUserImage(encode(response.data))
                setUserImageType(response.headers["content-type"])
            }, (error) => {
                if (error.response.status != 404) {
                    setErrorFlag(true)
                    setErrorMessage(error.toString())
                }
            })
    }

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="sticky">
                <Toolbar>
                    { auctions &&
                        <Button
                            color="inherit" variant="outlined"
                            onClick={() => navigate('/auctions')}
                        >
                            Auctions
                        </Button>
                    }
                    <Box sx={{ flexGrow: 1 }}/>

                    { login &&
                        (authData.token === "" ?
                            <Button
                                color="inherit" variant="outlined"
                                onClick={() => navigate('/account')}
                            >
                                Login/Register
                            </Button>
                        :
                            // <IconButton
                            //     onClick={handleClick}
                            // >
                            //     <Avatar src={`data:${userImageType};base64,${userImage}`}/>
                            //     <Typography variant="subtitle2" align='center' sx={{ml:'10px'}}>
                            //         {user.firstName + ' ' + user.lastName}
                            //     </Typography>
                            // </IconButton>
                            <Chip
                                avatar={
                                    <Avatar src={`data:${userImageType};base64,${userImage}`} >
                                        {user.firstName[0] + user.lastName[0]}
                                    </Avatar>
                                }
                                label={user.firstName + ' ' + user.lastName}
                                // variant="outlined"
                                color="primary"
                                onClick={handleClick}
                            />
                        )
                    }
                </Toolbar>
            </AppBar>
            <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem
                    onClick={() => {navigate('/account/details')}}
                >
                    <ListItemIcon>
                        <AccountCircle fontSize="small" />
                    </ListItemIcon>
                    Profile
                </MenuItem>
                <MenuItem
                    onClick={clearAuth}
                >
                    <ListItemIcon>
                        <Logout fontSize="small" />
                    </ListItemIcon>
                    Logout
                </MenuItem>
            </Menu>
        </Box>
    )
}

export default MenuBar;