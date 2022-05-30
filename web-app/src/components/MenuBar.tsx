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
    ListItemIcon, Chip, Divider
} from "@mui/material";
import {encode} from "base64-arraybuffer";
import {Logout, Settings, AccountCircle, Discount, Article, Menu as MenuIcon} from "@mui/icons-material";


interface IMenuBarProps {
    title: string,
    login: boolean,
}

const MenuBar = (props: IMenuBarProps) => {
    const {title, login} = props;
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

    const logOut = () => {
        if (authData.token === "") {
            return;
        }

        axios.post('http://localhost:4941/api/v1/users/logout',
            {},
            {headers:{"X-Authorization":authData.token}})
            .then((response) => {
                clearAuth()
                navigate('/account')
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

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

    const [accountAnchorEl, setAccountAnchorEl] = React.useState<null | HTMLElement>(null);
    const openAccountMenu = Boolean(accountAnchorEl);
    const accountHandleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAccountAnchorEl(event.currentTarget);
    };
    const accountHandleClose = () => {
        setAccountAnchorEl(null);
    };

    const [navigationAnchorEl, setNavigationAnchorEl] = React.useState<null | HTMLElement>(null);
    const openNavigationMenu = Boolean(navigationAnchorEl);
    const navigationHandleClick = (event: React.MouseEvent<HTMLElement>) => {
        setNavigationAnchorEl(event.currentTarget);
    };
    const navigationHandleClose = () => {
        setNavigationAnchorEl(null);
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="sticky">
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2 }}
                        onClick={navigationHandleClick}
                    >
                        <MenuIcon />
                    </IconButton>
                    {/*{ auctions &&*/}
                    {/*    <Button*/}
                    {/*        color="inherit" variant="outlined"*/}
                    {/*        onClick={() => navigate('/auctions')}*/}
                    {/*    >*/}
                    {/*        Auctions*/}
                    {/*    </Button>*/}
                    {/*}*/}
                    <Typography variant="h5">
                        {title}
                    </Typography>
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
                                onClick={accountHandleClick}
                            />
                        )
                    }
                </Toolbar>
            </AppBar>

            {/* Account Menu */}
            <Menu
                anchorEl={accountAnchorEl}
                id="account-menu"
                open={openAccountMenu}
                onClose={accountHandleClose}
                onClick={accountHandleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem
                    onClick={() => {
                        const params = {sellerId: authData.userId}
                        navigate(axios.getUri({url: '/auctions', params}))
                    }}
                >
                    <ListItemIcon>
                        <Article fontSize="small" />
                    </ListItemIcon>
                    My Auctions
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        const params = {bidderId: authData.userId}
                        navigate(axios.getUri({url: '/auctions', params}))
                    }}
                >
                    <ListItemIcon>
                        <Discount fontSize="small" />
                    </ListItemIcon>
                    My Bids
                </MenuItem>
                <Divider variant="middle"/>
                <MenuItem
                    onClick={() => navigate('/account/details')}
                >
                    <ListItemIcon>
                        <AccountCircle fontSize="small" />
                    </ListItemIcon>
                    Profile
                </MenuItem>
                <MenuItem
                    onClick={logOut}
                >
                    <ListItemIcon>
                        <Logout fontSize="small" />
                    </ListItemIcon>
                    Logout
                </MenuItem>
            </Menu>

            {/* Navigation Menu*/}
            <Menu
                anchorEl={navigationAnchorEl}
                open={openNavigationMenu}
                onClose={navigationHandleClose}
                onClick={navigationHandleClose}
            >
                <MenuItem
                    onClick={() => navigate('/auctions')}
                >
                    Auctions
                </MenuItem>
                <Divider variant="middle"/>
                <MenuItem
                    disabled = {authData.token === ''}
                    onClick={() => navigate('/auctions/create')}
                >
                    Create Auction
                </MenuItem>
            </Menu>
        </Box>
    )
}

export default MenuBar;