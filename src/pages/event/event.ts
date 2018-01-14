import { Component } from '@angular/core';
import { NavController,NavParams } from 'ionic-angular';
import { EventsProvider } from '../../providers/events';



@Component({
  selector: 'page-event',
  templateUrl: 'event.html'
})
export class EventPage {

  event:any;
  today=new Date();
  show_more=false;
  message="";
  //Datas don't contain the event description so I created an example
  description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum porttitor ullamcorper tristique. Morbi lobortis non orci in gravida. Curabitur interdum mi id metus scelerisque tristique. Phasellus sagittis at arcu id viverra. Sed in ipsum nulla. Donec sit amet eros vel ex bibendum varius. Sed non dictum ipsum, vel tempor augue. Mauris nisl nunc, fringilla quis sagittis et, aliquam id sapien"

  constructor(public navCtrl: NavController,
              eventsProvider:EventsProvider,
              public navParams: NavParams) {
    //Get the event title passed from the home page
    let title=this.navParams.get('title');
    //Fetch events datas from API
    eventsProvider.getEvents().subscribe(datas => {
      for(let i=0;i<datas.length;i++){
        if(datas[i].title==title) {
          //Save local even var
          this.event=datas[i];
        }
      }
    })
  }

  //Return to home page
  goBack(){
    this.navCtrl.pop();
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

  //Check if date is today
  isToday(d:string):boolean{
    let date=this.getDateFormat(d);
    let t=new Date(this.today.getFullYear(),this.today.getMonth(),this.today.getDate())
    return t.getTime()==date.getTime();
  }

  //Get the week day name
  getDayName(d:string):string{
    let date=this.getDateFormat(d);
    let dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ];
    return dayNames[date.getDay()];
  }

  //Get the month name 
  getMonth(d:string):string{
    let monthNames = ["Jan.", "Feb.", "Mar.", "Apr.", "May.", "Jun.",
      "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."
    ];
    let date=this.getDateFormat(d);
    return monthNames[date.getMonth()];
  }


}
