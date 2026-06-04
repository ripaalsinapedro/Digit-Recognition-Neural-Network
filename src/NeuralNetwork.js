class NeuralNetwork {
    #inputLayer;
    #hiddenLayerBeforeActivation;
    #hiddenLayer;
    #output;

    #inputHiddenWeights;
    #inputHiddenBiases;
    #hiddenOutputWeights;
    #hiddenOutputBiases;

    #dataSet;
    #learningRate;
    #batchSize;
    #pixelsPerImage;
    #labels;

    #initialized = false;

    /**
     * 
     * @param {Object} modelData 
     */
    constructor(modelData) {
        this.loadModel(modelData);
    }

    get initialized() {
        return this.#initialized;
    }

    /**
     * Creates a new neural network based on a data set and
     * a number of neurons.
     * Finally it initialazed the wheights of each layer
     * 
     * @param {DataSet} dataSet 
     * @param {Number} neurons 
     */
    createNewModel(dataSet, neurons, onLog = console.log) {
        if (neurons == undefined) { throw new Error("invalid neurons number") }
        if (dataSet == undefined) { throw new Error("invalid data set") }

        this.#setDataSet(dataSet);
        this.#initialized = true;

        this.#inputHiddenWeights = new Matrix(neurons, this.#pixelsPerImage);
        this.#inputHiddenBiases = new Matrix(neurons, 1);

        this.#hiddenOutputWeights = new Matrix(10, neurons);
        this.#hiddenOutputBiases = new Matrix(10, 1);

        this.#weightInitialization(this.#inputHiddenWeights);
        this.#weightInitialization(this.#hiddenOutputWeights);

        onLog("the new model has ben initialazed");
    }

    /**
     * This use the He initalization to set the values
     * of a weight matrix
     * 
     * @param {matrix} matrix 
     */
    #weightInitialization(matrix) {
        let inputSize = matrix.cols;
        let std = sqrt(2 / inputSize);

        for (let i = 0; i < matrix.rows; i++) {
            for (let j = 0; j < matrix.cols; j++) {
                let weight = randomGaussian(0, std);

                matrix.setMatrixValue(i, j, weight);
            }
        }
    }

    /**
     * This is the main traininf function, and it takes thre parameters,
     * the epoch, wich is the number of iterations the model will train,
     * the batch size, wich how many images it process at the same time,
     * and the learning rate, wich is how much the model has to
     * ajust the weights after each itation
     * 
     * @param {Number} epoch usally around 1500 up to 2500 wil get a decent accuracy
     * @param {Number} batchSize 65 up to 128
     * @param {Number} learningRate from .1 to .01
     */
    async train(epoch, batchSize, learningRate, onLog = console.log) {
        this.printInitialStatus(onLog);
        await new Promise(resolve => setTimeout(resolve, 0));

        this.#batchSize = batchSize;
        this.#learningRate = learningRate;

        let totalImages = this.#dataSet.totalImages;

        const imagesBuffer = new Float32Array(batchSize * this.#pixelsPerImage);
        const labelsBuffer = new Uint8Array(batchSize);

        for (let e = 0; e < epoch; e++) {
            this.#dataSet.shuffleIndexArray();

            let totalLoss = 0;
            let batchCount = 0;

            for (let i = 0; i < totalImages; i += batchSize) {
                let actualCount = this.#dataSet.getBatchToBuffer(i, batchSize, imagesBuffer, labelsBuffer);

                if (actualCount != batchSize) { continue }

                this.#inputLayer = this.#newInputLayer(actualCount, imagesBuffer);
                this.#labels = this.#oneHotEncoder(labelsBuffer);

                this.#fordWard();
                this.#backpropagation();

                totalLoss += this.lossFunctionValue();
                batchCount++;
            }

            onLog(`epoch ${e + 1} completed, with a loss value of ${totalLoss / batchCount}`);
            await new Promise(resolve => setTimeout(resolve, 0));
            this.#stepDecay(epoch, e);
        }

        onLog("finish training");
    }

    /**
     * It predicts wich number is containd in the image buffer,
     * outputing the number and the model confidence
     * 
     * @param {Float32Array} imageBuffer 
     */
    predict(imageBuffer, onLog = console.log) {
        this.#inputLayer = this.#newInputLayer(1, imageBuffer);

        this.#fordWard();

        let predict = this.#getPredictionFromColumn(0);
        let confidence = this.#output.getMatrixValue(predict, 0);

        onLog("The numbres is " + int(confidence * 100) + "% a: " + predict);
    }

    /**
     * It test the accuracy of the model, on a
     * test data set
     * 
     * @param {DataSet} testDataSet 
     * @param {Number} batchSize the amount if images to process at once
     */
    test(testDataSet, batchSize, onLog = console.log) {
        this.#setDataSet(testDataSet);

        let totalImages = this.#dataSet.totalImages;
        let correctPredictions = 0;
        let totalProcessed = 0;

        const imagesBuffer = new Float32Array(batchSize * this.#pixelsPerImage);
        const labelsBuffer = new Uint8Array(batchSize);


        for (let i = 0; i < totalImages; i += batchSize) {
            let actualCount = this.#dataSet.getBatchToBuffer(i, batchSize, imagesBuffer, labelsBuffer);
            console.log(imagesBuffer)

            if (actualCount === 0) break;

            this.#inputLayer = this.#newInputLayer(actualCount, imagesBuffer);
            this.#fordWard();

            for (let col = 0; col < actualCount; col++) {
                let prediction = this.#getPredictionFromColumn(col);
                let actualLabel = labelsBuffer[col];

                if (prediction === actualLabel) {
                    correctPredictions++;
                }
                totalProcessed++;
            }
        }

        let accuracy = (correctPredictions / totalProcessed) * 100;
        onLog(`Resultados: ${correctPredictions}/${totalProcessed} correctos.`);
        onLog(`Precisión Final: ${accuracy.toFixed(2)}%`);

        return accuracy;
    }

    /**
     * It cheks whats the largest number of a 
     * certain colum of the output matrix.
     * The index of the largest value is the 
     * number the model predict, for that image
     * 
     * @param {Number} colIndex 
     * @returns the predicted digit based of the largest value index
     */
    #getPredictionFromColumn(colIndex) {
        let maxValue = -1;
        let predictedDigit = -1;

        for (let i = 0; i < 10; i++) {
            let val = this.#output.getMatrixValue(i, colIndex);

            if (val > maxValue) {
                maxValue = val;
                predictedDigit = i;
            }
        }
        return predictedDigit;
    }

    /**
     * It creates a new input layer based of number
     * of number of images and a images buffer,
     * containing the data of each image
     * 
     * @param {Number} count the number of images
     * @param {Float32Array} imagesBuffer 
     * @returns a matrix of size pixels per image by the number of images
     */
    #newInputLayer(count, imagesBuffer) {
        let pixelsPerImage = (this.#pixelsPerImage) ? this.#pixelsPerImage : imagesBuffer.length;

        let totalElements = count * pixelsPerImage;
        let validData = imagesBuffer.subarray(0, totalElements);
        let tempInput = new Matrix(count, pixelsPerImage, validData);

        return Matrix.transpose(tempInput);
    }

    /**
     * Set a new data set as well as the pixels per image
     * 
     * @param {DataSet} dataSet 
     */
    #setDataSet(dataSet) {
        this.#dataSet = dataSet;
        this.#pixelsPerImage = dataSet.pixelsPerImage;
    }

    /**
     * This allows for a dinamic learngin rate,
     * where it goes down by half, according to 
     * the epoch ans the iteration
     * 
     * @param {Number} epoch the number of iterations
     * @param {Number} iteration the current iteration
     */
    #stepDecay(epoch, iteration) {
        if (
            (iteration === Math.floor(epoch * .25)) ||
            (iteration === Math.floor(epoch * .50)) ||
            (iteration === Math.floor(epoch * .75))) {

            this.#learningRate *= .5;
        }
    }

    /**
     * If the lables of a given data set come
     * in a array format, it converts it to the
     * one hot encoded format
     * 
     * @param {Array} labels 
     */
    #oneHotEncoder(labels) {
        let labelsLenght = labels.length;
        let labelArrayLength = this.#hiddenOutputWeights.rows;

        let labelsMatrix = new Matrix(labelArrayLength, labelsLenght);

        for (let i = 0; i < labelsLenght; i++) {
            let label = labels[i];
            if (label >= labelArrayLength) { throw new Error("invalid label") }

            for (let j = 0; j < labelArrayLength; j++) {
                labelsMatrix.setMatrixValue(j, i, int(label == j));
            }
        }

        return labelsMatrix;
    }

    /**
     * the fordward algorithm, this is the part where the model
     * guess the image
     */
    #fordWard() {
        this.#hiddenLayerBeforeActivation = Matrix.dotProduct(this.#inputHiddenWeights, this.#inputLayer);

        this.#hiddenLayerBeforeActivation.addVector(this.#inputHiddenBiases);
        this.#hiddenLayer = NeuralNetwork.leakyReLU(this.#hiddenLayerBeforeActivation);

        let output = Matrix.dotProduct(this.#hiddenOutputWeights, this.#hiddenLayer);

        output.addVector(this.#hiddenOutputBiases);
        this.#output = NeuralNetwork.Softmax(output);
    }

    /**
     * the main algorithm of the neural network. This algorithm is the 
     * responsable for the model learning process. It adjust it weights and
     * biases out of an erorr and improves it predictions
     */
    #backpropagation() {
        // 1. calculate the output matrix error
        let errorMatrix = Matrix.subMatrix(this.#output, this.#labels);

        // 2. output gradient
        let average = (1 / this.#batchSize);
        let transposeHiddenLayer = Matrix.transpose(this.#hiddenLayer);

        let hiddenOutputWeightsGradient = Matrix.dotProduct(errorMatrix, transposeHiddenLayer);
        hiddenOutputWeightsGradient.scalarMult(average);

        let hiddenOutputBiasesGradient = Matrix.sumColumValues(errorMatrix);
        hiddenOutputBiasesGradient.scalarMult(average);

        // 3. error propagation to the hidden layer
        let transposeHiddenOutputWeights = Matrix.transpose(this.#hiddenOutputWeights);
        let errorHiddenLayerMatrix = Matrix.dotProduct(transposeHiddenOutputWeights, errorMatrix);

        let hiddenLayerReLUDerivate = NeuralNetwork.leakyReLUDerivate(this.#hiddenLayerBeforeActivation);
        errorHiddenLayerMatrix = Matrix.hadamardProduct(errorHiddenLayerMatrix, hiddenLayerReLUDerivate);

        // 4. input layer gradient
        let transposeInputLayer = Matrix.transpose(this.#inputLayer);

        let inputHiddenWeightsGradient = Matrix.dotProduct(errorHiddenLayerMatrix, transposeInputLayer);
        inputHiddenWeightsGradient.scalarMult(average);

        let inputHiddenBiasesGradient = Matrix.sumColumValues(errorHiddenLayerMatrix);
        inputHiddenBiasesGradient.scalarMult(average);

        // 5. scaling gradients by learning rate        
        hiddenOutputWeightsGradient.scalarMult(this.#learningRate);
        hiddenOutputBiasesGradient.scalarMult(this.#learningRate);
        inputHiddenWeightsGradient.scalarMult(this.#learningRate);
        inputHiddenBiasesGradient.scalarMult(this.#learningRate);

        // 6. update matrices
        this.#hiddenOutputWeights = Matrix.subMatrix(this.#hiddenOutputWeights, hiddenOutputWeightsGradient);
        this.#hiddenOutputBiases = Matrix.subMatrix(this.#hiddenOutputBiases, hiddenOutputBiasesGradient);

        this.#inputHiddenWeights = Matrix.subMatrix(this.#inputHiddenWeights, inputHiddenWeightsGradient);
        this.#inputHiddenBiases = Matrix.subMatrix(this.#inputHiddenBiases, inputHiddenBiasesGradient);
    }

    /**
     * loads a save model onto the neural network structure, that is,
     * it basic configuration and weights and biases values
     * 
     * @param {Object} modelData a json file containg the data for the model
     */
    loadModel(modelData, onLog = console.log) {
        const inputSize = modelData.config.inputSize;
        const hiddenNeurons = modelData.config.hiddenNeurons;
        const outputSize = modelData.b2.length;

        this.#inputHiddenWeights = new Matrix(hiddenNeurons, inputSize, modelData.w1);
        this.#inputHiddenBiases = new Matrix(hiddenNeurons, 1, modelData.b1);

        this.#hiddenOutputWeights = new Matrix(outputSize, hiddenNeurons, modelData.w2);
        this.#hiddenOutputBiases = new Matrix(outputSize, 1, modelData.b2);

        onLog("succesfuly loaded model");
    }

    /**
     * its save the current model onto a json file, that can later be loaded again.
     * It saves the input size, the amount of neurons of the hidden layer, and
     * the weights ans biases values
     */
    saveModel() {
        const modelData = {
            config: {
                inputSize: this.#inputHiddenWeights.cols,
                hiddenNeurons: this.#hiddenOutputWeights.cols,
            },

            w1: this.#inputHiddenWeights.data,
            b1: this.#inputHiddenBiases.data,
            w2: this.#hiddenOutputWeights.data,
            b2: this.#hiddenOutputBiases.data,
        };

        saveJSON(modelData, 'nn.json');
    }

    /**
     * this calculates the loss value of the model, that is,
     * how far of are its prediciton to the real answer.
     * It uses the cross entropy algorithm
     * 
     * @returns the value of the loss function
     */
    lossFunctionValue() {
        const epsilon = 1e-8;
        let loss = 0;

        for (let i = 0; i < this.#output.rows; i++) {
            for (let j = 0; j < this.#output.cols; j++) {
                let label = this.#labels.getMatrixValue(i, j);
                if (!label) { continue }

                let matrixValue = this.#output.getMatrixValue(i, j);
                let logValue = Math.log(matrixValue + epsilon);

                loss += logValue;
            }
        }

        loss *= -1;
        loss /= this.#output.cols;

        return loss;
    }

    /**
     * this is a variation of the ReLU activation function, that help
     * avoiding the dyning neurons issue.
     * This function hoes through all the matrix value, and if the 
     * value is positive, it let it be, but if its not,
     * it multiply it by some alpha
     * 
     * @param {Matrix} matrix 
     * @returns a matrix with the new activated values
     */
    static leakyReLU(matrix) {
        let newMatrix = new Matrix(matrix.rows, matrix.cols);
        const alpha = .01;

        for (let i = 0; i < matrix.rows; i++) {
            for (let j = 0; j < matrix.cols; j++) {
                let matrixValue = matrix.getMatrixValue(i, j);
                let newMatrixValue = (matrixValue > 0) ? matrixValue : matrixValue * alpha;

                newMatrix.setMatrixValue(i, j, newMatrixValue);
            }
        }

        return newMatrix;
    }

    /**
     * this calculates the derivate of the leaky ReLU fucntion,
     * but instead of setting to cero the negative values, it
     * set them to be a aplha value
     * 
     * @param {Matrix} matrix 
     * @returns a new matrix wiht the derivate values
     */
    static leakyReLUDerivate(matrix) {
        let newMatrix = new Matrix(matrix.rows, matrix.cols);
        const alpha = .01;

        for (let i = 0; i < matrix.rows; i++) {
            for (let j = 0; j < matrix.cols; j++) {
                let matrixValue = matrix.getMatrixValue(i, j);
                let newMatrixValue = (matrixValue > 0) ? 1 : alpha;

                newMatrix.setMatrixValue(i, j, newMatrixValue);
            }
        }

        return newMatrix;
    }

    /**
     * this calculate the softmax function of a given matrix.
     * The softmax function converts the values of a matrix to 
     * a percentage, bases on the actual value and the amount of
     * values in the matrix col
     * 
     * @param {Matrix} matrix 
     */
    static Softmax(matrix) {
        let newMatrix = new Matrix(matrix.rows, matrix.cols);

        for (let i = 0; i < matrix.cols; i++) {
            let maxColValue = -Infinity;

            for (let j = 0; j < matrix.rows; j++) {
                let matrixValue = matrix.getMatrixValue(j, i);
                if (matrixValue > maxColValue) { maxColValue = matrixValue }
            }

            let expSum = 0;

            for (let j = 0; j < matrix.rows; j++) {
                let matrixValue = matrix.getMatrixValue(j, i);
                let expValue = Math.exp(matrixValue - maxColValue);
                newMatrix.setMatrixValue(j, i, expValue);

                expSum += expValue;
            }

            for (let j = 0; j < matrix.rows; j++) {
                let matrixValue = newMatrix.getMatrixValue(j, i);
                newMatrix.setMatrixValue(j, i, matrixValue / expSum);
            }
        }

        return newMatrix;
    }

    /**
     * prints the inital configuration of the model before training
     */
    printInitialStatus(onLog = console.log) {
        onLog(" --- NN INITIAL CONFIGURATION --- ");

        onLog("Pixels per Image:", this.#pixelsPerImage);

        onLog("Weights W1 (Input->Hidden):", this.#inputHiddenWeights.rows, "x", this.#inputHiddenWeights.cols);
        onLog("Weights W2 (Hidden->Output):", this.#hiddenOutputWeights.rows, "x", this.#hiddenOutputWeights.cols);

        onLog("Initial Weights W1 sample:", this.#inputHiddenWeights.getMatrixValue(0, 0));
        onLog("Initial Weights W2 sample:", this.#hiddenOutputWeights.getMatrixValue(0, 0));

        if (this.#dataSet) {
            onLog("Total Training Images:", this.#dataSet.totalImages);
        }

        onLog("---------------------------------------");
    }
}