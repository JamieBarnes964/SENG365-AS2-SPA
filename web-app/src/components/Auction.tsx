import React from "react";
import axios from "axios";
import {Link, useParams, useNavigate, useSearchParams} from 'react-router-dom';
import {decode, encode} from "base64-arraybuffer";
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
    Container,
    InputAdornment,
    Alert,
    Snackbar,
    AlertColor,
    Collapse,
    FormControl,
    InputLabel,
    Select,
    FormHelperText,
    SelectChangeEvent, MenuItem
} from "@mui/material";
import CSS from "csstype";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BidListObject  from "./BidListObject";
import MenuBar from "./MenuBar";
import {useAuthStore} from "../store";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFns";
import {DateTimePicker} from "@mui/x-date-pickers";
import {Delete} from "@mui/icons-material";



interface AuctionPatchData {
    title?: string,
    description?: string,
    categoryId?: number,
    endDate?: string,
    reserve?: number,
}

const Auction = () => {
    const {id} = useParams()
    const authData = useAuthStore(state => state.authData)
    const navigate = useNavigate()

    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")

    const [auction, setAuction] = React.useState<AuctionFull>({auctionId:0, sellerId:0, highestBid:1} as AuctionFull)
    const [category, setCategory] = React.useState<string>("")
    const [bids, setBids] = React.useState<Bid[]>([])

    const [userImage, setUserImage] = React.useState<string>("");
    const [userImageType, setUserImageType] = React.useState<string>("");

    const [auctionImage, setAuctionImage] = React.useState<string>("");
    const [auctionImageType, setAuctionImageType] = React.useState<string>("");



    const [bidValue, setBidValue] = React.useState<string>(bids.length === 0 ? '1' : (auction.highestBid + 1).toString())
    const [bidValueErr, setBidValueErr] = React.useState<boolean>(false)
    const [bidValueErrMsg, setBidValueErrMsg] = React.useState<string>(' ')
    const updateBidValueState = (event: React.ChangeEvent<HTMLInputElement>) => {
        const minVal = bids.length === 0 ? 1 : auction.highestBid + 1;
        if (parseInt(event.target.value) < minVal) {
            setBidValue(minVal.toString())
        } else {
            setBidValue(parseInt(event.target.value).toString())
        }
    }


    const [categories, setCategories] = React.useState<Category[]>([]);

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

    const [newTitle, setNewTitle] = React.useState<string>('')
    const [newTitleErr, setNewTitleErr] = React.useState<boolean>(false)
    const [newTitleErrMsg, setNewTitleErrMsg] = React.useState<string>(' ')
    const updateNewTitleState = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewTitle(event.target.value)
    }

    const [newCategory, setNewCategory] = React.useState<string>('')
    const [newCategoryErr, setNewCategoryErr] = React.useState<boolean>(false)
    const [newCategoryErrMsg, setNewCategoryErrMsg] = React.useState<string>(' ')
    const updateNewCategoryState = (event: SelectChangeEvent) => {
        setNewCategory(event.target.value as string)
    }

    const [newDescription, setNewDescription] = React.useState<string>('')
    const [newDescriptionErr, setNewDescriptionErr] = React.useState<boolean>(false)
    const [newDescriptionErrMsg, setNewDescriptionErrMsg] = React.useState<string>(' ')
    const updateNewDescriptionState = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewDescription(event.target.value)
    }

    const [newEndDate, setNewEndDate] = React.useState<Date | null>(new Date(Date.now() + 86400000))
    const [newEndDateErr, setNewEndDateErr] = React.useState<boolean>(false)
    const [newEndDateErrMsg, setNewEndDateErrMsg] = React.useState<string>(' ')

    const [newImageErr, setNewImageErr] = React.useState<boolean>(false)
    const [newImageErrMsg, setNewImageErrMsg] = React.useState<string>(' ')

    const [newReserve, setNewReserve] = React.useState<string>('')
    const [newReserveErr, setNewReserveErr] = React.useState<boolean>(false)
    const [newReserveErrMsg, setNewReserveErrMsg] = React.useState<string>(' ')
    const updateNewReserveState = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewReserve(event.target.value)
    }


    React.useEffect(() => {
        getAuctionDetails()
        getCategories()
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

    const getCategories = () => {
        axios.get('http://localhost:4941/api/v1/auctions/categories')
            .then((response) => {
                setErrorFlag(false);
                setErrorMessage("");
                setCategories(response.data);
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

    const categorySelectList = () => categories.map((category: Category) => {
        return <MenuItem key={category.categoryId + category.name} value={category.categoryId}>{category.name}</MenuItem>
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

    const placeBid = () => {
        if (Date.parse(auction.endDate) < Date.now()) {
            setBidValueErr(true)
            setBidValueErrMsg('You cannot place a bid on a finished auction.')
        } else if (authData.token === '') {
            setBidValueErr(true)
            setBidValueErrMsg('You must be logged in to place a bid.')
        } else if (authData.userId === auction.sellerId) {
            setBidValueErr(true)
            setBidValueErrMsg('You cannot place a bid on your own auction.')
        } else if (bids.length !== 0 && parseInt(bidValue) <= (auction.highestBid)) {
            setBidValueErr(true)
            setBidValueErrMsg('Please place a bid larger than the current highest bid.')
        } else if (parseInt(bidValue) <= 1) {
            setBidValueErr(true)
            setBidValueErrMsg('Please place a bid larger or equal to $1.')
        } else if (parseInt(bidValue) !== parseFloat(bidValue)) {
            setBidValueErr(true)
            setBidValueErrMsg('Please place a bid that is a whole number of dollars (e.g. not $10.50).')
        } else {
            setBidValueErr(false)
            setBidValueErrMsg(' ')
        }

        if (bidValueErr) {
            setOpenBidDialog(true)
            return;
        }

        axios.post(
            'http://localhost:4941/api/v1/auctions/' + id + '/bids',
            {"amount":parseInt(bidValue)},
            {headers:{"X-Authorization":authData.token}}
        )
            .then((response) => {
                setSnackSeverity("success")
                setSnackMessage(`Successfully placed bid of $${bidValue} on ${auction.title}`)
                setSnackOpen(true)
                getAuctionDetails()
            }, (error) => {
                setSnackSeverity("error")
                setSnackMessage("Failed to place bid: " + error.toString())
                setSnackOpen(true)
            })
    }


    const updateAuction = () => {
        let data: AuctionPatchData = {};
        let isError = false;

        if (newTitle.length !== 0) {
            data.title = newTitle
        }
        if (newDescription.length !== 0) {
            data.description = newDescription
        }

        if (newCategory !== '') {
            data.categoryId = parseInt(newCategory)
        }

        if (newReserve != '') {
            data.reserve = parseInt(newReserve)
            if (parseFloat(newReserve) < 1) {
                isError = true;
                setNewReserveErr(true)
                setNewReserveErrMsg("The reserve price must be at least $1.")
            } else {
                setNewReserveErr(false)
                setNewReserveErrMsg(" ")
            }
        } else {
            setNewReserveErr(false)
            setNewReserveErrMsg(" ")
        }

        if (newEndDate !== null) {
            if (newEndDate.getTime() !== Date.parse(auction.endDate)) {
                data.endDate = `${newEndDate.getFullYear()}-${newEndDate.getMonth() + 1}-${newEndDate.getDate()} ${newEndDate.getHours()}:${newEndDate.getMinutes()}:${newEndDate.getSeconds()}`
                if (newEndDate.getTime() < Date.now()) {
                    isError = true;
                    setNewEndDateErr(true)
                    setNewEndDateErrMsg("Please provide a date in the future")
                } else {
                    setNewEndDateErr(false)
                    setNewEndDateErrMsg(" ")
                }
            } else {
                setNewEndDateErr(false)
                setNewEndDateErrMsg(" ")
            }
        } else {
            setNewEndDateErr(false)
            setNewEndDateErrMsg(" ")
        }

        if (isError || authData.token === '' || bids.length !== 0) {
            return;
        }

        axios.patch(
            'http://localhost:4941/api/v1/auctions/' + auction.auctionId,
            data,
            {headers:{"X-Authorization":authData.token}}
        )
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage('')
                // TODO asahfksdgksgd
                if (selectedFileData !== '') {
                    axios.put('http://localhost:4941/api/v1/auctions/' + auction.auctionId.toString() + '/image',
                        decode(selectedFileData),
                        {headers:{
                                "X-Authorization":authData.token,
                                "Content-Type":selectedFileType
                            }}
                    )
                        .then((response) => {
                            setErrorFlag(false)
                            setErrorMessage("")
                            setSnackOpen(true)
                            setSnackMessage("Successfully updated the auction")
                            getAuctionDetails()
                            handleEditDetailsSwitch()
                        }, (error) => {
                            setErrorFlag(true)
                            setErrorMessage(error.toString())
                            setSnackOpen(true)
                            setSnackMessage("Failed to update details: " + error.message)
                        })
                } else {
                    setSnackOpen(true)
                    setSnackMessage("Successfully updated the auction")
                    getAuctionDetails()
                    handleEditDetailsSwitch()
                }
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
                setSnackOpen(true)
                setSnackMessage("Failed to update details: " + error.message)
            })
    }


    const deleteAuction = () => {
        if (auction.numBids !== 0) {
            return;
        }

        axios.delete(
            'http://localhost:4941/api/v1/auctions/' + auction.auctionId,
            {headers:{"X-Authorization":authData.token}}
        )
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setSnackOpen(true)
                setSnackMessage("Successfully deleted auction.")
                navigate('/auctions')
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
                setSnackOpen(true)
                setSnackMessage("Failed to delete auction: " + error.message)
            })
    }



    const [openBidDialog, setOpenBidDialog] = React.useState<boolean>(false);
    const handleOpenBidDialog = () => {
        setBidValue(bids.length === 0 ? '1' : (auction.highestBid + 1).toString())
        setOpenBidDialog(true)
    }
    const handleCloseBidDialog = () => {
        setOpenBidDialog(false)
    }

    const [openConfirmBidDialog, setOpenConfirmBidDialog] = React.useState<boolean>(false);
    const handleOpenConfirmBidDialog = () => {
        setOpenConfirmBidDialog(true)
    }
    const handleCloseConfirmBidDialog = () => {
        setOpenConfirmBidDialog(false)
    }

    const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = React.useState<boolean>(false);
    const handleOpenConfirmDeleteDialog = () => {
        setOpenConfirmDeleteDialog(true)
    }
    const handleCloseConfirmDeleteDialog = () => {
        setOpenConfirmDeleteDialog(false)
    }

    const [editDetailsCollapse, setEditDetailsCollapse] = React.useState(false);
    const handleEditDetailsSwitch = () => {
        setNewEndDate(new Date(Date.parse(auction.endDate)))
        setEditDetailsCollapse(!editDetailsCollapse)
    }

    const [snackOpen, setSnackOpen] = React.useState(false)
    const [snackMessage, setSnackMessage] = React.useState("")
    const [snackSeverity, setSnackSeverity] = React.useState<AlertColor>("success")
    const handleSnackClose = (event?: React.SyntheticEvent | Event,
                              reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackOpen(false);
    };


    return (
        <div>
            <Snackbar
                autoHideDuration={6000}
                open={snackOpen}
                onClose={handleSnackClose}
                key={snackMessage}>
                <Alert onClose={handleSnackClose} severity={snackSeverity} sx={{
                    width: '100%' }}>
                    {snackMessage}
                </Alert>
            </Snackbar>
            <MenuBar title="Auctions" login={true} />
            <Grid container justifyContent="center">
                <div style={{display:'flex', flexDirection:'column'}}>
                    <Paper elevation={3}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'left',
                            padding: "10px",
                            margin: "20px",
                            mb:'0px',
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
                                        maxHeight: { xs: 'auto', md: '520px'},
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
                                display: "flex",
                                flexDirection: "column",
                                // maxWidth: "100%",
                                width: { xs: 'auto', md: "300px"},
                                height: '500px',
                                maxHeight: "500px"
                            }}>
                                <Typography variant="h5" align='left'>Reserve: ${auction.reserve}</Typography>
                                <Typography variant="h6" align='left'>
                                    {bids.length === 0 ? 'No Bids' : `${bids.length} Bid${bids.length === 1 ? '' : 's'}`}
                                </Typography>
                                <List sx={{overflow: 'auto'}}>{bid_rows()}</List>
                                <Box sx={{ flexGrow: 1 }}/>

                                <Button
                                    variant='contained'
                                    disabled={
                                        authData.token === "" || authData.userId === auction.sellerId ||
                                        Date.parse(auction.endDate) <= Date.now()
                                    }
                                    sx={{mt:'10px'}}
                                    onClick={handleOpenBidDialog}
                                >
                                    { Date.parse(auction.endDate) <= Date.now() ?
                                        "Auction Closed"
                                        :
                                        authData.token === "" ?
                                            "You must be registered to bid"
                                            :
                                            authData.userId === auction.sellerId ?
                                                "Can't place bid on own auction"
                                                :
                                                "Place Bid"
                                    }
                                </Button>
                                <Dialog open={openBidDialog} onClose={handleCloseBidDialog} maxWidth='xs' fullWidth>
                                    <DialogTitle>Place Bid</DialogTitle>
                                    <DialogContent>
                                        <DialogContentText>
                                            { bids.length === 0 ?
                                                "Place the first bid (min: $1)"
                                                :
                                                `Place a bid larger than the current highest bid.`
                                            }
                                        </DialogContentText>
                                        { bids.length !== 0 &&
                                            <Typography variant="h6">Current Highest Bid: ${auction.highestBid}</Typography>
                                        }
                                        <TextField
                                            autoFocus
                                            margin="dense"
                                            label="Your Bid"
                                            type="number"
                                            variant="filled"
                                            fullWidth
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start">$</InputAdornment>
                                            }}
                                            error={bidValueErr}
                                            helperText={bidValueErrMsg}
                                            value={bidValue}
                                            onChange={updateBidValueState}
                                        />
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={handleCloseBidDialog}>Cancel</Button>
                                        <Button
                                            onClick={() => {
                                                handleCloseBidDialog()
                                                handleOpenConfirmBidDialog()
                                            }}
                                            variant='contained'>Place Bid</Button>
                                    </DialogActions>
                                </Dialog>
                                <Dialog open={openConfirmBidDialog} onClose={handleCloseConfirmBidDialog} maxWidth='xs' fullWidth>
                                    <DialogTitle>Confirm Bid</DialogTitle>
                                    <DialogContent>
                                        <DialogContentText>
                                            Are you sure you want to bid on <strong>{auction.title}</strong> {}
                                            with a bid of <strong>${bidValue}?</strong>
                                        </DialogContentText>
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={handleCloseConfirmBidDialog}>Cancel</Button>
                                        <Button
                                            onClick={() => {
                                                handleCloseConfirmBidDialog()
                                                placeBid()
                                            }}
                                            variant='contained'>Place Bid</Button>
                                    </DialogActions>
                                </Dialog>
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

                        <div style={{display:'flex', flexDirection:'row'}}>
                            <Button variant={'contained'} sx={{m:'10px'}}
                                    onClick={() => {
                                        const params = {categoryIds: auction.categoryId}
                                        navigate(axios.getUri({url: '/auctions', params}))
                                    }}
                            >Similar Auctions</Button>
                            <Button variant={'contained'} sx={{m:'10px'}}
                                    onClick={() => {
                                        const params = {sellerId: auction.sellerId}
                                        navigate(axios.getUri({url: '/auctions', params}))
                                    }}
                            >Seller's Other Auctions</Button>
                        </div>

                        { authData.userId === auction.sellerId &&
                            <div style={{display:'flex', flexDirection:'row'}}>
                                <Button variant='contained' color='error' sx={{m:'10px', mr:'20px'}}
                                        onClick={handleOpenConfirmDeleteDialog}
                                        disabled={auction.numBids !== 0}
                                >
                                    <Delete/>
                                    Delete Auction
                                </Button>
                                <Box sx={{ flexGrow: 1 }}/>
                                <Button variant='contained' color='inherit' sx={{m:'10px', mr:'20px'}}
                                        onClick={handleEditDetailsSwitch}
                                        disabled={auction.numBids !== 0}
                                >
                                    Edit Details
                                </Button>
                            </div>
                        }


                    </Paper>
                    <Collapse in={editDetailsCollapse}>
                        <Paper elevation={3} sx={{
                            padding: "20px",
                            margin: "20px",
                            mt:'10px',
                            display: "flex",
                            flexDirection:'column',
                            width: "auto",
                            height: "auto",
                        }}>
                            <TextField
                                error={newTitleErr}
                                label="Title"
                                type="text"
                                helperText={newTitleErr ? newTitleErrMsg : ' '}
                                sx={{mb: "10px"}}
                                value={newTitle}
                                onChange={updateNewTitleState}
                            />

                            <FormControl error={newCategoryErr}>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    value={newCategory}
                                    onChange={updateNewCategoryState}
                                    label="Category"
                                >
                                    <MenuItem value="">
                                        <em>Cancel</em>
                                    </MenuItem>
                                    {categorySelectList()}
                                </Select>
                                <FormHelperText>{newCategoryErr ? newCategoryErrMsg : ' '}</FormHelperText>
                            </FormControl>

                            <TextField
                                error={newDescriptionErr}
                                label="Description"
                                multiline
                                type="text"
                                helperText={newDescriptionErr ? newDescriptionErrMsg : ' '}
                                sx={{mb: "10px"}}
                                value={newDescription}
                                onChange={updateNewDescriptionState}
                            />

                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DateTimePicker
                                    disablePast
                                    renderInput={(props) =>
                                        <TextField {...props}
                                                   error={newEndDateErr}
                                                   helperText={newEndDateErr ? newEndDateErrMsg : ' '}
                                                   sx={{mb:'10px'}}
                                        />}
                                    label="End Date"
                                    value={newEndDate}
                                    onChange={(newValue) => {
                                        setNewEndDate(newValue);
                                    }}
                                    minDateTime={new Date()}

                                />
                            </LocalizationProvider>

                            <div style={{display:'flex', flexDirection:'row'}}>
                                <Button
                                    variant="contained"
                                    component="label"
                                    sx={{width:'50%'}}
                                >
                                    Select Auction Image
                                    <input
                                        type="file"
                                        accept="image/png, image/jpeg, image/gif"
                                        onChange={updateSelectedFileState}
                                        hidden
                                    />
                                </Button>
                                <Button variant='contained' sx={{ml:'10px', width:'50%'}} color='error'
                                        onClick={removeSelectedFile}
                                        disabled={selectedFileData === ''}
                                >
                                    <Delete />
                                    Remove Image
                                </Button>
                            </div>
                            <Typography variant="subtitle2" align="left" color="error" sx={{mb:'20px'}}>
                                {newImageErr ? newImageErrMsg : ' '}
                            </Typography>

                            { selectedFileData !== '' &&
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

                            <TextField
                                label="Reserve Price"
                                type="number"
                                error={newReserveErr}
                                helperText={newReserveErr ? newReserveErrMsg : ' '}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                                }}
                                sx={{mb: "10px"}}
                                value={newReserve}
                                onChange={updateNewReserveState}
                            />

                            <div style={{display:'flex', flexDirection:'row', marginTop:'30px'}}>
                                <Button
                                    variant="contained" color="inherit" sx={{mr:'10px', width:'50%'}}
                                    onClick={handleEditDetailsSwitch}
                                >Cancel</Button>
                                <Button
                                    variant="contained" color="primary" sx={{width:'50%'}}
                                    onClick={() => {
                                        updateAuction()
                                    }}
                                >Update Details</Button>
                            </div>
                        </Paper>
                    </Collapse>
                </div>
            </Grid>
            <Dialog
                open={openConfirmDeleteDialog}
                onClose={handleCloseConfirmDeleteDialog}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete auction <strong>{auction.title}</strong>?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirmDeleteDialog}>
                        Cancel
                    </Button>
                    <Button variant='contained' color='error'
                            onClick={() => {
                                handleCloseConfirmDeleteDialog()
                                deleteAuction()
                            }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default Auction;