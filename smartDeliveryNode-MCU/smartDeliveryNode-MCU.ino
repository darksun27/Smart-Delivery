#include<ESP8266WiFi.h>
#include<ESP8266WebServer.h>

const char *ssid = "DarksunJ";
const char *password = "9810166770";
const char *host = "192.168.29.214";

WiFiClient client;
ESP8266WebServer server;

const int sleepTimeSeconds = 2;

void setup() {
  // put your setup code here, to run once:
  pinMode(D7, INPUT); 
  WiFi.begin(ssid, password);
  Serial.begin(115200);
  while(WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println("Connected");
  Serial.println(WiFi.localIP().toString());
  if(client.connect(host,3000)) {
    String url = "/connectBOX?ip_addr=";
    client.print(String("GET ") + url + WiFi.localIP().toString() + " HTTP/1.1\r\n" + "Host: " + host + "\r\n" + "Connection: keep-alive\r\n\r\n");
    delay(10);
    Serial.println("Response: ");
    while(client.available()) {
      String line = client.readStringUntil('\r');
      Serial.print(line);
    } 
  }

  server.on("/startJob",startJob);
  server.on("/finishJob",finishJob);
  server.begin();
}

String order_id = "";
int in_job = 0;
int message_sent = 0;

void startJob(){
  order_id = server.arg("order_id");
  in_job = 1;
  Serial.print("Started");
  server.send(200,"text/plain", String("Started"));
}

void finishJob(){
  in_job = 0;
  message_sent = 0;
  server.send(200,"text/plain",String("Finish"));
}

void loop() {
  if(in_job){
    int sensor_value = digitalRead(D7);
    if(sensor_value == 0 && message_sent == 0) {
      sendMessage("open");
    }
  }
  server.handleClient(); 
}

void sendMessage(char* value) {
  if(client.connect(host,3000)) {
    String url = "/tamper?value=";
    url += String(value);
    url += "&order_id="+order_id;
    Serial.print(url);
    client.print(String("GET ") + url + " HTTP/1.1\r\n" + "Host: " + host + "\r\n" + "Connection: keep-alive\r\n\r\n");
    delay(10);
    Serial.println("Response: ");
    while(client.available()) {
      String line = client.readStringUntil('\r');
      Serial.print(line);
      message_sent = 1;
    } 
  }
}
