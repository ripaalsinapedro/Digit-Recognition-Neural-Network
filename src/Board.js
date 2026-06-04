class Board {
    #size;
    #resloution;
    #grid;

    #radius;

    /**
     * This class is the one that allows the 
     * user to input a number, so then it can be
     * pass to the neural network.
     * 
     * So the board is a grid of 28 by 28,
     * based on the mnist dataset images.
     */
    constructor(canvasSize) {
        this.#size = 28;
        this.#resloution = canvasSize / this.#size;
        this.#grid = new Array(this.#size * this.#size).fill(0);

        this.#radius = 2;
    }

    get board() {
        return this.#grid;
    }

    /**
     * This function is the main function that is called every
     * frame
     */
    update() {
        if (mouseIsPressed) {
            let mouse = this.#getMousePos();
            let x = mouse[0];
            let y = mouse[1];

            if (!this.#validCoord(x) || !this.#validCoord(y)) { return }

            this.#paint(x, y);
        }
    }

    /**
     * @returns an array with the mouse x position and y position
     */
    #getMousePos() {
        let x = Math.floor(mouseX / this.#resloution);
        let y = Math.floor(mouseY / this.#resloution);

        return [x, y];
    }

    #validCoord(value) {
        return value < this.#size;
    }

    /**
     * This function simulates a brush of a radius and modify the grid
     * values, 0 if is painted, and 1 if is not
     * 
     * @param {Number} cx the mouse x coordinate
     * @param {Number} cy the mouse y coordinate
     */
    #paint(cx, cy) {
        for (let y = max(0, cy - this.#radius); y <= min(this.#size - 1, cy + this.#radius); y++) {

            for (let x = max(0, cx - this.#radius); x <= min(this.#size - 1, cx + this.#radius); x++) {

                let dx = x - cx;
                let dy = y - cy;

                let distance = sqrt(dx * dx + dy * dy);

                if (distance > this.#radius) continue;

                let value = 1 - (distance / this.#radius);
                let index = this.#getGridIndex(x, y);

                this.#grid[index] = max(this.#grid[index], value);
            }
        }
    }

    /**
     * This map the x and y coordinates to a single index value,
     * because the board information is stored in a one dim array
     * 
     * @param {Number} x 
     * @param {Number} y 
     * @returns the grid index 
     */
    #getGridIndex(x, y) {
        return Math.floor(y) * this.#size + Math.floor(x);
    }

    /**
     * Set the board to the default values
     */
    clear() {
        for (let i = 0; i < this.#grid.length; i++) {
            this.#grid[i] = 0;
        }
    }

    /**
     * It display the grid, inverting the values.
     * This is because the neural network uses white digits
     * on a black background
     */
    display() {
        for (let i = 0; i < this.#grid.length; i++) {
            let x = Math.floor(i % this.#size);
            let y = Math.floor(i / this.#size);

            let gridValue = this.#grid[i];
            fill(gridValue * 255);
            strokeWeight(0);
            rect(x * this.#resloution, y * this.#resloution, this.#resloution, this.#resloution);
        }
    }
}