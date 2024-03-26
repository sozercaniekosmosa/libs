element('popup-message', function () {
    // style
    // language=CSS
    this.setStyle(`
        @keyframes slide-up {
            0% {
                transform: translateY(100%);
            }
            100% {
                transform: translateY(0);
            }
        }

        popup-message {
            position: fixed;
            top: 1em;
            right: 20px;
            background: #ffd8af;
            padding: 10px;
            border: 1px solid #b9b9b9;
            border-radius: 5px;
            display: none;
            animation: slide-up 0.3s ease;
            font-weight: bold;
            color: #4f4c62;
        }
    `);

    //behavior
    this.someMethod = () => true;

    this.onConnected = () => {
        //language=JSX
        // this.jsx = `<div class="popup-message" _message></div>`;

    };

    window.xlog = this.log = (message, timeout = 3000) => {
        this.textContent = message;
        this.style.display = 'block';

        setTimeout(() => this.style.display = 'none', timeout);
    }
});