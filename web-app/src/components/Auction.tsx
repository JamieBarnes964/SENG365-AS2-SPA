import React from "react";
import axios from "axios";
import {Link, useParams, useNavigate} from 'react-router-dom';
import {encode} from "base64-arraybuffer";
import {
    Button,
    Card,
    CardActions,
    CardContent,
    CardMedia,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    Paper,
    Box,
    Table,
    DialogTitle,
    IconButton,
    TextField,
    Typography,
    CardActionArea,
    TableBody,
    TableRow,
    Avatar,
    List,
    Chip,
    Grid,
    Container
} from "@mui/material";
import CSS from "csstype";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BidListObject  from "./BidListObject";
import MenuBar from "./MenuBar";

const Auction = () => {
    const {id} = useParams()
    const navigate = useNavigate()

    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")

    const [auction, setAuction] = React.useState<AuctionFull>({auctionId:0, sellerId:0} as AuctionFull)
    const [category, setCategory] = React.useState<string>("")
    const [bids, setBids] = React.useState<Bid[]>([])

    const [userImage, setUserImage] = React.useState<string>("");
    const [userImageType, setUserImageType] = React.useState<string>("");

    const [auctionImage, setAuctionImage] = React.useState<string>("");
    const [auctionImageType, setAuctionImageType] = React.useState<string>("");


    React.useEffect(() => {
        getAuctionDetails()
    }, [id, auction.auctionId])

    const getAuctionDetails = async () => {
        axios.get('http://localhost:4941/api/v1/auctions/' + id)
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setAuction(response.data)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            }).then(() => {
                getCategory()
                getBids()
                getAuctionImage()
                getUserImage()
            })
    }

    const getCategory = () => {
        axios.get('http://localhost:4941/api/v1/auctions/categories')
            .then((response) => {
                setErrorFlag(false);
                setErrorMessage("");
                for (let category of response.data as Category[]) {
                    if (category.categoryId === auction.categoryId) {setCategory(category.name); break;}
                }
            }, (error) => {
                setErrorFlag(true);
                setErrorMessage(error.toString());
            })
    }

    const getBids = () => {
        axios.get('http://localhost:4941/api/v1/auctions/' + id + '/bids')
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setBids(response.data)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

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
        axios.get('http://localhost:4941/api/v1/auctions/' + id + '/image', {responseType: "arraybuffer"})
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



    const bid_rows = () => bids.map((bid: Bid) => {
        return <BidListObject key={bid.bidderId.toString() + bid.amount.toString()} bid={bid} />
    })

    const endDate = () => {
        const date = new Date(auction.endDate);
        return `${date.toLocaleDateString('en-NZ', {
            weekday: 'short', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' , 
            hour: 'numeric', 
            minute: 'numeric'
        })}`;
    }


    const card: CSS.Properties = {
        padding: "10px",
        margin: "20px",
        display: "block",
        width: "fit-content"
    }


    return (
        <div>
            <MenuBar auctions={true} login={true} />
            <Grid container justifyContent="center">
                <Paper elevation={3}
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'left',
                        padding: "10px",
                        margin: "20px",
                        maxWidth: '1400px',
                        textOverflow: 'ellipsis'
                    }}
                >
                    <Box
                        sx={{
                            display: 'column',
                            flexDirection: { xs: 'column', md: 'row' },
                            alignItems: 'left',
                            m:'20px',
                        }}
                    >
                        <Typography variant={"h3"} align='left'>{auction.title}</Typography>
                        <Typography variant={"h4"} align='left'>{category}</Typography>
                        <div style={{ width: '100%', display:'inline-flex'}}>
                            <Box component="div" sx={{display:'inline-flex'}}>
                                <Avatar alt={auction.sellerFirstName + ' ' + auction.sellerLastName}
                                        src={`data:${userImageType};base64,${userImage}`}/>
                            </Box>
                            <Box component="div" sx={{display:'inline-flex', ml:'10px'}}>
                                <Typography variant="h6" align='center'>
                                    {auction.sellerFirstName + ' ' + auction.sellerLastName}
                                </Typography>
                            </Box>
                        </div>

                    </Box>

                    <Box sx={{
                        ml: "20px",
                        display: "block",
                        width: "fit-content"
                    }}>
                        <Chip icon={<AccessTimeIcon/>} label={endDate()}/>
                    </Box>


                    <Box
                        sx={{
                            display: 'inline-flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            alignItems: 'left',
                        }}
                    >
                        {/*<Box*/}
                        {/*    // elevation={5}*/}
                        {/*    component="img"*/}
                        {/*    sx={{*/}
                        {/*        // display: 'flex',*/}
                        {/*        // flexDirection: { xs: 'column', md: 'row' },*/}
                        {/*        alignItems: 'center',*/}
                        {/*        bgcolor: 'background.paper',*/}
                        {/*        m:'20px',*/}
                        {/*        // borderRadius: '12px',*/}
                        {/*        // width: { xs: '100%', md: '600px'},*/}
                        {/*        height: { xs: 'auto', md: '500px'},*/}
                        {/*        objectFit: 'hide',*/}
                        {/*    }}*/}

                        {/*    alt="Auction Image"*/}
                        {/*    src={`data:${auctionImageType};base64,${auctionImage}`}*/}
                        {/*/>*/}
                        <Card
                                sx={{
                                    // display: 'flex',
                                    // flexDirection: { xs: 'column', md: 'row' },
                                    alignItems: 'center',
                                    bgcolor: 'background.paper',
                                    m:'20px',
                                    // borderRadius: '12px',
                                    // width: { xs: '100%', md: '600px'},
                                    // height: { xs: 'auto', md: '500px'},
                                    maxHeight: { xs: 'auto', md: '500px'},
                                    objectFit: 'fill',
                                    flexGrow: 1
                                }}
                                object-fit='fill'
                        >
                            <CardMedia
                                component='img'
                                sx={{objectFit: 'fill'}}
                                src={`data:${auctionImageType};base64,${auctionImage}`}
                                object-fit='fill'
                            />
                        </Card>

                        <Paper elevation={5} sx={{
                            padding: "10px",
                            margin: "20px",
                            ml: { xs:'20px', md:'0px'},
                            display: "block",
                            // maxWidth: "100%",
                            width: { xs: 'auto', md: "300px"},
                            height: '500px',
                            maxHeight: "500px",
                            overflow:'auto'
                        }}>
                            <Typography variant="h5" align='left'>
                                {bids.length === 0 ? 'No Bids' : `${bids.length} Bid${bids.length === 1 ? '' : 's'}`}
                            </Typography>
                            <List>{bid_rows()}</List>
                        </Paper>
                    </Box>

                    <Paper elevation={3} sx={{
                        padding: "10px",
                        margin: "20px",
                        display: "block",
                        width: "auto",
                        height: "auto",
                    }}>
                        <Typography variant="h5" align='left'>Description</Typography>
                        <Typography variant='body1' align='left'>{auction.description}</Typography>
                    </Paper>

                </Paper>
            </Grid>
        </div>
    )
}

export default Auction;