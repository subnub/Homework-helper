'use strict';

class Popup {

    rawList;
    cardList;

    constructor() {

        this.rawList = window.localStorage.getItem("hw-helper-data");
        this.cardList = JSON.parse(this.rawList);

        this.generateCards();
    }

    generateCards = () => {

        this.cardList.forEach((item) => {
           
            const cardTemplate = document.getElementsByTagName("template")[0];
            const cardClone = cardTemplate.content.cloneNode(true);
    
            cardClone.getElementById("item__title").textContent = `Match: ${item.percentage}%`;
            cardClone.getElementById("item__body").textContent = item.answer;

            cardClone.answer = item.answer;
            cardClone.link = item.link;

            cardClone.getElementById("item__image").addEventListener("click", async() => {
                
                const itemAnswer = cardClone.answer;

                await navigator.clipboard.writeText(itemAnswer);

                console.log("answer copied");

            })

            cardClone.getElementById("item__image2").addEventListener("click", () => {
                console.log("click2");

                const itemLink = cardClone.link;

                console.log("card clone", this.link, cardClone.link);

                chrome.tabs.create({'url': itemLink } )
            })
    
            document.getElementById("box-div").appendChild(cardClone);
        })
    }
}

const popup = new Popup();
popup;