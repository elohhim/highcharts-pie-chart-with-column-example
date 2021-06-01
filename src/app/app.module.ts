import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HighchartsChartModule } from 'highcharts-angular';

import { AppComponent } from './app.component';

@NgModule({
  imports: [BrowserModule, FormsModule, HighchartsChartModule],
  declarations: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule {}
