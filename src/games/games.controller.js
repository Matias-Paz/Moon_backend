import * as gamesModel from "./games.model.js";

export const getGames = async (req, res) => {
  try {
    const games = await gamesModel.getGamesFromDB();
    res.status(200).json(games);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

export const getGame = async (req, res) => {
  const { id } = req.params;

  try {
    const game = await gamesModel.getGameFromDB(id);
    if (game) {
      res.status(200).json(game);
    } else {
      res.status(404).send("Game not found");
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

export const createGame = async (req, res) => {
  const gameData = req.body;

  try {
    const newGame = await gamesModel.createGameInDB(gameData);
    res.status(201).json(newGame);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const deleteGame = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await gamesModel.deleteGameInDB(id);
    if (result) {
      res.status(204).send();
    } else {
      res.status(404).send("Game not found");
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

export const updateGame = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const newGame = await gamesModel.updateGameInDB(id, updateData);

    res
      .status(200)
      .json({ message: "Game updated successfully!", updatedGame: newGame });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
