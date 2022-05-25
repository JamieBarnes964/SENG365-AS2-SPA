type Auction = {
    auctionId: number,
    title: string,
    categoryId: number,
    sellerId: number,
    sellerFirstName: string,
    sellerLastName: string,
    reserve: number,
    numBids: number,
    highestBid: number,
    endDate: string,
}

type AuctionFull = {
    categoryName: string,
    image: any,
    description: string,
} & Auction

type AuctionList = {
    auctions: Auction[],
    count: number,
}

type Category = {
    categoryId: number,
    name: string,
}

type Bid = {
    bidderId: number,
    amount: number,
    firstName: string
    lastName: string,
    timestamp: string
}