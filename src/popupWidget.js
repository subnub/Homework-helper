class PopupWidget {

    apiTitle;
    settingsButton;

    constructor() {

        this.apiTitle = document.getElementById("popup__widget__api");
        this.settingsButton = document.getElementById("popup__widget__button");

        this.setListeners();
        this.setAPIKeyStatus();
    }

    setListeners = () => {

        this.settingsButton.addEventListener("click", () => {
            chrome.tabs.create({'url': "./src/options.html" } )
        })

    }

    setAPIKeyStatus = () => {

        const hasAPIKey = window.localStorage.getItem("homework-helper-api-key");

        if (hasAPIKey) {

            this.apiTitle.textContent = "API Key Set!"

        } else {

            this.apiTitle.textContent = "No API Key! Go To Settings"
        }
    }
}

const popupWidget = new PopupWidget();
popupWidget;