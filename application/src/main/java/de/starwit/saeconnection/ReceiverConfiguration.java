package de.starwit.saeconnection;

import java.time.Duration;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceClientConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettucePoolingClientConfiguration;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.connection.stream.StreamOffset;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.data.redis.stream.StreamMessageListenerContainer;

import de.starwit.websocket.MessageService;
import io.lettuce.core.ClientOptions;
import io.lettuce.core.ClientOptions.DisconnectedBehavior;

@Configuration
public class ReceiverConfiguration {

    private Logger log = LoggerFactory.getLogger(ReceiverConfiguration.class);

    @Value("#{'${spring.redis.streamIds}'.split(',')}") 
    List<String> streamIds;

    @Value("${spring.redis.host:localhost}")
    private String redisHost;

    @Value("${spring.redis.port:6379}")
    private int redisPort;

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
    LettuceConnectionFactory lettuceConnectionFactory() {
        RedisStandaloneConfiguration redisConfig = new RedisStandaloneConfiguration(redisHost, redisPort);
        ClientOptions options = ClientOptions.builder().autoReconnect(true)
                .disconnectedBehavior(DisconnectedBehavior.REJECT_COMMANDS).build();
        LettuceClientConfiguration clientConfig = LettucePoolingClientConfiguration.builder().clientOptions(options)
                .build();
        LettuceConnectionFactory factory = new LettuceConnectionFactory(redisConfig,
                clientConfig);
        factory.setShareNativeConnection(false);
        return factory;
    }

    @Bean
    public StreamMessageListenerContainer<String, MapRecord<String, String, String>> streamMessageListenerContainer() {

        StreamMessageListenerContainer.StreamMessageListenerContainerOptions<String, MapRecord<String, String, String>> options = StreamMessageListenerContainer.StreamMessageListenerContainerOptions
                .builder()
                .pollTimeout(Duration.ofSeconds(1))
                .build();

        StreamMessageListenerContainer<String, MapRecord<String, String, String>> container = StreamMessageListenerContainer
                .create(lettuceConnectionFactory(), options);

        log.info("Start listening to messages from stream " + String.join(", ", streamIds));
        for (String streamId : streamIds) {
            container.receive(
                    StreamOffset.latest(streamId),
                    this::handleMessage);
        }

        messageService.setAvailableStreams(streamIds);

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
