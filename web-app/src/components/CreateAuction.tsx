import React from "react";
import axios from "axios";
import {Link, useParams, useNavigate} from 'react-router-dom';
import MenuBar from "./MenuBar";
import {
    Box,
    Button,
    Grid,
    Paper,
    TextField,
    Typography,
    InputAdornment,
    FormControl,
    InputLabel,
    Select, MenuItem, FormHelperText, SelectChangeEvent
} from "@mui/material";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {DateTimePicker} from "@mui/x-date-pickers";

import {decode} from "base64-arraybuffer";

import {useAuthStore} from "../store";


interface auctionPostData {
    title: string,
    description: string,
    categoryId: number,
    endDate: string,
    reserve?: number,
}

const CreateAuction = () => {

    const authData = useAuthStore(state => state.authData)
    const navigate = useNavigate();

    const [errorFlag, setErrorFlag] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");

    const [categories, setCategories] = React.useState<Category[]>([]);

    const [selectedFileData, setSelectedFileData] = React.useState<string>('')
    const [selectedFileType, setSelectedFileType] = React.useState<string>('')
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

    const [title, setTitle] = React.useState<string>('')
    const [titleErr, setTitleErr] = React.useState<boolean>(false)
    const [titleErrMsg, setTitleErrMsg] = React.useState<string>(' ')
    const updateTitleState = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(event.target.value)
    }

    const [category, setCategory] = React.useState<string>('')
    const [categoryErr, setCategoryErr] = React.useState<boolean>(false)
    const [categoryErrMsg, setCategoryErrMsg] = React.useState<string>(' ')
    const updateCategoryState = (event: SelectChangeEvent) => {
        setCategory(event.target.value as string)
    }

    const [description, setDescription] = React.useState<string>('')
    const [descriptionErr, setDescriptionErr] = React.useState<boolean>(false)
    const [descriptionErrMsg, setDescriptionErrMsg] = React.useState<string>(' ')
    const updateDescriptionState = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDescription(event.target.value)
    }

    const [endDate, setEndDate] = React.useState<Date | null>(new Date(Date.now() + 86400000))
    const [endDateErr, setEndDateErr] = React.useState<boolean>(false)
    const [endDateErrMsg, setEndDateErrMsg] = React.useState<string>(' ')

    const [imageErr, setImageErr] = React.useState<boolean>(false)
    const [imageErrMsg, setImageErrMsg] = React.useState<string>(' ')

    const [reserve, setReserve] = React.useState<string>('')
    const [reserveErr, setReserveErr] = React.useState<boolean>(false)
    const [reserveErrMsg, setReserveErrMsg] = React.useState<string>(' ')
    const updateReserveState = (event: React.ChangeEvent<HTMLInputElement>) => {
        setReserve(event.target.value)
    }


    React.useEffect(() => {
        if (authData.token === '') {
            navigate('/account')
        }
        getCategories()
    }, [])

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


    const categorySelectList = () => categories.map((category: Category) => {
        return <MenuItem key={category.categoryId + category.name} value={category.categoryId}>{category.name}</MenuItem>
    })



    const createAuction = () => {
        if (title.length === 0) {
            setTitleErr(true)
            setTitleErrMsg('Please provide a title.')
        } else {
            setTitleErr(false)
            setTitleErrMsg(' ')
        }
        if (category.length === 0) {
            setCategoryErr(true)
            setCategoryErrMsg('Please select a category.')
        } else {
            setCategoryErr(false)
            setCategoryErrMsg(' ')
        }
        if (description.length === 0) {
            setDescriptionErr(true)
            setDescriptionErrMsg('Please provide a description.')
        } else {
            setDescriptionErr(false)
            setDescriptionErrMsg(' ')
        }
        if (selectedFileData.length === 0 || selectedFileType !in ['image/png', 'image/jpeg', 'image/gif']) {
            setImageErr(true)
            setImageErrMsg('Please provide an image of type JPEG, PNG, or GIF.')
        } else {
            setImageErr(false)
            setImageErrMsg(' ')
        }
        if (endDate === null || endDate.getTime() < Date.now()) {
            setEndDateErr(true)
            setEndDateErrMsg('Please provide a date in the future.')
        } else {
            setEndDateErr(false)
            setEndDateErrMsg(' ')
        }
        if (reserve != '' && parseFloat(reserve) < 1) {
            setReserveErr(true)
            setReserveErrMsg('The reserve price must be at least $1.')
        } else {
            setReserveErr(false)
            setReserveErrMsg(' ')
        }

        if (!(titleErr || categoryErr || descriptionErr || imageErr || endDateErr || reserveErr || endDate === null)) {
            let data: auctionPostData = {
                title: title,
                description: description,
                categoryId: parseInt(category),
                // endDate: endDate.toLocaleString('en-NZ', { hour12: false, calendar: 'iso8601' }).replace(/\//g, '-').replace(/,/, ''),
                endDate: `${endDate.getFullYear()}-${endDate.getMonth() + 1}-${endDate.getDate()} ${endDate.getHours()}:${endDate.getMinutes()}:${endDate.getSeconds()}`
            }

            if (reserve != '') {
                data.reserve = parseFloat(reserve)
            }

            axios.post(
                    'http://localhost:4941/api/v1/auctions',
                    data,
                {headers:{"X-Authorization":authData.token}}
                )
                .then((response) => {
                    setErrorFlag(false)
                    setErrorMessage("")
                    axios.put('http://localhost:4941/api/v1/auctions/' + response.data.auctionId.toString() + '/image',
                        decode(selectedFileData),
                        {headers:{
                                "X-Authorization":authData.token,
                                "Content-Type":selectedFileType
                            }}
                        )
                        .then(() => navigate('/auctions/' + response.data.auctionId.toString()))

                })
                .then(() => {

                })
        }
    }


    return (
        <div style={{display:"flex", flexDirection:"column"}}>



            <MenuBar title="Create Auction" login={true}/>

            <Grid container justifyContent="center">
                <Paper elevation={5}
                       sx={{
                           m:'20px',
                           p:'20px',
                           width:'500px',
                           display:'flex',
                           flexDirection:"column"
                       }}
                >
                    <TextField
                        error={titleErr}
                        label="Title"
                        type="text"
                        helperText={titleErr ? titleErrMsg : ' '}
                        sx={{mb: "10px"}}
                        value={title}
                        onChange={updateTitleState}
                    />

                    <FormControl error={categoryErr}>
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={category}
                            onChange={updateCategoryState}
                            label="Category"
                        >
                            {categorySelectList()}
                        </Select>
                        <FormHelperText>{categoryErr ? categoryErrMsg : ' '}</FormHelperText>
                    </FormControl>

                    <TextField
                        error={descriptionErr}
                        label="Description"
                        multiline
                        type="text"
                        helperText={descriptionErr ? descriptionErrMsg : ' '}
                        sx={{mb: "10px"}}
                        value={description}
                        onChange={updateDescriptionState}
                    />

                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DateTimePicker
                            disablePast
                            renderInput={(props) =>
                                <TextField {...props}
                                    error={endDateErr}
                                    helperText={endDateErr ? endDateErrMsg : ' '}
                                    sx={{mb:'10px'}}
                                />}
                            label="End Date"
                            value={endDate}
                            onChange={(newValue) => {
                                setEndDate(newValue);
                            }}
                            // onChange={handleValueChange('endDate')}
                            minDateTime={new Date()}

                        />
                    </LocalizationProvider>

                    <Button
                        variant="contained"
                        component="label"
                    >
                        Select Auction Image
                        <input
                            type="file"
                            accept="image/png, image/jpeg, image/gif"
                            onChange={updateSelectedFileState}
                            hidden
                        />
                    </Button>
                    <Typography variant="subtitle2" align="left" color="error" sx={{mb:'20px'}}>
                        {imageErr ? imageErrMsg : ' '}
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
                        label="Reserve Price (Optional)"
                        type="number"
                        error={reserveErr}
                        helperText={reserveErr ? reserveErrMsg : ' '}
                        InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>
                        }}
                        sx={{mb: "10px"}}
                        value={reserve}
                        onChange={updateReserveState}
                    />

                    <Button variant="contained" onClick={createAuction}>Create Auction</Button>

                </Paper>
            </Grid>
        </div>
    )
}

export default CreateAuction;