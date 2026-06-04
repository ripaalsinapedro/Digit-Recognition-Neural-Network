# Digit-Recognition-Neural-Network
In this project i try to make a digit recognition neural network from scratch, using as few libries as i can. Altough this meant that maybe the algortihm isnt the fastest, i like the challenge of coding everything myself, from the neural network structure, to the math behind it.

I use the mnist data set to train and test mi neural network, i have to process the csv files a got and store the data as bin files, in order to be able of uploiding my project to the github repostory, and to help to the perfomace.

The neural network is a basic linear regression model, with the standar fordward and backward seccuence, and all the data of the neural network, meaning the all the weights, biases and outputs from each layer, are stored and managed by a matrix class, that also handles all of the math.

You are welcome to check the website i create here: https://ripaalsinapedro.github.io/Digit-Recognition-Neural-Network/

This website comes with a pre train model of 16 neurons and 1000 iterations of training, and a board where you can input some digits to test it. It also allows the user to load pre train models from a json file, create a new model, train it and test it. This new model can also be saved onto a json file.
