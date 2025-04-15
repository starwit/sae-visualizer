package de.starwit.saeconnection;

import java.time.Duration;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.connection.DataType;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import de.starwit.websocket.MessageService;

@Component
public class StreamMonitor {

    private Logger log = LoggerFactory.getLogger(this.getClass());

    @Value("${spring.redis.maxStreamAge:1s}")
    private Duration maxAge;
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    @Autowired
    private MessageService messageService;

    @Scheduled(fixedRate = 2000)
    public void getAvailableStreams() {
        // Get the list of available streams
        Set<String> allKeys = redisTemplate.keys("*");

        List<String> streamKeys = allKeys.stream()
            .filter(k -> redisTemplate.type(k) == DataType.STREAM)
            .collect(Collectors.toList());

        // The age calculation can yield negative results, which is fine in this case but smth to keep in mind
        Long serverTime = getServerTime();
        List<String> recentlyUpdatedStreams = streamKeys.stream()
            .filter(k -> (serverTime - getLastMessageTimestamp(k)) < maxAge.toMillis())
            .collect(Collectors.toList());
        
        messageService.setAvailableStreams(recentlyUpdatedStreams);
    }

    private Long getServerTime() {
        return redisTemplate.execute(new RedisCallback<Long>() {
            @Override
            public Long doInRedis(RedisConnection connection) throws DataAccessException {
                return connection.serverCommands().time();
            }
        });
    }

    private Long getLastMessageTimestamp(String streamKey) {
        String lastMessageId = redisTemplate.opsForStream().info(streamKey).lastEntryId();
        Long lastMessageTimestamp = Long.parseLong(lastMessageId.split("-")[0]);
        return lastMessageTimestamp;
    }
}
