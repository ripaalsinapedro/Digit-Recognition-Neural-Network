class DataSet {
    #images;
    #labels;

    #pixelsPerImage = 784;
    #totalImages;
    #indicesArray;

    /**
     * This class create the data set object, that stores all the 
     * digits and lables of the data table, that have the information
     * of the mnist digits.
     * It also stores the amount of images and the pixels per image,
     * that is, because this get the data from the mnist data set,
     * a constant number of 784 pixes per image.
     * It can be initalized wiht a data table for it to be process and
     * then stored, or, it can be initalized with the images and labels
     * alredy procces
     * 
     * @param {Uint8Array} [images=undefined] 
     * @param {Uint8Array} [labels=undefined] 
     * @param {Object} [dataTable=undefined] 
     */
    constructor(images = undefined, labels = undefined, dataTable = undefined) {
        this.#images = (images) ? images : [];
        this.#labels = (labels) ? labels : [];

        if (dataTable != undefined) { this.#processDataset() }

        this.#totalImages = this.#labels.length;
        this.#indicesArray = Array.from({ length: this.#totalImages }, (_, i) => i);
    }

    get pixelsPerImage() {
        return this.#pixelsPerImage;
    }

    get totalImages() {
        return this.#totalImages;
    }

    /**
     * It process the data table that contains the information
     * of the mnist digits, and covert it to two arrays,
     * the images array, that contains all the images,
     * and the labels array that contains wich number is
     * each image
     * 
     * @param {Object} dataTable 
     */
    #processDataset(dataTable) {
        let totalRows = dataTable.getRowCount();
        for (let i = 0; i < totalRows; i++) {
            let row = dataTable.getRow(i);

            this.#labels.push(row.getNum(0));

            let imageArray = new Array(this.#pixelsPerImage);
            for (let j = 0; j < this.#pixelsPerImage; j++) {
                imageArray[j] = row.getNum(j + 1);
            }
            this.#images.push(imageArray);
        }

        this.#saveDataSetBinary();
    }

    /**
     * This function saves the process tables into bin files,
     * so then it can recover the the process data from those files
     * without having to process them again
     */
    #saveDataSetBinary() {
        const totalPixels = this.#totalImages * this.#pixelsPerImage;
        const imagesBuffer = new Uint8Array(totalPixels);

        for (let i = 0; i < this.#totalImages; i++) {
            for (let j = 0; j < this.#pixelsPerImage; j++) {
                let val = this.#images[i][j];
                imagesBuffer[i * this.#pixelsPerImage + j] = val;
            }
        }

        const labelsBuffer = new Uint8Array(this.#labels);

        const downloadBin = (data, filename) => {
            console.log(data);

            const blob = new Blob([data], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);

            // Creamos un elemento <a> (enlace) que no se ve en la página
            const a = document.createElement('a');
            a.href = url;
            a.download = filename; // El nombre con el que se guardará el archivo

            // Simulamos un clic en el enlace para iniciar la descarga
            a.click();

            // Liberamos la memoria eliminando la URL temporal
            URL.revokeObjectURL(url);
        };

        downloadBin(imagesBuffer, 'mnist_images.bin');
        downloadBin(labelsBuffer, 'mnist_labels.bin');
    }

    /**
     * It shuffles the index array
     */
    shuffleIndexArray() {
        this.#indicesArray = shuffle(this.#indicesArray);
    }

    /**
     * It get a slice of the images and labels array,
     * and stores it a target and targets label buffers.
     * This is so the neural network can work in batches of
     * data insted of the entire thing at once
     * 
     * @param {Number} start the start of the slice
     * @param {Number} batchSize the amount of data it wants to recover
     * @param {Float32Array} targetBuffer the images buffer
     * @param {Uint8Array} targetLabelsBuffer the lables buffer
     * @returns the amount of data it process
     */
    getBatchToBuffer(start, batchSize, targetBuffer, targetLabelsBuffer) {
        let end = Math.min(start + batchSize, this.#totalImages);
        let count = 0;

        for (let i = start; i < end; i++) {
            let realIndex = this.#indicesArray[i];

            let offset = realIndex * this.#pixelsPerImage;
            for (let p = 0; p < this.#pixelsPerImage; p++) {
                targetBuffer[count * this.#pixelsPerImage + p] = this.#images[offset + p] / 255.0;
            }

            targetLabelsBuffer[count] = this.#labels[realIndex];

            count++;
        }
        return count;
    }
}
