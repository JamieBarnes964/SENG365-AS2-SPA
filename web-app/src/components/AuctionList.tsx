import axios from 'axios';
import React from "react";
import {Link, useParams, useNavigate, useSearchParams} from 'react-router-dom';
import CSS from 'csstype';
import {
    Paper,
    AlertTitle,
    Alert,
    Toolbar,
    Typography,
    TextField,
    InputLabel,
    Select,
    FormHelperText,
    FormControl,
    SelectChangeEvent,
    MenuItem,
    FormGroup,
    FormControlLabel,
    Checkbox,
    FormLabel,
    Button,
    Box
} from "@mui/material";
import AuctionListObject from "./AuctionListObject";
import MenuBar from "./MenuBar";



interface searchParams {
    q?: string,
    categoryIds?: number[],
    sellerId?: number,
    bidderId?: number,
    sortBy?: string,
    status?: string,
}

interface SortOption {
    title: string,
    value: string,
}

const sortValues: SortOption[] = [
    {title:'Closing Soon', value:'CLOSING_SOON'},
    {title:'Closing Latest', value:'CLOSING_LAST'},
    {title:'Alphabetical Asc', value:'ALPHABETICAL_ASC'},
    {title:'Alphabetical Desc', value:'ALPHABETICAL_DESC'},
    {title:'Current Bid Asc', value:'BIDS_ASC'},
    {title:'Current Bid Desc', value:'BIDS_DESC'},
    {title:'Reserve Asc', value:'RESERVE_ASC'},
    {title:'Reserve Desc', value:'RESERVE_DESC'},
]


const AuctionList = () => {
    const [errorFlag, setErrorFlag] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [auctions, setAuctions] = React.useState<Array<AuctionFull>>([]);
    const [auctionCount, setAuctionCount] = React.useState<Number>(0);
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [categoriesDict, setCategoriesDict] = React.useState<{[id: number] : string}>({});

    const [searchQuery, setSearchQuery] = React.useState<string>('')
    const updateSearchQueryState = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value)
    }

    const [category, setCategory] = React.useState<string[]>([])
    const [categoryErr, setCategoryErr] = React.useState<boolean>(false)
    const [categoryErrMsg, setCategoryErrMsg] = React.useState<string>(' ')
    const updateCategoryState = (event: SelectChangeEvent<string[]>) => {
        const {
            target: { value },
        } = event;

        setCategory(
            typeof value === 'string' ? value.split(',') : value
        )
    }

    const [sortBy, setSortBy] = React.useState<string>(sortValues[0].value)
    const [sortByErr, setSortByErr] = React.useState<boolean>(false)
    const [sortByErrMsg, setSortByErrMsg] = React.useState<string>(' ')
    const updateSortByState = (event: SelectChangeEvent) => {
        setSortBy(event.target.value as string)
    }

    const [openAuctions, setOpenAuctions] = React.useState(true)
    const handleOpenAuctions = (event: React.ChangeEvent<HTMLInputElement>) => {
        setOpenAuctions(event.target.checked)
    }
    const [closedAuctions, setClosedAuctions] = React.useState(true)
    const handleClosedAuctions = (event: React.ChangeEvent<HTMLInputElement>) => {
        setClosedAuctions(event.target.checked)
    }

    React.useEffect(() => {
        getAuctions();
    }, [searchParams]);

    const getCategories = () => {
        axios.get('http://localhost:4941/api/v1/auctions/categories')
            .then((response) => {
                setErrorFlag(false);
                setErrorMessage("");
                setCategories(response.data)
                setCategoriesDict(Object.assign({}, ...response.data.map((x: Category) => ({[x.categoryId]: x.name}))));
            }, (error) => {
                setErrorFlag(true);
                setErrorMessage(error.toString());
            })
    }

    const categorySelectList = () => categories.map((category: Category) => {
        return <MenuItem key={category.categoryId + category.name} value={category.categoryId}>{category.name}</MenuItem>
    })

    const getAuctions = () => {
        axios.get('http://localhost:4941/api/v1/auctions',
            {params: searchParams}
        )
            .then((response) => {
                setErrorFlag(false);
                setErrorMessage("");
                setAuctions(response.data.auctions);
                setAuctionCount(response.data.count);
            }, (error) => {
                setErrorFlag(true);
                setErrorMessage(error.toString());
            })
            .then(getCategories)
    };

    const auction_rows = () => auctions.map((auction: AuctionFull) => {
            // console.log(categories[auction.categoryId], auction.categoryId)
            auction.categoryName = categoriesDict[auction.categoryId];
            return <AuctionListObject key={auction.auctionId} auction={auction}/>
        }
    )

    const searchAuctions = () => {
        const params: searchParams = {}

        if (category.length !== 0) {
            params.categoryIds = category.map((id: string) => parseInt(id))
        }

        params.sortBy = sortBy

        if (openAuctions && closedAuctions) {params.status = 'ANY'}
        else if (openAuctions) {params.status = 'OPEN'}
        else if (closedAuctions) {params.status = 'CLOSED'}
        else {params.status = 'ANY'}

        if (searchQuery.length !== 0) {
            params.q = searchQuery
        }

        navigate(axios.getUri({url: '/auctions', params}))
    }

    const card: CSS.Properties = {
        padding: "10px",
        margin: "20px",
        display: "flex",
        flexDirection:"column",
        width: "auto"
    }

    return (
        <div>
            <MenuBar title="Auctions" login={true} />
            <Paper elevation={3}
                   sx={{m:'20px', p:'20px', display:'flex', flexDirection:'column'}}
            >
                <Typography variant="h5">
                    Search
                </Typography>

                <TextField label="Search"
                           value={searchQuery}
                           onChange={updateSearchQueryState}
                />
                <div style={{display:'flex', flexDirection:'row'}}>
                    <FormControl error={categoryErr} sx={{width:'1'}}>
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={category}
                            onChange={updateCategoryState}
                            label="Category"
                            multiple
                        >
                            {categorySelectList()}
                        </Select>
                        <FormHelperText>{categoryErr ? categoryErrMsg : ' '}</FormHelperText>
                    </FormControl>
                    <FormControl sx={{width:'1'}}>
                        <InputLabel>Sort</InputLabel>
                        <Select
                            value={sortBy}
                            onChange={updateSortByState}
                            label="Sort By"
                        >
                            {sortValues.map((option: SortOption) => <MenuItem key={option.value} value={option.value}>{option.title}</MenuItem>)}
                        </Select>
                        <FormHelperText>{categoryErr ? categoryErrMsg : ' '}</FormHelperText>
                    </FormControl>
                </div>
                <div style={{display:'flex', flexDirection:'row'}}>
                    <FormGroup sx={{display:'flex', flexDirection:'row'}}>
                        <FormControlLabel control={<Checkbox
                            defaultChecked
                            value={openAuctions}
                            onChange={handleOpenAuctions}
                        />} label="Open" />
                        <FormControlLabel control={<Checkbox
                            defaultChecked
                            value={closedAuctions}
                            onChange={handleClosedAuctions}
                        />} label="Closed" />
                    </FormGroup>

                    <Box sx={{ flexGrow: 1 }}/>

                    <Button variant='contained'
                            onClick={searchAuctions}
                    >Search</Button>
                </div>

            </Paper>
            <Paper elevation={3} style={card}>
                {/*<h1>Auctions: {auctionCount}</h1>*/}
                <div style={{display:"flex", flexDirection:"column"}}>
                    {errorFlag?
                        <Alert severity="error">
                            <AlertTitle>Error</AlertTitle>
                            {errorMessage}
                        </Alert>
                        :""}
                    {auction_rows()}
                </div>
            </Paper>
        </div>
    )
}

export default AuctionList;