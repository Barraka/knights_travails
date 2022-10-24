
function makeBoard(size=8) {
    let board=[];
    for(let i=0; i<size; i++) {
        board.push([]);
        for(let j=0; j<size; j++)board[i].push('');
    }
    return board;
}

function graphSolution(start, end) {
    let board=makeBoard();
    let possibleMoves = [[1,2],[2,1],[2,-1],[1,-2],[-1,-2],[-2,-1],[-2,1],[-1,2]];
    const boardLength=board.length;
    let knight = start;
    board[knight[0]][knight[1]]='v';
    let solutionFound = false;
    let analyzePosition=[[knight]];
    let tempPositions=[];
    while(!solutionFound) {
        for(let i=analyzePosition.length-1;i>=0;i--) {
            let posStack=analyzePosition[i];
            let pos=posStack[posStack.length-1];
            if(solutionFound)break;
            for(let j=possibleMoves.length-1;j>=0;j--) {
                let m=possibleMoves[j];
                let tempknight = [pos[0]+m[0], pos[1]+m[1]];
                //Check is move is inside board
                if(tempknight[0]<boardLength && tempknight[0]>=0 && tempknight[1]>=0 && tempknight[1]<boardLength) {
                    //Check if target reached
                    if(tempknight[0]===end[0] && tempknight[1]===end[1]) {
                        solutionFound=true;
                        posStack.push(tempknight);
                        board[tempknight[0]][tempknight[1]]='s';
                        return posStack;
                    }
                    //Check if not visited
                    if(board[tempknight[0]][tempknight[1]]!=='v') {
                        board[tempknight[0]][tempknight[1]]='v';
                        let tempStack=[...posStack];
                        tempStack.push(tempknight);
                        tempPositions.push(tempStack);
                    }
                }
            }
        }
        analyzePosition = [...tempPositions];
        tempPositions=[];
        if(analyzePosition.length<=0) {
            console.log('no next move found');
            break;
        }
    }
}

function displayBoard() {
    let container = document.querySelector('.container');
    container.innerHTML='';
    for(let i=7;i>=0;i--) {
        for(let j=0;j<8;j++) {
            let cell = document.createElement('div');
            cell.classList.add('cell');
            if((i%2===0 && j%2===0) || (i%2!==0 && j%2!==0)) {
                cell.classList.add('white');
            }
            else cell.classList.add('black');
            if(i===0 && j===0)cell.classList.add('start');
            cell.setAttribute('data-posX',`${i}`);
            cell.setAttribute('data-posY',`${j}`);
            container.appendChild(cell);
        }
    }
}

function startPos() {
    //Remove existing content
    displayBoard();
    let cell = document.querySelectorAll('.cell');    
    cell.forEach(x=>{
        x.classList.add('cellbg');
    });
    let guide = document.querySelector('.guide');
    guide.textContent='Place the knight somewhere on the board...';
}
function placeKnight(e) {
    let target=e.target;
    if(target.classList.contains('cellbg')) {
        let guide = document.querySelector('.guide');
        guide.textContent='Now choose a destination cell...';
        target.classList.add('knight');
        let cell = document.querySelectorAll('.cell');
        cell.forEach(x=>{
            if(x!==target) {
                x.classList.remove('cellbg')
                x.classList.add('destination');
            }            
        });
    }
    else if(target.classList.contains('destination')) {
        let guide = document.querySelector('.guide');
        guide.textContent='Click "Calculate" to search for the shortest way to your destination!';
        let calculate = document.querySelector('.calculate');
        calculate.classList.remove('inactive');
        calculate.classList.add('active', 'hint');
        calculate.addEventListener('click',runCalculate);
        target.classList.add('destinationFinal');
        let cell = document.querySelectorAll('.cell');
        cell.forEach(x=>{
            x.classList.remove('destination')
        });
    }
}
function runCalculate() {
    let calculate = document.querySelector('.calculate');
    calculate.removeEventListener('click',runCalculate);
    calculate.classList.remove('active', 'hint');
    calculate.classList.add('inactive');
    let knight = document.querySelector('.knight');
    let valX = parseInt(knight.getAttribute('data-posx'));
    let valY = parseInt(knight.getAttribute('data-posy'));
    let destinationFinal = document.querySelector('.destinationFinal');
    let finalX = parseInt(destinationFinal.getAttribute('data-posx'));
    let finalY = parseInt(destinationFinal.getAttribute('data-posy'));
    let solution = graphSolution([valX,valY],[finalX, finalY]);
    let imgKnight = document.createElement('img');
    imgKnight.classList.add('imgKnight');
    imgKnight.src=('assets/knight.png');
    let curWidth=knight.clientWidth;
    let curHeight=knight.clientHeight;
    imgKnight.width=curWidth;
    imgKnight.height=curHeight;
    let start = document.querySelector('.start');
    let animationTimer=0;
    let intervalSmall=300;
    let intervalLong=1500;
    let newPosX=0;
    let newPosY=0;
    //Place knight at initial position
    newPosX=solution[0][1]*curHeight;
    newPosY=solution[0][0]*curHeight;
    imgKnight.style.transform=`translateX(${newPosX}px) translateY(-${newPosY}px)`;
    start.appendChild(imgKnight);
    knight.classList.remove('knight');
    destinationFinal.classList.remove('destinationFinal');
    knight.classList.add('startPos');
    //Loop through to target
    let guide = document.querySelector('.guide');
    guide.textContent=`The Knight reached the target in ${solution.length-1} steps!!`;
    let step=1;
    for(let i=1; i<solution.length; i++) {
        let newPos=solution[i];
        newPosX=newPos[1]*curHeight;                
        animationTimer+=intervalLong;
        steps(newPosX,newPosY,animationTimer);
        animationTimer+=intervalSmall;
        newPosY=newPos[0]*curHeight;        
        let cellStep=document.querySelector(`.cell[data-posx="${solution[i][0]}"][data-posy="${solution[i][1]}"]`);
        if(i===solution.length-1)steps(newPosX,newPosY,animationTimer, cellStep, true);
        else steps(newPosX,newPosY,animationTimer, cellStep);
    }
    function steps(x,y,time, cellStep='', last=false) {
        if(cellStep) {
            cellStep.textContent=step;
            if(!last)cellStep.classList.add('temp');
            else cellStep.classList.add('tempLast');
            step++;
            setTimeout(()=>{
                if(last) {
                    cellStep.classList.add('target');
                    cellStep.textContent='';
                }
                else cellStep.classList.add('highlight');
                if(last) {
                    let guide = document.querySelector('.guide');
                    let again = document.createElement('div');
                    again.classList.add('again');
                    again.textContent=`\n Yaay! Click the "Place Knight" button to try again.`;
                    guide.appendChild(again);
                }
            },time);
        }
        let transformString=`translateX(${x}px) translateY(-${y}px)`;
        setTimeout(e=>{
            imgKnight.style.transform=transformString;
        },time);
    }
}

let placeButton = document.querySelector('.placeButton');
placeButton.addEventListener('click',startPos);
let container = document.querySelector('.container');
container.addEventListener('click',placeKnight);
let calculate = document.querySelector('.calculate');
calculate.addEventListener('click',runCalculate);
displayBoard();