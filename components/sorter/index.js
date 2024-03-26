import Sorter from './sorter.js'

function addCell(nodeTable, content) {
    var newDiv = document.createElement('div');
    newDiv.classList.add('cell');
    newDiv.classList.add('sortable');
    newDiv.textContent = content;
    nodeTable.appendChild(newDiv);
    return newDiv
}

let nodeTable = document.body;
let nodeTable2 = document.querySelector('.table')
for (let i = 0; i < 100; i++) {
    var node = addCell(nodeTable2, i);
    node.style.backgroundColor = '#' + Math.trunc(Math.random() * 0xffffff).toString(16).padStart(6, '0') + '40'
}
new Sorter({
    clbOver: (nodeDragging, nodeOver, isLeftSide, isCenter) => {
        let isOverSortAdd = nodeOver.closest('.container');
        let isDragSortAdd = nodeDragging.closest('.container');
        let isOverAdd = nodeOver.classList.contains('container');
        let isSortable = nodeOver.classList.contains('sortable');

        if (!isOverSortAdd) return true; //если контейнер над которым находимся не для добавления выходим
        if (isDragSortAdd === isOverSortAdd && isOverSortAdd === nodeOver && isCenter) return true
        if (isCenter && !isOverAdd) return true;
        if (isSortable) return false;
        if (!(isOverAdd && isCenter)) return true
    },
    clbEnd: (nodeDragging, nodeOver, isLeftSide, isCenter) => {

        if (!nodeDragging.classList.contains('exist')) {
            var newNode = document.createElement('div');
            newNode.classList.add('cell', 'exist', 'container');
            newNode.textContent = nodeDragging.textContent + '!';
            newNode.style.backgroundColor = nodeDragging.style.backgroundColor;

            return newNode;
        }
    }
})