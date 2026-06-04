let board, neuralNetwork, ui, defaultModelData
let trainTableImages, trainTableLabels, testTableImages, testTableLabels;

function preload() {
  defaultModelData = loadJSON("data/models/default_model.json");
  loadTables();
}

function setup() {
  createCanvas(800, 800);

  board = new Board(800);
  neuralNetwork = new NeuralNetwork(defaultModelData);

  let uiCallbacks = setupUiCallbacks();
  ui = new UI(810, uiCallbacks);
}

function setupUiCallbacks() {
  const uiCallbacks = {
    onFileUpload: (file) => {
      (file.subtype === 'json') ?
        neuralNetwork.loadModel(file.data, (msg) => ui.addLog(msg)) :
        alert("file must be a json")
    },

    onSaveModel: () => {
      neuralNetwork.saveModel();
    },

    onNewModel: (neurons) => {
      let trainDataSet = new DataSet(trainTableImages, trainTableLabels);
      neuralNetwork.createNewModel(trainDataSet, neurons, (msg) => ui.addLog(msg));
    },

    onTrain: (epochs, batch, lr) => {
      (neuralNetwork.initialized) ?
        neuralNetwork.train(epochs, batch, lr, (msg) => ui.addLog(msg)) :
        alert("the neural network must be initialize first")
    },

    onTest: (batch) => {
      let trainDataSet = new DataSet(testTableImages, testTableLabels);
      neuralNetwork.test(trainDataSet, batch, (msg) => ui.addLog(msg));
    },

    onPredict: () => {
      let boardBuffer = new Float32Array(board.board);
      neuralNetwork.predict(boardBuffer, (msg) => ui.addLog(msg));
    },

    onClear: () => {
      board.clear();
    }
  };

  return uiCallbacks;
}

function loadTables() {
  loadBytes('data/data_tables/train/mnist_images.bin', (data) => {
    trainTableImages = data.bytes;
  });

  loadBytes('data/data_tables/train/mnist_labels.bin', (data) => {
    trainTableLabels = data.bytes;
  });

  loadBytes('data/data_tables/test/mnist_images.bin', (data) => {
    testTableImages = data.bytes;
  });

  loadBytes('data/data_tables/test/mnist_labels.bin', (data) => {
    testTableLabels = data.bytes;
  });
}

function draw() {
  background(50);

  board.update();
  board.display();
}