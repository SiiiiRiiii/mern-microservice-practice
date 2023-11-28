import axios from "axios";
import {addError, addMessage} from "../notification/notificationSlice";
import {loadSaves, addSave, removeSave} from "./saveSlice";
import {loadGameFile} from "../game/gameSlice";

const gameServiceClient = axios.create({
    baseURL: "http://localhost:4003/api/game",
    timeout: 30000,
    withCredentials: true
});

export const save = gameState => dispatch => {
    gameServiceClient.post("/save", { gameState: gameState })
        .then(response => {
            dispatch(addSave(response.data.game));
            dispatch(addMessage("Your game file has been saved"));
        })
        .catch(error => {
            dispatch(addError("Unable to save game file - " + error?.response?.data?.message || error));
        });
};

export const findAllSavesForCurrentUser = () => dispatch => {
    gameServiceClient.get("/all")
        .then(response => {
            dispatch(loadSaves(response.data.results));
        })
        .catch(error => {
            dispatch(addError("Unable to load your save files - " + error?.response?.data?.message || error));
        });
};

export const loadGame = id => dispatch => {
    gameServiceClient.get(`/${id}/load`)
        .then(response => {
            dispatch(loadGameFile(response.data.game));
            dispatch(addMessage("Game successfully loaded"));
        })
        .catch(error => {
            dispatch(addError("Unable to load game: " + error?.response?.data?.message || error));
        });
};

export const deleteGame = id => dispatch => {
    gameServiceClient.delete(`/${id}`)
        .then(response => {
            dispatch(removeSave(id));
            dispatch(addMessage("Your game file has been deleted"));
        })
        .catch(error => {
            dispatch(addError("Unable to delete game file: " + error?.response?.data?.message || error));
        });
};
