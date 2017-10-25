import { Injectable, Pipe } from '@angular/core';

@Pipe({
  name: 'TimeStamp'
})
@Injectable()
export class TimeStamp {
  DateTime: any; 
  postDateTime: any; 
  currentDateTime: any; 
  
  transform(value, args) {
    this.DateTime = new Date();
    if (typeof value !== 'object') {
        this.postDateTime = new Date(value);
    }
    
    var seconds = Math.floor((this.DateTime - this.postDateTime) / 1000);
    var intervalType;
    var interval = Math.floor(seconds / 31536000);

    if (interval >= 1) {
    intervalType = 'year';
    } else {
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
        intervalType = 'month';
    } else {
        interval = Math.floor(seconds / 86400);
        if (interval >= 1) {
            intervalType = 'day';
        } else {
            interval = Math.floor(seconds / 3600);
        if (interval >= 1) {
            intervalType = "hr";
        } else {
            interval = Math.floor(seconds / 60);
                if (interval >= 1) {
                    intervalType = "min";
                } else {
                    interval = seconds;
                    intervalType = "sec";
                }
            }
        }
    }
    }

    if (interval > 1 || interval === 0) {
    intervalType += 's';
    }

    return interval + ' ' + intervalType;
  }

}
