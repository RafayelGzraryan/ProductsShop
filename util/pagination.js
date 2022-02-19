exports.ITEM_PER_PAGE = 2;

exports.pageNumbersArray = (pageNumber, totalPages) => {
    const pageArray = [];
    if(totalPages <= 3 || pageNumber < 3) {
        for(let i= 0; i < totalPages && i < 3; i++) {
            pageArray[i] = i + 1;
        }
    } else {
        const lastPageCorrector = (pageNumber >= totalPages) ? -1: 0;
        pageArray[0] = pageNumber + lastPageCorrector - 1;
        pageArray[1] = pageNumber + lastPageCorrector;
        pageArray[2] = pageNumber + lastPageCorrector + 1;
    }
    return pageArray
};

