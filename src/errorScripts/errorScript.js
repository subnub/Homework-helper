class ErrorScrips {

    googleErrorOptionButton;

    constructor() {

        this.googleErrorOptionButton = document.getElementById("google__error_button");

        this.setListeners();
    }

    setListeners = () => {
        
        if (this.googleErrorOptionButton) {

            console.log("setting click listener")

            this.googleErrorOptionButton.addEventListener("click", () => {

                console.log("clicked")
                chrome.tabs.create({'url': "./src/options.html" } )
            })
        }
    }
}

const errorScrips = new ErrorScrips();
errorScrips