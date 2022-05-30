import React from "react";
import axios from "axios";
import {Link, useNavigate} from 'react-router-dom'
import {Button, Card, CardActions, CardContent, CardMedia, Dialog,
    DialogActions, DialogContent, DialogContentText,
    DialogTitle, IconButton, TextField, Typography, CardActionArea} from "@mui/material";
import {encode} from "base64-arraybuffer";
import CSS from 'csstype';

interface IAuctionProps {
    auction: AuctionFull
}

const AuctionListObject = (props: IAuctionProps) => {
    const navigate = useNavigate();

    const [auction] = React.useState<AuctionFull>(props.auction);

    const [userImage, setUserImage] = React.useState<any>();
    const [userImageType, setUserImageType] = React.useState<string>("");

    const [auctionImage, setAuctionImage] = React.useState<any>();
    const [auctionImageType, setAuctionImageType] = React.useState<string>("");

    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")



    React.useEffect(() => {
        // getUserImage();
        getAuctionImage();
    }, []);


    const getUserImage = () => {
        axios.get('http://localhost:4941/api/v1/users/' + auction.sellerId.toString() + '/image', {responseType: "arraybuffer"})
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

    const getAuctionImage = () => {
        axios.get('http://localhost:4941/api/v1/auctions/' + auction.auctionId.toString() + '/image', {responseType: "arraybuffer"})
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setAuctionImage(encode(response.data))
                setAuctionImageType(response.headers["content-type"])
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }


    const auctionCardStyles: CSS.Properties = {
        // display: "block",
        maxHeight: "400px",
        width: "auto",
        // minWidth: "1000px",
        margin: "10px",
        padding: "0px"
    }

    return (
        <Card sx={auctionCardStyles}>
            <CardActionArea onClick={() => navigate('/auctions/' + auction.auctionId.toString())}>
                <CardMedia
                    component="img"
                    height="200"
                    width="200"
                    sx={{objectFit:"cover"}}
                    // image="https://atasouthport.com/wp-content/uploads/2017/04/default-image.jpg"
                    src={`data:${auctionImageType};base64,${auctionImage}`}
                    alt="Auction hero image"
                />
                <CardContent>
                    <Typography variant={"h5"}>
                        {auction.title}
                    </Typography>
                    <Typography variant={"subtitle1"}>
                        {auction.categoryName}
                    </Typography>
                    <Typography variant={"subtitle1"}>
                        {auction.sellerFirstName} {auction.sellerLastName}
                    </Typography>
                    <Typography variant={"subtitle1"}>
                        {"Reserve: $" + auction.reserve}
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    )
}

export default AuctionListObject;