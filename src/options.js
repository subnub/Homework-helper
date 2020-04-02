'use strict';

class Options {

    titleAPI;
    inputAPI;
    formAPI;
    getAPIButton;
    optionsSelect;

    constructor() {

        this.titleAPI = document.getElementById("options__api__title");
        this.inputAPI = document.getElementById("options__input");
        this.formAPI = document.getElementById("options__form");
        this.getAPIButton = document.getElementById("options_get__button")
        this.optionsSelect = document.getElementById("options__select");

        this.setListneners();
        this.setSavedAPIKey();
        this.setSavedOptionsValue();
    }

    submitAPIKey = (e) => {

        e.preventDefault();

        const newAPIKey = this.inputAPI.value;

        window.localStorage.setItem("homework-helper-api-key", newAPIKey);

        this.inputAPI.value = "";

        this.setSavedAPIKey();
    }

    getAPIKeyEvent = (e) => {

        chrome.tabs.create({'url': "https://developers.google.com/custom-search/v1/overview"} )
    }

    setListneners = () => {

        this.formAPI.addEventListener("submit", this.submitAPIKey);

        this.getAPIButton.addEventListener("click", this.getAPIKeyEvent);

        this.optionsSelect.addEventListener("change", this.submitOptionsValue);
    }

    setSavedOptionsValue = () => {

        let currentOptionsValue = window.localStorage.getItem("homework-helper-list-size") || "5";
        currentOptionsValue = currentOptionsValue.toString();
        this.optionsSelect.value = currentOptionsValue;
    }

    setSavedAPIKey = () => {

        const currentAPIKey = window.localStorage.getItem("homework-helper-api-key");

        if (!currentAPIKey || currentAPIKey.length === 0) {

            this.titleAPI.textContent = "No API Key";
    
        } else {

            this.titleAPI.textContent = `Current API Key: ${currentAPIKey}`
        }
    }

    submitOptionsValue = () => {

        const currentOptionsSize = +this.optionsSelect.value;

        window.localStorage.setItem("homework-helper-list-size", currentOptionsSize);
    }
}

const options = new Options();
options;