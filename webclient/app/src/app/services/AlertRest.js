import CrudRest from "./CrudRest";
import axios from "axios";

class AlertRest extends CrudRest {
    constructor() {
        super(window.location.pathname + "api/alerts");
    }

    findAllMarker = () => {
        return axios.get(this.baseUrl + "/marker");
    };
}
export default AlertRest;