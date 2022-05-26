import React from "react";
import axios from "axios";
import {Link, useNavigate} from 'react-router-dom'
import {
    Button, Card, CardActions, CardContent, CardMedia, Dialog,
    DialogActions, DialogContent, DialogContentText,
    DialogTitle, IconButton, TextField, Typography, CardActionArea, ListItem, Avatar, ListItemAvatar, ListItemText
} from "@mui/material";
import {encode} from "base64-arraybuffer";
import CSS from 'csstype';

interface IBidProps {
    bid: Bid
}

const BidListObject = (props: IBidProps) => {
    const [bid] = React.useState<Bid>(props.bid);

    const [user, setUser] = React.useState<UserReturnWithEmail>({firstName:"", lastName:"", email:""});
    const [userImage, setUserImage] = React.useState<string>('');
    const [userImageType, setUserImageType] = React.useState<string>('');

    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")

    React.useEffect(() => {
        getUser();
        getUserImage();
    }, []);

    const getUser = () => {
        axios.get('http://localhost:4941/api/v1/users/' + bid.bidderId.toString())
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
        axios.get('http://localhost:4941/api/v1/users/' + bid.bidderId.toString() + '/image', {responseType: "arraybuffer"})
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setUserImage(encode(response.data))
                setUserImageType(response.headers["content-type"])
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }



    return (
        <ListItem alignItems="flex-start" >
            <ListItemAvatar>
                <Avatar alt={user.firstName + ' ' + user.lastName}
                        src={`data:${userImageType};base64,${userImage}`}/>
            </ListItemAvatar>
            <ListItemText
                sx={{textOverflow: 'ellipsis', multiline:'false'}}
                primary={'$' + bid.amount.toString()}
                secondary={user.firstName + ' ' + user.lastName}
            />
        </ListItem>
    )
}

export default BidListObject;