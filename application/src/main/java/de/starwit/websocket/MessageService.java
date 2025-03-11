package de.starwit.websocket;

import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.google.protobuf.InvalidProtocolBufferException;

import de.starwit.visionapi.Sae.BoundingBox;
import de.starwit.visionapi.Sae.Detection;
import de.starwit.visionapi.Sae.SaeMessage;
import java.util.ArrayList;

@Service
public class MessageService {

    private Logger log = LoggerFactory.getLogger(MessageService.class);

    @Autowired
    private SimpMessagingTemplate template;    

    @Value("${spring.redis.streamId:test}")
    String streamId;

    public void handleMessage(MapRecord<String, String, String> message) {
        //log.debug("Message received: {}", message.getId());
        String protobuf_data = message.getValue().get("proto_data_b64");
        try {
            SaeMessage proto = SaeMessage.parseFrom(Base64.getDecoder().decode(protobuf_data));
            convertToDTOToQueue(proto);
        } catch (InvalidProtocolBufferException e) {
            log.error("Error decoding proto from message. streamId=" + streamId);
            log.debug(e.getMessage());
        }
    }

    private void convertToDTOToQueue(SaeMessage saeMessage) {
        
        List<TrajectoryDTO> trackedObjects = new ArrayList<>();

        for (Detection detection : saeMessage.getDetectionsList()) {
            var t = new TrajectoryDTO();
            byte[] objectID = detection.getObjectId().toByteArray();             
            t.setObjectId(HexFormat.of().formatHex(objectID));
            t.setClassId(detection.getClassId());
            t.setReceiveTimestamp(LocalDateTime.now());
            t.setStreamId(streamId);
            if (detection.getGeoCoordinate().getLatitude() == 0.0 && detection.getGeoCoordinate().getLongitude() == 0.0) {
                // Let's hope we never detect objects at geo coordinates 0,0
                t.setHasGeoCoordinates(false);
                t = setNormalizedImageCoordinates(t, detection.getBoundingBox());
            } else {
                t.setHasGeoCoordinates(true);
                t.getCoordinates().setLatitude(detection.getGeoCoordinate().getLatitude());
                t.getCoordinates().setLongitude(detection.getGeoCoordinate().getLongitude());                
            }
            trackedObjects.add(t);
            //log.debug("Added message to queue: {}", t.toString());
        }

        this.template.convertAndSend("/topic/location", trackedObjects);
    }

    private TrajectoryDTO setNormalizedImageCoordinates(TrajectoryDTO t, BoundingBox bb) {
        // compute center of bounding box
        float x = bb.getMaxX() - bb.getMinX();
        float y = bb.getMaxY() - bb.getMinY();
        t.getCoordinates().setX(x);
        t.getCoordinates().setY(y);
        return t;
    }
}
