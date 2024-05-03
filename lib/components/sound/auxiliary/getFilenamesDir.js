const fs = require('fs');

function escapeQuotes(str) {
    return str.replace(/"/g, '\\"');
}

function getFilenamesDir(dirPathWhere = './', dirPathTo = './fileNames.txt') {

    fs.readdir(dirPathWhere, (err, files) => {
        if (err) {
            console.log('Ошибка при чтении директории:', err);
            return;
        }

        const fileNames = '[' + files.map(name => `"${name}"`).join(',\n') + ']';


        fs.writeFile(dirPathTo, fileNames, (err) => {
            if (err) {
                console.log('Ошибка при записи в файл:', err);
                return;
            }
            console.log('Имена файлов успешно сохранены в файле ' + dirPathTo);
        });
    });
}


// const [exec, name, dir] = process.argv
getFilenamesDir('../mid/', '../mid.json')
getFilenamesDir('../sf2/', '../sf2.json')
