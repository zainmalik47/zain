/**
 * TicTacToe game implementation
 */
class TicTacToe {
    constructor() {
        this.board = [
            [' ', ' ', ' '],
            [' ', ' ', ' '],
            [' ', ' ', ' ']
        ];
        this.currentPlayer = 'X';
        this.gameOver = false;
        this.winner = null;
    }

    /**
     * Make a move on the board
     * @param {Number} row - Row index (0-2)
     * @param {Number} col - Column index (0-2)
     * @returns {Boolean} true if move was valid
     */
    makeMove(row, col) {
        if (this.gameOver || 
            row < 0 || row > 2 || 
            col < 0 || col > 2 || 
            this.board[row][col] !== ' ') {
            return false;
        }

        this.board[row][col] = this.currentPlayer;
        this.checkWinner();
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        return true;
    }

    /**
     * Check for a winner
     * @returns {String|null} Winner symbol or null
     */
    checkWinner() {
        // Check rows
        for (let i = 0; i < 3; i++) {
            if (this.board[i][0] !== ' ' && 
                this.board[i][0] === this.board[i][1] && 
                this.board[i][1] === this.board[i][2]) {
                this.gameOver = true;
                this.winner = this.board[i][0];
                return this.winner;
            }
        }

        // Check columns
        for (let j = 0; j < 3; j++) {
            if (this.board[0][j] !== ' ' && 
                this.board[0][j] === this.board[1][j] && 
                this.board[1][j] === this.board[2][j]) {
                this.gameOver = true;
                this.winner = this.board[0][j];
                return this.winner;
            }
        }

        // Check diagonals
        if (this.board[0][0] !== ' ' && 
            this.board[0][0] === this.board[1][1] && 
            this.board[1][1] === this.board[2][2]) {
            this.gameOver = true;
            this.winner = this.board[0][0];
            return this.winner;
        }

        if (this.board[0][2] !== ' ' && 
            this.board[0][2] === this.board[1][1] && 
            this.board[1][1] === this.board[2][0]) {
            this.gameOver = true;
            this.winner = this.board[0][2];
            return this.winner;
        }

        // Check for draw
        if (!this.board.flat().includes(' ')) {
            this.gameOver = true;
            this.winner = 'draw';
        }

        return this.winner;
    }

    /**
     * Get string representation of the board
     * @returns {String} Board string
     */
    toString() {
        return this.board.map(row => row.join('|')).join('\\n─┼─┼─\\n');
    }

    /**
     * Reset the game
     */
    reset() {
        this.board = [
            [' ', ' ', ' '],
            [' ', ' ', ' '],
            [' ', ' ', ' ']
        ];
        this.currentPlayer = 'X';
        this.gameOver = false;
        this.winner = null;
    }
}

// Active games map
const games = new Map();

module.exports = {
    TicTacToe,
    games
};