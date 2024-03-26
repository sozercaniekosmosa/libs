const NAME_ELEMENT = 'some-element'

element(NAME_ELEMENT, function () {
    // style
    // language=CSS
    this.setStyle(`
        ${NAME_ELEMENT} {
            width: 24px;
            height: 24px;
            border-radius: 0.1em;
            border: 1px solid #e4e4e4;
        }
    `);

    //behavior
    this.someMethod = () => true;

    //life cycle (event handlers)
    this.onConnected = () => true;
    this.onDisconnected = () => true;
    this.onAdopted = () => true;
    this.onAttribute = () => true;
    this.onVisible = () => true;
    this.onHidden = () => true;
    this.onHideDelayed(() => console.log('Компонент скрылся секунду назад'), 1000);

    //render
    //language=JSX
    this.jsx = `<div>...Insert here your content!!!</div>`;
});