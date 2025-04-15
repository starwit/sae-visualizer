package de.starwit.saeconnection;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.connection.stream.StreamOffset;
import org.springframework.data.redis.stream.StreamMessageListenerContainer;
import org.springframework.data.redis.stream.Subscription;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.AbstractSubProtocolEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;
import org.springframework.web.socket.messaging.SessionUnsubscribeEvent;

import de.starwit.websocket.MessageService;

@Component
public class SubscriptionSynchronizer implements ApplicationListener<AbstractSubProtocolEvent> {

    private Logger log = LoggerFactory.getLogger(this.getClass());
    
    @Autowired
    private StreamMessageListenerContainer<String, MapRecord<String, String, String>> streamMessageListenerContainer;

    @Autowired
    private MessageService messageService;

    private Map<String, List<String>> sessionIdsByDestination = new HashMap<>();
    private Map<String, String> destinationBySessionId = new HashMap<>();

    private Map<String, Subscription> subscriptionByDestination = new HashMap<>();

    @Override
    public synchronized void onApplicationEvent(AbstractSubProtocolEvent event) {
        log.info("Received event of type " + event.getClass().getSimpleName());
        
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();

        if (event instanceof SessionSubscribeEvent) {
            String destination = headerAccessor.getDestination();
            log.info("SUBSCRIBE to " + destination + "(sessionId=" + sessionId + ")");

            this.addSession(sessionId, destination);

            log.info("Added " + sessionId + " for " + destination);
        } else if (event instanceof SessionUnsubscribeEvent || event instanceof SessionDisconnectEvent) {
            log.info("Session ended " + sessionId);

            this.removeSession(sessionId);
        }

        synchronizeSubscriptions();

        if (log.isInfoEnabled()) {
            sessionIdsByDestination.entrySet().stream()
                .forEach(entry -> {log.info(entry.getKey() + ": " + Arrays.toString(entry.getValue().toArray()));});
        }
        
    }
    
    private void addSession(String sessionId, String destination) {
        destinationBySessionId.put(sessionId, destination);
        
        List<String> existingIds = sessionIdsByDestination.get(destination);
        if (existingIds == null) {
            existingIds = new ArrayList<>();
            sessionIdsByDestination.put(destination, existingIds);
        }
        existingIds.add(sessionId);
    }
    
    private void removeSession(String sessionId) {
        String destination = destinationBySessionId.get(sessionId);
        if (destination != null) {
            List<String> existingIds = sessionIdsByDestination.get(destination);
            existingIds.remove(sessionId);
            if (existingIds.isEmpty()) {
                destinationBySessionId.remove(sessionId);
                sessionIdsByDestination.remove(destination);
            }
        }
    }

    private void synchronizeSubscriptions() {
        // Make sure that there is an active subscription for all active destinations (i.e. with sessions attached)
        for (String destination : sessionIdsByDestination.keySet()) {
            if (subscriptionByDestination.get(destination) == null) {
                String streamId = streamIdFromDestination(destination);
                Subscription subscription = streamMessageListenerContainer.receive(StreamOffset.latest(streamId), messageService::handleMessage);
                subscriptionByDestination.put(destination, subscription);
            }
        }

        // Make sure there are no subscriptions for destinations with no sessions attached
        for (String destination : subscriptionByDestination.keySet()) {
            if (!sessionIdsByDestination.containsKey(destination)) {
                Subscription existingSubscription = subscriptionByDestination.get(destination);
                streamMessageListenerContainer.remove(existingSubscription);
            }
        }

    }

    private String streamIdFromDestination(String destination) {
        return destination.substring(destination.lastIndexOf("/") + 1);
    }
}

