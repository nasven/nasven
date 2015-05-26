var p = Packages.org.fusesource.mqtt.client;
var mqtt = new p.MQTT();
mqtt.setHost('tcp://test.mosquitto.org:1883');
print("Connecting...");
con = mqtt.blockingConnection();
con.connect();
print("Connected! Now subscribing... ");
con.subscribe([new p.Topic("presence", p.QoS.AT_LEAST_ONCE)]);
print("Subscribed! Now publishing... ");
con.publish("presence", "Hello Nashorn!".getBytes(), p.QoS.AT_LEAST_ONCE, false);
print("Published! Now receiving...");
var message = connection.receive();
print("Received! --> " + new java.lang.String(message.getPayload()));
print("Now disconnecting...");
message.ack();
con.disconnect();
print("Disconnected");

