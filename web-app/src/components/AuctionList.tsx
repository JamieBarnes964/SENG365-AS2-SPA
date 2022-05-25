import axios from 'axios';
import React from "react";
import CSS from 'csstype';
import {Paper, AlertTitle, Alert} from "@mui/material";
import AuctionListObject from "./AuctionListObject";

const AuctionList = () => {
    const [errorFlag, setErrorFlag] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");

    const [auctions, setAuctions] = React.useState<Array<AuctionFull>>([]);
    const [auctionCount, setAuctionCount] = React.useState<Number>(0);
    const [categories, setCategories] = React.useState<{[id: number] : string}>({});

    React.useEffect(() => {
        getAuctions();
    }, []);

    const getCategories = () => {
        axios.get('http://localhost:4941/api/v1/auctions/categories')
            .then((response) => {
                setErrorFlag(false);
                setErrorMessage("");
                setCategories(Object.assign({}, ...response.data.map((x: Category) => ({[x.categoryId]: x.name}))));
            }, (error) => {
                setErrorFlag(true);
                setErrorMessage(error.toString());
            })
    }

    const getAuctions = () => {
        axios.get('http://localhost:4941/api/v1/auctions')
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
            auction.categoryName = categories[auction.categoryId];
            return <AuctionListObject key={auction.auctionId} auction={auction}/>
        }
    )

    const card: CSS.Properties = {
        padding: "10px",
        margin: "20px",
        display: "block",
        width: "fit-content"
    }

    return (
        <Paper elevation={3} style={card}>
            {/*<h1>Auctions: {auctionCount}</h1>*/}
            <div style={{display:"inline", maxWidth:"965px", minWidth:"320"}}>
                {errorFlag?
                    <Alert severity="error">
                        <AlertTitle>Error</AlertTitle>
                        {errorMessage}
                    </Alert>
                    :""}
                {auction_rows()}
            </div>
        </Paper>
    )
}

export default AuctionList;