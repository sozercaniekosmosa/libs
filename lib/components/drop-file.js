element('drop-file', function () {
    // style
    // language=CSS
    this.setStyle(`

        @keyframes blink {
            0% {
                /*border: 1px dashed #ababab;*/
                background-color: #ffffff;
            }
            50% {
                /*border: 1px solid #ababab;*/
                background-color: #c8c8c8;
            }
            100% {
                /*border: 1px dashed #ababab;*/
                background-color: #ffffff;
            }
        }

        drop-file {
            width: auto;
            height: auto;
        }

        .drop-file__highlight {
            animation: blink 1s linear infinite;
        }
    `);

    this.onConnected = () => {

        const content = this.innerHTML
        this.innerHTML = ''

        this.innerHTML = `<div class="drop-area">${content}</div>`;
        let nodeArea = document.body;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            nodeArea.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, false)
        });

        ['dragenter', 'dragover'].forEach(eventName => nodeArea.addEventListener(eventName, () =>{
            document.body.classList.add('drop-file__highlight')
            this.classList.add('drop-file__highlight')
        }, false));
        ['dragleave', 'drop'].forEach(eventName => nodeArea.addEventListener(eventName, () => {
            document.body.classList.remove('drop-file__highlight')
            this.classList.remove('drop-file__highlight')
        }, false));
        nodeArea.addEventListener('drop', (e) => {
            let dt = e.dataTransfer;
            let files = dt.files;

            ([...files]).forEach(uploadFile);
        }, false);

        const uploadFile = (file) => {
            let reader = new FileReader(); // Создаем новый экземпляр FileReader

            reader.onload = (e) => {
                let text = e.target.result; // Получаем текст файла
                // EventBus.dispatchEvent('file-load', text)
                this.data && this.data(text)
                // console.log(text);
            };

            reader.readAsText(file); // Читаем содержимое файла как текст
        }

    };

});

