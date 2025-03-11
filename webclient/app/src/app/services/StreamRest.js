import axios from "axios";

class StreamRest  {
    constructor() {
        this.baseUrl = "/sae-visualizer/api/messages";
    }

    getAvailableStreams = () => {
        return axios.get(this.baseUrl + "/streams");
    };
}
export default StreamRest;