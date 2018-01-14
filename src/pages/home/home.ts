import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { EventsProvider } from '../../providers/events';
import { EventPage } from '../event/event';
import { Preference } from '../classes/Preference'

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  dataError=false;
  today_events=[];
  week_events=[];
  month_events=[];
  past_events=[];
  others_events=[];
  all_events=[];
  today=new Date();
  day_of_week=new Date().getDay();
  days_left=0;
  last_week_day=new Date();
  going=false;
  ignore=false;
  preferences:Preference[];
  searchValue:String;

  constructor(public navCtrl: NavController,
              eventsProvider:EventsProvider) {
    //Days left from the last week day to today
    this.days_left=6-this.day_of_week;
    //Set the last week day
    this.last_week_day.setDate(this.today.getDate() + this.days_left);
    this.searchValue="";
    this.preferences=[];
    //Call service to fetch events datas
    eventsProvider.getEvents().subscribe(
    data=> {
      let box=[];
      box=data;
      console.log(box);
      this.all_events=box;
      //Datas for TEST
      /*
      this.all_events[1].dateTime="12-1-2018 21:22:48"
      this.all_events[2].dateTime="14-1-2018 21:22:48"
      this.all_events[4].dateTime="16-1-2018 21:22:48"
      this.all_events[3].dateTime="21-2-2018 21:22:48"
      */
      //Local preferences variable filling
      for(let j=0;j<box.length;j++){
        this.preferences.push(new Preference(box[j].title,box[j].status));
      }
      
      this.fillDatas(box);
    },
    err=>{
      this.dataError=true;
    });
  }

  action(title:string, type, event){
    /*In a real case project I will save these preferences in a Db N to N table associating the project id and the user id, so
    if user change device, he can find his preferences anywhere.
    I cannot use the event id because events doesn't have unique id's.
    preferences:{
      projectID,
      userID
    }*/
    //Stop propagation to the parent div
    event.stopPropagation();
    for(let i=0;i<this.preferences.length;i++){
      if(this.preferences[i].eventTitle==title){
        if(this.preferences[i].type=='none'){
          this.preferences[i].type=type;
          return;
        }
        else{
          this.preferences[i].type='none';
          return;
        }
      }
    }
    
  }

  //Divide event by today, this week and this month
  fillDatas(box){
    for(let i=0;i<box.length;i++){
      
      if(this.isToday(box[i].dateTime)) {
        this.today_events.push(box[i]);
        continue;
      }
      if(this.getDateFormat(box[i].dateTime)<this.today){
        this.past_events.push(box[i]);
        continue;
      }
      if(this.isInSameWeek(box[i].dateTime)) {
        this.week_events.push(box[i]);
        continue;
      }
      if(this.isInSameMonth(box[i].dateTime)) {
        this.month_events.push(box[i]);
        continue;
      }
      
      if(!this.isToday(box[i].dateTime) && !this.isInSameWeek(box[i].dateTime) && !this.isInSameMonth(box[i].dateTime) && !(this.getDateFormat(box[i].dateTime)<this.today)){
        this.others_events.push(box[i]);
        continue;
      }
    }
  }

  //Get the input search events value and fill the today, week, month, past_events and others arrays
  searchInput(event:any){
    this.today_events=[];
    this.week_events=[];
    this.month_events=[];
    this.past_events=[];
    this.others_events=[];
    let events=this.all_events;
    for(let i=0;i<events.length;i++){
      //If input value is not empty, check which event match the value
      if(event.target.value!='' && (events[i].title.toLowerCase().startsWith(event.target.value.toLowerCase()))){
        if(this.getDateFormat(events[i].dateTime)<this.today){
          this.past_events.push(events[i]);
          continue;
        }
        if(this.isToday(events[i].dateTime)) {
          this.today_events.push(events[i]);
          continue;
        }
        if(this.isInSameWeek(events[i].dateTime)) {
          this.week_events.push(events[i]);
          continue;
        }
        if(this.isInSameMonth(events[i].dateTime)) {
          this.month_events.push(events[i]);
          continue;
        }
        if(!this.isToday(events[i].dateTime) && !this.isInSameWeek(events[i].dateTime) && !this.isInSameMonth(events[i].dateTime) && !(this.getDateFormat(events[i].dateTime)<this.today)){
          this.others_events.push(events[i]);
          continue;
        }
      }
      //If data values is empty, refill arrays
      if(event.target.value==''){
        if(this.getDateFormat(events[i].dateTime)<this.today){
          this.past_events.push(events[i]);
          continue;
        }
        if(this.isToday(events[i].dateTime)) {
          this.today_events.push(events[i]);
          continue;
        }
        if(this.isInSameWeek(events[i].dateTime)) {
          this.week_events.push(events[i]);
          continue;
        }
        if(this.isInSameMonth(events[i].dateTime)) {
          this.month_events.push(events[i]);
          continue;
        }
        if(!this.isToday(events[i].dateTime) && !this.isInSameWeek(events[i].dateTime) && !this.isInSameMonth(events[i].dateTime) && !(this.getDateFormat(events[i].dateTime)<this.today)){
          this.others_events.push(events[i]);
          continue;
        }
      }
    }
  }

  //Get user preference by title: going, ignore, none
  getPreference(title:string):string{
    for(let i=0;i<this.preferences.length;i++){
      if(this.preferences[i].eventTitle==title){
        return this.preferences[i].type;
      }
    }
  }

  getDateFormat(d:string){
    /*Date parsing in JS is problematic because system cannot detect very well which is the day,
    the month and the year. So I need to split all the datas and create a data object with date 
    values independetly. If you create a data object like this new Data(d) and try to call a get method
    like getMonth it returns NaN.*/

    //I take only the date
    let datePart:String=d.split(" ")[0];
    //Split data values. I also have to decrase by 1 the month value.
    let dataValues=datePart.split('-');
    let day=parseInt(dataValues[0]);
    let month=parseInt(dataValues[1])-1;
    let year=parseInt(dataValues[2]);
    //Now I can create the Date object
    return new Date(year,month,day);
  }

  //Check if date is today
  isToday(d:string):boolean{
    let date=this.getDateFormat(d);
    let t=new Date(this.today.getFullYear(),this.today.getMonth(),this.today.getDate())
    return t.getTime()==date.getTime();
  }

  //To find the event datils I have to pass the title because the id's are not unique
  goEventDetails(title:string):void{
    let t=this.getPreference(title);
    let p=new Preference(title,t);
    //Pass a json object with the title and the user preference
    this.navCtrl.push(EventPage, {title:p.eventTitle, type:p.type});

  }

  //Check if date is in the same today week
  isInSameWeek(d:string):boolean{
    let date=this.getDateFormat(d);
    return date<this.last_week_day && date>this.today;
  }

  //Check if date is in the same today month
  isInSameMonth(d:string):boolean{
    let date=this.getDateFormat(d);
    return date.getMonth() == this.today.getMonth() && date.getFullYear() == this.today.getFullYear();
  }

  //Get the month name 
  getMonth(d:string):string{
    let monthNames = ["Jan.", "Feb.", "Mar.", "Apr.", "May.", "Jun.",
      "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."
    ];
    let date=this.getDateFormat(d);
    return monthNames[date.getMonth()];
  }

  //Check if date is tomorrow
  checkIsTomorrow(d:string):boolean{
    let date=this.getDateFormat(d);
    if(date.getDay()==6 && this.today.getDay()==0) return true;
    else{
      if(date.getDay()==this.today.getDay()+1) return true
      else return false;
    }
  }

  //Get the month day
  getDay(d:string):string{
    let date=this.getDateFormat(d);
    return ""+date.getDate();
  }

  //Get the hour
  getHour(d:string):string{
    let hourPart:String=d.split(" ")[1];
    let dataValues=hourPart.split('-');
    if(parseInt(dataValues[0])>12){
      return (parseInt(dataValues[0])-12)+" PM";
    }
    else{
      return dataValues[0]+" AM";
    }
    
  }

  //Get the week day name
  getDayName(d:string):string{
    let date=this.getDateFormat(d);
    let dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ];
    return dayNames[date.getDay()];
  }

  

}
