import { Client } from '@stomp/stompjs';

class WebSocketClient {
    constructor() {
    }

    setup(onMessageCallback, streams) {
        this.onMessageCallback = onMessageCallback;
        this.streams = streams;

        this.stompClient = new Client({
            brokerURL: '/sae-visualizer/location-websocket'
        });   

        this.stompClient.onWebSocketError = (error) => {
            console.error('Error with websocket', error);
        };

        this.stompClient.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };
    }

    connect() {
        if (this.stompClient) {
            this.stompClient.onConnect = (frame) => {
                console.log('Connected: ' + frame);
                for (let stream of this.streams) {
                    this.stompClient.subscribe('/topic/location/' + stream, (location) => {
                        this.onMessageCallback(JSON.parse(location.body), stream);
                    });
                }
            };

            this.stompClient.activate();
        }
    }

    disconnect() {
        if (this.stompClient) {
            this.stompClient.deactivate();
        }
    }

}

export default WebSocketClient;