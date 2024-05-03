element('popup-message', function () {
    // style
    // language=CSS
    this.setStyle(`
        @keyframes slide-up {
            0% {
                transform: translateY(0px);
            }
            100% {
                transform: translateY(100px);
            }
        }

        .popup-message__error {
            background: #d30047;
            color: white;
        }

        .popup-message__warning {
            background: #ffc400;
            color: black;
        }

        popup-message {
            position: fixed;
            top: 1em;
            right: 20px;
            background: #cbf0ff;
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
    this.onConnected = () => {
        //language=JSX
        // this.jsx = `<div class="popup-message" _message></div>`;

    };

    window.xlog = this.log = (message, timeout = 3000) => {
        this.textContent = message;
        this.style.display = 'block';
        this.style.backgroundColor = '#cbf0ff';
        this.style.color = 'black';

        setTimeout(() => this.style.display = 'none', timeout);
    }
    window.xwarn = this.warn = (message, timeout = 3000) => {
        this.textContent = message;
        this.style.display = 'block';
        this.style.backgroundColor = '#ffc400';
        this.style.color = 'black';

        setTimeout(() => this.style.display = 'none', timeout);
    }
    window.xerr = this.err = (message, timeout = 3000) => {
        this.textContent = message;
        this.style.display = 'block';
        this.style.backgroundColor = '#d30047';
        this.style.color = 'white';

        setTimeout(() => this.style.display = 'none', timeout);
    }

    function changeAnimationKeyframes(animationName, startValue, endValue) {
        var styleSheet = document.styleSheets[0];
        var rules = styleSheet.cssRules || styleSheet.rules;

        for (var i = 0; i < rules.length; i++) {
            if (rules[i].name === animationName) {
                var keyframes = rules[i];
                keyframes.deleteRule('0%');
                keyframes.deleteRule('100%');

                keyframes.appendRule('0% { transform: translateY(' + startValue + 'px); }');
                keyframes.appendRule('100% { transform: translateY(' + endValue + 'px); }');
            }
        }
    }
});