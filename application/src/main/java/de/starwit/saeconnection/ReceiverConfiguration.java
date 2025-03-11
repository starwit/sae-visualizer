package de.starwit.saeconnection;

import java.time.Duration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.connection.stream.StreamOffset;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.data.redis.stream.StreamMessageListenerContainer;

import de.starwit.websocket.MessageService;

@Configuration
public class ReceiverConfiguration {

    private Logger log = LoggerFactory.getLogger(ReceiverConfiguration.class);

    @Value("${spring.redis.streamId:test}")
    String streamId;

    @Autowired
    MessageService messageService;

    @Bean
    public RedisTemplate<String, String> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, String> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new StringRedisSerializer());
        template.afterPropertiesSet();
        return template;
    }

    @Bean
    public StreamMessageListenerContainer<String, MapRecord<String, String, String>> streamMessageListenerContainer(
            RedisConnectionFactory connectionFactory) {

        StreamMessageListenerContainer.StreamMessageListenerContainerOptions<String, MapRecord<String, String, String>> options = StreamMessageListenerContainer.StreamMessageListenerContainerOptions
                .builder()
                .pollTimeout(Duration.ofSeconds(1))
                .build();

        StreamMessageListenerContainer<String, MapRecord<String, String, String>> container = StreamMessageListenerContainer
                .create(connectionFactory, options);

        log.info("Start listening to messages from stream " + streamId);
        container.receive(
                StreamOffset.latest(streamId),
                this::handleMessage);

        return container;
    }

    private void handleMessage(MapRecord<String, String, String> message) {
        messageService.handleMessage(message);
    }

    @Bean
    public ApplicationRunner runner(
            StreamMessageListenerContainer<String, MapRecord<String, String, String>> container) {
        return args -> {
            container.start();
        };
    }

}
