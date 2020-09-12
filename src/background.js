'use strict';

class SearchItem {

    title;
    subtitle;
    link;
    percentage;
    answer;

    constructor(title, subtitle, link, percentage, answer) {

        this.title = title;
        this.subtitle = subtitle;
        this.link = link;
        this.percentage = percentage;
        this.answer = answer;
    }
}

class ErrorHandler {

    openedWindow;

    constructor() {

        this.openedWindow = undefined;

    }

    throwGoogleSearchError = async() => {

        this.openedWindow = window.open("./src/errorScripts/googleError.html", "extension_popup", "width=500,height=400,status=no,scrollbars=yes,resizable=no");
    }

    throwGenericError = () => {

        this.openedWindow = window.open("./src/errorScripts/genericError.html", "extension_popup", "width=500,height=400,status=no,scrollbars=yes,resizable=no");
    }

    throwNoResultsError = () => {

        this.openedWindow = window.open("./src/errorScripts/googleSearchError.html", "extension_popup", "width=500,height=400,status=no,scrollbars=yes,resizable=no");
    }

}

const errorHandler = new ErrorHandler();


class Background {

    baseURL;
    cx;
    openedWindow;
    loadingWindow;


    constructor() {

        this.cx = "&cx=005006614289244563594:ae6w7u9hamc&q=";
        this.baseURL = `https://www.googleapis.com/customsearch/v1?`;
        
        this.openedWindow = undefined;
        
        this.loadingWindow = undefined;

        this.setListeners();
    }

    getFormattedAPIKey = () => {

        let apiKey = localStorage.getItem("homework-helper-api-key") || "no-key";
        apiKey = `key=${apiKey}`

        return apiKey;
    }

    getListLimitSize = () => {

        let currentListSize = window.localStorage.getItem("homework-helper-list-size") || 5;
        
        currentListSize = +currentListSize;

        return currentListSize;
    }

    generateMatchTotal = (snippet, searchQuery) => {

        const snippetSplit = snippet.split(" ");
        const searchSplit = searchQuery.split(" ");
        let totalMatches = 0;

        // if (snippet.replace(/\s+/g, '').toLowerCase().includes(searchQuery.replace(/\s+/g, '').toLowerCase())) {

        //     return 100;
        // }

        if (snippet.toLowerCase().replace(/[^a-zA-Z0-9]/g, '').includes(searchQuery.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''))) {

            return 100;
        }

        searchSplit.forEach((currentSearchSplit) => {

            if (snippetSplit.includes(currentSearchSplit)) {

                totalMatches += 1;
            }
        })

        return Math.floor((totalMatches / snippetSplit.length) * 100);

    }

    generateSearchObjects = (searchItems, searchQuery) => {

        let filteredSearchList = [];

        // console.log("search items", searchItems)

        searchItems.forEach((currentSearchItem) => {

            const currentSnippet = currentSearchItem.snippet

            const percentageMatch = this.generateMatchTotal(currentSnippet, searchQuery);

            const searchObject = new SearchItem(currentSearchItem.title, currentSearchItem.snippet, currentSearchItem.link, percentageMatch);

            filteredSearchList.push(searchObject);
        })

        filteredSearchList.sort((a, b) => (a.percentage < b.percentage) ? 1 : -1);

        const currentLimit = this.getListLimitSize();

        if (filteredSearchList.length > currentLimit) {

            filteredSearchList = filteredSearchList.slice(0, currentLimit);
        }

        return filteredSearchList;
    }

    setListeners = () => {
        
        chrome.contextMenus.create({
            "title": "Quote Search Homework Helper",
            "contexts": ["page", "selection", "image", "link"],
            "onclick" : this.rightClickEventQuote
        })
        
        chrome.contextMenus.create({
            "title": "Search Homework Helper",
            "contexts": ["page", "selection", "image", "link"],
            "onclick" : this.rightClickEvent
        })
    } 

    getQuizletAnswers = async(filteredList, searchQuery) => {

        let newFilteredList = [];

        console.log("get quizlet answers", filteredList.length)

        console.log('filtered list', filteredList);

        for (let i = 0; i < filteredList.length; i++) {

            const filteredItem = filteredList[i];

            const quizletPage = filteredItem.link;
            const currentSubtitle = filteredItem.subtitle;
            const quizletHTML = await this.getQuizletPage(quizletPage);

            if (!quizletHTML) continue;
    
            let parser = new DOMParser();
            let htmlDoc = parser.parseFromString(quizletHTML, 'text/html')
    
            let allDocuments = htmlDoc.getElementsByClassName("SetPageTerm-content");
    
            console.log("search", searchQuery.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''))

            for (let i = 0; i < allDocuments.length; i++) {
    
                const currentDocument = allDocuments[i];
    
                const termDoc = currentDocument.getElementsByClassName("SetPageTerm-wordText")[0].text;

                console.log(termDoc.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''))

                if (termDoc.toLowerCase().replace(/[^a-zA-Z0-9]/g, '').includes(searchQuery.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''))) {
    
                    //searchQuery.replace(/\s+/g, '').toLowerCase().includes(termDoc.replace(/\s+/g, '').toLowerCase())

                    if (currentDocument.getElementsByClassName("SetPageTerm-definitionText") 
                        && currentDocument.getElementsByClassName("SetPageTerm-definitionText"[0]) 
                        && currentDocument.getElementsByClassName("SetPageTerm-definitionText")[0].text) {
                        
                        const defDoc = currentDocument.getElementsByClassName("SetPageTerm-definitionText")[0].text;

                        filteredItem.answer = defDoc;

                        newFilteredList.push(filteredItem);

                        break;
                    }
                }
            }
        }

        console.log("filter length", newFilteredList)
        
        return newFilteredList;
    }

    rightClickEventQuote = async(e) => {

        console.log("right click event quote");
        
        const searchQuery =  e.selectionText;
        
        this.loadingWindow = window.open("./src/errorScripts/loadingPage.html", "extension_popup", "width=500,height=400,status=no,scrollbars=yes,resizable=no")

        // const searchQuery =  e.selectionText;

        const searchItems = await this.getSearchItems(searchQuery, true);

        const filteredList = this.generateSearchObjects(searchItems, searchQuery);

        const completeList = await this.getQuizletAnswers(filteredList, searchQuery);

        window.localStorage.setItem("hw-helper-data", JSON.stringify(completeList));

        this.loadingWindow.location.href = './src/popup.html'
    }

    rightClickEvent = async(e) => {

        console.log("right click event");

        const searchQuery =  e.selectionText;

        this.loadingWindow = window.open("./src/errorScripts/loadingPage.html", "extension_popup", "width=500,height=400,status=no,scrollbars=yes,resizable=no")        

        const searchItems = await this.getSearchItems(searchQuery);

        const filteredList = this.generateSearchObjects(searchItems, searchQuery);

        const completeList = await this.getQuizletAnswers(filteredList, searchQuery);

        window.localStorage.setItem("hw-helper-data", JSON.stringify(completeList));
        
        this.loadingWindow.location.href = './src/popup.html'
    }

    getQuizletPage = (url) => {

        return new Promise((resolve, reject) => {

            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {

                    if (xhr.status === 200) {

                        const response = xhr.responseText;

                        resolve(response);

                    } else {

                        console.log("xhr quizlet error!");
                        //errorHandler.throwGenericError();
                        resolve()
                    }
                } 
            }
            xhr.send();
        })

    }

    getSearchItems = (searchQuery, quoteSearch=false) => {

        const fixedSearchQuery = quoteSearch ? `"${searchQuery}" site:quizlet.com` : searchQuery;

        const fullURL = this.baseURL + this.getFormattedAPIKey() + this.cx + fixedSearchQuery;

        console.log("full url", fullURL);

        return new Promise((resolve, reject) => {

            var xhr = new XMLHttpRequest();
            xhr.open("GET", fullURL, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {

                    if (xhr.status === 200) {

                        try {

                            const searchJSON = JSON.parse(xhr.responseText)

                            const searchItems = searchJSON.items;

                            if (!searchItems) {

                                errorHandler.throwNoResultsError();
                                
                            } else {

                                resolve(searchItems);
                            }
                        } catch(e) {
                            console.log("JSON parse error!", e)
                            errorHandler.throwGoogleSearchError();
                        }

                    } else {
                        console.log("xhr error!")
                        errorHandler.throwGoogleSearchError();
                    }    
                }
            }
            xhr.send();
        })
    }
}

const background = new Background();
background;