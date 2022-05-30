import React from "react";
import axios from "axios";
import {Link, useParams, useNavigate} from 'react-router-dom';
import MenuBar from "./MenuBar";

import {
    Alert,
    Avatar,
    Button,
    Checkbox,
    Collapse, FormControlLabel,
    Grid,
    IconButton,
    InputAdornment,
    Paper, Snackbar,
    TextField,
    Typography
} from "@mui/material"
import {useAuthStore} from "../store";
import {decode, encode} from "base64-arraybuffer";
import {AddPhotoAlternate, Delete, Visibility, VisibilityOff} from "@mui/icons-material";
import {validate} from "email-validator";



interface userPostData {
    firstName?: string,
    lastName?: string,
    email?: string,
    currentPassword?: string,
    password?: string,
}

const AccountDetails = () => {
    const authData = useAuthStore(state => state.authData)
    const clearAuth = useAuthStore(state => state.clearAuth)
    const navigate = useNavigate();

    const [errorFlag, setErrorFlag] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const [snackOpen, setSnackOpen] = React.useState(false)
    const [snackMessage, setSnackMessage] = React.useState("")
    const handleSnackClose = (event?: React.SyntheticEvent | Event,
                              reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackOpen(false);
    };

    const [user, setUser] = React.useState<UserReturnWithEmail>({firstName:"", lastName:"", email:""});
    const [userImage, setUserImage] = React.useState<string>('');
    const [userImageType, setUserImageType] = React.useState<string>('');

    const [editDetailsCollapse, setEditDetailsCollapse] = React.useState(false);
    const handleEditDetailsSwitch = () => {
        setEditDetailsCollapse(!editDetailsCollapse)
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

    const [newPassword, setNewPassword] = React.useState("")
    const [showNewPassword, setShowNewPassword] = React.useState<boolean>(false)
    const [newPasswordError, setNewPasswordError] = React.useState(false)
    const [newPasswordMessage, setNewPasswordMessage] = React.useState("")
    const updateNewPasswordState = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewPassword(event.target.value)
    }
    const handleClickShowNewPassword = () => {
        setShowNewPassword(!showNewPassword);
    };
    const handleMouseDownNewPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const [currentPassword, setCurrentPassword] = React.useState("")
    const [showCurrentPassword, setShowCurrentPassword] = React.useState<boolean>(false)
    const [currentPasswordError, setCurrentPasswordError] = React.useState(false)
    const [currentPasswordMessage, setCurrentPasswordMessage] = React.useState("")
    const updateCurrentPasswordState = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentPassword(event.target.value)
    }
    const handleClickShowCurrentPassword = () => {
        setShowCurrentPassword(!showCurrentPassword);
    };
    const handleMouseDownCurrentPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const [removeCurrentImage, setRemoveCurrentImage] = React.useState<boolean>(false)
    const handleRemoveCurrentImage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRemoveCurrentImage(event.target.checked)
    }

    const [selectedFileData, setSelectedFileData] = React.useState<string>('')
    const [selectedFileType, setSelectedFileType] = React.useState<string>('')
    const removeSelectedFile = () => {
        setSelectedFileData('')
        setSelectedFileType('')
    }
    const updateSelectedFileState = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files != null) {
            const file = event.target.files[0]
            setSelectedFileType(file.type)

            let reader = new FileReader();
            reader.onload = function() {
                setSelectedFileData((reader.result as string).replace(RegExp(`^data:${file.type};base64,`), ''));
            }
            reader.readAsDataURL(event.target.files[0])
        }
    }





    React.useEffect(() => {
        if (authData.token === '') {
            navigate('/account')
            return;
        }
        getUser()
        getUserImage()
    }, [])

    const getUser = () => {
        axios.get(
            'http://localhost:4941/api/v1/users/' + authData.userId.toString(),
            {headers:{"X-Authorization":authData.token}}
        )
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
        axios.get(
            'http://localhost:4941/api/v1/users/' + authData.userId.toString() + '/image',
            {responseType: "arraybuffer", headers:{"X-Authorization":authData.token}}
            )
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setUserImage(encode(response.data))
                setUserImageType(response.headers["content-type"])
            }, (error) => {
                if (error.response.status != 404) {
                    setErrorFlag(true)
                    setErrorMessage(error.toString())
                } else {
                    setUserImage('')
                    setUserImageType('')
                }
            })
    }


    const updateUser = () => {
        let data: userPostData = {}
        let isError = false

        if (firstName.length !== 0) {
            data.firstName = firstName;
        }
        if (lastName.length !== 0) {
            data.lastName = lastName;
        }

        if (email.length !== 0) {
            data.email = email;
            if (!validate(email)) {
                isError = true;
                setEmailError(true)
                setEmailMessage("Please enter a valid email.")
            } else if (email === user.email) {
                isError = true;
                setEmailError(true)
                setEmailMessage("Please enter a new email or none at all if you don't wish to change it.")
            } else {
                setEmailError(false)
                setEmailMessage(" ")
            }
        } else {
            setEmailError(false)
            setEmailMessage(" ")
        }

        if (newPassword.length !== 0) {
            data.currentPassword = currentPassword;
            data.password = newPassword;
            if (newPassword.length < 6) {
                isError = true;
                setNewPasswordError(true)
                setNewPasswordMessage("Your new password must be at least 6 characters long.")
            } else {
                setNewPasswordError(false)
                setNewPasswordMessage(" ")
            }
            if (currentPassword.length === 0) {
                isError = true;
                setCurrentPasswordError(true)
                setCurrentPasswordMessage("You must enter your current password to change it.")
            } else {
                setCurrentPasswordError(false)
                setCurrentPasswordMessage(" ")
            }
        } else {
            setNewPasswordError(false)
            setNewPasswordMessage(" ")
            setCurrentPasswordError(false)
            setCurrentPasswordMessage(" ")
        }

        if (isError) {
            return;
        }

        axios.patch(
            'http://localhost:4941/api/v1/users/' + authData.userId,
            data,
            {headers:{"X-Authorization":authData.token}}
        )
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                if (removeCurrentImage) {
                    axios.delete('http://localhost:4941/api/v1/users/' + authData.userId + '/image',
                        {headers:{"X-Authorization":authData.token}})
                        .then((response) => {
                            setErrorFlag(false)
                            setErrorMessage("")
                            setSnackOpen(true)
                            setSnackMessage("Successfully updated details")
                            getUserImage()
                        }, (error) => {
                            setErrorFlag(true)
                            setErrorMessage(error.toString())

                            setSnackOpen(true)
                            setSnackMessage("Failed to update image: " + error.message)
                        })
                } else if (selectedFileData.length !== 0) {
                    axios.put('http://localhost:4941/api/v1/users/' + authData.userId + '/image',
                        decode(selectedFileData),
                        {headers:{
                                "X-Authorization":authData.token,
                                "Content-Type":selectedFileType
                            }})
                        .then((response) => {
                            setErrorFlag(false)
                            setErrorMessage("")
                            setSnackOpen(true)
                            setSnackMessage("Successfully updated details")
                            getUserImage()
                        }, (error) => {
                            setErrorFlag(true)
                            setErrorMessage(error.toString())

                            setSnackOpen(true)
                            setSnackMessage("Failed to update image: " + error.message)
                        })

                } else {
                    setSnackOpen(true)
                    setSnackMessage("Successfully updated details")
                }
                getUser()
            }, (error) => {
                if (error.response.status === 400) {
                    setCurrentPasswordError(true)
                    setCurrentPasswordMessage("The entered password is incorrect")
                } else if (error.response.status === 403) {
                    setEmailError(true)
                    setEmailMessage("Email is already in use")
                } else {
                    setErrorFlag(true)
                    setErrorMessage(error.toString())
                    setSnackOpen(true)
                    setSnackMessage("Failed to update details: " + error.message)
                }
            })
    }

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


    return (
        <div>
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
            <MenuBar title={'Account Details'} login={true}/>
            <Grid container justifyContent="center">
                <div  style={{display:'flex', flexDirection:'column'}}>
                    <Paper elevation={5}
                           sx={{
                               m:'20px',
                               mb:'0px',
                               p:'20px',
                               width:'500px',
                               display:'flex',
                               flexDirection:"column"
                           }}
                    >
                        <Typography variant="h5" align='left' sx={{mb:'20px'}}>Logged in as:</Typography>
                        <div style={{ width: '100%', display:'flex', flexDirection:'row'}}>
                            <Avatar alt={user.firstName + ' ' + user.lastName}
                                    sx={{height: '70px', width:'70px' }}
                                    src={`data:${userImageType};base64,${userImage}`}>{user.firstName[0]}{user.lastName[0]}</Avatar>
                            <div style={{display:'flex', flexDirection:'column', marginLeft:'20px'}}>
                                <Typography variant="h4">
                                    {user.firstName + ' ' + user.lastName}
                                </Typography>
                                <Typography variant="h6" align='left'>{user.email}</Typography>
                            </div>
                        </div>
                        <Button variant='contained' sx={{mt:'20px'}} onClick={handleEditDetailsSwitch}>Edit Account Details</Button>
                        <Button
                            variant="contained" color="error"
                            onClick={logOut} sx={{mt:'20px'}}
                        >Logout</Button>
                    </Paper>
                    <Collapse in={editDetailsCollapse}>
                        <Paper elevation={5}
                               sx={{
                                   m:'20px',
                                   mt:'10px',
                                   p:'20px',
                                   width:'500px',
                                   display:'flex',
                                   flexDirection:"column"
                               }}
                        >
                            <TextField
                                error={firstNameError}
                                id="firstNameInput"
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
                                id="lastNameInput"
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
                                id="emailInput"
                                type="email"
                                label="Email"
                                variant="outlined"
                                helperText={emailError ? emailMessage : " "}
                                value={email}
                                onChange={updateEmailState}
                                sx={{mb: "0px"}}
                            />
                            <TextField
                                error={currentPasswordError}
                                id="currentPasswordInput"
                                type={showCurrentPassword ? "text" : "password"}
                                label="Current Password"
                                variant="outlined"
                                helperText={currentPasswordError ? currentPasswordMessage : " "}
                                value={currentPassword}
                                onChange={updateCurrentPasswordState}
                                sx={{mb: "0px"}}
                                InputProps={{
                                    endAdornment:
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={handleClickShowCurrentPassword}
                                                onMouseDown={handleMouseDownCurrentPassword}
                                                edge="end"
                                            >
                                                {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                }}
                            />
                            <TextField
                                error={newPasswordError}
                                id="newPasswordInput"
                                type={showNewPassword ? "text" : "password"}
                                label="New Password"
                                variant="outlined"
                                helperText={newPasswordError ? newPasswordMessage : " "}
                                value={newPassword}
                                onChange={updateNewPasswordState}
                                sx={{mb: "0px"}}
                                InputProps={{
                                    endAdornment:
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={handleClickShowNewPassword}
                                                onMouseDown={handleMouseDownNewPassword}
                                                edge="end"
                                            >
                                                {showNewPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                }}
                            />

                            <div>
                                <FormControlLabel
                                    control={<Checkbox
                                        value={removeCurrentImage}
                                        onChange={handleRemoveCurrentImage}
                                    />}
                                    label="Remove Current Image"
                                    sx={{align:'center'}}
                                />
                            </div>

                            <div style={{display:'flex', flexDirection:'row'}}>
                                <Button variant='contained' component="label" sx={{m:'10px', width:'50%'}}
                                        disabled={removeCurrentImage}
                                >
                                    <AddPhotoAlternate />
                                    Set New Image
                                    <input
                                        type="file"
                                        accept="image/png, image/jpeg, image/gif"
                                        onChange={updateSelectedFileState}
                                        hidden
                                    />
                                </Button>
                                <Button variant='contained' sx={{m:'10px', width:'50%'}} color='error'
                                        onClick={removeSelectedFile}
                                        disabled={selectedFileData === '' || removeCurrentImage}
                                >
                                    <Delete />
                                    Remove Image
                                </Button>
                            </div>
                            { selectedFileData !== '' && !removeCurrentImage &&
                                <Paper
                                    elevation={4}
                                    component="img"
                                    sx={{
                                        alignItems: 'center',
                                        bgcolor: 'background.paper',
                                        mb:'20px',
                                    }}
                                    src={`data:${selectedFileType};base64,${selectedFileData}`}
                                />
                            }
                            <div style={{display:'flex', flexDirection:'row', marginTop:'30px'}}>
                                <Button
                                    variant="contained" color="inherit" sx={{mr:'10px', width:'50%'}}
                                    onClick={handleEditDetailsSwitch}
                                >Cancel</Button>
                                <Button
                                    variant="contained" color="primary" sx={{width:'50%'}}
                                    onClick={() => {
                                        updateUser()
                                    }}
                                >Update Details</Button>
                            </div>
                        </Paper>
                    </Collapse>
                </div>
            </Grid>
        </div>
    )
}

export default AccountDetails;