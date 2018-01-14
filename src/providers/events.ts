import { Http, Headers, RequestOptions } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';

/*
  Generated class for the Events provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class EventsProvider {

  private errorObserver: any;
  public error: any;
  eventsUrl="https://tsh-app.firebaseio.com/events.json";
  

  constructor(public http: Http) {
    this.errorObserver = null;
    this.error = Observable.create(observer => {
      this.errorObserver = observer;
    });
  }

  getEvents() {
    //Set headers content to json
    let headers = new Headers({
      'Content-Type': 'application/json; charset=utf-8'
    });
    let options = new RequestOptions({ headers: headers });
    //Fetch datas from API given
    return this.http.get(this.eventsUrl, options)
      .map(res => res.json())
      .catch(error => this.handleError(error));
  }


  private handleError(error) {
    //Hande Observable error
    this.errorObserver.next(error);
    return Observable.throw(error.json().error || 'Server error');
  }


}
