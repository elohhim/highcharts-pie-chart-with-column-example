// author: Jan Kumor

import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import gradstop from 'gradstop';
import convert from 'color-convert';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  readonly Highcharts: typeof Highcharts = Highcharts;

  readonly data = [
    ['Apples', 15],
    ['Oranges', 5],
    ['Kiwis', 10],
    ['Strawberries', 20]
  ];

  readonly drilldownData = {
    Apples: [['Cortland', 5], ['Jonaprince', 3], ['Gala', 2], ['Lobo', 5]],
    Oranges: [['Valencia', 5]],
    Kiwis: [['Normal', 7], ['Hardy', 3]],
    Strawberries: [['Senga Sengana', 10], ['Elsanta', 9], ['Honeoye', 1]]
  };

  selectedPoint$ = new BehaviorSubject<Highcharts.Point>(null);

  options$: Observable<Highcharts.Options>;
  startAngle$ = new BehaviorSubject<number>(0);

  drilldownOptions$: Observable<Highcharts.Options>;

  ngOnInit(): void {
    this.options$ = this.startAngle$.pipe(
      map(startAngle => this.buildOptions(startAngle))
    );
    this.drilldownOptions$ = this.selectedPoint$.pipe(
      map(point => this.buildDrilldownOptions(point))
    );
  }

  buildOptions(startAngle: number): Highcharts.Options {
    const _this = this;
    return {
      chart: {
        type: 'pie'
      },
      title: {
        text: 'Pie chart with column details'
      },
      plotOptions: {
        series: {
          allowPointSelect: true,
          point: {
            events: {
              select() {
                _this.recalculateAngle(this);
                _this.selectedPoint$.next(this);
              },
              legendItemClick() {
                const selectedPoint = this.series.points.find(p => p.selected);
                if (selectedPoint) {
                  setTimeout(() => _this.recalculateAngle(selectedPoint));
                }
              }
            }
          }
        }
      },
      series: [
        {
          type: 'pie',
          id: 'data',
          name: 'sold',
          data: this.data,
          startAngle,
          innerSize: '80%',
          dataLabels: {
            enabled: false
          },
          showInLegend: true
        }
      ],
      legend: {
        enabled: true,
        align: 'left',
        layout: 'vertical'
      }
    };
  }

  buildDrilldownOptions(point: Highcharts.Point): Highcharts.Options {
    const selectedData = point ? this.drilldownData[point.name] : [];
    const colors = point
      ? this.generateColors(point.color as string, selectedData.length)
      : [];
    return {
      chart: {
        type: 'column'
      },
      title: {
        text: ''
      },
      subtitle: {
        text: point?.name ?? ''
      },
      xAxis: {
        visible: false
      },
      yAxis: {
        visible: false
      },
      plotOptions: {
        series: {
          stacking: 'percent'
        }
      },
      series: selectedData
        .sort((a, b) => a[1] - b[1])
        .map(([name, count], index) => ({
          type: 'column',
          id: name as string,
          name: name as string,
          color: colors[index],
          data: [count],
          dataLabels: {
            enabled: true,
            format: '{series.name}: {y}'
          }
        })),
      tooltip: {
        enabled: false
      },
      legend: {
        enabled: false
      }
    };
  }

  recalculateAngle(point: Highcharts.Point): void {
    const targetAngle = 90;
    const preceedingAngle = point.series.points
      .filter(p => p.visible)
      .filter(p => p.index < point.index) // preceeding points
      .map(p => p.percentage)
      .map(AppComponent.percentageToDegree)
      .reduce((a, b) => a + b, 0);
    const pointMiddleAngle =
      AppComponent.percentageToDegree(point.percentage) / 2;
    const startAngle = targetAngle - pointMiddleAngle - preceedingAngle;
    this.startAngle$.next(startAngle);
  }

  private static percentageToDegree(percentage: number): number {
    return (percentage / 100) * 360;
  }

  private generateColors(base: string, stops: number): string[] {
    const [h, s, l] = convert.hex.hsl(base);
    const dark = '#' + convert.hsl.hex([h, s, l - 20]);
    const light = '#' + convert.hsl.hex([h, s, l + 20]);
    return gradstop({
      stops: Math.max(stops, 2),
      inputFormat: 'hex',
      colorArray: [light, dark]
    });
  }
}
