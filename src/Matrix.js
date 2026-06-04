class Matrix {
    #rows;
    #cols;
    #data;

    /**
     * It crates a matrix object, that is way of storing numbers
     * in a 2d grid, of a number of rows and cols.
     * It can also hava a optional data parameter that contains
     * an array with the data inside the matrix.
     * 
     * @param {Number} rows 
     * @param {Number} cols 
     * @param {Array} data 
     */
    constructor(rows, cols, data = undefined) {
        this.#rows = rows;
        this.#cols = cols;

        this.#data = this.#createNewDataArray(data);
    }

    get rows() {
        return this.#rows
    }

    get cols() {
        return this.#cols;
    }

    /**
     * Creates a new data array if no data array is pased
     * into de constructor
     *
     * @param {Array} data 
     * @returns a data array 
     */
    #createNewDataArray(data) {
        if (!data) { return new Array(this.#rows * this.#cols).fill(0) }
        if (data.length != this.#rows * this.#cols) { throw new Error("cannot create the matrix") }
        return data;
    }

    /**
     * It gets the value of a row and a col
     * of the matrix
     * 
     * @param {Number} row 
     * @param {Number} col 
     * @returns a number value
     */
    getMatrixValue(row, col) {
        this.#validateRow(row);
        this.#validateCol(col);

        let dataIndex = this.#getDataIndex(row, col);
        return this.#data[dataIndex];
    }

    /**
     * Set a matrix value, at the row and col
     * to a number value
     * 
     * @param {Number} row 
     * @param {Number} col 
     * @param {Number} value 
     */
    setMatrixValue(row, col, value) {
        this.#validateRow(row);
        this.#validateCol(col);
        if (typeof (value) != "number") { throw new Error("invalid value") }

        let dataIndex = this.#getDataIndex(row, col);
        this.#data[dataIndex] = value;
    }

    #validateRow(row) {
        if (row < 0 || row >= this.#rows) { throw new Error("invalid row") }
    }

    #validateCol(col) {
        if (col < 0 || col >= this.#cols) { throw new Error("invalid col") }
    }

    /**
     * So because the matrix stores it values
     * in a unidimensional array, this function
     * calculates the index for the data array for
     * a row and a col
     * 
     * @param {Number} row 
     * @param {Number} col 
     * @returns a index number
     */
    #getDataIndex(row, col) {
        return row * this.#cols + col;
    }

    /**
     * 
     * @param {Matrix} vector matrix of 1 column
     */
    addVector(vector) {
        if (vector.cols != 1) { throw new Error("the parameter is not a vector") }
        if (this.#rows != vector.rows) { throw new Error("matrix and vector dim are not equal") }

        for (let i = 0; i < this.#rows; i++) {
            let vectorValue = vector.getMatrixValue(i, 0);

            for (let j = 0; j < this.#cols; j++) {
                let matrixValue = this.getMatrixValue(i, j);
                this.setMatrixValue(i, j, vectorValue + matrixValue);
            }
        }
    }

    /**
     * It multiplies all the matrix values, by 
     * a value
     * 
     * @param {Number} value 
     */
    scalarMult(value) {
        if (typeof (value) != "number") { throw new Error("parameter must be a number") }

        for (let i = 0; i < this.#data.length; i++) {
            this.#data[i] *= value;
        }
    }

    /**
     * It sums all the values from the colunms of a
     * matrix, and stores them in a vector
     * 
     * @param {Matrix} matrix 
     * @returns a vector
     */
    static sumColumValues(matrix) {
        let columnVector = new Matrix(matrix.rows, 1);

        for (let i = 0; i < matrix.rows; i++) {
            let colSum = 0;

            for (let j = 0; j < matrix.cols; j++) {
                let matrixValue = matrix.getMatrixValue(i, j);
                colSum += matrixValue;
            }

            columnVector.setMatrixValue(i, 0, colSum);
        }

        return columnVector;
    }

    /** 
     * It calcuates the dot product between two
     * matrix
     * 
     * @param {Matrix} matrixA 
     * @param {Matrix} matrixB 
     * @returns a new matrix with the dot product
     */
    static dotProduct(matrixA, matrixB) {
        if (matrixA.cols != matrixB.rows) { throw new Error("matrices are not valid") }

        let dotProduct = new Matrix(matrixA.rows, matrixB.cols);

        for (let i = 0; i < matrixA.rows; i++) {
            for (let j = 0; j < matrixB.cols; j++) {
                let sum = 0;

                for (let k = 0; k < matrixB.rows; k++) {
                    let ma = matrixA.getMatrixValue(i, k);
                    let mb = matrixB.getMatrixValue(k, j);

                    sum += ma * mb;
                }

                dotProduct.setMatrixValue(i, j, sum)
            }
        }

        return dotProduct;
    }

    /**
     * It calculates the result of subtracting all the
     * elemnts from the first matrix, by the second one.
     * This is done elemnt by elemnt
     * 
     * @param {Matrix} matrixA 
     * @param {Matrix} matrixB 
     * @returns a new matrix with the values of the two matrix subtracted
     */
    static subMatrix(matrixA, matrixB) {
        if (matrixA.rows != matrixB.rows || matrixA.cols != matrixB.cols) {
            throw new Error("invalid matrix");
        }

        let subMatrix = new Matrix(matrixA.rows, matrixA.cols);

        for (let i = 0; i < matrixA.rows; i++) {
            for (let j = 0; j < matrixA.cols; j++) {
                let ma = matrixA.getMatrixValue(i, j);
                let mb = matrixB.getMatrixValue(i, j);

                subMatrix.setMatrixValue(i, j, ma - mb);
            }
        }

        return subMatrix;
    }

    /**
     * It calculate the result of multypling all the 
     * elements of both matrix elemnt by elemnt
     * 
     * @param {Matrix} matrixA 
     * @param {Matrix} matrixB 
     * @returns a new matrix with the product of both matrix
     */
    static hadamardProduct(matrixA, matrixB) {
        if (matrixA.rows != matrixB.rows || matrixA.cols != matrixB.cols) {
            throw new Error("invalid matrix");
        }

        let productMatrix = new Matrix(matrixA.rows, matrixA.cols);

        for (let i = 0; i < matrixA.rows; i++) {
            for (let j = 0; j < matrixA.cols; j++) {
                let ma = matrixA.getMatrixValue(i, j);
                let mb = matrixB.getMatrixValue(i, j);

                productMatrix.setMatrixValue(i, j, ma * mb);
            }
        }

        return productMatrix;
    }

    /**
     * It transpose the given matrix, that is
     * making so the columns became rows and the 
     * rows became cols
     * 
     * @param {Matrix} matrix 
     * @returns a new matrix transpose
     */
    static transpose(matrix) {
        let transposeMatrix = new Matrix(matrix.cols, matrix.rows);

        for (let i = 0; i < matrix.rows; i++) {
            for (let j = 0; j < matrix.cols; j++) {
                let matrixValue = matrix.getMatrixValue(i, j);
                transposeMatrix.setMatrixValue(j, i, matrixValue);
            }
        }

        return transposeMatrix;
    }
}