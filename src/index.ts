import { Viewer } from "./Viewer";
import { Configuration } from "./Configuration";
import axios from "axios";
import { Excursion } from "./Models/ExcursionModels/Excursion";

document.addEventListener("DOMContentLoaded", async () => {

    const configuration = await axios.get<Configuration>("config.json");
    if (configuration.status !== 200) {
        console.warn("Can't get configuration");
        return;
    }

    const response = await axios.get<Excursion>(configuration.data.sceneURL + "tour.json");
    if (response.status !== 200) {
        console.warn("Can't get scene description");
        return;
    }
    const viewer = new Viewer(configuration.data);
    viewer.createScene();
    await viewer.show(response.data);
});
