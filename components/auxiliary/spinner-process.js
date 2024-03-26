element('spinner-process', function () {

// language=CSS
    this.setStyle(`
        spinner-process .spinner {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 3.8px solid;
            border-color: #e4e4e4;
            border-right-color: #6d6d6d;
            animation: spinner-process-rot 1s infinite linear;
            position: absolute;
        }

        @keyframes spinner-process-rot {
            to {
                transform: rotate(1turn);
            }
        }
    `);

    this.show = () => this.classList.remove('hide');
    this.hide = (ms = 0) => {
        setTimeout(() => this.classList.add('hide'), ms)
    };
    this.visible = (isVisible = true) => this[isVisible ? 'remove' : 'add']('hide')


    this.onConnected = () => {
        this.jsx = `<div class="spinner"></div>`;
    };
});