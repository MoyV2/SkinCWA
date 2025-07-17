// Game state
let gameState = 'menu';
let selectedCategory = null;
let currentPuzzle = null;
let currentGrid = [];
let selectedCell = null;
let selectedWord = null;
let currentLevel = 1;
let puzzlesCompleted = 0;

// Categories and progress
const categories = [
    'One Piece', 'Solo Leveling', 'Dragon Ball Z', 'Bleach', 'Naruto', 
    'Jujutsu Kaisen', 'Pokemon', 'Demon Slayer', 'My Hero Academia'
];

// Load progress from localStorage
let categoryProgress = {};
try {
    const saved = localStorage.getItem('animeXwordProgress');
    if (saved) {
        categoryProgress = JSON.parse(saved);
    }
} catch (e) {
    console.error('Error loading progress:', e);
}

// Initialize progress for new categories
categories.forEach(cat => {
    if (!categoryProgress[cat]) {
        categoryProgress[cat] = { level: 1, puzzlesCompleted: 0 };
    }
});

// Save progress
function saveProgress() {
    try {
        localStorage.setItem('animeXwordProgress', JSON.stringify(categoryProgress));
    } catch (e) {
        console.error('Error saving progress:', e);
    }
}

// Calculate puzzles needed for level
function getPuzzlesNeededForLevel(level) {
    if (level <= 1) return 3;
    if (level <= 10) return 3 + Math.floor((level - 1) / 2);
    if (level <= 25) return 6 + Math.floor((level - 10) / 3);
    return 10 + Math.floor((level - 25) / 5);
}

// Get grid size based on level
function getCurrentGridSize(level) {
    if (level <= 20) return 9;
    if (level <= 40) return 13;
    return 17;
}

// Initialize menu
function initMenu() {
    gameState = 'menu';
    const grid = document.getElementById('category-grid');
    grid.innerHTML = '';
    
    categories.forEach(category => {
        const progress = categoryProgress[category];
        const puzzlesNeeded = getPuzzlesNeededForLevel(progress.level);
        const progressPercentage = (progress.puzzlesCompleted / puzzlesNeeded) * 100;
        
        const card = document.createElement('button');
        card.className = 'card';
        card.style.cssText = `
            background: #374151; 
            border: 2px solid #4b5563; 
            cursor: pointer; 
            transition: all 0.2s;
            text-align: left;
        `;
        card.onmouseover = () => card.style.borderColor = '#a855f7';
        card.onmouseout = () => card.style.borderColor = '#4b5563';
        card.onclick = () => selectCategory(category);
        
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                <h3 style="font-size: 1.2rem; font-weight: bold;">${category}</h3>
                <span class="purple" style="font-weight: bold;">Level ${progress.level}</span>
            </div>
            <div style="margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; font-size: 0.9rem; color: #d1d5db; margin-bottom: 0.5rem;">
                    <span>Progress</span>
                    <span>${progress.puzzlesCompleted}/${puzzlesNeeded}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                </div>
            </div>
            <p style="font-size: 0.9rem; color: #9ca3af;">
                ${puzzlesNeeded - progress.puzzlesCompleted} puzzles to next level
            </p>
        `;
        
        grid.appendChild(card);
    });
}

// Select category and start game
function selectCategory(category) {
    selectedCategory = category;
    currentLevel = categoryProgress[category].level;
    puzzlesCompleted = categoryProgress[category].puzzlesCompleted;
    generatePuzzle();
}

// Generate puzzle
function generatePuzzle() {
    const gridSize = getCurrentGridSize(currentLevel);
    
    // Sample words for each category
    const wordSets = {
        'One Piece': [
            { word: "LUFFY", clue: "Captain of the Straw Hat Pirates" },
            { word: "ZORO", clue: "Three-sword style swordsman" },
            { word: "NAMI", clue: "Navigator who loves treasure" },
            { word: "SANJI", clue: "Cook who fights with his legs" },
            { word: "CHOPPER", clue: "Reindeer doctor of the crew" },
            { word: "ROBIN", clue: "Archaeologist with flower powers" }
        ],
        'Dragon Ball Z': [
            { word: "GOKU", clue: "Saiyan protagonist" },
            { word: "VEGETA", clue: "Proud Saiyan prince" },
            { word: "GOHAN", clue: "Goku's eldest son" },
            { word: "FRIEZA", clue: "Galactic emperor villain" },
            { word: "CELL", clue: "Bio-android created by Dr. Gero" },
            { word: "BULMA", clue: "Genius inventor and scientist" }
        ],
        'Naruto': [
            { word: "NARUTO", clue: "Dreams of becoming Hokage" },
            { word: "SASUKE", clue: "Last Uchiha clan member" },
            { word: "SAKURA", clue: "Medical ninja with super strength" },
            { word: "KAKASHI", clue: "Copy ninja sensei" },
            { word: "ITACHI", clue: "Sasuke's older brother" },
            { word: "HINATA", clue: "Byakugan user from Hyuga clan" }
        ],
        'Bleach': [
            { word: "ICHIGO", clue: "Substitute Soul Reaper" },
            { word: "RUKIA", clue: "Soul Reaper who gave Ichigo powers" },
            { word: "URYU", clue: "Quincy archer and classmate" },
            { word: "ORIHIME", clue: "Healer with rejection powers" }
        ],
        'Jujutsu Kaisen': [
            { word: "YUJI", clue: "Pink-haired protagonist vessel" },
            { word: "MEGUMI", clue: "Ten Shadows technique user" },
            { word: "NOBARA", clue: "Hammer and nails technique user" },
            { word: "GOJO", clue: "Strongest sorcerer with Six Eyes" }
        ],
        'Pokemon': [
            { word: "PIKACHU", clue: "Electric mouse Pokemon" },
            { word: "CHARIZARD", clue: "Fire/Flying dragon-like Pokemon" },
            { word: "BLASTOISE", clue: "Water turtle with cannons" },
            { word: "VENUSAUR", clue: "Grass/Poison Pokemon with flower" }
        ],
        'Demon Slayer': [
            { word: "TANJIRO", clue: "Water breathing demon slayer" },
            { word: "NEZUKO", clue: "Demon sister in bamboo muzzle" },
            { word: "ZENITSU", clue: "Thunder breathing yellow-haired slayer" },
            { word: "INOSUKE", clue: "Beast breathing boar-headed slayer" }
        ],
        'My Hero Academia': [
            { word: "DEKU", clue: "Green-haired One For All user" },
            { word: "BAKUGO", clue: "Explosion quirk user" },
            { word: "TODOROKI", clue: "Half-hot half-cold quirk user" },
            { word: "ALLMIGHT", clue: "Symbol of Peace, former One For All user" }
        ],
        'Solo Leveling': [
            { word: "JINWOO", clue: "Shadow Monarch and weakest hunter" },
            { word: "IGRIS", clue: "Red shadow knight" },
            { word: "BERU", clue: "Ant shadow soldier" },
            { word: "HUNTER", clue: "Person who fights monsters" }
        ]
    };
    
    const words = wordSets[selectedCategory] || wordSets['One Piece'];
    const numWords = Math.min(3 + Math.floor(currentLevel / 5), words.length);
    
    currentPuzzle = {
        size: gridSize,
        words: words.slice(0, numWords).map((wordData, index) => ({
            ...wordData,
            startRow: Math.floor(index * 2),
            startCol: Math.floor(index * 1.5),
            direction: index % 2 === 0 ? "across" : "down",
            number: index + 1
        }))
    };
    
    createGrid();
    showGameScreen();
}

// Create crossword grid
function createGrid() {
    const size = currentPuzzle.size;
    currentGrid = Array(size).fill().map(() => 
        Array(size).fill({ letter: '', number: 0, isBlack: true, userInput: '', isCorrect: false })
    );
    
    // Place words in grid
    currentPuzzle.words.forEach((wordData) => {
        const { word, startRow, startCol, direction } = wordData;
        for (let i = 0; i < word.length; i++) {
            const row = direction === 'across' ? startRow : startRow + i;
            const col = direction === 'across' ? startCol + i : startCol;
            
            if (row < size && col < size) {
                currentGrid[row][col] = {
                    letter: word[i],
                    number: i === 0 ? wordData.number : (currentGrid[row][col].number || 0),
                    isBlack: false,
                    userInput: '',
                    isCorrect: false
                };
            }
        }
    });
    
    renderGrid();
    renderClues();
}

// MOBILE-FRIENDLY Render grid HTML
function renderGrid() {
    const container = document.getElementById('crossword-container');
    const grid = document.createElement('div');
    grid.className = 'crossword-grid';
    grid.style.gridTemplateColumns = `repeat(${currentGrid.length}, 1fr)`;
    
    currentGrid.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            const cellDiv = document.createElement('div');
            cellDiv.className = `cell ${cell.isBlack ? 'black' : ''}`;
            
            // Add selection highlighting
            if (selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex) {
                cellDiv.classList.add('selected');
            }
            
            if (!cell.isBlack) {
                if (cell.number > 0) {
                    const number = document.createElement('span');
                    number.className = 'cell-number';
                    number.textContent = cell.number;
                    cellDiv.appendChild(number);
                }
                
                // MOBILE FIX: Add input for mobile keyboards
                const input = document.createElement('input');
                input.type = 'text';
                input.maxLength = 1;
                input.value = cell.userInput || '';
                input.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: transparent;
                    border: none;
                    outline: none;
                    text-align: center;
                    font-size: 18px;
                    font-weight: bold;
                    color: ${cell.isCorrect ? 'green' : (cell.userInput && !cell.isCorrect ? 'red' : 'black')};
                    z-index: 2;
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    appearance: none;
                `;
                
                // Handle input changes
                input.addEventListener('input', (e) => {
                    const value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
                    currentGrid[rowIndex][colIndex].userInput = value;
                    e.target.value = value;
                    
                    if (value) {
                        moveToNextCell(rowIndex, colIndex);
                    }
                });
                
                // Handle backspace
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Backspace' && !input.value) {
                        moveToPrevCell(rowIndex, colIndex);
                    }
                });
                
                // Handle focus
                input.addEventListener('focus', () => {
                    selectCell(rowIndex, colIndex);
                });
                
                cellDiv.appendChild(input);
                cellDiv.onclick = () => {
                    selectCell(rowIndex, colIndex);
                    setTimeout(() => input.focus(), 50);
                };
            }
            
            grid.appendChild(cellDiv);
        });
    });
    
    container.innerHTML = '';
    container.appendChild(grid);
    
    // Auto-focus selected cell input
    if (selectedCell) {
        setTimeout(() => {
            const inputs = container.querySelectorAll('input');
            const targetInput = inputs[selectedCell.row * currentGrid.length + selectedCell.col];
            if (targetInput) targetInput.focus();
        }, 100);
    }
}

// Select cell
function selectCell(row, col) {
    if (currentGrid[row][col].isBlack) return;
    
    selectedCell = { row, col };
    
    // Find word containing this cell
    selectedWord = currentPuzzle.words.find(w => {
        if (w.direction === 'across') {
            return w.startRow === row && col >= w.startCol && col < w.startCol + w.word.length;
        } else {
            return w.startCol === col && row >= w.startRow && row < w.startRow + w.word.length;
        }
    });
    
    renderGrid(); // Re-render to show selection
}

// Move to next cell
function moveToNextCell(row, col) {
    if (!selectedWord) return;
    
    let nextRow = row;
    let nextCol = col;
    
    if (selectedWord.direction === 'across') {
        nextCol++;
        if (nextCol >= selectedWord.startCol + selectedWord.word.length) return;
    } else {
        nextRow++;
        if (nextRow >= selectedWord.startRow + selectedWord.word.length) return;
    }
    
    if (nextRow < currentGrid.length && nextCol < currentGrid[0].length && !currentGrid[nextRow][nextCol].isBlack) {
        selectCell(nextRow, nextCol);
    }
}

// Move to previous cell
function moveToPrevCell(row, col) {
    if (!selectedWord) return;
    
    let prevRow = row;
    let prevCol = col;
    
    if (selectedWord.direction === 'across') {
        prevCol--;
        if (prevCol < selectedWord.startCol) return;
    } else {
        prevRow--;
        if (prevRow < selectedWord.startRow) return;
    }
    
    if (prevRow >= 0 && prevCol >= 0 && !currentGrid[prevRow][prevCol].isBlack) {
        selectCell(prevRow, prevCol);
    }
}

// Render clues
function renderClues() {
    const acrossClues = currentPuzzle.words.filter(w => w.direction === 'across');
    const downClues = currentPuzzle.words.filter(w => w.direction === 'down');
    
    document.getElementById('across-clues').innerHTML = acrossClues.map(word => 
        `<div style="padding: 0.5rem; margin-bottom: 0.5rem; cursor: pointer; border-radius: 8px;" 
         onmouseover="this.style.background='#374151'" 
         onmouseout="this.style.background='transparent'"
         onclick="selectWordFromClue('${word.direction}', ${word.number})">
            <strong>${word.number}.</strong> ${word.clue}
        </div>`
    ).join('');
    
    document.getElementById('down-clues').innerHTML = downClues.map(word => 
        `<div style="padding: 0.5rem; margin-bottom: 0.5rem; cursor: pointer; border-radius: 8px;"
         onmouseover="this.style.background='#374151'" 
         onmouseout="this.style.background='transparent'"
         onclick="selectWordFromClue('${word.direction}', ${word.number})">
            <strong>${word.number}.</strong> ${word.clue}
        </div>`
    ).join('');
}

// Select word from clue click
function selectWordFromClue(direction, number) {
    const word = currentPuzzle.words.find(w => w.direction === direction && w.number === number);
    if (word) {
        selectCell(word.startRow, word.startCol);
    }
}

// Show game screen
function showGameScreen() {
    gameState = 'playing';
    document.getElementById('menu-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    document.getElementById('levelup-screen').classList.add('hidden');
    
    document.getElementById('current-category').textContent = selectedCategory;
    document.getElementById('level-info').textContent = `Level ${currentLevel}`;
    
    const puzzlesNeeded = getPuzzlesNeededForLevel(currentLevel);
    document.getElementById('progress-info').textContent = `${puzzlesCompleted}/${puzzlesNeeded}`;
}

// Check answers
function checkAnswers() {
    let allCorrect = true;
    
    for (let row = 0; row < currentGrid.length; row++) {
        for (let col = 0; col < currentGrid[row].length; col++) {
            if (!currentGrid[row][col].isBlack) {
                const isCorrect = currentGrid[row][col].userInput === currentGrid[row][col].letter;
                currentGrid[row][col].isCorrect = isCorrect;
                if (!isCorrect && currentGrid[row][col].userInput) allCorrect = false;
            }
        }
    }
    
    if (allCorrect) {
        completePuzzle();
    }
    
    renderGrid();
}

// Complete puzzle
function completePuzzle() {
    puzzlesCompleted++;
    const puzzlesNeeded = getPuzzlesNeededForLevel(currentLevel);
    
    if (puzzlesCompleted >= puzzlesNeeded && currentLevel < 50) {
        // Level up!
        currentLevel++;
        categoryProgress[selectedCategory] = {
            level: currentLevel,
            puzzlesCompleted: 0
        };
        puzzlesCompleted = 0;
        saveProgress();
        showLevelUp();
    } else {
        // Just completed a puzzle
        categoryProgress[selectedCategory].puzzlesCompleted = puzzlesCompleted;
        saveProgress();
        setTimeout(() => generatePuzzle(), 1000);
    }
}

// Show level up screen
function showLevelUp() {
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('levelup-screen').classList.remove('hidden');
    document.getElementById('levelup-text').textContent = 
        `${selectedCategory} - Level ${currentLevel}!`;
}

// Next puzzle after level up
function nextPuzzle() {
    generatePuzzle();
}

// Reveal answers
function revealAnswers() {
    for (let row = 0; row < currentGrid.length; row++) {
        for (let col = 0; col < currentGrid[row].length; col++) {
            if (!currentGrid[row][col].isBlack) {
                currentGrid[row][col].userInput = currentGrid[row][col].letter;
                currentGrid[row][col].isCorrect = true;
            }
        }
    }
    renderGrid();
}

// Back to menu
function backToMenu() {
    document.getElementById('menu-screen').classList.remove('hidden');
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('levelup-screen').classList.add('hidden');
    initMenu();
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initMenu();
});
