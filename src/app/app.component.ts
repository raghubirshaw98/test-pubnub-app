import { Component, OnDestroy, OnInit } from '@angular/core';
import { PubNubAngular } from 'pubnub-angular2';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [PubNubAngular]
})
export class AppComponent {
  title = 'jagota-driver-app';
  pubnub: PubNubAngular;
  channel: string;
  watchID: any;
  watchNow: boolean = false;
  buttonClass = '';
  pubnubError = true;
  pubnubTime = '';
  constructor(pubnub: PubNubAngular) {
    this.channel = 'driver_bcnf';
    this.pubnub = pubnub;
    this.pubnub.init({
      publishKey: 'pub-c-c5d50824-f354-4f9c-87db-f0be1d5105dc',
      subscribeKey: 'sub-c-8c59747c-e934-11eb-b05e-3ebc6f27b518'
    });
    this.pubnub.subscribe({
      channels: [this.channel],
      triggerEvents: ['message']
    });
  }

  watchNowFn(event: Event) {
    if (!event) { return; }
    const watchMe = !(this.watchNow);
    if (watchMe) {
      this.watchID = navigator.geolocation.watchPosition(
        position => {
          const { latitude, longitude } = position.coords;
          console.log("got location from navigator", latitude, longitude);
          this.pubnubTime = `Location: ${latitude} ${longitude}`;
          this.pubnub.publish({
            channel: this.channel, message: { latitude, longitude }
          }, (status = {}, response) => {
            const { error } = status;
            if (error === false) {
              this.pubnubError = false;
              this.pubnubTime = `response: ${response.timetoken}`;
              console.log("successfully sent to channel", status, response);
            } else {
              this.pubnubError = true;
              this.pubnubTime = 'Location not sending';
              console.log("error in sending to channel", status, response);
            }
          });
        })
    } else if (watchMe && this.watchID !== undefined) {
      navigator.geolocation.clearWatch(this.watchID);
    }
    this.watchNow = watchMe;
    this.buttonClass = watchMe ? 'spinning' : '';
  }
}
