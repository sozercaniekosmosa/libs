let path = './libs/components/sound/lib-synth/';
//подключение синтезатора
const script = document.createElement('script');
script.setAttribute("defer", "defer");
script.src = path + 'js-synth.js';
document.head.appendChild(script);


/**
 * Класс для воспроизведения midi-файлов
 *
 * Пример использования:
 *
 * let clickButton = async () => { // не просто так
 *     let s = new Synthesizer()   // создание аудио контекста обязательно должно быть встроено в обработчки кнопки
 *     await s.loadResource({urlSF: './sf2/sound-font.sf2', urlMel: './mid/melody.mid'})
 *     await s.play()
 * }
 */
export default class Synthesizer {

    ac;
    sfontId;
    arrBufSF2;
    arrBufMel;
    synth;

    /**
     * Загрузить бинарный файл
     * @param url
     * @returns {Promise<ArrayBuffer>}
     */
    async loadBinary(url) {
        const resp = await fetch(url);
        return await resp.arrayBuffer();
    }

    /**
     * Инициализация синтезатора
     * @returns {Promise<void>}
     */
    initializeSynthesizer = async () => {
        this.stop();
        if (!this.ac) this.ac = new AudioContext();

        if (this.synth) {
            await this.synth.unloadSFontAsync(this.sfontId);
        } else {
            await this.ac.audioWorklet.addModule(path + 'libfluidsynth-2.3.0.js');
            await this.ac.audioWorklet.addModule(path + 'js-synthesizer.worklet.min.js');

            this.synth = new JSSynth.AudioWorkletNodeSynthesizer();
            this.synth.init(this.ac.sampleRate);
            const node = this.synth.createAudioNode(this.ac);
            node.connect(this.ac.destination);
        }

        // Load SoundFont data to the synthesizer
        this.sfontId = await this.synth.loadSFont(this.arrBufSF2);

        if (this.arrBufMel) await this.synth.addSMFDataToPlayer(this.arrBufMel);
    };

    /**
     * Загрузка ресурсов
     * @param urlSF
     * @param urlMel
     * @param arrBufSF2
     * @param arrBufMel
     * @returns {Promise<void>}
     */
    loadResource = async ({urlSF, urlMel, arrBufSF2, arrBufMel} = {}) => {
        if (arrBufSF2) this.arrBufSF2 = arrBufSF2;
        if (arrBufMel) this.arrBufMel = arrBufMel;
        if (urlSF && urlSF !== this._urlSF) this.arrBufSF2 = await this.loadBinary(urlSF);
        if (urlMel && urlMel !== this._urlMel) this.arrBufMel = await this.loadBinary(urlMel);

        this._urlSF = urlSF;
        this._urlMel = urlMel;
    };

    /**
     * Позиция воспроизведения трека
     * @param val
     * @returns {*}
     */
    seek = (val) => this.synth.seekPlayer(val)

    /**
     * Задать темп (BPM)
     * @param val
     * @returns {*}
     */
    temp = (val) => this.synth.setPlayerTempo(1, val)

    /**
     * Задать общую громкость воспроизведения
     * @param val
     * @returns {*}
     */
    volume = (val) => this.synth.setGain(val)

    /**
     * Пичер канала
     * @param channel
     * @param val
     * @returns {*}
     */
    pitch = (channel, val) => this.synth.midiPitchBend(channel, val)

    /**
     * Получить текущую общую громкость
     * @returns {Promise<*>}
     */
    getGain = async () => await this.synth && this.synth.getGain()

    /**
     * Получить текущий темп (BPM)
     * @returns {Promise<*>}
     */
    getBpm = async () => await this.synth && this.synth.retrievePlayerBpm()

    /**
     * Получить текущую позицию воспроизведения
     * @returns {Promise<*>}
     */
    getCurrentTick = async () => await this.synth && this.synth.retrievePlayerCurrentTick()

    /**
     * Получить общую длину трека
     * @returns {Promise<*>}
     */
    getTotalTicks = async () => await this.synth && this.synth.retrievePlayerTotalTicks()

    /**
     * Начать воспроизведение
     * @returns {Promise<void>}
     */
    play = async () => {
        await this.initializeSynthesizer();
        await this.synth.playPlayer()

        await this.synth.waitForPlayerStopped();
        await this.synth.waitForVoicesStopped();
        await this.synth.resetPlayer();
    }

    /**
     * Остановить воспроизведение
     * @returns {Promise<void>}
     */
    stop = async () => {
        if (this.synth) {
            this.synth.stopPlayer();
            await this.synth.waitForPlayerStopped();
            await this.synth.waitForVoicesStopped();
            await this.synth.resetPlayer();
        }
    }
}