package de.starwit.websocket;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;

@RestController
@RequestMapping(path = "${rest.base-path}/messages")
public class MessageController {

    private Logger log = LoggerFactory.getLogger(MessageController.class);

    @Autowired
    MessageService messageService;

    @Operation(summary = "get list of all available message streams")
    @GetMapping(value = "/streams")
    public List<String> getMessageStreams() {
        return messageService.getAvailableStreams();
    }  
}
