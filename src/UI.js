class UI {
    #logBox;

    #neuronsInput;
    #epochsInput;
    #batchInput;
    #lrInput;

    constructor(xPos, callbacks) {
        this.x = xPos;
        this.y = 10;
        this.#createLogBox();
        this.#createElements(callbacks);
    }

    #createElements(cb) {
        // 1. load model
        createP("<b>Load Model (.json)</b>").position(this.x, this.y);
        let fileBtn = createFileInput((file) => cb.onFileUpload(file));
        fileBtn.position(this.x, this.y + 40);

        // 2. sava model
        let saveY = this.y + 80;
        createP("<b>Save Model (.json)</b>").position(this.x, saveY);
        let saveBtn = createButton("Save Model");
        saveBtn.position(this.x, saveY + 40);
        saveBtn.mousePressed(() => cb.onSaveModel());

        // 3. new model
        let modelY = saveY + 80;
        createP("<b>Create New Model</b>").position(this.x, modelY);
        createSpan("Amount of Neurons: ").position(this.x, modelY + 40);
        this.#neuronsInput = createInput('16', 'number').position(this.x + 140, modelY + 40).size(40);

        let newModelBtn = createButton('Initialize Neural Network');
        newModelBtn.position(this.x, modelY + 65);
        newModelBtn.mousePressed(() => cb.onNewModel(int(this.#neuronsInput.value())));

        // 4. train
        let trainY = modelY + 110;
        createP("<b>Training</b>").position(this.x, trainY);

        createSpan("Epoch: ").position(this.x, trainY + 35);
        this.#epochsInput = createInput('10', 'number').position(this.x + 60, trainY + 35).size(35);

        createSpan("Batch: ").position(this.x + 110, trainY + 35);
        this.#batchInput = createInput('64', 'number').position(this.x + 160, trainY + 35).size(35);

        createSpan("LR: ").position(this.x + 210, trainY + 35);
        this.#lrInput = createInput('0.1', 'number').position(this.x + 240, trainY + 35).size(35);

        let trainBtn = createButton('Begin Training');
        trainBtn.position(this.x, trainY + 65);
        trainBtn.mousePressed(() => {
            cb.onTrain(
                int(this.#epochsInput.value()),
                int(this.#batchInput.value()),
                float(this.#lrInput.value())
            );
        });

        // 5. test
        let testY = trainY + 110;
        createP("<b>Test</b>").position(this.x, testY);

        let testBtn = createButton('Test Model');
        testBtn.position(this.x, testY + 40);
        testBtn.mousePressed(() => {
            cb.onTest(
                int(this.#batchInput.value())
            );
        });

        // 6. board
        let boardY = testY + 90;
        createP("<b>Pizarra</b>").position(this.x, boardY);

        let predictBtn = createButton('🔮 ADIVINAR NÚMERO');
        predictBtn.position(this.x, boardY + 40);
        predictBtn.style('font-weight', 'bold');
        predictBtn.mousePressed(() => cb.onPredict());

        let clearBtn = createButton('🗑️ Limpiar');
        clearBtn.position(this.x + 160, boardY + 40);
        clearBtn.mousePressed(() => cb.onClear());
    }

    #createLogBox() {
        let lbX = this.x + 400;
        let lbY = this.y;

        createP("<b>Log:</b>").position(lbX, lbY);
        this.#logBox = createDiv('');
        this.#logBox.position(lbX, lbY + 40);
        this.#logBox.size(300, 500);
        
        this.#logBox.style('background-color', '#f0f0f0');
        this.#logBox.style('overflow-y', 'scroll');
        this.#logBox.style('padding', '10px');
        this.#logBox.style('font-family', 'monospace');
        this.#logBox.style('border', '1px solid #ccc');
    }

    
    addLog(message) {
        let msg = createSpan(`> ${message}<br>`);[2]
        this.#logBox.child(msg);[3]
        
        this.#logBox.elt.scrollTop = this.#logBox.elt.scrollHeight;
    }
}