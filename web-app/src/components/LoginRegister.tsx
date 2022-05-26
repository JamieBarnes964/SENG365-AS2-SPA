import axios from 'axios';
import React from "react";
import CSS from 'csstype';
import {
    Paper,
    AlertTitle,
    Alert,
    Grid,
    Box,
    Typography,
    Tabs,
    Tab,
    TextField,
    Button,
    Snackbar,
    Avatar
} from "@mui/material";
import {useNavigate} from "react-router-dom";
import {validate} from "email-validator";
import {useAuthStore} from "../store";
import MenuBar from "./MenuBar";
import {encode} from "base64-arraybuffer";


interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}




const LoginRegister = () => {
    const navigate = useNavigate();
    const authData = useAuthStore(state => state.authData)
    const setAuth = useAuthStore(state => state.setAuth)
    const clearAuth = useAuthStore(state => state.clearAuth)



    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")


    const [user, setUser] = React.useState<UserReturnWithEmail>({firstName:"", lastName:"", email:""});
    const [userImage, setUserImage] = React.useState<string>('');
    const [userImageType, setUserImageType] = React.useState<string>('');

    React.useEffect(() => {
        if (authData.token != "") {
            getUser();
            getUserImage();
        }
    }, [authData])

    const getUser = () => {
        axios.get('http://localhost:4941/api/v1/users/' + authData.userId.toString())
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setUser(response.data)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
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



    // Input
    const [firstName, setFirstName] = React.useState("")
    const [firstNameError, setFirstNameError] = React.useState(false)
    const [firstNameMessage, setFirstNameMessage] = React.useState("")
    const updateFirstNameState = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFirstName(event.target.value)
    }

    const [lastName, setLastName] = React.useState("")
    const [lastNameError, setLastNameError] = React.useState(false)
    const [lastNameMessage, setLastNameMessage] = React.useState("")
    const updateLastNameState = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLastName(event.target.value)
    }

    const [email, setEmail] = React.useState("")
    const [emailError, setEmailError] = React.useState(false)
    const [emailMessage, setEmailMessage] = React.useState("")
    const updateEmailState = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value)
    }

    const [password, setPassword] = React.useState("")
    const [passwordError, setPasswordError] = React.useState(false)
    const [passwordMessage, setPasswordMessage] = React.useState("")
    const updatePasswordState = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value)
    }


    const [snackOpen, setSnackOpen] = React.useState(false)
    const [snackMessage, setSnackMessage] = React.useState("")
    const handleSnackClose = (event?: React.SyntheticEvent | Event,
                              reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackOpen(false);
    };



    const register = () => {
        if (firstName.length === 0) {
            setFirstNameError(true)
            setFirstNameMessage("Please enter a first name.")
        } else {
            setFirstNameError(false)
            setFirstNameMessage("")
        }

        if (lastName.length === 0) {
            setLastNameError(true)
            setLastNameMessage("Please enter a last name.")
        } else {
            setLastNameError(false)
            setLastNameMessage("")
        }

        if (email.length === 0) {
            setEmailError(true)
            setEmailMessage("Please enter a email.")
        } else if (!validate(email)) {
            setEmailError(true)
            setEmailMessage("Please enter a valid email.")
        } else {
            setEmailError(false)
            setEmailMessage("")
        }

        if (password.length < 6) {
            setPasswordError(true)
            setPasswordMessage("Your password must be at least 6 characters long.")
        } else {
            setPasswordError(false)
            setPasswordMessage("")
        }

        if (!(firstNameError || lastNameError || emailError || passwordError)) {
            axios.post(
                'http://localhost:4941/api/v1/users/register',
                {
                    "firstName": firstName,
                    "lastName": lastName,
                    "email": email,
                    "password": password
                })
                .then((response) => {
                    setErrorFlag(false)
                    setErrorMessage("")
                    login()
                }, (error) => {
                    if (error.response.status === 403) {
                        setEmailError(true)
                        setEmailMessage("Email already in use")
                    } else {
                        setErrorFlag(true)
                        setErrorMessage(error.response.statusText)
                    }
                })
        }
    }



    const login = () => {
        if (email.length === 0) {
            setEmailError(true)
            setEmailMessage("Please enter a email.")
        } else {
            setEmailError(false)
            setEmailMessage("")
        }

        if (password.length < 6) {
            setPasswordError(true)
            setPasswordMessage("Your password must be at least 6 characters long.")
        } else {
            setPasswordError(false)
            setPasswordMessage("")
        }

        if (!(emailError || passwordError)) {
            axios.post(
                'http://localhost:4941/api/v1/users/login',
                {
                    "email":email,
                    "password":password
                }) // TODO figure out getting values
                .then((response) => {
                    setErrorFlag(false)
                    setErrorMessage("")
                    setAuth(response.data)

                    setSnackMessage(response.data.token) // TODO remove this
                    setSnackOpen(true)
                }, (error) => {
                    if (error.response.status === 400) {
                        setEmailError(true)
                        setEmailMessage("Email or Password not correct")
                        setPasswordError(true)
                        setPasswordMessage(" ")
                    } else {
                        setErrorFlag(true)
                        setErrorMessage(error.toString())
                    }

                })
        }
    }


    const [activeTab, setActiveTab] = React.useState(0);
    const updateActiveTabState = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };




    return (
        <div>
            {errorFlag && <Alert severity="error">
                <AlertTitle>Error</AlertTitle>
                {errorMessage}
            </Alert>}
            <Snackbar
                autoHideDuration={6000}
                open={snackOpen}
                onClose={handleSnackClose}
                key={snackMessage}>
                <Alert onClose={handleSnackClose} severity="success" sx={{
                    width: '100%' }}>
                    {snackMessage}
                </Alert>
            </Snackbar>

            <MenuBar auctions={true} login={false} />

            <Grid container justifyContent="center">
                <Paper elevation={5}
                   sx={{
                       m:'20px',
                       width:'500px'
                   }}
                >
                    { authData.token === "" ?
                        <div>
                            <Box>
                                <Tabs value={activeTab} onChange={updateActiveTabState} aria-label="basic tabs example"
                                      centered>
                                    <Tab label="Login" {...a11yProps(0)} />
                                    <Tab label="Register" {...a11yProps(1)} />
                                </Tabs>
                            </Box>
                            <TabPanel index={0} value={activeTab}>
                                <Box sx={{display: "flex", flexDirection: "column"}}>
                                    <TextField
                                        error={emailError}
                                        id="loginEmailInput"
                                        type="email"
                                        label="Email"
                                        variant="outlined"
                                        helperText={emailError ? emailMessage : " "}
                                        value={email}
                                        onChange={updateEmailState}
                                        sx={{mb: "0px"}}/>
                                    <TextField
                                        error={passwordError}
                                        id="loginPasswordInput"
                                        type="password"
                                        label="Password"
                                        variant="outlined"
                                        helperText={passwordError ? passwordMessage : " "}
                                        value={password}
                                        onChange={updatePasswordState}
                                        sx={{mb: "0px"}}/>
                                    <Button
                                        variant="contained" color="primary"
                                        onClick={login}
                                    >Log In</Button>
                                    <Button
                                        variant="text" color="primary"
                                        onClick={() => {
                                            setActiveTab(1)
                                        }}
                                    >Don't have an account?</Button>
                                </Box>
                            </TabPanel>
                            <TabPanel index={1} value={activeTab}>
                                <Box sx={{display: "flex", flexDirection: "column"}}>
                                    <TextField
                                        error={firstNameError}
                                        id="registerFirstNameInput"
                                        type="text"
                                        label="First Name"
                                        variant="outlined"
                                        helperText={firstNameError ? firstNameMessage : " "}
                                        value={firstName}
                                        onChange={updateFirstNameState}
                                        sx={{mb: "0px"}}
                                    />
                                    <TextField
                                        error={lastNameError}
                                        id="registerLastNameInput"
                                        type="text"
                                        label="Last Name"
                                        variant="outlined"
                                        helperText={lastNameError ? lastNameMessage : " "}
                                        value={lastName}
                                        onChange={updateLastNameState}
                                        sx={{mb: "0px"}}
                                    />
                                    <TextField
                                        error={emailError}
                                        id="registerEmailInput"
                                        type="email"
                                        label="Email"
                                        variant="outlined"
                                        helperText={emailError ? emailMessage : " "}
                                        value={email}
                                        onChange={updateEmailState}
                                        sx={{mb: "0px"}}
                                    />
                                    <TextField
                                        error={passwordError}
                                        id="registerPasswordInput"
                                        type="password"
                                        label="Password"
                                        variant="outlined"
                                        helperText={passwordError ? passwordMessage : " "}
                                        value={password}
                                        onChange={updatePasswordState}
                                        sx={{mb: "0px"}}
                                    />
                                    <Button
                                        variant="contained" color="primary"
                                        onClick={register}
                                    >Register</Button>
                                    <Button
                                        variant="text" color="primary"
                                        onClick={() => {
                                            setActiveTab(0)
                                        }}
                                    >Already have an account?</Button>
                                </Box>
                            </TabPanel>
                        </div>
                        :
                        <Box sx={{display: "flex", flexDirection: "column", p:'20px'}}>
                            <Typography variant="h5" align='left' sx={{mb:'20px'}}>Logged in as:</Typography>
                            <div style={{ width: '100%', display:'inline-flex' }}>
                                    <Avatar alt={user.firstName + ' ' + user.lastName}
                                            src={`data:${userImageType};base64,${userImage}`}/>
                                    <Typography variant="h4" align='center' sx={{ml:'20px'}}>
                                        {user.firstName + ' ' + user.lastName}
                                    </Typography>
                            </div>
                            <Button
                                variant="contained" color="primary"
                                onClick={() => navigate('/account/profile')} sx={{mt:'20px'}}
                            >Profile</Button>
                            <Button
                                variant="contained" color="error"
                                onClick={clearAuth} sx={{mt:'20px'}}
                            >Logout</Button>
                        </Box>
                    }
                </Paper>
            </Grid>
        </div>
    )
}

export default LoginRegister;